using Microsoft.SemanticKernel;
using System.ComponentModel;
using System.Text;
using FinfoxApi.Interfaces;
using FinfoxApi.Models;
using Microsoft.Extensions.Logging;

namespace FinfoxApi.Plugins;

public class FinfoxPlugin
{
    private readonly ITransactionService _transactionService;
    private readonly IAccountService _accountService;
    private readonly IBillService _billService;
    private readonly IDebtService _debtService;
    private readonly IInvestmentService _investmentService;
    private readonly IRecurringTransactionService _recurringTransactionService;
    private readonly ILogger<FinfoxPlugin> _logger;

    public FinfoxPlugin(
        ITransactionService transactionService,
        IAccountService accountService,
        IBillService billService,
        IDebtService debtService,
        IInvestmentService investmentService,
        IRecurringTransactionService recurringTransactionService,
        ILogger<FinfoxPlugin> logger)
    {
        _transactionService = transactionService;
        _accountService = accountService;
        _billService = billService;
        _debtService = debtService;
        _investmentService = investmentService;
        _recurringTransactionService = recurringTransactionService;
        _logger = logger;
    }

    [KernelFunction("get_financial_summary")]
    [Description("Returns a quick overview of balances, debts, investments, and recurring flows.")]
    public async Task<string> GetFinancialSummaryAsync(
        [Description("The user ID requesting the summary")] Guid userId)
    {
        try
        {
            var accounts = await _accountService.GetByUserIdAsync(userId);
            var activeDebts = await _debtService.GetActiveDebtsAsync(userId);
            var investments = await _investmentService.GetByUserIdAsync(userId);
            var recurring = await _recurringTransactionService.GetActiveTransactionsAsync(userId);
            var transactions = await _transactionService.GetByDateRangeAsync(userId, DateTime.UtcNow.AddDays(-30), DateTime.UtcNow);

            var totalBalance = accounts.Sum(a => a.CurrentBalance);
            var outstandingDebt = activeDebts.Sum(d => Math.Max(0, d.Amount - d.PaidAmount));
            var totalInvestment = investments.Sum(i => i.CurrentValue);
            var monthlyRecurringCommitment = EstimateMonthlyCommitment(recurring);
            var income = transactions.Where(t => t.Type == TransactionType.INCOME).Sum(t => t.Amount);
            var expense = transactions.Where(t => t.Type == TransactionType.EXPENSE).Sum(t => t.Amount);

            var builder = new StringBuilder();
            builder.AppendLine($"Accounts ({accounts.Count}): Total balance Rs {FormatCurrency(totalBalance)}");
            builder.AppendLine($"Active debts ({activeDebts.Count}): Outstanding Rs {FormatCurrency(outstandingDebt)}");
            builder.AppendLine($"Investments ({investments.Count}): Current value Rs {FormatCurrency(totalInvestment)}");
            builder.AppendLine($"Recurring flows ({recurring.Count} active): ~Rs {FormatCurrency(monthlyRecurringCommitment)} monthly commitment");
            builder.AppendLine($"Recent 30 days ({transactions.Count} transactions): Income Rs {FormatCurrency(income)}, Expense Rs {FormatCurrency(expense)}");

            if (!transactions.Any())
            {
                builder.AppendLine("Need more transaction data to provide richer insights.");
            }

            return builder.ToString().TrimEnd();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to build financial summary for user {UserId}", userId);
            return $"Unable to generate summary: {ex.Message}";
        }
    }

    [KernelFunction("get_pending_obligations")]
    [Description("Lists upcoming bills and debts due within a configurable window.")]
    public async Task<string> GetPendingObligationsAsync(
        [Description("The user ID to query")] Guid userId,
        [Description("Window in days to look ahead for obligations")] int daysWindow = 30)
    {
        try
        {
            var now = DateTime.UtcNow.Date;
            var windowEnd = now.AddDays(daysWindow);

            var upcomingBills = (await _billService.GetByUserIdAsync(userId))
                .Where(b => b.DueDate.Date >= now && b.DueDate.Date <= windowEnd)
                .OrderBy(b => b.DueDate)
                .Take(5)
                .ToList();

            var upcomingDebts = (await _debtService.GetActiveDebtsAsync(userId))
                .Where(d =>
                    d.DueDate.HasValue &&
                    d.DueDate.Value.Date >= now &&
                    d.DueDate.Value.Date <= windowEnd)
                .OrderBy(d => d.DueDate)
                .Take(5)
                .ToList();

            var builder = new StringBuilder();
            builder.AppendLine($"Upcoming obligations within {daysWindow} days:");

            if (!upcomingBills.Any() && !upcomingDebts.Any())
            {
                builder.AppendLine("No bills or debts are due in that window.");
                return builder.ToString().TrimEnd();
            }

            if (upcomingBills.Any())
            {
                builder.AppendLine("Bills:");
                foreach (var bill in upcomingBills)
                {
                    builder.AppendLine($"- {bill.BillTo?.Name} (due {bill.DueDate:yyyy-MM-dd})");
                }
            }

            if (upcomingDebts.Any())
            {
                builder.AppendLine("Debts:");
                foreach (var debt in upcomingDebts)
                {
                    var outstanding = Math.Max(0, debt.Amount - debt.PaidAmount);
                    builder.AppendLine($"- {debt.PersonName}: Rs {FormatCurrency(outstanding)} due {debt.DueDate:yyyy-MM-dd}");
                }
            }

            return builder.ToString().TrimEnd();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch obligations for user {UserId}", userId);
            return $"Unable to determine upcoming obligations: {ex.Message}";
        }
    }

    [KernelFunction("get_next_month_forecast")]
    [Description("Projects income and expenses for next month based on recurring transactions and 6-month historical averages.")]
    public async Task<string> GetNextMonthForecastAsync(
        [Description("The user ID to project for")] Guid userId)
    {
        try
        {
            var endDate = DateTime.UtcNow;
            var sixMonthsAgo = endDate.AddMonths(-6);

            // Get recurring transactions
            var recurringTransactions = await _recurringTransactionService.GetActiveTransactionsAsync(userId);
            var recurringIncome = recurringTransactions
                .Where(rt => rt.Type == RecurringTransactionType.INCOME)
                .Sum(rt => rt.Frequency switch
                {
                    Frequency.DAILY => rt.Amount * 30,
                    Frequency.WEEKLY => rt.Amount * 4.33,
                    Frequency.MONTHLY => rt.Amount,
                    Frequency.YEARLY => rt.Amount / 12,
                    _ => rt.Amount
                });

            var recurringExpense = recurringTransactions
                .Where(rt => rt.Type == RecurringTransactionType.EXPENSE)
                .Sum(rt => rt.Frequency switch
                {
                    Frequency.DAILY => rt.Amount * 30,
                    Frequency.WEEKLY => rt.Amount * 4.33,
                    Frequency.MONTHLY => rt.Amount,
                    Frequency.YEARLY => rt.Amount / 12,
                    _ => rt.Amount
                });

            // Get last 6 months transactions for historical averages
            var last6MonthsTransactions = await _transactionService.GetByDateRangeAsync(userId, sixMonthsAgo, endDate);
            var sixMonthIncome = last6MonthsTransactions.Where(t => t.Type == TransactionType.INCOME).Sum(t => t.Amount);
            var sixMonthExpense = last6MonthsTransactions.Where(t => t.Type == TransactionType.EXPENSE).Sum(t => t.Amount);
            var monthsCount = 6;
            var avgMonthlyIncome = sixMonthIncome / monthsCount;
            var avgMonthlyExpense = sixMonthExpense / monthsCount;

            // Combine recurring and historical average (weighted approach)
            // Use recurring as base + 70% of historical average to account for non-recurring transactions
            var forecastIncome = recurringIncome + (avgMonthlyIncome * 0.7);
            var forecastExpense = recurringExpense + (avgMonthlyExpense * 0.7);
            var net = forecastIncome - forecastExpense;

            var builder = new StringBuilder();
            builder.AppendLine("Next-month forecast (recurring + historical average):");
            builder.AppendLine($"- Income: Rs {FormatCurrency(forecastIncome)}");
            builder.AppendLine($"  └─ Recurring: Rs {FormatCurrency(recurringIncome)} + Historical avg: Rs {FormatCurrency(avgMonthlyIncome * 0.7)}");
            builder.AppendLine($"- Expense: Rs {FormatCurrency(forecastExpense)}");
            builder.AppendLine($"  └─ Recurring: Rs {FormatCurrency(recurringExpense)} + Historical avg: Rs {FormatCurrency(avgMonthlyExpense * 0.7)}");
            builder.AppendLine($"- Net change: Rs {FormatCurrency(net)}");
            builder.AppendLine(net >= 0
                ? "You should be in surplus. Good financial health!"
                : $"Projected shortfall of Rs {FormatCurrency(Math.Abs(net))}. Consider adjusting spending or increasing income.");

            return builder.ToString().TrimEnd();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to produce forecast for user {UserId}", userId);
            return $"Unable to build forecast: {ex.Message}";
        }
    }

    private static string FormatCurrency(double value) => value.ToString("0.00");

    [KernelFunction("search_transactions")]
    [Description("Search transactions with optional filters for a user")]
    public async Task<string> SearchTransactionsAsync(
        [Description("The user ID to query")] Guid userId,
        [Description("Optional: start transaction date for filtering (yyyy-MM-dd)")] string? startDate = null,
        [Description("Optional: end transaction date for filtering (yyyy-MM-dd)")] string? endDate = null,
        [Description("Optional: filter by account ID")] int? fromAccountId = null,
        [Description("Optional: minimum amount to filter")] double? amountGreaterThan = null,
        [Description("Optional: maximum amount to filter")] double? amountLessThan = null,
        [Description("Optional: filter by transaction type (INCOME/EXPENSE/TRANSFER)")] string? type = null,
        [Description("Optional: filter by category")] string? category = null,
        [Description("Optional: filter by description keyword")] string? description = null)
    {
        try
        {
            DateTime? parsedStartDate = null;
            DateTime? parsedEndDate = null;

            if (!string.IsNullOrEmpty(startDate) && DateTime.TryParse(startDate, out var start))
                parsedStartDate = start;

            if (!string.IsNullOrEmpty(endDate) && DateTime.TryParse(endDate, out var end))
                parsedEndDate = end;

            var (transactions, totalCount) = await _transactionService.GetByUserIdWithFiltersAsync(
                userId,
                pageNumber: 0,
                pageSize: 10,
                startDate: parsedStartDate,
                endDate: parsedEndDate,
                fromAccountId: fromAccountId,
                amountGreaterThan: amountGreaterThan,
                amountLessThan: amountLessThan,
                type: type,
                category: category,
                description: description);

            if (!transactions.Any())
                return "No transactions found matching your search criteria.";

            var transactionsList = transactions.Select(t =>
                $"ID: {t.TransactionId}, Date: {t.Date:yyyy-MM-dd}, Amount: Rs {FormatCurrency(t.Amount)}, Type: {t.Type}, Category: {t.Category}, Description: {t.Description}");

            return $"Found {totalCount} transaction(s):\n" + string.Join("\n", transactionsList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching transactions");
            return $"Error searching transactions: {ex.Message}";
        }
    }

    [KernelFunction("search_debts")]
    [Description("Search debts with optional filters for a user")]
    public async Task<string> SearchDebtsAsync(
        [Description("The user ID to query")] Guid userId,
        [Description("Optional: filter by creditor/person name")] string? personName = null,
        [Description("Optional: minimum amount to filter")] double? amountGreaterThan = null,
        [Description("Optional: maximum amount to filter")] double? amountLessThan = null,
        [Description("Optional: filter by debt type")] string? debtType = null,
        [Description("Optional: filter by status (OPEN/CLOSED/SETTLED)")] string? status = null,
        [Description("Optional: start date for filtering (yyyy-MM-dd)")] string? startDate = null,
        [Description("Optional: end date for filtering (yyyy-MM-dd)")] string? endDate = null)
    {
        try
        {
            DateTime? parsedStartDate = null;
            DateTime? parsedEndDate = null;

            if (!string.IsNullOrEmpty(startDate) && DateTime.TryParse(startDate, out var start))
                parsedStartDate = start;

            if (!string.IsNullOrEmpty(endDate) && DateTime.TryParse(endDate, out var end))
                parsedEndDate = end;

            var (debts, totalCount) = await _debtService.GetByUserIdWithFiltersAsync(
                userId,
                pageNumber: 0,
                pageSize: 10,
                personName: personName,
                amountGreaterThan: amountGreaterThan,
                amountLessThan: amountLessThan,
                debtType: debtType,
                status: status,
                startDate: parsedStartDate,
                endDate: parsedEndDate);

            if (!debts.Any())
                return "No debts found matching your search criteria.";

            var debtsList = debts.Select(d =>
                $"ID: {d.DebtId}, Person: {d.PersonName}, Amount: Rs {FormatCurrency(d.Amount)}, Paid: Rs {FormatCurrency(d.PaidAmount)}, Outstanding: Rs {FormatCurrency(d.Amount - d.PaidAmount)}, Type: {d.DebtType}, Status: {d.Status}, Due: {d.DueDate:yyyy-MM-dd}");

            return $"Found {totalCount} debt(s):\n" + string.Join("\n", debtsList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching debts");
            return $"Error searching debts: {ex.Message}";
        }
    }

    [KernelFunction("search_bills")]
    [Description("Search bills with optional filters for a user")]
    public async Task<string> SearchBillsAsync(
        [Description("The user ID to query")] Guid userId,
        [Description("Optional: filter by client/vendor name")] string? client = null,
        [Description("Optional: filter by invoice number")] string? invoiceNumber = null,
        [Description("Optional: minimum amount to filter")] double? amountGreaterThan = null,
        [Description("Optional: maximum amount to filter")] double? amountLessThan = null,
        [Description("Optional: filter by due date (yyyy-MM-dd)")] string? dueDate = null)
    {
        try
        {
            DateTime? parsedDueDate = null;

            if (!string.IsNullOrEmpty(dueDate) && DateTime.TryParse(dueDate, out var due))
                parsedDueDate = due;

            var (bills, totalCount) = await _billService.GetByUserIdWithFiltersAsync(
                userId,
                pageNumber: 0,
                pageSize: 10,
                client: client,
                invoiceNumber: invoiceNumber,
                amountGreaterThan: amountGreaterThan,
                amountLessThan: amountLessThan,
                dueDate: parsedDueDate);

            if (!bills.Any())
                return "No bills found matching your search criteria.";

            var billsList = bills.Select(b =>
                $"ID: {b.BillId}, Client: {b.Client}, Invoice: {b.InvoiceNumber}, Amount: Rs {FormatCurrency(b.TotalAmount)}, Due: {b.DueDate:yyyy-MM-dd}, Status: {(b.DueDate.Date < DateTime.UtcNow.Date ? "Overdue" : "Pending")}");

            return $"Found {totalCount} bill(s):\n" + string.Join("\n", billsList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching bills");
            return $"Error searching bills: {ex.Message}";
        }
    }

    private static double EstimateMonthlyCommitment(IEnumerable<RecurringTransaction> recurring)
    {
        return recurring.Sum(rt => rt.Frequency switch
        {
            Frequency.DAILY => rt.Amount * 30,
            Frequency.WEEKLY => rt.Amount * 4,
            Frequency.MONTHLY => rt.Amount,
            Frequency.YEARLY => rt.Amount / 12,
            _ => rt.Amount
        });
    }
}