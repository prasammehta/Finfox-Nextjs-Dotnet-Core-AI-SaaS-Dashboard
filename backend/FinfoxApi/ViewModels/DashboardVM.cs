namespace FinfoxApi.ViewModels;

// ==================== Main Dashboard Response ====================
public class DashboardResponseVM
{
    public KeyMetricsVM? KeyMetrics { get; set; }
    public AccountSummaryVM? AccountSummary { get; set; }
    public TransactionSummaryVM? TransactionSummary { get; set; }
    public DebtSummaryVM? DebtSummary { get; set; }
    public InvestmentSummaryVM? InvestmentSummary { get; set; }
    public RecentTransactionsVM? RecentTransactions { get; set; }
    public BudgetOverviewVM? BudgetOverview { get; set; }
}

// ==================== Key Metrics ====================
public class KeyMetricsVM
{
    public double TotalAssets { get; set; }
    public double TotalLiabilities { get; set; }
    public double NetWorth { get; set; }
    public double MonthlyIncome { get; set; }
    public double MonthlyExpense { get; set; }
    public double MonthlySavings { get; set; }
    public double SavingsRate { get; set; } // Percentage
}

// ==================== Account Summary ====================
public class AccountSummaryVM
{
    public int TotalAccounts { get; set; }
    public double TotalBalance { get; set; }
    public List<AccountDetailVM>? Accounts { get; set; }
}

public class AccountDetailVM
{
    public int AccountId { get; set; }
    public string? Name { get; set; }
    public double CurrentBalance { get; set; }
    public double InitialBalance { get; set; }
    public double BalanceChange { get; set; }
    public double ChangePercentage { get; set; }
}

// ==================== Transaction Summary ====================
public class TransactionSummaryVM
{
    public int TotalTransactions { get; set; }
    public int TransactionsThisMonth { get; set; }
    public double TotalIncomeThisMonth { get; set; }
    public double TotalExpenseThisMonth { get; set; }
    public List<TransactionByCategoryVM>? TopExpenseCategories { get; set; }
    public List<TransactionByCategoryVM>? TopIncomeCategories { get; set; }
}

public class TransactionByCategoryVM
{
    public string? Category { get; set; }
    public double Amount { get; set; }
    public int Count { get; set; }
    public double Percentage { get; set; }
}

// ==================== Debt Summary ====================
public class DebtSummaryVM
{
    public int TotalDebts { get; set; }
    public int OpenDebts { get; set; }
    public int ClosedDebts { get; set; }
    public double TotalDebtAmount { get; set; }
    public double TotalDebtPaid { get; set; }
    public double OutstandingDebt { get; set; }
    public List<DebtDetailVM>? RecentDebts { get; set; }
}

public class DebtDetailVM
{
    public int DebtId { get; set; }
    public string? PersonName { get; set; }
    public string? DebtType { get; set; }
    public double Amount { get; set; }
    public double PaidAmount { get; set; }
    public double OutstandingAmount { get; set; }
    public string? Status { get; set; }
    public DateTime? DueDate { get; set; }
    public bool IsOverdue { get; set; }
}

// ==================== Investment Summary ====================
public class InvestmentSummaryVM
{
    public int TotalInvestments { get; set; }
    public double TotalInvestedAmount { get; set; }
    public double TotalCurrentValue { get; set; }
    public double TotalGainLoss { get; set; }
    public double ReturnPercentage { get; set; }
    public List<InvestmentDetailVM>? TopInvestments { get; set; }
}

public class InvestmentDetailVM
{
    public int InvestmentId { get; set; }
    public string? Name { get; set; }
    public string? Type { get; set; }
    public double InitialAmount { get; set; }
    public double CurrentValue { get; set; }
    public double GainLoss { get; set; }
    public double ReturnPercentage { get; set; }
}

// ==================== Recent Transactions ====================
public class RecentTransactionsVM
{
    public List<TransactionDetailVM>? Transactions { get; set; }
}

public class TransactionDetailVM
{
    public int TransactionId { get; set; }
    public double Amount { get; set; }
    public string? Category { get; set; }
    public string? Type { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    public string? AccountName { get; set; }
}

// ==================== Budget Overview ====================
public class BudgetOverviewVM
{
    public double TotalBudget { get; set; }
    public double TotalSpent { get; set; }
    public double RemainingBudget { get; set; }
    public double BudgetUtilization { get; set; } // Percentage
    public List<CategoryBudgetVM>? CategoryBreakdown { get; set; }
}

public class CategoryBudgetVM
{
    public string? Category { get; set; }
    public double Budget { get; set; }
    public double Spent { get; set; }
    public double Remaining { get; set; }
    public double UtilizationPercentage { get; set; }
}

// ==================== Chart Data ====================
public class MonthlyTrendVM
{
    public string? Month { get; set; }
    public double Income { get; set; }
    public double Expense { get; set; }
    public double Savings { get; set; }
}

public class AssetDistributionVM
{
    public string? AssetType { get; set; }
    public double Value { get; set; }
    public double Percentage { get; set; }
}
