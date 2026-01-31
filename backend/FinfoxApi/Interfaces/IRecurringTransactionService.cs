using FinfoxApi.Models;

namespace FinfoxApi.Interfaces;

public interface IRecurringTransactionService : IBaseService<RecurringTransaction>
{
    Task<List<RecurringTransaction>> GetByUserIdAsync(Guid userId);
    Task<(List<RecurringTransaction> data, int totalCount)> GetByUserIdAsync(Guid userId, int pageNumber, int pageSize);
    Task<List<RecurringTransaction>> GetActiveTransactionsAsync(Guid userId);
    Task ProcessRecurringTransactionsAsync(Guid userId);
    Task<(List<RecurringTransaction> data, int totalCount)> GetAllWithFiltersAsync(
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
        DateTime? endDate = null);
    Task<(List<RecurringTransaction> data, int totalCount)> GetByUserIdWithFiltersAsync(
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
        DateTime? endDate = null);
    Task<List<RecurringTransaction>> GetAllForExportAsync(
        string? description = null,
        double? amountGreaterThan = null,
        double? amountLessThan = null,
        string? frequency = null,
        string? category = null,
        string? type = null,
        bool? isActive = null,
        DateTime? startDate = null,
        DateTime? endDate = null);
    Task<List<RecurringTransaction>> GetByUserIdForExportAsync(
        Guid userId,
        string? description = null,
        double? amountGreaterThan = null,
        double? amountLessThan = null,
        string? frequency = null,
        string? category = null,
        string? type = null,
        bool? isActive = null,
        DateTime? startDate = null,
        DateTime? endDate = null);
    byte[] GenerateExcelExport(List<RecurringTransaction> transactions, string sheetName);
}
