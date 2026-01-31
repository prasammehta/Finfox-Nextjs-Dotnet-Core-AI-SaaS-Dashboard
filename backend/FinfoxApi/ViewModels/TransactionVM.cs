namespace FinfoxApi.ViewModels;

public class CreateTransactionVM
{
    public Guid UserId { get; set; }
    public double Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    public string Type { get; set; } = string.Empty; // Income, Expense
    public string? Category { get; set; }
    public int? FromAccountId { get; set; }
    public int? ToAccountId { get; set; }
    public int? DebtId { get; set; }
    public int? RecurringTransactionId { get; set; }
}

public class UpdateTransactionVM
{
    public int TransactionId { get; set; }
    public Guid UserId { get; set; }
    public double Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Category { get; set; }
    public int? FromAccountId { get; set; }
    public int? ToAccountId { get; set; }
    public int? DebtId { get; set; }
    public int? RecurringTransactionId { get; set; }
}

public class TransactionResponseVM
{
    public int TransactionId { get; set; }
    public Guid UserId { get; set; }
    public double Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Category { get; set; }
    public int? FromAccountId { get; set; }
    public int? ToAccountId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
