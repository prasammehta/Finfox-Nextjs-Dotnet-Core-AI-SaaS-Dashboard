namespace FinfoxApi.ViewModels;

public class CreateDebtVM
{
    public Guid UserId { get; set; }
    public string PersonName { get; set; } = string.Empty;
    public double Amount { get; set; }
    public string DebtType { get; set; } = string.Empty; // Owed, Lent
    public DateTime Date { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Settled
}

public class UpdateDebtVM
{
    public int DebtId { get; set; }
    public Guid UserId { get; set; }
    public string PersonName { get; set; } = string.Empty;
    public double Amount { get; set; }
    public string DebtType { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Pending";
    public double PaidAmount { get; set; }
}

public class DebtResponseVM
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
    public double PaidAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
