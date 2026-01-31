namespace FinfoxApi.Models;

public class AiChatSession
{
    public int ChatSessionId { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Foreign Key & Navigation properties
    public virtual User? User { get; set; }
    public virtual ICollection<AiChatMessage> Messages { get; set; } = new List<AiChatMessage>();
}
