using FinfoxApi.Models;

namespace FinfoxApi.Interfaces;

public interface IBillCompanyService : IBaseService<BillCompany>
{
    Task<List<BillCompany>> GetByUserIdAsync(Guid userId);
    Task<(List<BillCompany> data, int totalCount)> GetByUserIdAsync(Guid userId, int pageNumber, int pageSize);
    Task<(List<BillCompany> data, int totalCount)> GetAllWithFiltersAsync(int pageNumber, int pageSize, string? name = null, string? email = null, string? gstin = null);
    Task<(List<BillCompany> data, int totalCount)> GetByUserIdWithFiltersAsync(Guid userId, int pageNumber, int pageSize, string? name = null, string? email = null, string? gstin = null);
    Task<List<BillCompany>> GetAllForExportAsync(string? name = null, string? email = null, string? gstin = null);
    Task<List<BillCompany>> GetByUserIdForExportAsync(Guid userId, string? name = null, string? email = null, string? gstin = null);
    byte[] GenerateExcelExport(List<BillCompany> companies, string sheetName);
}
