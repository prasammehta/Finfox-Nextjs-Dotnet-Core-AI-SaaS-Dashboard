using FinfoxApi.Models;

namespace FinfoxApi.Interfaces;

public interface IDebtService : IBaseService<Debt>
{
    Task<List<Debt>> GetByUserIdAsync(Guid userId);
    Task<(List<Debt> data, int totalCount)> GetByUserIdAsync(Guid userId, int pageNumber, int pageSize);
    Task<List<Debt>> GetActiveDebtsAsync(Guid userId);
    Task<(List<Debt> data, int totalCount)> GetActiveDebtsAsync(Guid userId, int pageNumber, int pageSize);
    Task<double> GetTotalDebtAsync(Guid userId);
    Task<(List<Debt> data, int totalCount)> GetAllWithFiltersAsync(int pageNumber, int pageSize, string? personName = null, double? amountGreaterThan = null, double? amountLessThan = null, string? debtType = null, string? status = null, DateTime? startDate = null, DateTime? endDate = null);
    Task<(List<Debt> data, int totalCount)> GetByUserIdWithFiltersAsync(Guid userId, int pageNumber, int pageSize, string? personName = null, double? amountGreaterThan = null, double? amountLessThan = null, string? debtType = null, string? status = null, DateTime? startDate = null, DateTime? endDate = null);
    Task<List<Debt>> GetAllForExportAsync(string? personName = null, double? amountGreaterThan = null, double? amountLessThan = null, string? debtType = null, string? status = null, DateTime? startDate = null, DateTime? endDate = null);
    Task<List<Debt>> GetByUserIdForExportAsync(Guid userId, string? personName = null, double? amountGreaterThan = null, double? amountLessThan = null, string? debtType = null, string? status = null, DateTime? startDate = null, DateTime? endDate = null);
    byte[] GenerateExcelExport(List<Debt> debts, string sheetName);
}
