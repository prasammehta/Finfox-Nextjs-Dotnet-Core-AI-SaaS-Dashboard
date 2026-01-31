using Microsoft.EntityFrameworkCore;
using FinfoxApi.Data;
using FinfoxApi.Interfaces;
using FinfoxApi.Models;
using FinfoxApi.ViewModels;

namespace FinfoxApi.Services;

public class DashboardService : IDashboardService
{
    private readonly FinfoxApiDbContext _context;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(FinfoxApiDbContext context, ILogger<DashboardService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<DashboardResponseVM> GetDashboardAsync(Guid userId)
    {
        try
        {
            var dashboard = new DashboardResponseVM
            {
                KeyMetrics = await GetKeyMetricsAsync(userId),
                AccountSummary = await GetAccountSummaryAsync(userId),
                TransactionSummary = await GetTransactionSummaryAsync(userId),
                DebtSummary = await GetDebtSummaryAsync(userId),
                InvestmentSummary = await GetInvestmentSummaryAsync(userId),
                RecentTransactions = await GetRecentTransactionsAsync(userId),
                BudgetOverview = await GetBudgetOverviewAsync(userId)
            };

            return dashboard;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching dashboard data for user {UserId}", userId);
            throw;
        }
    }

    public async Task<KeyMetricsVM> GetKeyMetricsAsync(Guid userId)
    {
        try
        {
            var accounts = await _context.Accounts
                .Where(a => a.UserId == userId)
                .ToListAsync();

            var debts = await _context.Debts
                .Where(d => d.UserId == userId)
                .ToListAsync();

            var investments = await _context.Investments
                .Where(i => i.UserId == userId)
                .ToListAsync();

            // Current month
            var currentMonth = DateTime.UtcNow;
            var monthStart = new DateTime(currentMonth.Year, currentMonth.Month, 1).Date;
            var monthEnd = monthStart.AddMonths(1).AddDays(-1).Date;

            var monthlyTransactions = await _context.Transactions
                .Where(t => t.UserId == userId && t.Date >= monthStart && t.Date <= monthEnd)
                .ToListAsync();

            var totalAssets = accounts.Sum(a => a.CurrentBalance) + investments.Sum(i => i.CurrentValue);
            var totalLiabilities = debts.Sum(d => d.Amount - d.PaidAmount);
            var netWorth = totalAssets - totalLiabilities;

            var monthlyIncome = monthlyTransactions
                .Where(t => t.Type == TransactionType.INCOME)
                .Sum(t => t.Amount);

            var monthlyExpense = monthlyTransactions
                .Where(t => t.Type == TransactionType.EXPENSE)
                .Sum(t => t.Amount);

            var monthlySavings = monthlyIncome - monthlyExpense;
            var savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

            return new KeyMetricsVM
            {
                TotalAssets = totalAssets,
                TotalLiabilities = totalLiabilities,
                NetWorth = netWorth,
                MonthlyIncome = monthlyIncome,
                MonthlyExpense = monthlyExpense,
                MonthlySavings = monthlySavings,
                SavingsRate = savingsRate
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating key metrics for user {UserId}", userId);
            throw;
        }
    }

    public async Task<AccountSummaryVM> GetAccountSummaryAsync(Guid userId)
    {
        try
        {
            var accounts = await _context.Accounts
                .Where(a => a.UserId == userId)
                .ToListAsync();

            var accountDetails = accounts.Select(a => new AccountDetailVM
            {
                AccountId = a.AccountId,
                Name = a.Name,
                CurrentBalance = a.CurrentBalance,
                InitialBalance = a.InitialBalance,
                BalanceChange = a.CurrentBalance - a.InitialBalance,
                ChangePercentage = a.InitialBalance > 0 
                    ? ((a.CurrentBalance - a.InitialBalance) / a.InitialBalance) * 100 
                    : 0
            }).ToList();

            return new AccountSummaryVM
            {
                TotalAccounts = accounts.Count,
                TotalBalance = accounts.Sum(a => a.CurrentBalance),
                Accounts = accountDetails
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching account summary for user {UserId}", userId);
            throw;
        }
    }

    public async Task<TransactionSummaryVM> GetTransactionSummaryAsync(Guid userId)
    {
        try
        {
            var allTransactions = await _context.Transactions
                .Where(t => t.UserId == userId)
                .ToListAsync();

            // Current month transactions
            var currentMonth = DateTime.UtcNow;
            var monthStart = new DateTime(currentMonth.Year, currentMonth.Month, 1).Date;
            var monthEnd = monthStart.AddMonths(1).AddDays(-1).Date;

            var monthlyTransactions = allTransactions
                .Where(t => t.Date >= monthStart && t.Date <= monthEnd)
                .ToList();

            var totalIncomeThisMonth = monthlyTransactions
                .Where(t => t.Type == TransactionType.INCOME)
                .Sum(t => t.Amount);

            var totalExpenseThisMonth = monthlyTransactions
                .Where(t => t.Type == TransactionType.EXPENSE)
                .Sum(t => t.Amount);

            // Top expense categories
            var topExpenseCategories = monthlyTransactions
                .Where(t => t.Type == TransactionType.EXPENSE && t.Category.HasValue)
                .GroupBy(t => t.Category!.Value.ToString())
                .Select(g => new TransactionByCategoryVM
                {
                    Category = g.Key,
                    Amount = g.Sum(t => t.Amount),
                    Count = g.Count(),
                    Percentage = totalExpenseThisMonth > 0 ? (g.Sum(t => t.Amount) / totalExpenseThisMonth) * 100 : 0
                })
                .OrderByDescending(c => c.Amount)
                .Take(5)
                .ToList();

            // Top income categories
            var topIncomeCategories = monthlyTransactions
                .Where(t => t.Type == TransactionType.INCOME && t.Category.HasValue)
                .GroupBy(t => t.Category!.Value.ToString())
                .Select(g => new TransactionByCategoryVM
                {
                    Category = g.Key,
                    Amount = g.Sum(t => t.Amount),
                    Count = g.Count(),
                    Percentage = totalIncomeThisMonth > 0 ? (g.Sum(t => t.Amount) / totalIncomeThisMonth) * 100 : 0
                })
                .OrderByDescending(c => c.Amount)
                .Take(5)
                .ToList();

            return new TransactionSummaryVM
            {
                TotalTransactions = allTransactions.Count,
                TransactionsThisMonth = monthlyTransactions.Count,
                TotalIncomeThisMonth = totalIncomeThisMonth,
                TotalExpenseThisMonth = totalExpenseThisMonth,
                TopExpenseCategories = topExpenseCategories,
                TopIncomeCategories = topIncomeCategories
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching transaction summary for user {UserId}", userId);
            throw;
        }
    }

    public async Task<DebtSummaryVM> GetDebtSummaryAsync(Guid userId)
    {
        try
        {
            var debts = await _context.Debts
                .Where(d => d.UserId == userId)
                .OrderByDescending(d => d.DueDate)
                .ToListAsync();

            var openDebts = debts.Where(d => d.Status.ToLower() == "open").ToList();
            var closedDebts = debts.Where(d => d.Status.ToLower() == "closed").ToList();

            var recentDebts = debts
                .Take(5)
                .Select(d => new DebtDetailVM
                {
                    DebtId = d.DebtId,
                    PersonName = d.PersonName,
                    DebtType = d.DebtType,
                    Amount = d.Amount,
                    PaidAmount = d.PaidAmount,
                    OutstandingAmount = d.Amount - d.PaidAmount,
                    Status = d.Status,
                    DueDate = d.DueDate,
                    IsOverdue = d.DueDate.HasValue && d.DueDate.Value.Date < DateTime.UtcNow.Date
                })
                .ToList();

            return new DebtSummaryVM
            {
                TotalDebts = debts.Count,
                OpenDebts = openDebts.Count,
                ClosedDebts = closedDebts.Count,
                TotalDebtAmount = debts.Sum(d => d.Amount),
                TotalDebtPaid = debts.Sum(d => d.PaidAmount),
                OutstandingDebt = debts.Sum(d => d.Amount - d.PaidAmount),
                RecentDebts = recentDebts
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching debt summary for user {UserId}", userId);
            throw;
        }
    }

    public async Task<InvestmentSummaryVM> GetInvestmentSummaryAsync(Guid userId)
    {
        try
        {
            var investments = await _context.Investments
                .Where(i => i.UserId == userId)
                .OrderByDescending(i => i.CurrentValue - i.InitialAmount)
                .ToListAsync();

            var totalInvestedAmount = investments.Sum(i => i.InitialAmount);
            var totalCurrentValue = investments.Sum(i => i.CurrentValue);
            var totalGainLoss = totalCurrentValue - totalInvestedAmount;
            var returnPercentage = totalInvestedAmount > 0 ? (totalGainLoss / totalInvestedAmount) * 100 : 0;

            var topInvestments = investments
                .Take(5)
                .Select(i => new InvestmentDetailVM
                {
                    InvestmentId = i.InvestmentId,
                    Name = i.Name,
                    Type = i.Type.ToString(),
                    InitialAmount = i.InitialAmount,
                    CurrentValue = i.CurrentValue,
                    GainLoss = i.CurrentValue - i.InitialAmount,
                    ReturnPercentage = i.InitialAmount > 0 
                        ? ((i.CurrentValue - i.InitialAmount) / i.InitialAmount) * 100 
                        : 0
                })
                .ToList();

            return new InvestmentSummaryVM
            {
                TotalInvestments = investments.Count,
                TotalInvestedAmount = totalInvestedAmount,
                TotalCurrentValue = totalCurrentValue,
                TotalGainLoss = totalGainLoss,
                ReturnPercentage = returnPercentage,
                TopInvestments = topInvestments
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching investment summary for user {UserId}", userId);
            throw;
        }
    }

    public async Task<RecentTransactionsVM> GetRecentTransactionsAsync(Guid userId, int limit = 10)
    {
        try
        {
            var recentTransactions = await _context.Transactions
                .Where(t => t.UserId == userId)
                .Include(t => t.FromAccount)
                .OrderByDescending(t => t.Date)
                .ThenByDescending(t => t.TransactionId)
                .Take(limit)
                .ToListAsync();

            var transactions = recentTransactions
                .Select(t => new TransactionDetailVM
                {
                    TransactionId = t.TransactionId,
                    Amount = t.Amount,
                    Category = t.Category?.ToString() ?? "UNCATEGORIZED",
                    Type = t.Type.ToString(),
                    Date = t.Date,
                    Description = t.Description ?? "",
                    AccountName = t.FromAccount?.Name ?? "Unknown Account"
                })
                .ToList();

            return new RecentTransactionsVM
            {
                Transactions = transactions
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching recent transactions for user {UserId}", userId);
            throw;
        }
    }

    public async Task<BudgetOverviewVM> GetBudgetOverviewAsync(Guid userId)
    {
        try
        {
            var currentMonth = DateTime.UtcNow;
            var monthStart = new DateTime(currentMonth.Year, currentMonth.Month, 1).Date;
            var monthEnd = monthStart.AddMonths(1).AddDays(-1).Date;

            var monthlyTransactions = await _context.Transactions
                .Where(t => t.UserId == userId && t.Date >= monthStart && t.Date <= monthEnd && t.Type == TransactionType.EXPENSE)
                .ToListAsync();

            // Estimate monthly budget based on average of last 3 months
            var threeMonthsAgo = monthStart.AddMonths(-3);
            var historicalTransactions = await _context.Transactions
                .Where(t => t.UserId == userId && t.Date >= threeMonthsAgo && t.Type == TransactionType.EXPENSE)
                .ToListAsync();

            var averageMonthlySpend = historicalTransactions.Count > 0 
                ? historicalTransactions.Sum(t => t.Amount) / 3 
                : 0;

            var estimatedBudget = averageMonthlySpend * 1.1; // 110% of average for buffer

            var totalSpent = monthlyTransactions.Sum(t => t.Amount);
            var remainingBudget = estimatedBudget - totalSpent;
            var budgetUtilization = estimatedBudget > 0 ? (totalSpent / estimatedBudget) * 100 : 0;

            var categoryCount = monthlyTransactions.Where(t => t.Category.HasValue).GroupBy(t => t.Category!.Value.ToString()).Count();
            var categoryCount2 = categoryCount > 0 ? categoryCount : 1;

            var categoryBreakdown = monthlyTransactions
                .Where(t => t.Category.HasValue)
                .GroupBy(t => t.Category!.Value.ToString())
                .Select(g => new CategoryBudgetVM
                {
                    Category = g.Key,
                    Budget = estimatedBudget / categoryCount2,
                    Spent = g.Sum(t => t.Amount),
                    Remaining = (estimatedBudget / categoryCount2) - g.Sum(t => t.Amount),
                    UtilizationPercentage = 0 // Will be calculated below
                })
                .ToList();

            // Calculate utilization percentage for each category
            foreach (var category in categoryBreakdown)
            {
                category.UtilizationPercentage = category.Budget > 0 ? (category.Spent / category.Budget) * 100 : 0;
            }

            return new BudgetOverviewVM
            {
                TotalBudget = estimatedBudget,
                TotalSpent = totalSpent,
                RemainingBudget = remainingBudget,
                BudgetUtilization = budgetUtilization,
                CategoryBreakdown = categoryBreakdown.OrderByDescending(c => c.Spent).ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching budget overview for user {UserId}", userId);
            throw;
        }
    }

    public async Task<List<MonthlyTrendVM>> GetMonthlyTrendsAsync(Guid userId, int months = 6)
    {
        try
        {
            var trends = new List<MonthlyTrendVM>();

            for (int i = months - 1; i >= 0; i--)
            {
                var currentMonth = DateTime.UtcNow.AddMonths(-i);
                var monthStart = new DateTime(currentMonth.Year, currentMonth.Month, 1).Date;
                var monthEnd = monthStart.AddMonths(1).AddDays(-1).Date;

                var monthlyTransactions = await _context.Transactions
                    .Where(t => t.UserId == userId && t.Date >= monthStart && t.Date <= monthEnd)
                    .ToListAsync();

                var income = monthlyTransactions
                    .Where(t => t.Type == TransactionType.INCOME)
                    .Sum(t => t.Amount);

                var expense = monthlyTransactions
                    .Where(t => t.Type == TransactionType.EXPENSE)
                    .Sum(t => t.Amount);

                var savings = income - expense;

                trends.Add(new MonthlyTrendVM
                {
                    Month = currentMonth.ToString("MMM yyyy"),
                    Income = income,
                    Expense = expense,
                    Savings = savings
                });
            }

            return trends;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching monthly trends for user {UserId}", userId);
            throw;
        }
    }

    public async Task<List<AssetDistributionVM>> GetAssetDistributionAsync(Guid userId)
    {
        try
        {
            var distribution = new List<AssetDistributionVM>();

            var accounts = await _context.Accounts
                .Where(a => a.UserId == userId)
                .ToListAsync();

            var investments = await _context.Investments
                .Where(i => i.UserId == userId)
                .ToListAsync();

            var accountsValue = accounts.Sum(a => a.CurrentBalance);
            var investmentsValue = investments.Sum(i => i.CurrentValue);
            var totalAssets = accountsValue + investmentsValue;

            if (totalAssets > 0)
            {
                if (accountsValue > 0)
                {
                    distribution.Add(new AssetDistributionVM
                    {
                        AssetType = "Bank Accounts",
                        Value = accountsValue,
                        Percentage = (accountsValue / totalAssets) * 100
                    });
                }

                if (investmentsValue > 0)
                {
                    distribution.Add(new AssetDistributionVM
                    {
                        AssetType = "Investments",
                        Value = investmentsValue,
                        Percentage = (investmentsValue / totalAssets) * 100
                    });
                }
            }

            return distribution;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching asset distribution for user {UserId}", userId);
            throw;
        }
    }
}
