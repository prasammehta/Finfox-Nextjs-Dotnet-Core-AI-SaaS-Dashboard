using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;

namespace FinfoxApi.Controllers;


public class ChatRequest
{
    public string Message { get; set; } = string.Empty;
}
public class ChatResponse
{
    public string Reply { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly Kernel _kernel;
    private readonly IChatCompletionService _chatService;
    private static ChatHistory _chatHistory = new();

    public TestController(Kernel kernel)
    {
        _kernel = kernel;
        _chatService = _kernel.GetRequiredService<IChatCompletionService>();
    }

    [HttpPost]
    public async Task<IActionResult> Chat(ChatRequest request)
    {
        _chatHistory.AddUserMessage(request.Message);

        var response = await _chatService.GetChatMessageContentAsync(
            _chatHistory,
            executionSettings: new()
            {
            }
        );

        _chatHistory.AddAssistantMessage(response.Content!);

        return Ok(new ChatResponse
        {
            Reply = response.Content!
        });
    }
}