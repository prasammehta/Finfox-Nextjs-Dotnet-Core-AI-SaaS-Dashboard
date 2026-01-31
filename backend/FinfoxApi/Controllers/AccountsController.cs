using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinfoxApi.Interfaces;
using FinfoxApi.ViewModels;
using FinfoxApi.Helper;

namespace FinfoxApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountsController : ControllerBase
{
    private readonly IAccountService _accountService;
    private readonly IMapper _mapper;
    private readonly ILogger<AccountsController> _logger;

    public AccountsController(
        IAccountService accountService,
        IMapper mapper,
        ILogger<AccountsController> logger)
    {
        _accountService = accountService;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportToExcel(
        [FromQuery] string? name = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Account") });

            var accounts = AuthorizationHelper.IsAdmin(User) 
                ? await _accountService.GetAllForExportAsync(name, startDate, endDate)
                : await _accountService.GetByUserIdForExportAsync(userId!.Value, name, startDate, endDate);

            var fileName = $"Accounts_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";
            var excelFile = _accountService.GenerateExcelExport(accounts, "Accounts");
            return File(excelFile, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting accounts to Excel");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet]
    public async Task<ActionResult<PaginationResponseVM<AccountResponseVM>>> GetAll(
        [FromQuery] int pageNumber = 0, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? name = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Account") });

            var (accounts, totalCount) = AuthorizationHelper.IsAdmin(User) 
                ? await _accountService.GetAllWithFiltersAsync(pageNumber, pageSize, name, startDate, endDate)
                : await _accountService.GetByUserIdWithFiltersAsync(userId!.Value, pageNumber, pageSize, name, startDate, endDate);
            
            var response = accounts.Select(a => _mapper.MapAccountToAccountResponseVM(a)).ToList();

            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<AccountResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Accounts")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all accounts");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AccountResponseVM>> GetById(int id)
    {
        try
        {
            var account = await _accountService.GetByIdAsync(id);
            if (account == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Account") });

            if (!AuthorizationHelper.IsAuthorized(User, account.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Account") });

            var response = _mapper.MapAccountToAccountResponseVM(account);

            return Ok(new SuccessVM
            {
                Data = response,
                Message = ConstantHelper.GetSuccess("Account")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting account {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<PaginationResponseVM<AccountResponseVM>>> GetByUserId(
        Guid userId, 
        [FromQuery] int pageNumber = 0, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? name = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, userId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Account") });

            var (accounts, totalCount) = await _accountService.GetByUserIdWithFiltersAsync(userId, pageNumber, pageSize, name, startDate, endDate);
            var response = accounts.Select(a => _mapper.MapAccountToAccountResponseVM(a)).ToList();

            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<AccountResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Accounts")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting accounts for user {userId}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPost]
    public async Task<ActionResult<AccountResponseVM>> Create([FromBody] CreateAccountVM request)
    {
        try
        {
            if (!ModelState.IsValid)
                return Ok(new ErrorVM { Message = ConstantHelper.INVALID_MODEL_ERR });

            if (!AuthorizationHelper.IsAuthorized(User, request.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Account") });

            var account = _mapper.MapCreateAccountVMToAccount(request);
            account.UserId = request.UserId;

            await _accountService.AddAsync(account);

            return Ok(new SuccessVM
            {
                Data = account.AccountId,
                Message = ConstantHelper.AddSuccess("Account")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating account");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAccountVM request)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, request.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Account") });

            if (id != request.AccountId)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotMatchErr("Account") });

            var existingAccount = await _accountService.GetByIdAsync(id);
            if (existingAccount == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Account") });

            existingAccount = _mapper.MapUpdateAccountVMToAccount(request, existingAccount);

            await _accountService.UpdateAsync(existingAccount);
            return Ok(new SuccessVM { Message = ConstantHelper.UpdateSuccess("Account") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating account {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var account = await _accountService.GetByIdAsync(id);
            if (account == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Account") });

            if (!AuthorizationHelper.IsAuthorized(User, account.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Account") });

            await _accountService.DeleteAsync(account);
            return Ok(new SuccessVM { Message = ConstantHelper.DeleteSuccess("Account") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting account {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("{id}/balance")]
    public async Task<ActionResult<double>> GetBalance(int id)
    {
        try
        {
            var account = await _accountService.GetByIdAsync(id);
            if (account == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Account") });

            if (!AuthorizationHelper.IsAuthorized(User, account.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Account") });

            var balance = await _accountService.GetCurrentBalanceAsync(id);
            return Ok(new SuccessVM
            {
                Data = new { balance },
                Message = ConstantHelper.GetSuccess("Account balance")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting balance for account {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }
}
