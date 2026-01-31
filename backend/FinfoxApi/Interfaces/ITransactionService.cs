using FinfoxApi.Models;

namespace FinfoxApi.Interfaces;

public interface ITransactionService : IBaseService<Transaction>
{
    Task<List<Transaction>> GetByUserIdAsync(Guid userId);
    Task<(List<Transaction> data, int totalCount)> GetByUserIdAsync(Guid userId, int pageNumber, int pageSize);
    Task<List<Transaction>> GetByAccountIdAsync(int accountId);
    Task<(List<Transaction> data, int totalCount)> GetByAccountIdAsync(int accountId, int pageNumber, int pageSize);
    Task<List<Transaction>> GetByDateRangeAsync(Guid userId, DateTime startDate, DateTime endDate);
    Task<(List<Transaction> data, int totalCount)> GetByDateRangeAsync(Guid userId, DateTime startDate, DateTime endDate, int pageNumber, int pageSize);
    Task<List<Transaction>> GetByCategoryAsync(Guid userId, string category);
    Task<(List<Transaction> data, int totalCount)> GetAllWithFiltersAsync(
        int pageNumber, 
        int pageSize,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? fromAccountId = null,
        double? amountGreaterThan = null,
        double? amountLessThan = null,
        string? type = null,
        string? category = null,
        string? description = null);
    Task<(List<Transaction> data, int totalCount)> GetByUserIdWithFiltersAsync(
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
        string? description = null);
    Task<List<Transaction>> GetAllForExportAsync(
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? fromAccountId = null,
        double? amountGreaterThan = null,
        double? amountLessThan = null,
        string? type = null,
        string? category = null,
        string? description = null);
    Task<List<Transaction>> GetByUserIdForExportAsync(
        Guid userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? fromAccountId = null,
        double? amountGreaterThan = null,
        double? amountLessThan = null,
        string? type = null,
        string? category = null,
        string? description = null);
    byte[] GenerateExcelExport(List<Transaction> transactions, string sheetName);
}
