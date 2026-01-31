using FinfoxApi.Models;

namespace FinfoxApi.Interfaces;

public interface IBillService : IBaseService<Bill>
{
    Task<List<Bill>> GetByUserIdAsync(Guid userId);
    Task<(List<Bill> data, int totalCount)> GetByUserIdAsync(Guid userId, int pageNumber, int pageSize);
    Task<List<Bill>> GetOverdueBillsAsync(Guid userId);
    Task<(List<Bill> data, int totalCount)> GetOverdueBillsAsync(Guid userId, int pageNumber, int pageSize);
    Task<double> GetTotalBillAmountAsync(Guid userId);
    Task<(List<Bill> data, int totalCount)> GetAllWithFiltersAsync(int pageNumber, int pageSize, string? client = null, string? invoiceNumber = null, double? amountGreaterThan = null, double? amountLessThan = null, DateTime? dueDate = null);
    Task<(List<Bill> data, int totalCount)> GetByUserIdWithFiltersAsync(Guid userId, int pageNumber, int pageSize, string? client = null, string? invoiceNumber = null, double? amountGreaterThan = null, double? amountLessThan = null, DateTime? dueDate = null);
    Task<List<Bill>> GetAllForExportAsync(string? client = null, string? invoiceNumber = null, double? amountGreaterThan = null, double? amountLessThan = null, DateTime? dueDate = null);
    Task<List<Bill>> GetByUserIdForExportAsync(Guid userId, string? client = null, string? invoiceNumber = null, double? amountGreaterThan = null, double? amountLessThan = null, DateTime? dueDate = null);
    byte[] GenerateExcelExport(List<Bill> bills, string sheetName);
}
