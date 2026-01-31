using FinfoxApi.Interfaces;
using Microsoft.AspNetCore.Http;

namespace FinfoxApi.Services;

public class FileService : IFileService
{
    private readonly ILogger<FileService> _logger;
    private readonly string _logoDirectory = "wwwroot/assets/logos";
    private readonly long _maxFileSize = 5 * 1024 * 1024; // 5MB
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

    public FileService(ILogger<FileService> logger)
    {
        _logger = logger;
        CreateDirectoryIfNotExists();
    }

    public async Task<string> UploadCompanyLogoAsync(IFormFile file, Guid userId)
    {
        try
        {
            ValidateFile(file);

            var fileName = $"{userId}_{DateTime.UtcNow.Ticks}{Path.GetExtension(file.FileName).ToLower()}";
            var filePath = Path.Combine(_logoDirectory, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            _logger.LogInformation($"Successfully uploaded logo for user {userId}");
            return $"/assets/logos/{fileName}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading company logo");
            throw;
        }
    }

    public async Task<bool> DeleteCompanyLogoAsync(string logoUrl)
    {
        try
        {
            if (string.IsNullOrEmpty(logoUrl))
                return false;

            var fileName = Path.GetFileName(logoUrl);
            var filePath = Path.Combine(_logoDirectory, fileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation($"Successfully deleted logo: {logoUrl}");
                return true;
            }

            _logger.LogWarning($"Logo file not found: {logoUrl}");
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting company logo");
            return false;
        }
    }

    private void ValidateFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty");

        if (file.Length > _maxFileSize)
            throw new ArgumentException($"File size exceeds maximum limit of 5MB");

        var fileExtension = Path.GetExtension(file.FileName).ToLower();
        if (!_allowedExtensions.Contains(fileExtension))
            throw new ArgumentException($"Invalid file extension. Allowed: {string.Join(", ", _allowedExtensions)}");
    }

    private void CreateDirectoryIfNotExists()
    {
        if (!Directory.Exists(_logoDirectory))
        {
            Directory.CreateDirectory(_logoDirectory);
            _logger.LogInformation($"Created logo directory: {_logoDirectory}");
        }
    }
}
