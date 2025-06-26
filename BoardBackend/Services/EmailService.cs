using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace BoardBackend.Services
{
    public interface IEmailService
    {
        Task SendPasswordResetNotificationAsync(string email, string name);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // 비밀번호 재설정 알림 이메일 발송
        public async Task SendPasswordResetNotificationAsync(string email, string name)
        {
            try
            {
                var emailSettings = _configuration.GetSection("EmailSettings");

                // Gmail SMTP를 사용한 무료 이메일 발송
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("게시판 시스템", emailSettings["FromEmail"]));
                message.To.Add(new MailboxAddress(name, email));
                message.Subject = "비밀번호 재설정 완료 알림";

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                            <h2 style='color: #1976d2;'>비밀번호 재설정 완료</h2>
                            <p>안녕하세요, <strong>{name}</strong>님!</p>
                            <p>귀하의 게시판 계정 비밀번호가 성공적으로 재설정되었습니다.</p>
                            <p>새로운 비밀번호로 로그인하실 수 있습니다.</p>
                            <div style='background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;'>
                                <p><strong>재설정 일시:</strong> {DateTime.Now:yyyy-MM-dd HH:mm:ss}</p>
                                <p><strong>이메일:</strong> {email}</p>
                            </div>
                            <p>만약 본인이 요청하지 않은 변경사항이라면, 즉시 관리자에게 문의해 주세요.</p>
                            <hr style='margin: 30px 0;'>
                            <p style='color: #666; font-size: 12px;'>
                                이 이메일은 자동으로 발송된 메일입니다. 회신하지 마세요.
                            </p>
                        </div>"
                };

                message.Body = bodyBuilder.ToMessageBody();

                // Gmail SMTP 서버를 통해 이메일 발송
                using (var client = new SmtpClient())
                {
                    await client.ConnectAsync("cyeongb@naver.com", 587, SecureSocketOptions.StartTls);
                    await client.AuthenticateAsync(emailSettings["cyeongb@naver.com"], emailSettings["0000"]);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }
            }
            catch (Exception ex)
            {
                // 실제 운영 환경에서는 로깅 시스템 사용 권장
                Console.WriteLine($"이메일 발송 실패: {ex.Message}");
                // 이메일 발송 실패해도 비밀번호 재설정 자체는 성공으로 처리
            }
        }
    }
}