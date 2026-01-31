namespace FinfoxApi.ViewModels;

public class CreateAccountVM
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public double InitialBalance { get; set; }
}

public class UpdateAccountVM
{
    public int AccountId { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public double InitialBalance { get; set; }
    public double CurrentBalance { get; set; }
}

public class AccountResponseVM
{
    public int AccountId { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public double InitialBalance { get; set; }
    public double CurrentBalance { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
