namespace FinfoxApi.Models;

public class RecurringTransaction
{
    public int RecurringTransactionId { get; set; }
    public Guid UserId { get; set; }
    public double Amount { get; set; }
    public string? Description { get; set; }
    public Category Category { get; set; }
    public Frequency Frequency { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? LastGeneratedDate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int AccountId { get; set; }
    public RecurringTransactionType Type { get; set; }

    // Foreign Keys & Navigation properties
    public virtual Account? Account { get; set; }
    public virtual User? User { get; set; }
    public virtual ICollection<Transaction> GeneratedTransactions { get; set; } = new List<Transaction>();
}
