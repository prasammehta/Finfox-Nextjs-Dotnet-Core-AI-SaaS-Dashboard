using Microsoft.SemanticKernel;
using System.ComponentModel;
using FinfoxApi.Interfaces;
using FinfoxApi.Models;

namespace FinfoxApi.Plugins;

public class TransactionPlugin
{
    private readonly ITransactionService _transactionService;
    private readonly IAccountService _accountService;
    private readonly IDebtService _debtService;
    private readonly ILogger<TransactionPlugin> _logger;

    public TransactionPlugin(
        ITransactionService transactionService,
        IAccountService accountService,
        IDebtService debtService,
        ILogger<TransactionPlugin> logger)
    {
        _transactionService = transactionService;
        _accountService = accountService;
        _debtService = debtService;
        _logger = logger;
    }

    [KernelFunction("get_user_accounts")]
    [Description("Get all accounts for a user")]
    public async Task<string> GetUserAccountsAsync(
        [Description("The user ID")] Guid userId)
    {
        try
        {
            var accounts = await _accountService.GetByUserIdAsync(userId);
            if (!accounts.Any())
                return "No accounts found for this user.";

            var accountsList = accounts.Select(a => $"ID: {a.AccountId}, Name: {a.Name}, Balance: ${a.CurrentBalance}");
            return string.Join("\n", accountsList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user accounts");
            return $"Error retrieving accounts: {ex.Message}";
        }
    }

    [KernelFunction("get_user_debts")]
    [Description("Get all active debts for a user")]
    public async Task<string> GetUserDebtsAsync(
        [Description("The user ID")] Guid userId)
    {
        try
        {
            var debts = await _debtService.GetByUserIdAsync(userId);
            if (!debts.Any())
                return "No debts found for this user.";

            var debtsList = debts.Select(d => $"ID: {d.DebtId}, Person: {d.PersonName}, Amount: ${d.Amount}, Status: {d.Status}");
            return string.Join("\n", debtsList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user debts");
            return $"Error retrieving debts: {ex.Message}";
        }
    }

    [KernelFunction("validate_transaction_data")]
    [Description("Validate if transaction data has all required fields")]
    public string ValidateTransactionData(
        [Description("Amount in double")] double? amount,
        [Description("Transaction type: INCOME or EXPENSE")] string? type,
        [Description("From account ID")] int? fromAccountId)
    {
        var missingFields = new List<string>();

        if (!amount.HasValue || amount <= 0)
            missingFields.Add("Amount (must be greater than 0)");

        if (string.IsNullOrEmpty(type) || (type != "INCOME" && type != "EXPENSE"))
            missingFields.Add("Type (must be 'INCOME' or 'EXPENSE')");

        if (!fromAccountId.HasValue || fromAccountId <= 0)
            missingFields.Add("From Account ID (required)");

        if (missingFields.Any())
            return $"Missing required fields: {string.Join(", ", missingFields)}";

        return "Validation passed";
    }

    [KernelFunction("get_transaction_categories")]
    [Description("Get available transaction categories")]
    public string GetTransactionCategories()
    {
        var categories = new[]
        {
            "GROCERIES", "UTILITIES", "ENTERTAINMENT", "TRANSPORTATION",
            "HEALTHCARE", "EDUCATION", "DINING", "SHOPPING",
            "SALARY", "FREELANCE", "INVESTMENT", "OTHER_INCOME", "OTHER_EXPENSE"
        };

        return string.Join(", ", categories);
    }

    [KernelFunction("create_transaction")]
    [Description("Create a new transaction for the user")]
    public async Task<string> CreateTransactionAsync(
        [Description("User ID")] Guid userId,
        [Description("Amount in double")] double amount,
        [Description("Transaction type: INCOME or EXPENSE")] string type,
        [Description("From account ID")] int fromAccountId,
        [Description("Transaction date in YYYY-MM-DD format")] string? date = null,
        [Description("Transaction description")] string? description = null,
        [Description("Transaction category")] string? category = null,
        [Description("To account ID for transfers")] int? toAccountId = null,
        [Description("Debt ID if payment related")] int? debtId = null)
    {
        try
        {
            // Validate enum values
            if (!Enum.TryParse<TransactionType>(type, ignoreCase: true, out var transactionType))
            {
                return $"Invalid transaction type '{type}'. Must be 'INCOME' or 'EXPENSE'";
            }

            var transaction = new Transaction
            {
                UserId = userId,
                Amount = amount,
                Type = transactionType,
                FromAccountId = fromAccountId,
                ToAccountId = toAccountId,
                DebtId = debtId,
                Description = description,
                Category = string.IsNullOrEmpty(category)
                    ? null
                    : Enum.TryParse<Category>(category, ignoreCase: true, out var cat)
                        ? cat
                        : null,
                Date = string.IsNullOrEmpty(date) ? DateTime.UtcNow : DateTime.Parse(date),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _transactionService.AddAsync(transaction);

            _logger.LogInformation($"Transaction created successfully. ID: {transaction.TransactionId}, Amount: {transaction.Amount}, Type: {transaction.Type}, UserId: {userId}");

            return $"✓ New Transaction created successfully! ID: {transaction.TransactionId}, Amount: Rs {transaction.Amount}, Type: {transaction.Type}, Date: {transaction.Date:yyyy-MM-dd}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error creating transaction for user {userId}: {ex.Message}");
            return $"✗ Error creating transaction: {ex.Message}";
        }
    }

    [KernelFunction("get_user_transactions")]
    [Description("Get all transactions for a user")]
    public async Task<string> GetUserTransactionsAsync(
        [Description("The user ID")] Guid userId,
        [Description("Optional: number of recent transactions to return")] int limit = 10)
    {
        try
        {
            var transactions = await _transactionService.GetByUserIdAsync(userId);

            if (!transactions.Any())
                return "No transactions found for this user.";

            var recentTransactions = transactions
                .OrderByDescending(t => t.Date)
                .Take(limit)
                .Select(t => $"ID: {t.TransactionId}, Amount: ${t.Amount}, Type: {t.Type}, Category: {t.Category}, Date: {t.Date:yyyy-MM-dd}");

            return string.Join("\n", recentTransactions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user transactions");
            return $"Error retrieving transactions: {ex.Message}";
        }
    }
}
