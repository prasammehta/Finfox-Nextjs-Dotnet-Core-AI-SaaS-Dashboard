using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinfoxApi.Interfaces;
using FinfoxApi.ViewModels;
using FinfoxApi.Helper;
using Microsoft.AspNetCore.Identity;
using FinfoxApi.Models;

namespace FinfoxApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IMapper _mapper;
    private readonly ILogger<UsersController> _logger;
    private readonly PasswordHasher<User> _passwordHasher;

    public UsersController(
        IUserService userService,
        IMapper mapper,
        ILogger<UsersController> logger,
        PasswordHasher<User> passwordHasher)
    {
        _userService = userService;
        _mapper = mapper;
        _logger = logger;
        _passwordHasher = passwordHasher;
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportToExcel(
        [FromQuery] string? name = null,
        [FromQuery] string? email = null,
        [FromQuery] string? role = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var users = await _userService.GetAllForExportAsync(name, email, role, startDate, endDate);

            var fileName = $"Users_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";
            var excelFile = _userService.GenerateExcelExport(users, "Users");
            return File(excelFile, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting users to Excel");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet]
    public async Task<ActionResult<PaginationResponseVM<UserResponseVM>>> GetAll(
        [FromQuery] int pageNumber = 0, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? name = null,
        [FromQuery] string? email = null,
        [FromQuery] string? role = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var (users, totalCount) = await _userService.GetAllWithFiltersAsync(pageNumber, pageSize, name, email, role, startDate, endDate);
            var response = users.Select(u => _mapper.MapUserToUserResponseVM(u)).ToList();

            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<UserResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Users")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all users");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponseVM>> GetById(Guid id)
    {
        try
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("User") });

            var response = _mapper.MapUserToUserResponseVM(user);

            return Ok(new SuccessVM
            {
                Data = response,
                Message = ConstantHelper.GetSuccess("User")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting user {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPost]
    public async Task<ActionResult<UserResponseVM>> Create([FromBody] CreateUserVM request)
    {
        try
        {
            if (!ModelState.IsValid)
                return Ok(new ErrorVM { Message = ConstantHelper.INVALID_MODEL_ERR });

            var isEmailUnique = await _userService.IsEmailUniqueAsync(request.Email);
            if (!isEmailUnique)
                return Ok(new ErrorVM { Message = "Email already exists" });

            request.Password = _passwordHasher.HashPassword(null, request.Password);
            var user = _mapper.MapCreateUserVMToUser(request);

            await _userService.AddAsync(user);

            return Ok(new SuccessVM
            {
                Data = user.UserId,
                Message = ConstantHelper.AddSuccess("User")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserVM request)
    {
        try
        {
            if (id != request.UserId)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotMatchErr("User") });

            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("User") });

            var updatedUser = _mapper.MapUpdateUserVMToUser(request, user);

            await _userService.UpdateAsync(updatedUser);
            return Ok(new SuccessVM { Message = ConstantHelper.UpdateSuccess("User") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating user {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("User") });

            await _userService.DeleteAsync(user);
            return Ok(new SuccessVM { Message = ConstantHelper.DeleteSuccess("User") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting user {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }
}
