using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinfoxApi.Interfaces;
using FinfoxApi.ViewModels;
using FinfoxApi.Helper;
using System.Security.Claims;

namespace FinfoxApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly IAiService _aiService;
    private readonly ILogger<AiController> _logger;

    public AiController(
        IAiService aiService,
        ILogger<AiController> logger)
    {
        _aiService = aiService;
        _logger = logger;
    }

    /// <summary>
    /// Send a message to the AI transaction assistant
    /// </summary>
    [HttpPost("chat")]
    public async Task<ActionResult<SuccessVM>> ChatWithAi([FromBody] AiChatRequestVM request)
    {
        try
        {
            if (!ModelState.IsValid)
                return Ok(new ErrorVM { Message = ConstantHelper.INVALID_MODEL_ERR });

            // Validate userId from token matches request
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = "Invalid user information in token" });

            request.UserId = userId!.Value;

            var response = await _aiService.ProcessChatMessageAsync(request);

            if (!string.IsNullOrEmpty(response.Error))
                return Ok(new ErrorVM { Message = response.Error });

            return Ok(new SuccessVM
            {
                Data = response,
                Message = ConstantHelper.GetSuccess("Chat Message Processed")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing AI chat");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    /// <summary>
    /// Extract transaction intent from a user message
    /// </summary>
    [HttpPost("extract-intent")]
    public async Task<ActionResult<SuccessVM>> ExtractTransactionIntent([FromBody] ExtractIntentRequestVM request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Message))
                return Ok(new ErrorVM { Message = "Message cannot be empty" });

            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = "Invalid user information in token" });

            var intent = await _aiService.ExtractTransactionIntentAsync(request.Message, userId.Value);
            return Ok(new SuccessVM
            {
                Data = intent,
                Message = ConstantHelper.GetSuccess("Intent Extracted")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting transaction intent");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    /// <summary>
    /// Get chat history for the authenticated user
    /// </summary>
    [HttpGet("history")]
    public async Task<ActionResult<SuccessVM>> GetChatHistory()
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = "Invalid user information in token" });

            var history = await _aiService.GetChatHistoryAsync(userId.Value);
            return Ok(new SuccessVM
            {
                Data = history,
                Message = ConstantHelper.GetSuccess("Chat History")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving chat history");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }



    /// <summary>
    /// Get all chat sessions for the authenticated user
    /// </summary>
    [HttpGet("sessions")]
    public async Task<ActionResult<SuccessVM>> GetSessionsByUserId()
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = "Invalid user information in token" });

            var sessions = await _aiService.GetSessionsByUserIdAsync(userId.Value);
            return Ok(new SuccessVM
            {
                Data = sessions,
                Message = ConstantHelper.GetSuccess("Chat Sessions")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user sessions");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    /// <summary>
    /// Get messages from a specific chat session
    /// </summary>
    [HttpGet("session/{sessionId}")]
    public async Task<ActionResult<SuccessVM>> GetChatSession(int sessionId)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = "Invalid user information in token" });

            var response = await _aiService.GetChatSessionMessagesAsync(userId.Value, sessionId);

            if (!string.IsNullOrEmpty(response.Error))
                return Ok(new ErrorVM { Message = response.Error });

            return Ok(new SuccessVM
            {
                Data = response,
                Message = ConstantHelper.GetSuccess("Chat Session")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving chat session");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    /// <summary>
    /// Delete a chat session
    /// </summary>
    [HttpDelete("session/{sessionId}")]
    public async Task<ActionResult<SuccessVM>> DeleteChatSession(int sessionId)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = "Invalid user information in token" });

            await _aiService.DeleteChatSessionAsync(userId.Value, sessionId);
            return Ok(new SuccessVM
            {
                Message = ConstantHelper.DeleteSuccess("Chat Session")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting chat session");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

}

public class ExtractIntentRequestVM
{
    public string Message { get; set; } = string.Empty;
}
