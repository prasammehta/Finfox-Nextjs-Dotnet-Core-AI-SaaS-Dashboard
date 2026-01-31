namespace FinfoxApi.Interfaces;

/// <summary>
/// Base service interface for common CRUD operations
/// </summary>
public interface IBaseService<TEntity> where TEntity : class
{
    Task<List<TEntity>> GetAllAsync();
    Task<(List<TEntity> data, int totalCount)> GetAllAsync(int pageNumber, int pageSize);
    Task<TEntity?> GetByIdAsync(int id);
    Task<TEntity?> GetByIdAsync(Guid id);
    Task AddAsync(TEntity entity);
    Task UpdateAsync(TEntity entity);
    Task DeleteAsync(TEntity entity);
}
