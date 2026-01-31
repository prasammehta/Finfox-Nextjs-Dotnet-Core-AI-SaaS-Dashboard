using Microsoft.EntityFrameworkCore;
using FinfoxApi.Models;
using FinfoxApi.Repositories;
using FinfoxApi.Interfaces;

namespace FinfoxApi.Services;

public class RecurringTransactionService : IRecurringTransactionService
{
    private readonly IRepository<RecurringTransaction> _repository;
    private readonly IRepository<Transaction> _transactionRepository;
    private readonly ILogger<RecurringTransactionService> _logger;

    public RecurringTransactionService(
        IRepository<RecurringTransaction> repository,
        IRepository<Transaction> transactionRepository,
        ILogger<RecurringTransactionService> logger)
    {
        _repository = repository;
        _transactionRepository = transactionRepository;
        _logger = logger;
    }

    public async Task<List<RecurringTransaction>> GetAllAsync()
    {
        try
        {
            return await _repository.Table.ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all recurring transactions");
            throw;
        }
    }

    public async Task<(List<RecurringTransaction> data, int totalCount)> GetAllAsync(int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table.CountAsync();
            var transactions = await _repository.Table
                .OrderByDescending(r => r.CreatedAt)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (transactions, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all recurring transactions with pagination");
            throw;
        }
    }

    public async Task<RecurringTransaction?> GetByIdAsync(int id)
    {
        try
        {
            return await _repository.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting recurring transaction with id {id}");
            throw;
        }
    }

    public async Task<RecurringTransaction?> GetByIdAsync(Guid id)
    {
        try
        {
            return await _repository.Table.FirstOrDefaultAsync(r => r.UserId == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting recurring transaction");
            throw;
        }
    }

    public async Task<List<RecurringTransaction>> GetByUserIdAsync(Guid userId)
    {
        try
        {
            return await _repository.Table
                .Where(r => r.UserId == userId)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting recurring transactions for user {userId}");
            throw;
        }
    }

    public async Task<(List<RecurringTransaction> data, int totalCount)> GetByUserIdAsync(Guid userId, int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table
                .Where(r => r.UserId == userId)
                .CountAsync();
            
            var transactions = await _repository.Table
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (transactions, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting recurring transactions for user {userId} with pagination");
            throw;
        }
    }

    public async Task<List<RecurringTransaction>> GetActiveTransactionsAsync(Guid userId)
    {
        try
        {
            var now = DateTime.UtcNow.Date;
            return await _repository.Table
                .Where(r => r.UserId == userId
                    && r.IsActive
                    && r.StartDate <= now
                    && (r.EndDate == null || r.EndDate >= now))
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting active recurring transactions");
            throw;
        }
    }

    public async Task<(List<RecurringTransaction> data, int totalCount)> GetAllWithFiltersAsync(
        int pageNumber,
        int pageSize,
        string? description = null,
        double? amountGreaterThan = null,
        double? amountLessThan = null,
        string? frequency = null,
        string? category = null,
        string? type = null,
        bool? isActive = null,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        try
        {
            var query = _repository.Table.AsQueryable();

            // Description Filter
            if (!string.IsNullOrEmpty(description))
                query = query.Where(r => r.Description.Contains(description));

            // Amount Range Filters
            if (amountGreaterThan.HasValue)
                query = query.Where(r => r.Amount > amountGreaterThan.Value);

            if (amountLessThan.HasValue)
                query = query.Where(r => r.Amount < amountLessThan.Value);

            // Frequency Filter
            if (!string.IsNullOrEmpty(frequency))
            {
                if (Enum.TryParse<Frequency>(frequency, ignoreCase: true, out var parsedFrequency))
                    query = query.Where(r => r.Frequency == parsedFrequency);
            }

            // Category Filter
            if (!string.IsNullOrEmpty(category))
            {
                if (Enum.TryParse<Category>(category, ignoreCase: true, out var parsedCategory))
                    query = query.Where(r => r.Category == parsedCategory);
            }

            // Type Filter
            if (!string.IsNullOrEmpty(type))
            {
                if (Enum.TryParse<RecurringTransactionType>(type, ignoreCase: true, out var parsedType))
                    query = query.Where(r => r.Type == parsedType);
            }

            // Status Filter (IsActive)
            if (isActive.HasValue)
                query = query.Where(r => r.IsActive == isActive.Value);

            // Start Date Filter
            if (startDate.HasValue)
                query = query.Where(r => r.StartDate >= startDate.Value);

            // End Date Filter
            if (endDate.HasValue)
                query = query.Where(r => r.EndDate == null || r.EndDate <= endDate.Value);

            var totalCount = await query.CountAsync();

            var transactions = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (transactions, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting filtered recurring transactions");
            throw;
        }
    }

    public async Task<(List<RecurringTransaction> data, int totalCount)> GetByUserIdWithFiltersAsync(
        Guid userId,
        int pageNumber,
        int pageSize,
        string? description = null,
        double? amountGreaterThan = null,
        double? amountLessThan = null,
        string? frequency = null,
        string? category = null,
        string? type = null,
        bool? isActive = null,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        try
        {
            var query = _repository.Table.Where(r => r.UserId == userId);

            // Description Filter
            if (!string.IsNullOrEmpty(description))
                query = query.Where(r => r.Description.Contains(description));

            // Amount Range Filters
            if (amountGreaterThan.HasValue)
                query = query.Where(r => r.Amount > amountGreaterThan.Value);

            if (amountLessThan.HasValue)
                query = query.Where(r => r.Amount < amountLessThan.Value);

            // Frequency Filter
            if (!string.IsNullOrEmpty(frequency))
            {
                if (Enum.TryParse<Frequency>(frequency, ignoreCase: true, out var parsedFrequency))
                    query = query.Where(r => r.Frequency == parsedFrequency);
            }

            // Category Filter
            if (!string.IsNullOrEmpty(category))
            {
                if (Enum.TryParse<Category>(category, ignoreCase: true, out var parsedCategory))
                    query = query.Where(r => r.Category == parsedCategory);
            }

            // Type Filter
            if (!string.IsNullOrEmpty(type))
            {
                if (Enum.TryParse<RecurringTransactionType>(type, ignoreCase: true, out var parsedType))
                    query = query.Where(r => r.Type == parsedType);
            }

            // Status Filter (IsActive)
            if (isActive.HasValue)
                query = query.Where(r => r.IsActive == isActive.Value);

            // Start Date Filter
            if (startDate.HasValue)
                query = query.Where(r => r.StartDate >= startDate.Value);

            // End Date Filter
            if (endDate.HasValue)
                query = query.Where(r => r.EndDate == null || r.EndDate <= endDate.Value);

            var totalCount = await query.CountAsync();

            var transactions = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (transactions, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting filtered recurring transactions for user {userId}");
            throw;
        }
    }

    public async Task ProcessRecurringTransactionsAsync(Guid userId)
    {
        try
        {
            var activeTransactions = await GetActiveTransactionsAsync(userId);

            foreach (var recurring in activeTransactions)
            {
                var lastGenerated = recurring.LastGeneratedDate ?? recurring.StartDate;
                var nextDue = GetNextDueDate(lastGenerated, recurring.Frequency.ToString());

                if (nextDue <= DateTime.UtcNow.Date)
                {
                    var newTransaction = new Transaction
                    {
                        UserId = userId,
                        Amount = recurring.Amount,
                        Date = nextDue,
                        Description = recurring.Description,
                        Type = (TransactionType)recurring.Type,
                        Category = recurring.Category,
                        FromAccountId = recurring.AccountId,
                        RecurringTransactionId = recurring.RecurringTransactionId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    await _transactionRepository.InsertAsync(newTransaction);

                    recurring.LastGeneratedDate = nextDue;
                    await _repository.UpdateAsync(recurring);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while processing recurring transactions");
            throw;
        }
    }

    private DateTime GetNextDueDate(DateTime lastDate, string frequency)
    {
        return frequency.ToLower() switch
        {
            "daily" => lastDate.AddDays(1),
            "weekly" => lastDate.AddDays(7),
            "monthly" => lastDate.AddMonths(1),
            "yearly" => lastDate.AddYears(1),
            _ => lastDate.AddMonths(1)
        };
    }

    public async Task AddAsync(RecurringTransaction entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.InsertAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while adding recurring transaction");
            throw;
        }
    }

    public async Task UpdateAsync(RecurringTransaction entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.UpdateAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while updating recurring transaction with id {entity.RecurringTransactionId}");
            throw;
        }
    }

    public async Task DeleteAsync(RecurringTransaction entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.DeleteAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while deleting recurring transaction with id {entity.RecurringTransactionId}");
            throw;
        }
    }

    public async Task<List<RecurringTransaction>> GetAllForExportAsync(
        string? description = null,
        double? amountGreaterThan = null,
        double? amountLessThan = null,
        string? frequency = null,
        string? category = null,
        string? type = null,
        bool? isActive = null,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        try
        {
            var query = _repository.Table.AsQueryable();

            // Description Filter
            if (!string.IsNullOrEmpty(description))
                query = query.Where(r => r.Description.Contains(description));

            // Amount Range Filters
            if (amountGreaterThan.HasValue)
                query = query.Where(r => r.Amount > amountGreaterThan.Value);

            if (amountLessThan.HasValue)
                query = query.Where(r => r.Amount < amountLessThan.Value);

            // Frequency Filter
            if (!string.IsNullOrEmpty(frequency))
            {
                if (Enum.TryParse<Frequency>(frequency, ignoreCase: true, out var parsedFrequency))
                    query = query.Where(r => r.Frequency == parsedFrequency);
            }

            // Category Filter
            if (!string.IsNullOrEmpty(category))
            {
                if (Enum.TryParse<Category>(category, ignoreCase: true, out var parsedCategory))
                    query = query.Where(r => r.Category == parsedCategory);
            }

            // Type Filter
            if (!string.IsNullOrEmpty(type))
            {
                if (Enum.TryParse<RecurringTransactionType>(type, ignoreCase: true, out var parsedType))
                    query = query.Where(r => r.Type == parsedType);
            }

            // Status Filter (IsActive)
            if (isActive.HasValue)
                query = query.Where(r => r.IsActive == isActive.Value);

            // Start Date Filter
            if (startDate.HasValue)
                query = query.Where(r => r.StartDate >= startDate.Value);

            // End Date Filter
            if (endDate.HasValue)
                query = query.Where(r => r.EndDate == null || r.EndDate <= endDate.Value);

            var transactions = await query
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return transactions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting recurring transactions for export");
            throw;
        }
    }

    public async Task<List<RecurringTransaction>> GetByUserIdForExportAsync(
        Guid userId,
        string? description = null,
        double? amountGreaterThan = null,
        double? amountLessThan = null,
        string? frequency = null,
        string? category = null,
        string? type = null,
        bool? isActive = null,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        try
        {
            var query = _repository.Table.Where(r => r.UserId == userId);

            // Description Filter
            if (!string.IsNullOrEmpty(description))
                query = query.Where(r => r.Description.Contains(description));

            // Amount Range Filters
            if (amountGreaterThan.HasValue)
                query = query.Where(r => r.Amount > amountGreaterThan.Value);

            if (amountLessThan.HasValue)
                query = query.Where(r => r.Amount < amountLessThan.Value);

            // Frequency Filter
            if (!string.IsNullOrEmpty(frequency))
            {
                if (Enum.TryParse<Frequency>(frequency, ignoreCase: true, out var parsedFrequency))
                    query = query.Where(r => r.Frequency == parsedFrequency);
            }

            // Category Filter
            if (!string.IsNullOrEmpty(category))
            {
                if (Enum.TryParse<Category>(category, ignoreCase: true, out var parsedCategory))
                    query = query.Where(r => r.Category == parsedCategory);
            }

            // Type Filter
            if (!string.IsNullOrEmpty(type))
            {
                if (Enum.TryParse<RecurringTransactionType>(type, ignoreCase: true, out var parsedType))
                    query = query.Where(r => r.Type == parsedType);
            }

            // Status Filter (IsActive)
            if (isActive.HasValue)
                query = query.Where(r => r.IsActive == isActive.Value);

            // Start Date Filter
            if (startDate.HasValue)
                query = query.Where(r => r.StartDate >= startDate.Value);

            // End Date Filter
            if (endDate.HasValue)
                query = query.Where(r => r.EndDate == null || r.EndDate <= endDate.Value);

            var transactions = await query
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return transactions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting recurring transactions for user {userId} for export");
            throw;
        }
    }

    public byte[] GenerateExcelExport(List<RecurringTransaction> transactions, string sheetName)
    {
        try
        {
            using (var workbook = new ClosedXML.Excel.XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add(sheetName);

                // Add headers
                worksheet.Cell(1, 1).Value = "Recurring Transaction ID";
                worksheet.Cell(1, 2).Value = "User ID";
                worksheet.Cell(1, 3).Value = "Description";
                worksheet.Cell(1, 4).Value = "Amount";
                worksheet.Cell(1, 5).Value = "Frequency";
                worksheet.Cell(1, 6).Value = "Category";
                worksheet.Cell(1, 7).Value = "Type";
                worksheet.Cell(1, 8).Value = "Start Date";
                worksheet.Cell(1, 9).Value = "End Date";
                worksheet.Cell(1, 10).Value = "Is Active";
                worksheet.Cell(1, 11).Value = "Account ID";

                // Format header row
                var headerRow = worksheet.Row(1);
                headerRow.Style.Font.Bold = true;
                headerRow.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;

                // Add data rows
                for (int i = 0; i < transactions.Count; i++)
                {
                    var transaction = transactions[i];
                    worksheet.Cell(i + 2, 1).Value = transaction.RecurringTransactionId;
                    worksheet.Cell(i + 2, 2).Value = transaction.UserId.ToString();
                    worksheet.Cell(i + 2, 3).Value = transaction.Description;
                    worksheet.Cell(i + 2, 4).Value = transaction.Amount;
                    worksheet.Cell(i + 2, 5).Value = transaction.Frequency.ToString();
                    worksheet.Cell(i + 2, 6).Value = transaction.Category.ToString();
                    worksheet.Cell(i + 2, 7).Value = transaction.Type.ToString();
                    worksheet.Cell(i + 2, 8).Value = transaction.StartDate.ToString("yyyy-MM-dd");
                    worksheet.Cell(i + 2, 9).Value = transaction.EndDate?.ToString("yyyy-MM-dd");
                    worksheet.Cell(i + 2, 10).Value = transaction.IsActive;
                    worksheet.Cell(i + 2, 11).Value = transaction.AccountId;
                }

                // Auto-fit columns
                worksheet.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return stream.ToArray();
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while generating Excel export for recurring transactions");
            throw;
        }
    }
}
