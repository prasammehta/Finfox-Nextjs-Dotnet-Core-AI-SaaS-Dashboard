using Microsoft.EntityFrameworkCore;
using FinfoxApi.Models;
using FinfoxApi.Repositories;
using FinfoxApi.Interfaces;
using ClosedXML.Excel;

namespace FinfoxApi.Services;

public class UserService : IUserService
{
    private readonly IRepository<User> _repository;
    private readonly ILogger<UserService> _logger;

    public UserService(IRepository<User> repository, ILogger<UserService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<List<User>> GetAllAsync()
    {
        try
        {
            return await _repository.Table.ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all users");
            throw;
        }
    }

    public async Task<(List<User> data, int totalCount)> GetAllAsync(int pageNumber, int pageSize)
    {
        try
        {
            var totalCount = await _repository.Table.CountAsync();
            var users = await _repository.Table
                .OrderByDescending(u => u.CreatedAt)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (users, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all users with pagination");
            throw;
        }
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        try
        {
            return await _repository.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting user with id {id}");
            throw;
        }
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        try
        {
            return await _repository.Table.FirstOrDefaultAsync(u => u.UserId == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting user with id {id}");
            throw;
        }
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        try
        {
            return await _repository.Table.FirstOrDefaultAsync(u => u.Email == email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while getting user by email");
            throw;
        }
    }

    public async Task<bool> IsEmailUniqueAsync(string email, Guid? userId = null)
    {
        try
        {
            var user = await _repository.Table.FirstOrDefaultAsync(u => u.Email == email);
            
            if (user == null)
                return true;

            if (userId.HasValue && user.UserId == userId)
                return true;

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while checking email uniqueness");
            throw;
        }
    }

    public async Task AddAsync(User entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.InsertAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while adding user");
            throw;
        }
    }

    public async Task UpdateAsync(User entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.UpdateAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while updating user with id {entity.UserId}");
            throw;
        }
    }

    public async Task DeleteAsync(User entity)
    {
        try
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await _repository.DeleteAsync(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while deleting user with id {entity.UserId}");
            throw;
        }
    }

    public async Task<(List<User> data, int totalCount)> GetAllWithFiltersAsync(
        int pageNumber, 
        int pageSize, 
        string? name = null, 
        string? email = null, 
        string? role = null, 
        DateTime? startDate = null, 
        DateTime? endDate = null)
    {
        try
        {
            var query = _repository.Table.AsQueryable();

            if (!string.IsNullOrEmpty(name))
                query = query.Where(u => u.Name.Contains(name));

            if (!string.IsNullOrEmpty(email))
                query = query.Where(u => u.Email.Contains(email));

            if (!string.IsNullOrEmpty(role))
                query = query.Where(u => u.Role == role);

            if (startDate.HasValue)
                query = query.Where(u => u.CreatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(u => u.CreatedAt <= endDate.Value);

            var totalCount = await query.CountAsync();
            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip(pageNumber * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (users, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all users with filters");
            throw;
        }
    }

    public async Task<List<User>> GetAllForExportAsync(
        string? name = null, 
        string? email = null, 
        string? role = null, 
        DateTime? startDate = null, 
        DateTime? endDate = null)
    {
        try
        {
            var query = _repository.Table.AsQueryable();

            if (!string.IsNullOrEmpty(name))
                query = query.Where(u => u.Name.Contains(name));

            if (!string.IsNullOrEmpty(email))
                query = query.Where(u => u.Email.Contains(email));

            if (!string.IsNullOrEmpty(role))
                query = query.Where(u => u.Role == role);

            if (startDate.HasValue)
                query = query.Where(u => u.CreatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(u => u.CreatedAt <= endDate.Value);

            return await query.OrderByDescending(u => u.CreatedAt).ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting users for export");
            throw;
        }
    }

    public byte[] GenerateExcelExport(List<User> users, string sheetName)
    {
        try
        {
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add(sheetName);

                // Add headers
                var headers = new[] { "User ID", "Name", "Email", "Role", "Created At", "Updated At" };
                for (int i = 0; i < headers.Length; i++)
                {
                    var cell = worksheet.Cell(1, i + 1);
                    cell.Value = headers[i];
                    cell.Style.Font.Bold = true;
                    cell.Style.Fill.BackgroundColor = XLColor.LightGray;
                }

                // Add data
                for (int i = 0; i < users.Count; i++)
                {
                    var user = users[i];
                    worksheet.Cell(i + 2, 1).Value = user.UserId.ToString();
                    worksheet.Cell(i + 2, 2).Value = user.Name;
                    worksheet.Cell(i + 2, 3).Value = user.Email;
                    worksheet.Cell(i + 2, 4).Value = user.Role;
                    worksheet.Cell(i + 2, 5).Value = user.CreatedAt;
                    worksheet.Cell(i + 2, 6).Value = user.UpdatedAt;
                }

                // Auto fit columns
                worksheet.Columns().AdjustToContents();

                // Write to memory stream
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return stream.ToArray();
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while generating Excel export for users");
            throw;
        }
    }
}
