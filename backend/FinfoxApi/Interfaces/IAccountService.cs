using FinfoxApi.Models;

namespace FinfoxApi.Interfaces;

public interface IAccountService : IBaseService<Account>
{
    Task<List<Account>> GetByUserIdAsync(Guid userId);
    Task<(List<Account> data, int totalCount)> GetByUserIdAsync(Guid userId, int pageNumber, int pageSize);
    Task<Account?> GetByUserAndNameAsync(Guid userId, string name);
    Task<double> GetCurrentBalanceAsync(int accountId);
    Task<(List<Account> data, int totalCount)> GetAllWithFiltersAsync(int pageNumber, int pageSize, string? name = null, DateTime? startDate = null, DateTime? endDate = null);
    Task<(List<Account> data, int totalCount)> GetByUserIdWithFiltersAsync(Guid userId, int pageNumber, int pageSize, string? name = null, DateTime? startDate = null, DateTime? endDate = null);
    Task<List<Account>> GetAllForExportAsync(string? name = null, DateTime? startDate = null, DateTime? endDate = null);
    Task<List<Account>> GetByUserIdForExportAsync(Guid userId, string? name = null, DateTime? startDate = null, DateTime? endDate = null);
    byte[] GenerateExcelExport(List<Account> accounts, string sheetName);
}
