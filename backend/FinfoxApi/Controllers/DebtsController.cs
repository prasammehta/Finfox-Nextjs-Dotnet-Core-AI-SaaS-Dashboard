using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinfoxApi.Interfaces;
using FinfoxApi.ViewModels;
using FinfoxApi.Helper;

namespace FinfoxApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DebtsController : ControllerBase
{
    private readonly IDebtService _debtService;
    private readonly IMapper _mapper;
    private readonly ILogger<DebtsController> _logger;

    public DebtsController(
        IDebtService debtService,
        IMapper mapper,
        ILogger<DebtsController> logger)
    {
        _debtService = debtService;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportToExcel(
        [FromQuery] string? personName = null,
        [FromQuery] double? amountGreaterThan = null,
        [FromQuery] double? amountLessThan = null,
        [FromQuery] string? debtType = null,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Debt") });

            var debts = AuthorizationHelper.IsAdmin(User) 
                ? await _debtService.GetAllForExportAsync(personName, amountGreaterThan, amountLessThan, debtType, status, startDate, endDate)
                : await _debtService.GetByUserIdForExportAsync(userId!.Value, personName, amountGreaterThan, amountLessThan, debtType, status, startDate, endDate);

            var fileName = $"Debts_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";
            var excelFile = _debtService.GenerateExcelExport(debts, "Debts");
            return File(excelFile, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting debts to Excel");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet]
    public async Task<ActionResult<PaginationResponseVM<DebtResponseVM>>> GetAll(
        [FromQuery] int pageNumber = 0, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? personName = null,
        [FromQuery] double? amountGreaterThan = null,
        [FromQuery] double? amountLessThan = null,
        [FromQuery] string? debtType = null,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Debt") });

            var (debts, totalCount) = AuthorizationHelper.IsAdmin(User) 
                ? await _debtService.GetAllWithFiltersAsync(pageNumber, pageSize, personName, amountGreaterThan, amountLessThan, debtType, status, startDate, endDate)
                : await _debtService.GetByUserIdWithFiltersAsync(userId!.Value, pageNumber, pageSize, personName, amountGreaterThan, amountLessThan, debtType, status, startDate, endDate);
            var response = debts.Select(d => _mapper.MapDebtToDebtResponseVM(d)).ToList();

            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<DebtResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Debts")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all debts");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DebtResponseVM>> GetById(int id)
    {
        try
        {
            var debt = await _debtService.GetByIdAsync(id);
            if (debt == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Debt") });

            if (!AuthorizationHelper.IsAuthorized(User, debt.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Debt") });

            return Ok(new SuccessVM
            {
                Data = _mapper.MapDebtToDebtResponseVM(debt),
                Message = ConstantHelper.GetSuccess("Debt")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting debt {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<PaginationResponseVM<DebtResponseVM>>> GetByUserId(
        Guid userId, 
        [FromQuery] int pageNumber = 0, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? personName = null,
        [FromQuery] double? amountGreaterThan = null,
        [FromQuery] double? amountLessThan = null,
        [FromQuery] string? debtType = null,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, userId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Debt") });

            var (debts, totalCount) = await _debtService.GetByUserIdWithFiltersAsync(userId, pageNumber, pageSize, personName, amountGreaterThan, amountLessThan, debtType, status, startDate, endDate);
            var response = debts.Select(d => _mapper.MapDebtToDebtResponseVM(d)).ToList();
            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<DebtResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Debts")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting debts for user {userId}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("user/{userId}/active")]
    public async Task<ActionResult<PaginationResponseVM<DebtResponseVM>>> GetActiveDebts(Guid userId, [FromQuery] int pageNumber = 0, [FromQuery] int pageSize = 10)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, userId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Debt") });

            var (debts, totalCount) = await _debtService.GetActiveDebtsAsync(userId, pageNumber, pageSize);
            var response = debts.Select(d => _mapper.MapDebtToDebtResponseVM(d)).ToList();
            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<DebtResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Active Debts")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active debts");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("user/{userId}/total")]
    public async Task<ActionResult<double>> GetTotalDebt(Guid userId)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, userId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Debt") });

            var total = await _debtService.GetTotalDebtAsync(userId);
            return Ok(new SuccessVM
            {
                Data = new { totalDebt = total },
                Message = ConstantHelper.GetSuccess("Total debt")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting total debt");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPost]
    public async Task<ActionResult<DebtResponseVM>> Create([FromBody] CreateDebtVM request)
    {
        try
        {
            if (!ModelState.IsValid)
                return Ok(new ErrorVM { Message = ConstantHelper.INVALID_MODEL_ERR });

            if (!AuthorizationHelper.IsAuthorized(User, request.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Debt") });

            var debt = _mapper.MapCreateDebtVMToDebt(request);
            debt.UserId = request.UserId;

            await _debtService.AddAsync(debt);

            return Ok(new SuccessVM
            {
                Data = debt.DebtId,
                Message = ConstantHelper.AddSuccess("Debt")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating debt");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDebtVM request)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, request.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Debt") });

            if (id != request.DebtId)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotMatchErr("Debt") });

            var debt = await _debtService.GetByIdAsync(id);
            if (debt == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Debt") });

            var updatedDebt = _mapper.MapUpdateDebtVMToDebt(request, debt);

            await _debtService.UpdateAsync(updatedDebt);
            return Ok(new SuccessVM { Message = ConstantHelper.UpdateSuccess("Debt") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating debt {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var debt = await _debtService.GetByIdAsync(id);
            if (debt == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Debt") });

            if (!AuthorizationHelper.IsAuthorized(User, debt.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Debt") });

            await _debtService.DeleteAsync(debt);
            return Ok(new SuccessVM { Message = ConstantHelper.DeleteSuccess("Debt") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting debt {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }
}
