namespace FinfoxApi.Models;

public class Transaction
{
    public int TransactionId { get; set; }
    public Guid UserId { get; set; }
    public double Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    public TransactionType Type { get; set; }
    public Category? Category { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int? ToAccountId { get; set; }
    public int? DebtId { get; set; }
    public int? RecurringTransactionId { get; set; }
    public int? FromAccountId { get; set; }

    // Foreign Keys & Navigation properties
    public virtual Debt? Debt { get; set; }
    public virtual Account? FromAccount { get; set; }
    public virtual RecurringTransaction? RecurringTransaction { get; set; }
    public virtual Account? ToAccount { get; set; }
    public virtual User? User { get; set; }
}
