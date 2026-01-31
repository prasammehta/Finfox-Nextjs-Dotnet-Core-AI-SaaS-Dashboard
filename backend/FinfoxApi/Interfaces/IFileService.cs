namespace FinfoxApi.Interfaces;

public interface IFileService
{
    Task<string> UploadCompanyLogoAsync(IFormFile file, Guid userId);
    Task<bool> DeleteCompanyLogoAsync(string logoUrl);
}
