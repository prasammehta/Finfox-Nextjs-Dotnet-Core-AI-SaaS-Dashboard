namespace FinfoxApi.Models;

public class Debt
{
    public int DebtId { get; set; }
    public Guid UserId { get; set; }
    public string PersonName { get; set; } = string.Empty;
    public double Amount { get; set; }
    public string DebtType { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
    public double PaidAmount { get; set; } = 0;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Foreign Key & Navigation properties
    public virtual User? User { get; set; }
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
