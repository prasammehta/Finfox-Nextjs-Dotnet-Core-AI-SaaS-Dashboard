using Microsoft.EntityFrameworkCore;
using FinfoxApi.Data;

namespace FinfoxApi.Repositories;

/// <summary>
/// Represents the Entity Framework repository
/// </summary>
/// <typeparam name="TEntity">Entity type</typeparam>
public class BaseRepository<TEntity> : IRepository<TEntity> where TEntity : class
{
    #region Fields
    private readonly FinfoxApiDbContext _context;
    private DbSet<TEntity>? _entities;
    #endregion

    #region Ctor
    public BaseRepository(FinfoxApiDbContext context)
    {
        _context = context;
    }
    #endregion

    #region Utilities
    protected string GetFullErrorTextAndRollbackEntityChanges(Exception exception)
    {
        var msg = string.Empty;
        var innerException = exception;
        while (innerException != null)
        {
            msg += innerException.Message;
            innerException = innerException.InnerException;
        }

        _context.ChangeTracker.Entries().ToList().ForEach(entry => entry.State = EntityState.Detached);

        return msg;
    }
    #endregion

    #region Methods

    /// <summary>
    /// Get entity by identifier
    /// </summary>
    public virtual async Task<TEntity?> GetByIdAsync(object id)
    {
        return await Entities.FindAsync(id);
    }

    /// <summary>
    /// Insert entity
    /// </summary>
    public virtual async Task InsertAsync(TEntity entity)
    {
        if (entity == null)
            throw new ArgumentNullException(nameof(entity));

        try
        {
            await Entities.AddAsync(entity);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException exception)
        {
            throw new Exception(GetFullErrorTextAndRollbackEntityChanges(exception), exception);
        }
    }

    /// <summary>
    /// Insert entities
    /// </summary>
    public virtual async Task InsertAsync(IEnumerable<TEntity> entities)
    {
        if (entities == null)
            throw new ArgumentNullException(nameof(entities));

        try
        {
            await Entities.AddRangeAsync(entities);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException exception)
        {
            throw new Exception(GetFullErrorTextAndRollbackEntityChanges(exception), exception);
        }
    }

    /// <summary>
    /// Update entity
    /// </summary>
    public virtual async Task UpdateAsync(TEntity entity)
    {
        if (entity == null)
            throw new ArgumentNullException(nameof(entity));

        try
        {
            Entities.Update(entity);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException exception)
        {
            throw new Exception(GetFullErrorTextAndRollbackEntityChanges(exception), exception);
        }
    }

    /// <summary>
    /// Update entities
    /// </summary>
    public virtual async Task UpdateAsync(IEnumerable<TEntity> entities)
    {
        if (entities == null)
            throw new ArgumentNullException(nameof(entities));

        try
        {
            Entities.UpdateRange(entities);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException exception)
        {
            throw new Exception(GetFullErrorTextAndRollbackEntityChanges(exception), exception);
        }
    }

    /// <summary>
    /// Delete entity
    /// </summary>
    public virtual async Task DeleteAsync(TEntity entity)
    {
        if (entity == null)
            throw new ArgumentNullException(nameof(entity));

        try
        {
            Entities.Remove(entity);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException exception)
        {
            throw new Exception(GetFullErrorTextAndRollbackEntityChanges(exception), exception);
        }
    }

    /// <summary>
    /// Delete entities
    /// </summary>
    public virtual async Task DeleteAsync(IEnumerable<TEntity> entities)
    {
        if (entities == null)
            throw new ArgumentNullException(nameof(entities));

        try
        {
            Entities.RemoveRange(entities);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException exception)
        {
            throw new Exception(GetFullErrorTextAndRollbackEntityChanges(exception), exception);
        }
    }

    #endregion

    #region Properties

    /// <summary>
    /// Gets a table
    /// </summary>
    public virtual IQueryable<TEntity> Table => Entities;

    /// <summary>
    /// Gets a table with no tracking
    /// </summary>
    public virtual IQueryable<TEntity> TableNoTracking => Entities.AsNoTracking();

    /// <summary>
    /// Gets a DbSet for the entity type
    /// </summary>
    protected virtual DbSet<TEntity> Entities
    {
        get
        {
            _entities ??= _context.Set<TEntity>();
            return _entities;
        }
    }

    #endregion
}
