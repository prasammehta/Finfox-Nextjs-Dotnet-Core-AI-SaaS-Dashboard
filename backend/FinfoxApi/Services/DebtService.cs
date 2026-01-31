using Microsoft.EntityFrameworkCore;
using FinfoxApi.Models;
using FinfoxApi.Repositories;
using FinfoxApi.Interfaces;

namespace FinfoxApi.Services;

public class DebtService : IDebtService
{
    private readonly IRepository<Debt> _repository;
    private readonly ILogger<DebtService> _logger;

    public DebtService(IRepository<Debt> repository, ILogger<DebtService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<List<Debt>> GetAllAsync()
    {
        try
        {
            return await _repository.Table.ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all debts");
            throw;
        }
    }

    public async Task<(List<Debt> data, int totalCount)> GetAllAsync(int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table.CountAsync();
            var debts = await _repository.Table
                .OrderByDescending(d => d.DueDate)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (debts, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all debts with pagination");
            throw;
        }
    }

    public async Task<Debt?> GetByIdAsync(int id)
    {
        try
        {
            return await _repository.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting debt with id {id}");
            throw;
        }
    }

    public async Task<Debt?> GetByIdAsync(Guid id)
    {
        try
        {
            return await _repository.Table.FirstOrDefaultAsync(d => d.UserId == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting debt");
            throw;
        }
    }

    public async Task<List<Debt>> GetByUserIdAsync(Guid userId)
    {
        try
        {
            return await _repository.Table
                .Where(d => d.UserId == userId)
                .OrderByDescending(d => d.DueDate)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting debts for user {userId}");
            throw;
        }
    }

    public async Task<(List<Debt> data, int totalCount)> GetByUserIdAsync(Guid userId, int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table
                .Where(d => d.UserId == userId)
                .CountAsync();
            
            var debts = await _repository.Table
                .Where(d => d.UserId == userId)
                .OrderByDescending(d => d.DueDate)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (debts, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting debts for user {userId} with pagination");
            throw;
        }
    }

    public async Task<List<Debt>> GetActiveDebtsAsync(Guid userId)
    {
        try
        {
            return await _repository.Table
                .Where(d => d.UserId == userId && d.Status != "Settled")
                .OrderByDescending(d => d.DueDate)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting active debts");
            throw;
        }
    }

    public async Task<(List<Debt> data, int totalCount)> GetActiveDebtsAsync(Guid userId, int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table
                .Where(d => d.UserId == userId && d.Status != "Settled")
                .CountAsync();
            
            var debts = await _repository.Table
                .Where(d => d.UserId == userId && d.Status != "Settled")
                .OrderByDescending(d => d.DueDate)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (debts, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting active debts with pagination");
            throw;
        }
    }

    public async Task<double> GetTotalDebtAsync(Guid userId)
    {
        try
        {
            var debts = await _repository.Table
                .Where(d => d.UserId == userId && d.Status != "Settled")
                .ToListAsync();

            return debts.Sum(d => d.Amount - d.PaidAmount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while calculating total debt");
            throw;
        }
    }

    public async Task AddAsync(Debt entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.InsertAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while adding debt");
            throw;
        }
    }

    public async Task UpdateAsync(Debt entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.UpdateAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while updating debt with id {entity.DebtId}");
            throw;
        }
    }

    public async Task DeleteAsync(Debt entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.DeleteAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while deleting debt with id {entity.DebtId}");
            throw;
        }
    }

    public async Task<(List<Debt> data, int totalCount)> GetAllWithFiltersAsync(int pageNumber, int pageSize, string? personName = null, double? amountGreaterThan = null, double? amountLessThan = null, string? debtType = null, string? status = null, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            var query = _repository.Table.AsQueryable();

            if (!string.IsNullOrWhiteSpace(personName))
                query = query.Where(d => d.PersonName.Contains(personName));

            if (amountGreaterThan.HasValue)
                query = query.Where(d => d.Amount > amountGreaterThan.Value);

            if (amountLessThan.HasValue)
                query = query.Where(d => d.Amount < amountLessThan.Value);

            if (!string.IsNullOrWhiteSpace(debtType))
                query = query.Where(d => d.DebtType == debtType);

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(d => d.Status == status);

            if (startDate.HasValue)
                query = query.Where(d => d.Date >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(d => d.Date <= endDate.Value);

            var totalCount = await query.CountAsync();

            var debts = await query
                .OrderByDescending(d => d.DueDate)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (debts, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all debts with filters");
            throw;
        }
    }

    public async Task<(List<Debt> data, int totalCount)> GetByUserIdWithFiltersAsync(Guid userId, int pageNumber, int pageSize, string? personName = null, double? amountGreaterThan = null, double? amountLessThan = null, string? debtType = null, string? status = null, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            var query = _repository.Table.Where(d => d.UserId == userId).AsQueryable();

            if (!string.IsNullOrWhiteSpace(personName))
                query = query.Where(d => d.PersonName.Contains(personName));

            if (amountGreaterThan.HasValue)
                query = query.Where(d => d.Amount > amountGreaterThan.Value);

            if (amountLessThan.HasValue)
                query = query.Where(d => d.Amount < amountLessThan.Value);

            if (!string.IsNullOrWhiteSpace(debtType))
                query = query.Where(d => d.DebtType == debtType);

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(d => d.Status == status);

            if (startDate.HasValue)
                query = query.Where(d => d.Date >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(d => d.Date <= endDate.Value);

            var totalCount = await query.CountAsync();

            var debts = await query
                .OrderByDescending(d => d.DueDate)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (debts, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting debts for user {userId} with filters");
            throw;
        }
    }

    public async Task<List<Debt>> GetAllForExportAsync(string? personName = null, double? amountGreaterThan = null, double? amountLessThan = null, string? debtType = null, string? status = null, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            var query = _repository.Table.AsQueryable();

            if (!string.IsNullOrWhiteSpace(personName))
                query = query.Where(d => d.PersonName.Contains(personName));

            if (amountGreaterThan.HasValue)
                query = query.Where(d => d.Amount > amountGreaterThan.Value);

            if (amountLessThan.HasValue)
                query = query.Where(d => d.Amount < amountLessThan.Value);

            if (!string.IsNullOrWhiteSpace(debtType))
                query = query.Where(d => d.DebtType == debtType);

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(d => d.Status == status);

            if (startDate.HasValue)
                query = query.Where(d => d.Date >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(d => d.Date <= endDate.Value);

            return await query.OrderByDescending(d => d.DueDate).ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all debts for export");
            throw;
        }
    }

    public async Task<List<Debt>> GetByUserIdForExportAsync(Guid userId, string? personName = null, double? amountGreaterThan = null, double? amountLessThan = null, string? debtType = null, string? status = null, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            var query = _repository.Table.Where(d => d.UserId == userId).AsQueryable();

            if (!string.IsNullOrWhiteSpace(personName))
                query = query.Where(d => d.PersonName.Contains(personName));

            if (amountGreaterThan.HasValue)
                query = query.Where(d => d.Amount > amountGreaterThan.Value);

            if (amountLessThan.HasValue)
                query = query.Where(d => d.Amount < amountLessThan.Value);

            if (!string.IsNullOrWhiteSpace(debtType))
                query = query.Where(d => d.DebtType == debtType);

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(d => d.Status == status);

            if (startDate.HasValue)
                query = query.Where(d => d.Date >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(d => d.Date <= endDate.Value);

            return await query.OrderByDescending(d => d.DueDate).ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting debts for user {userId} for export");
            throw;
        }
    }

    public byte[] GenerateExcelExport(List<Debt> debts, string sheetName)
    {
        try
        {
            using (var workbook = new ClosedXML.Excel.XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add(sheetName);

                // Add headers
                worksheet.Cell(1, 1).Value = "Debt ID";
                worksheet.Cell(1, 2).Value = "Person Name";
                worksheet.Cell(1, 3).Value = "Amount";
                worksheet.Cell(1, 4).Value = "Debt Type";
                worksheet.Cell(1, 5).Value = "Date";
                worksheet.Cell(1, 6).Value = "Due Date";
                worksheet.Cell(1, 7).Value = "Status";
                worksheet.Cell(1, 8).Value = "Paid Amount";
                worksheet.Cell(1, 9).Value = "Notes";

                // Format header row
                var headerRow = worksheet.Row(1);
                headerRow.Style.Font.Bold = true;
                headerRow.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;

                // Add data rows
                for (int i = 0; i < debts.Count; i++)
                {
                    var debt = debts[i];
                    worksheet.Cell(i + 2, 1).Value = debt.DebtId;
                    worksheet.Cell(i + 2, 2).Value = debt.PersonName;
                    worksheet.Cell(i + 2, 3).Value = debt.Amount;
                    worksheet.Cell(i + 2, 4).Value = debt.DebtType;
                    worksheet.Cell(i + 2, 5).Value = debt.Date.ToString("yyyy-MM-dd");
                    worksheet.Cell(i + 2, 6).Value = debt.DueDate?.ToString("yyyy-MM-dd");
                    worksheet.Cell(i + 2, 7).Value = debt.Status;
                    worksheet.Cell(i + 2, 8).Value = debt.PaidAmount;
                    worksheet.Cell(i + 2, 9).Value = debt.Notes;
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
            _logger.LogError(ex, "Error occurred while generating Excel export for debts");
            throw;
        }
    }
}
