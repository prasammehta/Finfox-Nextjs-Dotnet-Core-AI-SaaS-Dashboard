namespace FinfoxApi.Models;

public class Investment
{
    public int InvestmentId { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public InvestmentType Type { get; set; }
    public double InitialAmount { get; set; }
    public double CurrentValue { get; set; }
    public DateTime DateAcquired { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Foreign Key & Navigation properties
    public virtual User? User { get; set; }
}
