using Microsoft.EntityFrameworkCore;
using FinfoxApi.Models;
using FinfoxApi.Repositories;
using FinfoxApi.Interfaces;

namespace FinfoxApi.Services;

public class InvestmentService : IInvestmentService
{
    private readonly IRepository<Investment> _repository;
    private readonly ILogger<InvestmentService> _logger;

    public InvestmentService(IRepository<Investment> repository, ILogger<InvestmentService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<List<Investment>> GetAllAsync()
    {
        try
        {
            return await _repository.Table.ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all investments");
            throw;
        }
    }

    public async Task<(List<Investment> data, int totalCount)> GetAllAsync(int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table.CountAsync();
            var investments = await _repository.Table
                .OrderByDescending(i => i.CreatedAt)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (investments, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all investments with pagination");
            throw;
        }
    }

    public async Task<Investment?> GetByIdAsync(int id)
    {
        try
        {
            return await _repository.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting investment with id {id}");
            throw;
        }
    }

    public async Task<Investment?> GetByIdAsync(Guid id)
    {
        try
        {
            return await _repository.Table.FirstOrDefaultAsync(i => i.UserId == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting investment");
            throw;
        }
    }

    public async Task<List<Investment>> GetByUserIdAsync(Guid userId)
    {
        try
        {
            return await _repository.Table
                .Where(i => i.UserId == userId)
                .OrderByDescending(i => i.DateAcquired)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting investments for user {userId}");
            throw;
        }
    }

    public async Task<(List<Investment> data, int totalCount)> GetByUserIdAsync(Guid userId, int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table
                .Where(i => i.UserId == userId)
                .CountAsync();
            
            var investments = await _repository.Table
                .Where(i => i.UserId == userId)
                .OrderByDescending(i => i.CreatedAt)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (investments, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting investments for user {userId} with pagination");
            throw;
        }
    }

    public async Task<double> GetTotalInvestmentValueAsync(Guid userId)
    {
        try
        {
            var investments = await _repository.Table
                .Where(i => i.UserId == userId)
                .ToListAsync();

            return investments.Sum(i => i.CurrentValue);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while calculating total investment value");
            throw;
        }
    }

    public async Task<double> GetInvestmentGainLossAsync(int investmentId)
    {
        try
        {
            var investment = await GetByIdAsync(investmentId);
            if (investment == null)
                return 0;

            return investment.CurrentValue - investment.InitialAmount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while calculating gain/loss");
            throw;
        }
    }

    public async Task AddAsync(Investment entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.InsertAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while adding investment");
            throw;
        }
    }

    public async Task UpdateAsync(Investment entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.UpdateAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while updating investment with id {entity.InvestmentId}");
            throw;
        }
    }

    public async Task DeleteAsync(Investment entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.DeleteAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while deleting investment with id {entity.InvestmentId}");
            throw;
        }
    }

    public async Task<(List<Investment> data, int totalCount)> GetAllWithFiltersAsync(int pageNumber, int pageSize, string? name = null, string? type = null, double? gainLossGreaterThan = null, double? gainLossLessThan = null, double? returnPercentGreaterThan = null, DateTime? dateAcquired = null)
    {
        try
        {
            var query = _repository.Table.AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(i => i.Name.Contains(name));

            if (!string.IsNullOrWhiteSpace(type))
                query = query.Where(i => i.Type.ToString() == type);

            if (gainLossGreaterThan.HasValue)
                query = query.Where(i => (i.CurrentValue - i.InitialAmount) > gainLossGreaterThan.Value);

            if (gainLossLessThan.HasValue)
                query = query.Where(i => (i.CurrentValue - i.InitialAmount) < gainLossLessThan.Value);

            if (returnPercentGreaterThan.HasValue)
            {
                query = query.Where(i => i.InitialAmount > 0 && 
                    ((i.CurrentValue - i.InitialAmount) / i.InitialAmount * 100) > returnPercentGreaterThan.Value);
            }

            if (dateAcquired.HasValue)
                query = query.Where(i => i.DateAcquired >= dateAcquired.Value);

            var totalCount = await query.CountAsync();

            var investments = await query
                .OrderByDescending(i => i.DateAcquired)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (investments, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all investments with filters");
            throw;
        }
    }

    public async Task<(List<Investment> data, int totalCount)> GetByUserIdWithFiltersAsync(Guid userId, int pageNumber, int pageSize, string? name = null, string? type = null, double? gainLossGreaterThan = null, double? gainLossLessThan = null, double? returnPercentGreaterThan = null, DateTime? dateAcquired = null)
    {
        try
        {
            var query = _repository.Table.Where(i => i.UserId == userId).AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(i => i.Name.Contains(name));

            if (!string.IsNullOrWhiteSpace(type))
                query = query.Where(i => i.Type.ToString() == type);

            if (gainLossGreaterThan.HasValue)
                query = query.Where(i => (i.CurrentValue - i.InitialAmount) > gainLossGreaterThan.Value);

            if (gainLossLessThan.HasValue)
                query = query.Where(i => (i.CurrentValue - i.InitialAmount) < gainLossLessThan.Value);

            if (returnPercentGreaterThan.HasValue)
            {
                query = query.Where(i => i.InitialAmount > 0 && 
                    ((i.CurrentValue - i.InitialAmount) / i.InitialAmount * 100) > returnPercentGreaterThan.Value);
            }

            if (dateAcquired.HasValue)
                query = query.Where(i => i.DateAcquired >= dateAcquired.Value);

            var totalCount = await query.CountAsync();

            var investments = await query
                .OrderByDescending(i => i.DateAcquired)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (investments, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting investments for user {userId} with filters");
            throw;
        }
    }

    public async Task<List<Investment>> GetAllForExportAsync(string? name = null, string? type = null, double? gainLossGreaterThan = null, double? gainLossLessThan = null, double? returnPercentGreaterThan = null, DateTime? dateAcquired = null)
    {
        try
        {
            var query = _repository.Table.AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(i => i.Name.Contains(name));

            if (!string.IsNullOrWhiteSpace(type))
                query = query.Where(i => i.Type.ToString() == type);

            if (gainLossGreaterThan.HasValue)
                query = query.Where(i => (i.CurrentValue - i.InitialAmount) > gainLossGreaterThan.Value);

            if (gainLossLessThan.HasValue)
                query = query.Where(i => (i.CurrentValue - i.InitialAmount) < gainLossLessThan.Value);

            if (returnPercentGreaterThan.HasValue)
            {
                query = query.Where(i => i.InitialAmount > 0 && 
                    ((i.CurrentValue - i.InitialAmount) / i.InitialAmount * 100) > returnPercentGreaterThan.Value);
            }

            if (dateAcquired.HasValue)
                query = query.Where(i => i.DateAcquired >= dateAcquired.Value);

            return await query.OrderByDescending(i => i.DateAcquired).ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all investments for export");
            throw;
        }
    }

    public async Task<List<Investment>> GetByUserIdForExportAsync(Guid userId, string? name = null, string? type = null, double? gainLossGreaterThan = null, double? gainLossLessThan = null, double? returnPercentGreaterThan = null, DateTime? dateAcquired = null)
    {
        try
        {
            var query = _repository.Table.Where(i => i.UserId == userId).AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(i => i.Name.Contains(name));

            if (!string.IsNullOrWhiteSpace(type))
                query = query.Where(i => i.Type.ToString() == type);

            if (gainLossGreaterThan.HasValue)
                query = query.Where(i => (i.CurrentValue - i.InitialAmount) > gainLossGreaterThan.Value);

            if (gainLossLessThan.HasValue)
                query = query.Where(i => (i.CurrentValue - i.InitialAmount) < gainLossLessThan.Value);

            if (returnPercentGreaterThan.HasValue)
            {
                query = query.Where(i => i.InitialAmount > 0 && 
                    ((i.CurrentValue - i.InitialAmount) / i.InitialAmount * 100) > returnPercentGreaterThan.Value);
            }

            if (dateAcquired.HasValue)
                query = query.Where(i => i.DateAcquired >= dateAcquired.Value);

            return await query.OrderByDescending(i => i.DateAcquired).ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting investments for user {userId} for export");
            throw;
        }
    }

    public byte[] GenerateExcelExport(List<Investment> investments, string sheetName)
    {
        try
        {
            using (var workbook = new ClosedXML.Excel.XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add(sheetName);

                // Add headers
                worksheet.Cell(1, 1).Value = "Investment ID";
                worksheet.Cell(1, 2).Value = "Name";
                worksheet.Cell(1, 3).Value = "Type";
                worksheet.Cell(1, 4).Value = "Initial Amount";
                worksheet.Cell(1, 5).Value = "Current Value";
                worksheet.Cell(1, 6).Value = "Gain/Loss";
                worksheet.Cell(1, 7).Value = "Return %";
                worksheet.Cell(1, 8).Value = "Date Acquired";
                worksheet.Cell(1, 9).Value = "Notes";

                // Format header row
                var headerRow = worksheet.Row(1);
                headerRow.Style.Font.Bold = true;
                headerRow.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;

                // Add data rows
                for (int i = 0; i < investments.Count; i++)
                {
                    var investment = investments[i];
                    var gainLoss = investment.CurrentValue - investment.InitialAmount;
                    var returnPercent = investment.InitialAmount > 0 ? (gainLoss / investment.InitialAmount * 100) : 0;

                    worksheet.Cell(i + 2, 1).Value = investment.InvestmentId;
                    worksheet.Cell(i + 2, 2).Value = investment.Name;
                    worksheet.Cell(i + 2, 3).Value = investment.Type.ToString();
                    worksheet.Cell(i + 2, 4).Value = investment.InitialAmount;
                    worksheet.Cell(i + 2, 5).Value = investment.CurrentValue;
                    worksheet.Cell(i + 2, 6).Value = gainLoss;
                    worksheet.Cell(i + 2, 7).Value = returnPercent;
                    worksheet.Cell(i + 2, 8).Value = investment.DateAcquired.ToString("yyyy-MM-dd");
                    worksheet.Cell(i + 2, 9).Value = investment.Notes;
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
            _logger.LogError(ex, "Error occurred while generating Excel export for investments");
            throw;
        }
    }
}
