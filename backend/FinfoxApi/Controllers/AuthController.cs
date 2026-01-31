using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using FinfoxApi.Helper;
using FinfoxApi.Interfaces;
using FinfoxApi.ViewModels;
using FinfoxApi.Models;

namespace FinfoxApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;
    private readonly IMapper _mapper;
    private readonly ILogger<AuthController> _logger;
    private readonly PasswordHasher<User> _passwordHasher;

    public AuthController(
        IUserService userService,
        IAuthService authService,
        IConfiguration configuration,
        IMapper mapper,
        ILogger<AuthController> logger,
        PasswordHasher<User> passwordHasher)
    {
        _userService = userService;
        _authService = authService;
        _configuration = configuration;
        _mapper = mapper;
        _logger = logger;
        _passwordHasher = passwordHasher;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterVM model)
    {
        try
        {
            if (!ModelState.IsValid)
                return Ok(new ErrorVM { Message = ConstantHelper.INVALID_MODEL_ERR });

            // Check if email already exists
            var existingUser = await _userService.GetByEmailAsync(model.Email);
            if (existingUser != null)
                return Ok(new ErrorVM { Message = ConstantHelper.SameNameErr("Email") });

            // Create new user
            var user = new FinfoxApi.Models.User
            {
                UserId = Guid.NewGuid(),
                Email = model.Email,
                Name = model.Name,
                PasswordHash = _passwordHasher.HashPassword(null, model.Password),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _userService.AddAsync(user);

            return Ok(new SuccessVM 
            { 
                Message = ConstantHelper.AddSuccess("User"),
                Data = user.UserId 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginVM model)
    {
        try
        {
            if (!ModelState.IsValid)
                return Ok(new ErrorVM { Message = ConstantHelper.INVALID_MODEL_ERR });

            // Validate user credentials
            var user = await _authService.ValidateUserAsync(model);
            if (user == null)
                return Ok(new ErrorVM { Message = "Invalid email or password." });

            // Generate JWT token
            var token = _authService.GenerateJwtToken(user);

            return Ok(new SuccessVM
            {
                Data = new { token = token },
                Message = "Login successful"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging in user");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Ok(new ErrorVM { Message = "Invalid user information in token" });

            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("User") });

            var response = new UserResponseVM
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };

            return Ok(new SuccessVM
            {
                Data = response,
                Message = ConstantHelper.GetSuccess("User")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [Authorize]
    [HttpGet("logout")]
    public IActionResult Logout()
    {
        try
        {
            // Token invalidation logic would typically be handled client-side
            // by removing the token from storage. For server-side token blacklisting,
            // you'd implement a token blacklist mechanism.
            return Ok(new SuccessVM { Message = "Logout successful" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging out user");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }
}
