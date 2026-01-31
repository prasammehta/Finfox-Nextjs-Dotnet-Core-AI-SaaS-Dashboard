using Microsoft.EntityFrameworkCore;
using FinfoxApi.Models;
using FinfoxApi.Repositories;
using FinfoxApi.Interfaces;

namespace FinfoxApi.Services;

public class BillService : IBillService
{
    private readonly IRepository<Bill> _repository;
    private readonly ILogger<BillService> _logger;

    public BillService(IRepository<Bill> repository, ILogger<BillService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<List<Bill>> GetAllAsync()
    {
        try
        {
            return await _repository.Table.ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all bills");
            throw;
        }
    }

    public async Task<(List<Bill> data, int totalCount)> GetAllAsync(int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table.CountAsync();
            var bills = await _repository.Table
                .OrderByDescending(b => b.DueDate)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (bills, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all bills with pagination");
            throw;
        }
    }

    public async Task<Bill?> GetByIdAsync(int id)
    {
        try
        {
            return await _repository.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting bill with id {id}");
            throw;
        }
    }

    public async Task<Bill?> GetByIdAsync(Guid id)
    {
        try
        {
            return await _repository.Table.FirstOrDefaultAsync(b => b.UserId == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting bill");
            throw;
        }
    }

    public async Task<List<Bill>> GetByUserIdAsync(Guid userId)
    {
        try
        {
            return await _repository.Table
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.DueDate)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting bills for user {userId}");
            throw;
        }
    }

    public async Task<(List<Bill> data, int totalCount)> GetByUserIdAsync(Guid userId, int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table
                .Where(b => b.UserId == userId)
                .CountAsync();
            
            var bills = await _repository.Table
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.DueDate)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (bills, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting bills for user {userId} with pagination");
            throw;
        }
    }

    public async Task<List<Bill>> GetOverdueBillsAsync(Guid userId)
    {
        try
        {
            var today = DateTime.UtcNow.Date;
            return await _repository.Table
                .Where(b => b.UserId == userId && b.DueDate < today)
                .OrderByDescending(b => b.DueDate)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting overdue bills");
            throw;
        }
    }

    public async Task<(List<Bill> data, int totalCount)> GetOverdueBillsAsync(Guid userId, int pageNumber, int pageSize)
    {
        try
        {
            var today = DateTime.UtcNow.Date;
            var totalCount = await _repository.Table
                .Where(b => b.UserId == userId && b.DueDate < today)
                .CountAsync();
            
            var bills = await _repository.Table
                .Where(b => b.UserId == userId && b.DueDate < today)
                .OrderByDescending(b => b.DueDate)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (bills, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting overdue bills with pagination");
            throw;
        }
    }

    public async Task<double> GetTotalBillAmountAsync(Guid userId)
    {
        try
        {
            var bills = await _repository.Table
                .Where(b => b.UserId == userId)
                .ToListAsync();

            return bills.Sum(b => b.BillItems.Count * 100);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while calculating total bill amount");
            throw;
        }
    }

    public async Task AddAsync(Bill entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.InsertAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while adding bill");
            throw;
        }
    }

    public async Task UpdateAsync(Bill entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.UpdateAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while updating bill with id {entity.BillId}");
            throw;
        }
    }

    public async Task DeleteAsync(Bill entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.DeleteAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while deleting bill with id {entity.BillId}");
            throw;
        }
    }

    public async Task<(List<Bill> data, int totalCount)> GetAllWithFiltersAsync(int pageNumber, int pageSize, string? client = null, string? invoiceNumber = null, double? amountGreaterThan = null, double? amountLessThan = null, DateTime? dueDate = null)
    {
        try
        {
            var query = _repository.Table.AsQueryable();

            if (!string.IsNullOrWhiteSpace(client))
                query = query.Where(b => b.Client.Contains(client));

            if (!string.IsNullOrWhiteSpace(invoiceNumber))
                query = query.Where(b => b.InvoiceNumber.Contains(invoiceNumber));

            if (amountGreaterThan.HasValue)
                query = query.Where(b => b.TotalAmount > amountGreaterThan.Value);

            if (amountLessThan.HasValue)
                query = query.Where(b => b.TotalAmount < amountLessThan.Value);

            if (dueDate.HasValue)
                query = query.Where(b => b.DueDate <= dueDate.Value);

            var totalCount = await query.CountAsync();

            var bills = await query
                .OrderByDescending(b => b.DueDate)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (bills, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all bills with filters");
            throw;
        }
    }

    public async Task<(List<Bill> data, int totalCount)> GetByUserIdWithFiltersAsync(Guid userId, int pageNumber, int pageSize, string? client = null, string? invoiceNumber = null, double? amountGreaterThan = null, double? amountLessThan = null, DateTime? dueDate = null)
    {
        try
        {
            var query = _repository.Table.Where(b => b.UserId == userId).AsQueryable();

            if (!string.IsNullOrWhiteSpace(client))
                query = query.Where(b => b.Client.Contains(client));

            if (!string.IsNullOrWhiteSpace(invoiceNumber))
                query = query.Where(b => b.InvoiceNumber.Contains(invoiceNumber));

            if (amountGreaterThan.HasValue)
                query = query.Where(b => b.TotalAmount > amountGreaterThan.Value);

            if (amountLessThan.HasValue)
                query = query.Where(b => b.TotalAmount < amountLessThan.Value);

            if (dueDate.HasValue)
                query = query.Where(b => b.DueDate <= dueDate.Value);

            var totalCount = await query.CountAsync();

            var bills = await query
                .OrderByDescending(b => b.DueDate)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (bills, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting bills for user {userId} with filters");
            throw;
        }
    }

    public async Task<List<Bill>> GetAllForExportAsync(string? client = null, string? invoiceNumber = null, double? amountGreaterThan = null, double? amountLessThan = null, DateTime? dueDate = null)
    {
        try
        {
            var query = _repository.Table.AsQueryable();

            if (!string.IsNullOrWhiteSpace(client))
                query = query.Where(b => b.Client.Contains(client));

            if (!string.IsNullOrWhiteSpace(invoiceNumber))
                query = query.Where(b => b.InvoiceNumber.Contains(invoiceNumber));

            if (amountGreaterThan.HasValue)
                query = query.Where(b => b.TotalAmount > amountGreaterThan.Value);

            if (amountLessThan.HasValue)
                query = query.Where(b => b.TotalAmount < amountLessThan.Value);

            if (dueDate.HasValue)
                query = query.Where(b => b.DueDate <= dueDate.Value);

            return await query.OrderByDescending(b => b.DueDate).ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all bills for export");
            throw;
        }
    }

    public async Task<List<Bill>> GetByUserIdForExportAsync(Guid userId, string? client = null, string? invoiceNumber = null, double? amountGreaterThan = null, double? amountLessThan = null, DateTime? dueDate = null)
    {
        try
        {
            var query = _repository.Table.Where(b => b.UserId == userId).AsQueryable();

            if (!string.IsNullOrWhiteSpace(client))
                query = query.Where(b => b.Client.Contains(client));

            if (!string.IsNullOrWhiteSpace(invoiceNumber))
                query = query.Where(b => b.InvoiceNumber.Contains(invoiceNumber));

            if (amountGreaterThan.HasValue)
                query = query.Where(b => b.TotalAmount > amountGreaterThan.Value);

            if (amountLessThan.HasValue)
                query = query.Where(b => b.TotalAmount < amountLessThan.Value);

            if (dueDate.HasValue)
                query = query.Where(b => b.DueDate <= dueDate.Value);

            return await query.OrderByDescending(b => b.DueDate).ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting bills for user {userId} for export");
            throw;
        }
    }

    public byte[] GenerateExcelExport(List<Bill> bills, string sheetName)
    {
        try
        {
            using (var workbook = new ClosedXML.Excel.XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add(sheetName);

                // Add headers
                worksheet.Cell(1, 1).Value = "Bill ID";
                worksheet.Cell(1, 2).Value = "Invoice Number";
                worksheet.Cell(1, 3).Value = "Client";
                worksheet.Cell(1, 4).Value = "Issue Date";
                worksheet.Cell(1, 5).Value = "Due Date";
                worksheet.Cell(1, 6).Value = "Subtotal";
                worksheet.Cell(1, 7).Value = "GST Amount";
                worksheet.Cell(1, 8).Value = "Total Amount";

                // Format header row
                var headerRow = worksheet.Row(1);
                headerRow.Style.Font.Bold = true;
                headerRow.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;

                // Add data rows
                for (int i = 0; i < bills.Count; i++)
                {
                    var bill = bills[i];
                    worksheet.Cell(i + 2, 1).Value = bill.BillId;
                    worksheet.Cell(i + 2, 2).Value = bill.InvoiceNumber;
                    worksheet.Cell(i + 2, 3).Value = bill.Client;
                    worksheet.Cell(i + 2, 4).Value = bill.IssueDate.ToString("yyyy-MM-dd");
                    worksheet.Cell(i + 2, 5).Value = bill.DueDate.ToString("yyyy-MM-dd");
                    worksheet.Cell(i + 2, 6).Value = bill.Subtotal;
                    worksheet.Cell(i + 2, 7).Value = bill.GstAmount;
                    worksheet.Cell(i + 2, 8).Value = bill.TotalAmount;
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
            _logger.LogError(ex, "Error occurred while generating Excel export for bills");
            throw;
        }
    }
}
