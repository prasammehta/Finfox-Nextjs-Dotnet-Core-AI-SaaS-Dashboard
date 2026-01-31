using FinfoxApi.ViewModels;

namespace FinfoxApi.Interfaces;

public interface IDashboardService
{
    Task<DashboardResponseVM> GetDashboardAsync(Guid userId);
    Task<KeyMetricsVM> GetKeyMetricsAsync(Guid userId);
    Task<AccountSummaryVM> GetAccountSummaryAsync(Guid userId);
    Task<TransactionSummaryVM> GetTransactionSummaryAsync(Guid userId);
    Task<DebtSummaryVM> GetDebtSummaryAsync(Guid userId);
    Task<InvestmentSummaryVM> GetInvestmentSummaryAsync(Guid userId);
    Task<RecentTransactionsVM> GetRecentTransactionsAsync(Guid userId, int limit = 10);
    Task<BudgetOverviewVM> GetBudgetOverviewAsync(Guid userId);
    Task<List<MonthlyTrendVM>> GetMonthlyTrendsAsync(Guid userId, int months = 6);
    Task<List<AssetDistributionVM>> GetAssetDistributionAsync(Guid userId);
}
