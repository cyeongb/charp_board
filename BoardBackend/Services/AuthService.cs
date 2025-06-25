using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using BoardBackend.Data;
using BoardBackend.Models;

namespace BoardBackend.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request);
        Task<ApiResponse<string>> RegisterAsync(RegisterRequest request);
        Task<ApiResponse<string>> ResetPasswordAsync(ResetPasswordRequest request);
        Task<User?> GetUserByIdAsync(int userId);
    }

    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthService(ApplicationDbContext context, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

        // 로그인 처리
        public async Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request)
        {
            try
            {
                // 이메일로 사용자 찾기
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    return new ApiResponse<LoginResponse>
                    {
                        Success = false,
                        Message = "이메일 또는 비밀번호가 올바르지 않습니다."
                    };
                }

                // JWT 토큰 생성
                var token = GenerateJwtToken(user);

                return new ApiResponse<LoginResponse>
                {
                    Success = true,
                    Message = "로그인 성공",
                    Data = new LoginResponse
                    {
                        Token = token,
                        Name = user.Name,
                        Email = user.Email
                    }
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<LoginResponse>
                {
                    Success = false,
                    Message = $"로그인 중 오류가 발생했습니다: {ex.Message}"
                };
            }
        }

        // 회원가입 처리
        public async Task<ApiResponse<string>> RegisterAsync(RegisterRequest request)
        {
            try
            {
                // 이메일 중복 확인
                if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                {
                    return new ApiResponse<string>
                    {
                        Success = false,
                        Message = "이미 등록된 이메일입니다."
                    };
                }

                // 비밀번호 해시화
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                // 새 사용자 생성
                var user = new User
                {
                    Name = request.Name,
                    Email = request.Email,
                    PasswordHash = passwordHash,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return new ApiResponse<string>
                {
                    Success = true,
                    Message = "회원가입이 완료되었습니다."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<string>
                {
                    Success = false,
                    Message = $"회원가입 중 오류가 발생했습니다: {ex.Message}"
                };
            }
        }

        // 비밀번호 재설정 처리
        public async Task<ApiResponse<string>> ResetPasswordAsync(ResetPasswordRequest request)
        {
            try
            {
                // 이름과 이메일로 사용자 찾기 (간단한 인증)
                var user = await _context.Users.FirstOrDefaultAsync(u =>
                    
                u.Name == request.Name && u.Email == request.Email);
                Console.WriteLine($"User found: {user != null}");
                if (user == null)
                {
                    return new ApiResponse<string>
                    {
                        Success = false,
                        Message = "입력하신 이름과 이메일에 해당하는 사용자를 찾을 수 없습니다."
                    };
                }

                // 새 비밀번호로 업데이트
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                await _context.SaveChangesAsync();

                // 이메일 알림 발송
                await _emailService.SendPasswordResetNotificationAsync(user.Email, user.Name);

                return new ApiResponse<string>
                {
                    Success = true,
                    Message = "비밀번호가 성공적으로 재설정되었습니다. 확인 이메일을 발송했습니다."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<string>
                {
                    Success = false,
                    Message = $"비밀번호 재설정 중 오류가 발생했습니다: {ex.Message}"
                };
            }
        }

        // 사용자 ID로 사용자 정보 조회
        public async Task<User?> GetUserByIdAsync(int userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        // JWT 토큰 생성
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7), // 7일 유효
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(secretKey),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}