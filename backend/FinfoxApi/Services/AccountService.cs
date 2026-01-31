using Microsoft.EntityFrameworkCore;
using FinfoxApi.Models;
using FinfoxApi.Repositories;
using FinfoxApi.Interfaces;

namespace FinfoxApi.Services;

public class AccountService : IAccountService
{
    private readonly IRepository<Account> _repository;
    private readonly IRepository<Transaction> _transactionRepository;
    private readonly ILogger<AccountService> _logger;

    public AccountService(
        IRepository<Account> repository,
        IRepository<Transaction> transactionRepository,
        ILogger<AccountService> logger)
    {
        _repository = repository;
        _transactionRepository = transactionRepository;
        _logger = logger;
    }

    public async Task<List<Account>> GetAllAsync()
    {
        try
        {
            return await _repository.Table.ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all accounts");
            throw;
        }
    }

    public async Task<(List<Account> data, int totalCount)> GetAllAsync(int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table.CountAsync();
            var accounts = await _repository.Table
                .OrderByDescending(a => a.CreatedAt)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (accounts, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all accounts with pagination");
            throw;
        }
    }

    public async Task<Account?> GetByIdAsync(int id)
    {
        try
        {
            return await _repository.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting account with id {id}");
            throw;
        }
    }

    public async Task<Account?> GetByIdAsync(Guid id)
    {
        try
        {
            return await _repository.Table.FirstOrDefaultAsync(a => a.UserId == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting account");
            throw;
        }
    }

    public async Task<List<Account>> GetByUserIdAsync(Guid userId)
    {
        try
        {
            return await _repository.Table
                .Where(a => a.UserId == userId)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting accounts for user {userId}");
            throw;
        }
    }

    public async Task<(List<Account> data, int totalCount)> GetByUserIdAsync(Guid userId, int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table
                .Where(a => a.UserId == userId)
                .CountAsync();
            
            var accounts = await _repository.Table
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (accounts, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting accounts for user {userId} with pagination");
            throw;
        }
    }

    public async Task<Account?> GetByUserAndNameAsync(Guid userId, string name)
    {
        try
        {
            return await _repository.Table
                .FirstOrDefaultAsync(a => a.UserId == userId && a.Name == name);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting account by name");
            throw;
        }
    }

    public async Task<double> GetCurrentBalanceAsync(int accountId)
    {
        try
        {
            var account = await GetByIdAsync(accountId);
            return account?.CurrentBalance ?? 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting balance for account {accountId}");
            throw;
        }
    }

    public async Task AddAsync(Account entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.InsertAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while adding account");
            throw;
        }
    }

    public async Task UpdateAsync(Account entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.UpdateAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while updating account with id {entity.AccountId}");
            throw;
        }
    }

    public async Task DeleteAsync(Account entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.DeleteAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while deleting account with id {entity.AccountId}");
            throw;
        }
    }

    public async Task<(List<Account> data, int totalCount)> GetAllWithFiltersAsync(int pageNumber, int pageSize, string? name = null, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            var query = _repository.Table.AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(a => a.Name.Contains(name));

            if (startDate.HasValue)
                query = query.Where(a => a.CreatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(a => a.CreatedAt <= endDate.Value);

            var totalCount = await query.CountAsync();

            var accounts = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (accounts, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all accounts with filters");
            throw;
        }
    }

    public async Task<(List<Account> data, int totalCount)> GetByUserIdWithFiltersAsync(Guid userId, int pageNumber, int pageSize, string? name = null, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            var query = _repository.Table.Where(a => a.UserId == userId).AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(a => a.Name.Contains(name));

            if (startDate.HasValue)
                query = query.Where(a => a.CreatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(a => a.CreatedAt <= endDate.Value);

            var totalCount = await query.CountAsync();

            var accounts = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (accounts, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting accounts for user {userId} with filters");
            throw;
        }
    }

    public async Task<List<Account>> GetAllForExportAsync(string? name = null, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            var query = _repository.Table.AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(a => a.Name.Contains(name));

            if (startDate.HasValue)
                query = query.Where(a => a.CreatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(a => a.CreatedAt <= endDate.Value);

            return await query.OrderByDescending(a => a.CreatedAt).ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all accounts for export");
            throw;
        }
    }

    public async Task<List<Account>> GetByUserIdForExportAsync(Guid userId, string? name = null, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            var query = _repository.Table.Where(a => a.UserId == userId).AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(a => a.Name.Contains(name));

            if (startDate.HasValue)
                query = query.Where(a => a.CreatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(a => a.CreatedAt <= endDate.Value);

            return await query.OrderByDescending(a => a.CreatedAt).ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting accounts for user {userId} for export");
            throw;
        }
    }

    public byte[] GenerateExcelExport(List<Account> accounts, string sheetName)
    {
        try
        {
            using (var workbook = new ClosedXML.Excel.XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add(sheetName);

                // Add headers
                worksheet.Cell(1, 1).Value = "Account ID";
                worksheet.Cell(1, 2).Value = "Name";
                worksheet.Cell(1, 3).Value = "Initial Balance";
                worksheet.Cell(1, 4).Value = "Current Balance";
                worksheet.Cell(1, 5).Value = "Created At";
                worksheet.Cell(1, 6).Value = "Updated At";

                // Format header row
                var headerRow = worksheet.Row(1);
                headerRow.Style.Font.Bold = true;
                headerRow.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;

                // Add data rows
                for (int i = 0; i < accounts.Count; i++)
                {
                    var account = accounts[i];
                    worksheet.Cell(i + 2, 1).Value = account.AccountId;
                    worksheet.Cell(i + 2, 2).Value = account.Name;
                    worksheet.Cell(i + 2, 3).Value = account.InitialBalance;
                    worksheet.Cell(i + 2, 4).Value = account.CurrentBalance;
                    worksheet.Cell(i + 2, 5).Value = account.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss");
                    worksheet.Cell(i + 2, 6).Value = account.UpdatedAt.ToString("yyyy-MM-dd HH:mm:ss");
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
            _logger.LogError(ex, "Error occurred while generating Excel export for accounts");
            throw;
        }
    }
}
