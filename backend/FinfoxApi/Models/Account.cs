namespace FinfoxApi.Models;

public class Account
{
    public int AccountId { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public double InitialBalance { get; set; } = 0;
    public double CurrentBalance { get; set; } = 0;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Foreign Key & Navigation properties
    public virtual User? User { get; set; }
    public virtual ICollection<RecurringTransaction> RecurringTransactions { get; set; } = new List<RecurringTransaction>();
    public virtual ICollection<Transaction> TransactionsFrom { get; set; } = new List<Transaction>();
    public virtual ICollection<Transaction> TransactionsTo { get; set; } = new List<Transaction>();
}
