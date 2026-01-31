namespace FinfoxApi.Models;

public class User
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User"; // User, Admin
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<string> DebtBotHistory { get; set; } = new();
    public List<string> InvestmentBotHistory { get; set; } = new();
    public List<string> RecurringInvestBotHistory { get; set; } = new();
    public List<string> TransactionBotHistory { get; set; } = new();

    // Navigation properties
    public virtual ICollection<Account> Accounts { get; set; } = new List<Account>();
    public virtual ICollection<Debt> Debts { get; set; } = new List<Debt>();
    public virtual ICollection<Investment> Investments { get; set; } = new List<Investment>();
    public virtual ICollection<RecurringTransaction> RecurringTransactions { get; set; } = new List<RecurringTransaction>();
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
