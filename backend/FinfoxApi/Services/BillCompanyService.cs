using Microsoft.EntityFrameworkCore;
using FinfoxApi.Models;
using FinfoxApi.Repositories;
using FinfoxApi.Interfaces;

namespace FinfoxApi.Services;

public class BillCompanyService : IBillCompanyService
{
    private readonly IRepository<BillCompany> _repository;
    private readonly ILogger<BillCompanyService> _logger;

    public BillCompanyService(IRepository<BillCompany> repository, ILogger<BillCompanyService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<List<BillCompany>> GetAllAsync()
    {
        try
        {
            return await _repository.Table
                .OrderByDescending(bc => bc.CreatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all bill companies");
            throw;
        }
    }

    public async Task<(List<BillCompany> data, int totalCount)> GetAllAsync(int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table.CountAsync();
            var companies = await _repository.Table
                .OrderByDescending(bc => bc.CreatedAt)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (companies, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all bill companies with pagination");
            throw;
        }
    }

    public async Task<BillCompany?> GetByIdAsync(int id)
    {
        try
        {
            return await _repository.Table
                .FirstOrDefaultAsync(bc => bc.BillCompanyId == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting bill company with id {id}");
            throw;
        }
    }

    public async Task<BillCompany?> GetByIdAsync(Guid id)
    {
        try
        {
            return await _repository.Table
                .FirstOrDefaultAsync(bc => bc.UserId == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting bill company");
            throw;
        }
    }

    public async Task<List<BillCompany>> GetByUserIdAsync(Guid userId)
    {
        try
        {
            return await _repository.Table
                .Where(bc => bc.UserId == userId)
                .OrderByDescending(bc => bc.CreatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting bill companies for user {userId}");
            throw;
        }
    }

    public async Task<(List<BillCompany> data, int totalCount)> GetByUserIdAsync(Guid userId, int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table
                .Where(bc => bc.UserId == userId)
                .CountAsync();
            
            var companies = await _repository.Table
                .Where(bc => bc.UserId == userId)
                .OrderByDescending(bc => bc.CreatedAt)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (companies, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting bill companies for user {userId} with pagination");
            throw;
        }
    }

    public async Task AddAsync(BillCompany entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.InsertAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while adding bill company");
            throw;
        }
    }

    public async Task UpdateAsync(BillCompany entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.UpdateAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while updating bill company with id {entity.BillCompanyId}");
            throw;
        }
    }

    public async Task DeleteAsync(BillCompany entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.DeleteAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while deleting bill company with id {entity.BillCompanyId}");
            throw;
        }
    }

    public async Task<(List<BillCompany> data, int totalCount)> GetAllWithFiltersAsync(int pageNumber, int pageSize, string? name = null, string? email = null, string? gstin = null)
    {
        try
        {
            var query = _repository.Table.AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(bc => bc.Name.Contains(name));

            if (!string.IsNullOrWhiteSpace(email))
                query = query.Where(bc => bc.Email != null && bc.Email.Contains(email));

            if (!string.IsNullOrWhiteSpace(gstin))
                query = query.Where(bc => bc.Gstin != null && bc.Gstin.Contains(gstin));

            var totalCount = await query.CountAsync();

            var companies = await query
                .OrderByDescending(bc => bc.CreatedAt)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (companies, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all bill companies with filters");
            throw;
        }
    }

    public async Task<(List<BillCompany> data, int totalCount)> GetByUserIdWithFiltersAsync(Guid userId, int pageNumber, int pageSize, string? name = null, string? email = null, string? gstin = null)
    {
        try
        {
            var query = _repository.Table.Where(bc => bc.UserId == userId).AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(bc => bc.Name.Contains(name));

            if (!string.IsNullOrWhiteSpace(email))
                query = query.Where(bc => bc.Email != null && bc.Email.Contains(email));

            if (!string.IsNullOrWhiteSpace(gstin))
                query = query.Where(bc => bc.Gstin != null && bc.Gstin.Contains(gstin));

            var totalCount = await query.CountAsync();

            var companies = await query
                .OrderByDescending(bc => bc.CreatedAt)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (companies, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting bill companies for user {userId} with filters");
            throw;
        }
    }

    public async Task<List<BillCompany>> GetAllForExportAsync(string? name = null, string? email = null, string? gstin = null)
    {
        try
        {
            var query = _repository.Table.AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(bc => bc.Name.Contains(name));

            if (!string.IsNullOrWhiteSpace(email))
                query = query.Where(bc => bc.Email != null && bc.Email.Contains(email));

            if (!string.IsNullOrWhiteSpace(gstin))
                query = query.Where(bc => bc.Gstin != null && bc.Gstin.Contains(gstin));

            return await query.OrderByDescending(bc => bc.CreatedAt).ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all bill companies for export");
            throw;
        }
    }

    public async Task<List<BillCompany>> GetByUserIdForExportAsync(Guid userId, string? name = null, string? email = null, string? gstin = null)
    {
        try
        {
            var query = _repository.Table.Where(bc => bc.UserId == userId).AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(bc => bc.Name.Contains(name));

            if (!string.IsNullOrWhiteSpace(email))
                query = query.Where(bc => bc.Email != null && bc.Email.Contains(email));

            if (!string.IsNullOrWhiteSpace(gstin))
                query = query.Where(bc => bc.Gstin != null && bc.Gstin.Contains(gstin));

            return await query.OrderByDescending(bc => bc.CreatedAt).ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting bill companies for user {userId} for export");
            throw;
        }
    }

    public byte[] GenerateExcelExport(List<BillCompany> companies, string sheetName)
    {
        try
        {
            using (var workbook = new ClosedXML.Excel.XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add(sheetName);

                // Add headers
                worksheet.Cell(1, 1).Value = "Company ID";
                worksheet.Cell(1, 2).Value = "Name";
                worksheet.Cell(1, 3).Value = "Email";
                worksheet.Cell(1, 4).Value = "GSTIN";
                worksheet.Cell(1, 5).Value = "Phone";
                worksheet.Cell(1, 6).Value = "Address";
                worksheet.Cell(1, 7).Value = "PAN";
                worksheet.Cell(1, 8).Value = "Account Name";
                worksheet.Cell(1, 9).Value = "Account Number";
                worksheet.Cell(1, 10).Value = "IFSC Code";

                // Format header row
                var headerRow = worksheet.Row(1);
                headerRow.Style.Font.Bold = true;
                headerRow.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;

                // Add data rows
                for (int i = 0; i < companies.Count; i++)
                {
                    var company = companies[i];
                    worksheet.Cell(i + 2, 1).Value = company.BillCompanyId;
                    worksheet.Cell(i + 2, 2).Value = company.Name;
                    worksheet.Cell(i + 2, 3).Value = company.Email;
                    worksheet.Cell(i + 2, 4).Value = company.Gstin;
                    worksheet.Cell(i + 2, 5).Value = company.Phone;
                    worksheet.Cell(i + 2, 6).Value = company.Address;
                    worksheet.Cell(i + 2, 7).Value = company.Pan;
                    worksheet.Cell(i + 2, 8).Value = company.AccountName;
                    worksheet.Cell(i + 2, 9).Value = company.AccountNumber;
                    worksheet.Cell(i + 2, 10).Value = company.IfscCode;
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
            _logger.LogError(ex, "Error occurred while generating Excel export for bill companies");
            throw;
        }
    }
}
