using FinfoxApi.Models;
using FinfoxApi.ViewModels;

namespace FinfoxApi.Interfaces;

public interface IAuthService
{
    Task<User?> ValidateUserAsync(LoginVM model);
    string GenerateJwtToken(User user);
}
