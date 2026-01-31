namespace FinfoxApi.Repositories;

/// <summary>
/// Represents an entity repository
/// </summary>
/// <typeparam name="TEntity">Entity type</typeparam>
public interface IRepository<TEntity> where TEntity : class
{
    #region Methods

    /// <summary>
    /// Get entity by identifier
    /// </summary>
    Task<TEntity?> GetByIdAsync(object id);

    /// <summary>
    /// Insert entity
    /// </summary>
    Task InsertAsync(TEntity entity);

    /// <summary>
    /// Insert entities
    /// </summary>
    Task InsertAsync(IEnumerable<TEntity> entities);

    /// <summary>
    /// Update entity
    /// </summary>
    Task UpdateAsync(TEntity entity);

    /// <summary>
    /// Update entities
    /// </summary>
    Task UpdateAsync(IEnumerable<TEntity> entities);

    /// <summary>
    /// Delete entity
    /// </summary>
    Task DeleteAsync(TEntity entity);

    /// <summary>
    /// Delete entities
    /// </summary>
    Task DeleteAsync(IEnumerable<TEntity> entities);

    #endregion

    #region Properties

    /// <summary>
    /// Gets a table
    /// </summary>
    IQueryable<TEntity> Table { get; }

    /// <summary>
    /// Gets a table with no tracking
    /// </summary>
    IQueryable<TEntity> TableNoTracking { get; }

    #endregion
}
