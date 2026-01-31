namespace FinfoxApi.Models;

public class AiChatMessage
{
    public int ChatMessageId { get; set; }
    public int ChatSessionId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty; // "user" or "assistant"
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Foreign Key & Navigation properties
    public virtual User? User { get; set; }
    public virtual AiChatSession? ChatSession { get; set; }
}
