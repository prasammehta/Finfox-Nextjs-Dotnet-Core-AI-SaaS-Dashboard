namespace FinfoxApi.ViewModels;

public class CreateRecurringTransactionVM
{
    public Guid UserId { get; set; }
    public int AccountId { get; set; }
    public double Amount { get; set; }
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty; // Daily, Weekly, Monthly, Yearly
    public string Type { get; set; } = string.Empty; // Income, Expense
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateRecurringTransactionVM
{
    public int RecurringTransactionId { get; set; }
    public Guid UserId { get; set; }
    public int AccountId { get; set; }
    public double Amount { get; set; }
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Income, Expense
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; }
}

public class RecurringTransactionResponseVM
{
    public int RecurringTransactionId { get; set; }
    public Guid UserId { get; set; }
    public int AccountId { get; set; }
    public double Amount { get; set; }
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Income, Expense
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? LastGeneratedDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
