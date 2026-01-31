using Microsoft.EntityFrameworkCore;
using FinfoxApi.Models;
using FinfoxApi.Repositories;
using FinfoxApi.Interfaces;

namespace FinfoxApi.Services;

public class TransactionService : ITransactionService
{
    private readonly IRepository<Transaction> _repository;
    private readonly ILogger<TransactionService> _logger;

    public TransactionService(IRepository<Transaction> repository, ILogger<TransactionService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<List<Transaction>> GetAllAsync()
    {
        try
        {
            return await _repository.Table.ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all transactions");
            throw;
        }
    }

    public async Task<(List<Transaction> data, int totalCount)> GetAllAsync(int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table.CountAsync();
            var transactions = await _repository.Table
                .OrderByDescending(t => t.Date)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (transactions, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all transactions with pagination");
            throw;
        }
    }

    public async Task<(List<Transaction> data, int totalCount)> GetAllWithFiltersAsync(
        int pageNumber, 
        int pageSize,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? fromAccountId = null,
        double? amountGreaterThan = null,
        double? amountLessThan = null,
        string? type = null,
        string? category = null,
        string? description = null)
    {
        try
        {
            var query = _repository.Table.AsQueryable();

            // Date Range Filter
            if (startDate.HasValue)
                query = query.Where(t => t.Date >= startDate.Value);
            
            if (endDate.HasValue)
                query = query.Where(t => t.Date <= endDate.Value);

            // From Account ID Filter
            if (fromAccountId.HasValue)
                query = query.Where(t => t.FromAccountId == fromAccountId.Value);

            // Amount Range Filters
            if (amountGreaterThan.HasValue)
                query = query.Where(t => t.Amount > amountGreaterThan.Value);

            if (amountLessThan.HasValue)
                query = query.Where(t => t.Amount < amountLessThan.Value);

            // Type Filter
            if (!string.IsNullOrEmpty(type))
            {
                if (Enum.TryParse<TransactionType>(type, ignoreCase: true, out var parsedType))
                    query = query.Where(t => t.Type == parsedType);
            }

            // Category Filter
            if (!string.IsNullOrEmpty(category))
            {
                if (Enum.TryParse<Category>(category, ignoreCase: true, out var parsedCategory))
                    query = query.Where(t => t.Category == parsedCategory);
            }

            // Description Filter
            if (!string.IsNullOrEmpty(description))
                query = query.Where(t => t.Description != null && t.Description.ToLower().Contains(description.ToLower()));

            var totalCount = await query.CountAsync();
            
            var transactions = await query
                .OrderByDescending(t => t.Date)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (transactions, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting filtered transactions");
            throw;
        }
    }

    public async Task<(List<Transaction> data, int totalCount)> GetByUserIdWithFiltersAsync(
        Guid userId,
        int pageNumber, 
        int pageSize,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? fromAccountId = null,
        double? amountGreaterThan = null,
        double? amountLessThan = null,
        string? type = null,
        string? category = null,
        string? description = null)
    {
        try
        {
            var query = _repository.Table.Where(t => t.UserId == userId);

            // Date Range Filter
            if (startDate.HasValue)
                query = query.Where(t => t.Date >= startDate.Value);
            
            if (endDate.HasValue)
                query = query.Where(t => t.Date <= endDate.Value);

            // From Account ID Filter
            if (fromAccountId.HasValue)
                query = query.Where(t => t.FromAccountId == fromAccountId.Value);

            // Amount Range Filters
            if (amountGreaterThan.HasValue)
                query = query.Where(t => t.Amount > amountGreaterThan.Value);

            if (amountLessThan.HasValue)
                query = query.Where(t => t.Amount < amountLessThan.Value);

            // Type Filter
            if (!string.IsNullOrEmpty(type))
            {
                if (Enum.TryParse<TransactionType>(type, ignoreCase: true, out var parsedType))
                    query = query.Where(t => t.Type == parsedType);
            }

            // Category Filter
            if (!string.IsNullOrEmpty(category))
            {
                if (Enum.TryParse<Category>(category, ignoreCase: true, out var parsedCategory))
                    query = query.Where(t => t.Category == parsedCategory);
            }

            // Description Filter
            if (!string.IsNullOrEmpty(description))
                query = query.Where(t => t.Description != null && t.Description.ToLower().Contains(description.ToLower()));

            var totalCount = await query.CountAsync();
            
            var transactions = await query
                .OrderByDescending(t => t.Date)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (transactions, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting filtered transactions for user {userId}");
            throw;
        }
    }

    public async Task<Transaction?> GetByIdAsync(int id)
    {
        try
        {
            return await _repository.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting transaction with id {id}");
            throw;
        }
    }

    public async Task<Transaction?> GetByIdAsync(Guid id)
    {
        try
        {
            return await _repository.Table.FirstOrDefaultAsync(t => t.UserId == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting transaction");
            throw;
        }
    }

    public async Task<List<Transaction>> GetByUserIdAsync(Guid userId)
    {
        try
        {
            return await _repository.Table
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.Date)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting transactions for user {userId}");
            throw;
        }
    }

    public async Task<(List<Transaction> data, int totalCount)> GetByUserIdAsync(Guid userId, int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table
                .Where(t => t.UserId == userId)
                .CountAsync();
            
            var transactions = await _repository.Table
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.Date)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (transactions, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting transactions for user {userId} with pagination");
            throw;
        }
    }

    public async Task<List<Transaction>> GetByAccountIdAsync(int accountId)
    {
        try
        {
            return await _repository.Table
                .Where(t => t.FromAccountId == accountId || t.ToAccountId == accountId)
                .OrderByDescending(t => t.Date)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting transactions for account {accountId}");
            throw;
        }
    }

    public async Task<(List<Transaction> data, int totalCount)> GetByAccountIdAsync(int accountId, int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table
                .Where(t => t.FromAccountId == accountId || t.ToAccountId == accountId)
                .CountAsync();
            
            var transactions = await _repository.Table
                .Where(t => t.FromAccountId == accountId || t.ToAccountId == accountId)
                .OrderByDescending(t => t.Date)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (transactions, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting transactions for account {accountId} with pagination");
            throw;
        }
    }

    public async Task<List<Transaction>> GetByDateRangeAsync(Guid userId, DateTime startDate, DateTime endDate)
    {
        try
        {
            return await _repository.Table
                .Where(t => t.UserId == userId && t.Date >= startDate && t.Date <= endDate)
                .OrderByDescending(t => t.Date)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting transactions by date range");
            throw;
        }
    }

    public async Task<(List<Transaction> data, int totalCount)> GetByDateRangeAsync(Guid userId, DateTime startDate, DateTime endDate, int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table
                .Where(t => t.UserId == userId && t.Date >= startDate && t.Date <= endDate)
                .CountAsync();
            
            var transactions = await _repository.Table
                .Where(t => t.UserId == userId && t.Date >= startDate && t.Date <= endDate)
                .OrderByDescending(t => t.Date)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (transactions, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting transactions by date range with pagination");
            throw;
        }
    }

    public async Task<List<Transaction>> GetByCategoryAsync(Guid userId, string category)
    {
        try
        {
            var parsedCategory = Enum.Parse<Category>(category);
            return await _repository.Table
                .Where(t => t.UserId == userId && t.Category == parsedCategory)
                .OrderByDescending(t => t.Date)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting transactions by category");
            throw;
        }
    }

    public async Task AddAsync(Transaction entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.InsertAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while adding transaction");
            throw;
        }
    }

    public async Task UpdateAsync(Transaction entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.UpdateAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while updating transaction with id {entity.TransactionId}");
            throw;
        }
    }

    public async Task DeleteAsync(Transaction entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.DeleteAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while deleting transaction with id {entity.TransactionId}");
            throw;
        }
    }

    public async Task<List<Transaction>> GetAllForExportAsync(
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? fromAccountId = null,
        double? amountGreaterThan = null,
        double? amountLessThan = null,
        string? type = null,
        string? category = null,
        string? description = null)
    {
        try
        {
            var query = _repository.Table.AsQueryable();

            // Date Range Filter
            if (startDate.HasValue)
                query = query.Where(t => t.Date >= startDate.Value);
            
            if (endDate.HasValue)
                query = query.Where(t => t.Date <= endDate.Value);

            // From Account ID Filter
            if (fromAccountId.HasValue)
                query = query.Where(t => t.FromAccountId == fromAccountId.Value);

            // Amount Range Filters
            if (amountGreaterThan.HasValue)
                query = query.Where(t => t.Amount > amountGreaterThan.Value);

            if (amountLessThan.HasValue)
                query = query.Where(t => t.Amount < amountLessThan.Value);

            // Type Filter
            if (!string.IsNullOrEmpty(type))
            {
                if (Enum.TryParse<TransactionType>(type, ignoreCase: true, out var parsedType))
                    query = query.Where(t => t.Type == parsedType);
            }

            // Category Filter
            if (!string.IsNullOrEmpty(category))
            {
                if (Enum.TryParse<Category>(category, ignoreCase: true, out var parsedCategory))
                    query = query.Where(t => t.Category == parsedCategory);
            }

            // Description Filter
            if (!string.IsNullOrEmpty(description))
                query = query.Where(t => t.Description.Contains(description));

            var transactions = await query
                .OrderByDescending(t => t.Date)
                .ToListAsync();

            return transactions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting transactions for export");
            throw;
        }
    }

    public async Task<List<Transaction>> GetByUserIdForExportAsync(
        Guid userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? fromAccountId = null,
        double? amountGreaterThan = null,
        double? amountLessThan = null,
        string? type = null,
        string? category = null,
        string? description = null)
    {
        try
        {
            var query = _repository.Table.Where(t => t.UserId == userId);

            // Date Range Filter
            if (startDate.HasValue)
                query = query.Where(t => t.Date >= startDate.Value);
            
            if (endDate.HasValue)
                query = query.Where(t => t.Date <= endDate.Value);

            // From Account ID Filter
            if (fromAccountId.HasValue)
                query = query.Where(t => t.FromAccountId == fromAccountId.Value);

            // Amount Range Filters
            if (amountGreaterThan.HasValue)
                query = query.Where(t => t.Amount > amountGreaterThan.Value);

            if (amountLessThan.HasValue)
                query = query.Where(t => t.Amount < amountLessThan.Value);

            // Type Filter
            if (!string.IsNullOrEmpty(type))
            {
                if (Enum.TryParse<TransactionType>(type, ignoreCase: true, out var parsedType))
                    query = query.Where(t => t.Type == parsedType);
            }

            // Category Filter
            if (!string.IsNullOrEmpty(category))
            {
                if (Enum.TryParse<Category>(category, ignoreCase: true, out var parsedCategory))
                    query = query.Where(t => t.Category == parsedCategory);
            }

            // Description Filter
            if (!string.IsNullOrEmpty(description))
                query = query.Where(t => t.Description.Contains(description));

            var transactions = await query
                .OrderByDescending(t => t.Date)
                .ToListAsync();

            return transactions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting transactions for user {userId} for export");
            throw;
        }
    }

    public byte[] GenerateExcelExport(List<Transaction> transactions, string sheetName)
    {
        try
        {
            using (var workbook = new ClosedXML.Excel.XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add(sheetName);

                // Add headers
                worksheet.Cell(1, 1).Value = "Transaction ID";
                worksheet.Cell(1, 2).Value = "User ID";
                worksheet.Cell(1, 3).Value = "Date";
                worksheet.Cell(1, 4).Value = "Description";
                worksheet.Cell(1, 5).Value = "Amount";
                worksheet.Cell(1, 6).Value = "Type";
                worksheet.Cell(1, 7).Value = "Category";
                worksheet.Cell(1, 8).Value = "Account ID";

                // Format header row
                var headerRow = worksheet.Row(1);
                headerRow.Style.Font.Bold = true;
                headerRow.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;

                // Add data rows
                for (int i = 0; i < transactions.Count; i++)
                {
                    var transaction = transactions[i];
                    worksheet.Cell(i + 2, 1).Value = transaction.TransactionId;
                    worksheet.Cell(i + 2, 2).Value = transaction.UserId.ToString();
                    worksheet.Cell(i + 2, 3).Value = transaction.Date.ToString("yyyy-MM-dd");
                    worksheet.Cell(i + 2, 4).Value = transaction.Description;
                    worksheet.Cell(i + 2, 5).Value = transaction.Amount;
                    worksheet.Cell(i + 2, 6).Value = transaction.Type.ToString();
                    worksheet.Cell(i + 2, 7).Value = transaction.Category.ToString();
                    worksheet.Cell(i + 2, 8).Value = transaction.FromAccountId;
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
            _logger.LogError(ex, "Error occurred while generating Excel export for transactions");
            throw;
        }
    }
}
