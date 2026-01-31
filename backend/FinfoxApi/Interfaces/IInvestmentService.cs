using FinfoxApi.Models;

namespace FinfoxApi.Interfaces;

public interface IInvestmentService : IBaseService<Investment>
{
    Task<List<Investment>> GetByUserIdAsync(Guid userId);
    Task<(List<Investment> data, int totalCount)> GetByUserIdAsync(Guid userId, int pageNumber, int pageSize);
    Task<double> GetTotalInvestmentValueAsync(Guid userId);
    Task<double> GetInvestmentGainLossAsync(int investmentId);
    Task<(List<Investment> data, int totalCount)> GetAllWithFiltersAsync(int pageNumber, int pageSize, string? name = null, string? type = null, double? gainLossGreaterThan = null, double? gainLossLessThan = null, double? returnPercentGreaterThan = null, DateTime? dateAcquired = null);
    Task<(List<Investment> data, int totalCount)> GetByUserIdWithFiltersAsync(Guid userId, int pageNumber, int pageSize, string? name = null, string? type = null, double? gainLossGreaterThan = null, double? gainLossLessThan = null, double? returnPercentGreaterThan = null, DateTime? dateAcquired = null);
    Task<List<Investment>> GetAllForExportAsync(string? name = null, string? type = null, double? gainLossGreaterThan = null, double? gainLossLessThan = null, double? returnPercentGreaterThan = null, DateTime? dateAcquired = null);
    Task<List<Investment>> GetByUserIdForExportAsync(Guid userId, string? name = null, string? type = null, double? gainLossGreaterThan = null, double? gainLossLessThan = null, double? returnPercentGreaterThan = null, DateTime? dateAcquired = null);
    byte[] GenerateExcelExport(List<Investment> investments, string sheetName);
}
