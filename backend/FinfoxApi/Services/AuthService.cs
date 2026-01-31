using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using FinfoxApi.Models;
using FinfoxApi.Repositories;
using FinfoxApi.Interfaces;
using FinfoxApi.ViewModels;

namespace FinfoxApi.Services;

public class AuthService : IAuthService
{
    private readonly IRepository<User> _repository;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;
    private readonly PasswordHasher<User> _passwordHasher;

    public AuthService(
        IRepository<User> repository,
        IConfiguration configuration,
        ILogger<AuthService> logger,
        PasswordHasher<User> passwordHasher)
    {
        _repository = repository;
        _configuration = configuration;
        _logger = logger;
        _passwordHasher = passwordHasher;
    }

    public async Task<User?> ValidateUserAsync(LoginVM model)
    {
        try
        {
            var user = await _repository.Table.FirstOrDefaultAsync(u => u.Email == model.Email);
            
            if (user == null)
                return null;

            // Check if PasswordHash is empty or invalid
            if (string.IsNullOrWhiteSpace(user.PasswordHash))
            {
                _logger.LogWarning($"User {model.Email} has empty password hash");
                return null;
            }

            try
            {
                // Verify password using PasswordHasher
                var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, model.Password);
                
                if (result == PasswordVerificationResult.Failed)
                    return null;

                return user;
            }
            catch (FormatException)
            {
                _logger.LogWarning($"User {model.Email} has invalid password hash format. Password needs to be reset.");
                return null;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while validating user");
            throw;
        }
    }

    public string GenerateJwtToken(User user)
    {
        try
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("UserId", user.UserId.ToString()),
                new Claim("Role", user.Role),
                new Claim("Name", user.Name),
                new Claim("Email", user.Email)
            };

            var jwtSettings = _configuration.GetSection("Jwt");
            var secretKey = jwtSettings.GetValue<string>("SecretKey") ?? "";
            var issuer = jwtSettings.GetValue<string>("Issuer") ?? "";
            var audience = jwtSettings.GetValue<string>("Audience") ?? "";
            var expirationMinutes = jwtSettings.GetValue<int>("ExpirationMinutes", 60);

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiration = DateTime.UtcNow.AddMinutes(expirationMinutes);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiration,
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating JWT token");
            throw;
        }
    }
}
