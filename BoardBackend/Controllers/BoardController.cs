using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BoardBackend.Models;
using BoardBackend.Services;

namespace BoardBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]     //controller 를 제외한 컨트롤러 이름(asp.net 에서 소문자로 변환함)
    [Authorize]      // JWT 토큰 인증 필요 토큰 없으면 401 Unauthorized 에러 남
    public class BoardController : ControllerBase
    {
        private readonly IBoardService _boardService;
        //앞에 i를 붙여서 인터페이스, 즉 "추상화"를 지칭.

        public BoardController(IBoardService boardService)
        {
            _boardService = boardService;
        }

        // 현재 로그인한 사용자 ID 가져오기
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        // GET: api/board
        // 게시글 목록 조회 API
        [HttpGet]
        public async Task<IActionResult> GetBoards()
        {
            var userId = GetCurrentUserId(); 
            var result = await _boardService.GetBoardsAsync(userId);
            //result를 GET: api/board로 보냄

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        // GET: api/board/{id}
        // 게시글 상세 조회 API
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBoard(int id)
        {
            var userId = GetCurrentUserId();
            var result = await _boardService.GetBoardByIdAsync(id, userId);

            if (result.Success)
            {
                return Ok(result);
            }

            return NotFound(result);
        }

        // POST: api/board
        // 게시글 작성 API
        [HttpPost]
        public async Task<IActionResult> CreateBoard([FromBody] BoardRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "입력 데이터가 올바르지 않습니다."
                });
            }

            var userId = GetCurrentUserId();
            var result = await _boardService.CreateBoardAsync(request, userId);

            if (result.Success)
            {
                return CreatedAtAction(nameof(GetBoard), new { id = result.Data?.Id }, result);
            }

            return BadRequest(result);
        }

        // PUT: api/board/{id}
        // 게시글 수정 API
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBoard(int id, [FromBody] BoardRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "입력 데이터가 올바르지 않습니다."
                });
            }

            var userId = GetCurrentUserId();
            var result = await _boardService.UpdateBoardAsync(id, request, userId);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        // DELETE: api/board/{id}
        // 게시글 삭제 API
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBoard(int id)
        {
            var userId = GetCurrentUserId();
            var result = await _boardService.DeleteBoardAsync(id, userId);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }
    }
}