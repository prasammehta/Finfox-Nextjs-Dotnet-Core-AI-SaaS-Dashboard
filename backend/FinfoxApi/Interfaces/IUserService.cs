using FinfoxApi.Models;
using FinfoxApi.ViewModels;

namespace FinfoxApi.Interfaces;

public interface IUserService : IBaseService<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<bool> IsEmailUniqueAsync(string email, Guid? userId = null);
    Task<(List<User> data, int totalCount)> GetAllWithFiltersAsync(int pageNumber, int pageSize, string? name = null, string? email = null, string? role = null, DateTime? startDate = null, DateTime? endDate = null);
    Task<List<User>> GetAllForExportAsync(string? name = null, string? email = null, string? role = null, DateTime? startDate = null, DateTime? endDate = null);
    byte[] GenerateExcelExport(List<User> users, string sheetName);
}
