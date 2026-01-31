namespace FinfoxApi.ViewModels;

public class AiChatResponseVM
{
    public int ChatSessionId { get; set; }
    public List<AiChatMessageVM> Messages { get; set; } = new();
    public AiChatMessageVM? LastAssistantMessage { get; set; }
    public string? Error { get; set; }
}

public class AiChatMessageVM
{
    public int ChatMessageId { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class AiChatSessionVM
{
    public int ChatSessionId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int MessageCount { get; set; }
}

public class AiChatHistoryVM
{
    public List<AiChatSessionVM> Sessions { get; set; } = new();
}
