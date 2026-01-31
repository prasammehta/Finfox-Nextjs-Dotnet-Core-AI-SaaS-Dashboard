namespace FinfoxApi.ViewModels;

public class AiTransactionIntentVM
{
    public string Intent { get; set; } = string.Empty; // "CREATE", "READ", "UPDATE", "DELETE"
    public TransactionIntentDataVM? Data { get; set; }
    public List<string> MissingFields { get; set; } = new();
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
}

public class TransactionIntentDataVM
{
    public double? Amount { get; set; }
    public DateTime? Date { get; set; }
    public string? Description { get; set; }
    public string? Type { get; set; } // "INCOME" or "EXPENSE"
    public string? Category { get; set; }
    public int? FromAccountId { get; set; }
    public int? ToAccountId { get; set; }
    public int? DebtId { get; set; }
    public int? RecurringTransactionId { get; set; }
}
