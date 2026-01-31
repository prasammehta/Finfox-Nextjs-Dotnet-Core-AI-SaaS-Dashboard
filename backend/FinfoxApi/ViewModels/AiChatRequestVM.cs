using FinfoxApi.Models;

namespace FinfoxApi.ViewModels;

public class AiChatRequestVM
{
    public Guid UserId { get; set; }
    public int? ChatSessionId { get; set; }
    public BotType BotType { get; set; } = BotType.FINFOX_ADVICER;
    public string Message { get; set; } = string.Empty;
}
