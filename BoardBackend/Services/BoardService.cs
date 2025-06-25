using Microsoft.EntityFrameworkCore;
using BoardBackend.Data;
using BoardBackend.Models;

namespace BoardBackend.Services
{
    public interface IBoardService
    //앞에 i를 붙여서 인터페이스, 즉 "추상화"를 지칭.
    {
        Task<ApiResponse<List<BoardResponse>>> GetBoardsAsync(int userId);
        Task<ApiResponse<BoardResponse>> GetBoardByIdAsync(int id, int userId);
        Task<ApiResponse<BoardResponse>> CreateBoardAsync(BoardRequest request, int userId);
        Task<ApiResponse<BoardResponse>> UpdateBoardAsync(int id, BoardRequest request, int userId);
        Task<ApiResponse<string>> DeleteBoardAsync(int id, int userId);
    }

    public class BoardService : IBoardService
    {
        private readonly ApplicationDbContext _context;

        public BoardService(ApplicationDbContext context)
        { //디비 작업을 처리하기 위한 컨텍스트
        //
            _context = context;
        }

        // 게시글 목록 조회 (최신순 정렬)
        public async Task<ApiResponse<List<BoardResponse>>> GetBoardsAsync(int userId)
        {
            try
            {
                var boards = await _context.Boards
                    .Include(b => b.User)  //user.id 를 fk로 가지고있어 참조하는 상태.
                    .OrderByDescending(b => b.CreatedAt)
                    .Select(b => new BoardResponse  //b 는 board 의 각 행
                    // BoardResponse 타입으로 내보내기 위한 작업
                    {
                        Id = b.Id,
                        Title = b.Title,
                        Content = b.Content.Length > 100 ? b.Content.Substring(0, 100) + "..." : b.Content,
                        AuthorName = b.User.Name,
                        CreatedAt = b.CreatedAt,
                        UpdatedAt = b.UpdatedAt,
                        ViewCount = b.ViewCount,
                        CanEdit = b.UserId == userId //현재사용자인지 판별
                    })
                    .ToListAsync();  //쿼리를 실행하여 데이터를 메모리에 로드. 결과는 List로 반환함 List<BoardResponse>

                return new ApiResponse<List<BoardResponse>>
                {
                    Success = true,
                    Message = "게시글 목록 조회 성공",
                    Data = boards
                    //데이터에 담아서 api 에 담아서 프론트로 보냄
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<List<BoardResponse>>
                {
                    Success = false,
                    Message = $"게시글 목록 조회 중 오류가 발생했습니다: {ex.Message}"
                };
            }
        }

        // 게시글 상세 조회 (조회수 증가)
        public async Task<ApiResponse<BoardResponse>> GetBoardByIdAsync(int id, int userId)
        {
            try
            {
                var board = await _context.Boards
                    .Include(b => b.User)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (board == null)
                {
                    return new ApiResponse<BoardResponse>
                    {
                        Success = false,
                        Message = "게시글을 찾을 수 없습니다."
                    };
                }

                // 조회수 증가
                board.ViewCount++;
                await _context.SaveChangesAsync();

                var response = new BoardResponse
                {
                    Id = board.Id,
                    Title = board.Title,
                    Content = board.Content,
                    AuthorName = board.User.Name,
                    CreatedAt = board.CreatedAt,
                    UpdatedAt = board.UpdatedAt,
                    ViewCount = board.ViewCount,
                    CanEdit = board.UserId == userId
                };

                return new ApiResponse<BoardResponse>
                {
                    Success = true,
                    Message = "게시글 조회 성공",
                    Data = response
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<BoardResponse>
                {
                    Success = false,
                    Message = $"게시글 조회 중 오류가 발생했습니다: {ex.Message}"
                };
            }
        }

        // 게시글 작성
        public async Task<ApiResponse<BoardResponse>> CreateBoardAsync(BoardRequest request, int userId)
        {
            try
            {
                var board = new Board
                {
                    Title = request.Title,
                    Content = request.Content,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Boards.Add(board);
                await _context.SaveChangesAsync();

                // 작성자 정보 포함해서 응답
                await _context.Entry(board).Reference(b => b.User).LoadAsync();

                var response = new BoardResponse
                {
                    Id = board.Id,
                    Title = board.Title,
                    Content = board.Content,
                    AuthorName = board.User.Name,
                    CreatedAt = board.CreatedAt,
                    UpdatedAt = board.UpdatedAt,
                    ViewCount = board.ViewCount,
                    CanEdit = true
                };

                return new ApiResponse<BoardResponse>
                {
                    Success = true,
                    Message = "게시글이 성공적으로 작성되었습니다.",
                    Data = response
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<BoardResponse>
                {
                    Success = false,
                    Message = $"게시글 작성 중 오류가 발생했습니다: {ex.Message}"
                };
            }
        }

        // 게시글 수정 (작성자만 가능)
        public async Task<ApiResponse<BoardResponse>> UpdateBoardAsync(int id, BoardRequest request, int userId)
        {
            try
            {
                var board = await _context.Boards
                    .Include(b => b.User)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (board == null)
                {
                    return new ApiResponse<BoardResponse>
                    {
                        Success = false,
                        Message = "게시글을 찾을 수 없습니다."
                    };
                }

                // 작성자 권한 확인
                if (board.UserId != userId)
                {
                    return new ApiResponse<BoardResponse>
                    {
                        Success = false,
                        Message = "게시글을 수정할 권한이 없습니다."
                    };
                }

                // 게시글 업데이트
                board.Title = request.Title;
                board.Content = request.Content;
                board.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var response = new BoardResponse
                {
                    Id = board.Id,
                    Title = board.Title,
                    Content = board.Content,
                    AuthorName = board.User.Name,
                    CreatedAt = board.CreatedAt,
                    UpdatedAt = board.UpdatedAt,
                    ViewCount = board.ViewCount,
                    CanEdit = true
                };

                return new ApiResponse<BoardResponse>
                {
                    Success = true,
                    Message = "게시글이 성공적으로 수정되었습니다.",
                    Data = response
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<BoardResponse>
                {
                    Success = false,
                    Message = $"게시글 수정 중 오류가 발생했습니다: {ex.Message}"
                };
            }
        }

        // 게시글 삭제 (작성자만 가능)
        public async Task<ApiResponse<string>> DeleteBoardAsync(int id, int userId)
        {
            try
            {
                var board = await _context.Boards.FirstOrDefaultAsync(b => b.Id == id);

                if (board == null)
                {
                    return new ApiResponse<string>
                    {
                        Success = false,
                        Message = "게시글을 찾을 수 없습니다."
                    };
                }

                // 작성자 권한 확인
                if (board.UserId != userId)
                {
                    return new ApiResponse<string>
                    {
                        Success = false,
                        Message = "게시글을 삭제할 권한이 없습니다."
                    };
                }

                _context.Boards.Remove(board);
                await _context.SaveChangesAsync();

                return new ApiResponse<string>
                {
                    Success = true,
                    Message = "게시글이 성공적으로 삭제되었습니다."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<string>
                {
                    Success = false,
                    Message = $"게시글 삭제 중 오류가 발생했습니다: {ex.Message}"
                };
            }
        }
    }
}