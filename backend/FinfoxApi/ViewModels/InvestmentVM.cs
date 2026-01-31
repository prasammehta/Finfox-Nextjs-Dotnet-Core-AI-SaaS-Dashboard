namespace FinfoxApi.ViewModels;

public class CreateInvestmentVM
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Stock, Mutual Fund, Bond, etc.
    public double InitialAmount { get; set; }
    public double CurrentValue { get; set; }
    public DateTime DateAcquired { get; set; }
    public string? Notes { get; set; }
}

public class UpdateInvestmentVM
{
    public int InvestmentId { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Stock, Mutual Fund, Bond, etc.
    public double InitialAmount { get; set; }
    public double CurrentValue { get; set; }
    public DateTime DateAcquired { get; set; }
    public string? Notes { get; set; }
}

public class InvestmentResponseVM
{
    public int InvestmentId { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public double InitialAmount { get; set; }
    public double CurrentValue { get; set; }
    public DateTime DateAcquired { get; set; }
    public string? Notes { get; set; }
    public double GainLoss { get; set; }
    public double GainLossPercentage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
