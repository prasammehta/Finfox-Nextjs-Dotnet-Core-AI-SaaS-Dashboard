using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinfoxApi.Interfaces;
using FinfoxApi.ViewModels;
using FinfoxApi.Helper;

namespace FinfoxApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvestmentsController : ControllerBase
{
    private readonly IInvestmentService _investmentService;
    private readonly IMapper _mapper;
    private readonly ILogger<InvestmentsController> _logger;

    public InvestmentsController(
        IInvestmentService investmentService,
        IMapper mapper,
        ILogger<InvestmentsController> logger)
    {
        _investmentService = investmentService;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportToExcel(
        [FromQuery] string? name = null,
        [FromQuery] string? type = null,
        [FromQuery] double? gainLossGreaterThan = null,
        [FromQuery] double? gainLossLessThan = null,
        [FromQuery] double? returnPercentGreaterThan = null,
        [FromQuery] DateTime? dateAcquired = null)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Investment") });

            var investments = AuthorizationHelper.IsAdmin(User) 
                ? await _investmentService.GetAllForExportAsync(name, type, gainLossGreaterThan, gainLossLessThan, returnPercentGreaterThan, dateAcquired)
                : await _investmentService.GetByUserIdForExportAsync(userId!.Value, name, type, gainLossGreaterThan, gainLossLessThan, returnPercentGreaterThan, dateAcquired);

            var fileName = $"Investments_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";
            var excelFile = _investmentService.GenerateExcelExport(investments, "Investments");
            return File(excelFile, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting investments to Excel");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet]
    public async Task<ActionResult<PaginationResponseVM<InvestmentResponseVM>>> GetAll(
        [FromQuery] int pageNumber = 0, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? name = null,
        [FromQuery] string? type = null,
        [FromQuery] double? gainLossGreaterThan = null,
        [FromQuery] double? gainLossLessThan = null,
        [FromQuery] double? returnPercentGreaterThan = null,
        [FromQuery] DateTime? dateAcquired = null)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Investment") });

            var (investments, totalCount) = AuthorizationHelper.IsAdmin(User) 
                ? await _investmentService.GetAllWithFiltersAsync(pageNumber, pageSize, name, type, gainLossGreaterThan, gainLossLessThan, returnPercentGreaterThan, dateAcquired)
                : await _investmentService.GetByUserIdWithFiltersAsync(userId!.Value, pageNumber, pageSize, name, type, gainLossGreaterThan, gainLossLessThan, returnPercentGreaterThan, dateAcquired);
            var response = investments.Select(i => _mapper.MapInvestmentToInvestmentResponseVM(i)).ToList();

            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<InvestmentResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Investments")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all investments");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InvestmentResponseVM>> GetById(int id)
    {
        try
        {
            var investment = await _investmentService.GetByIdAsync(id);
            if (investment == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Investment") });

            if (!AuthorizationHelper.IsAuthorized(User, investment.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Investment") });

            return Ok(new SuccessVM
            {
                Data = _mapper.MapInvestmentToInvestmentResponseVM(investment),
                Message = ConstantHelper.GetSuccess("Investment")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting investment {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<PaginationResponseVM<InvestmentResponseVM>>> GetByUserId(
        Guid userId, 
        [FromQuery] int pageNumber = 0, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? name = null,
        [FromQuery] string? type = null,
        [FromQuery] double? gainLossGreaterThan = null,
        [FromQuery] double? gainLossLessThan = null,
        [FromQuery] double? returnPercentGreaterThan = null,
        [FromQuery] DateTime? dateAcquired = null)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, userId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Investment") });

            var (investments, totalCount) = await _investmentService.GetByUserIdWithFiltersAsync(userId, pageNumber, pageSize, name, type, gainLossGreaterThan, gainLossLessThan, returnPercentGreaterThan, dateAcquired);
            var response = investments.Select(i => _mapper.MapInvestmentToInvestmentResponseVM(i)).ToList();
            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<InvestmentResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Investments")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting investments for user {userId}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("user/{userId}/total-value")]
    public async Task<ActionResult<double>> GetTotalInvestmentValue(Guid userId)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, userId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Investment") });

            var totalValue = await _investmentService.GetTotalInvestmentValueAsync(userId);
            return Ok(new SuccessVM
            {
                Data = new { totalInvestmentValue = totalValue },
                Message = ConstantHelper.GetSuccess("Total investment value")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting total investment value");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("{id}/gain-loss")]
    public async Task<ActionResult<double>> GetGainLoss(int id)
    {
        try
        {
            var investment = await _investmentService.GetByIdAsync(id);
            if (investment == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Investment") });

            if (!AuthorizationHelper.IsAuthorized(User, investment.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Investment") });

            var gainLoss = await _investmentService.GetInvestmentGainLossAsync(id);
            return Ok(new SuccessVM
            {
                Data = new { gainLoss },
                Message = ConstantHelper.GetSuccess("Gain/Loss")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting investment gain/loss");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPost]
    public async Task<ActionResult<InvestmentResponseVM>> Create([FromBody] CreateInvestmentVM request)
    {
        try
        {
            if (!ModelState.IsValid)
                return Ok(new ErrorVM { Message = ConstantHelper.INVALID_MODEL_ERR });

            if (!AuthorizationHelper.IsAuthorized(User, request.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Investment") });

            var investment = _mapper.MapCreateInvestmentVMToInvestment(request);
            investment.UserId = request.UserId;

            await _investmentService.AddAsync(investment);

            return Ok(new SuccessVM
            {
                Data = investment.InvestmentId,
                Message = ConstantHelper.AddSuccess("Investment")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating investment");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateInvestmentVM request)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, request.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Investment") });

            if (id != request.InvestmentId)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotMatchErr("Investment") });

            var investment = await _investmentService.GetByIdAsync(id);
            if (investment == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Investment") });

            var updatedInvestment = _mapper.MapUpdateInvestmentVMToInvestment(request, investment);

            await _investmentService.UpdateAsync(updatedInvestment);
            return Ok(new SuccessVM { Message = ConstantHelper.UpdateSuccess("Investment") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating investment {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var investment = await _investmentService.GetByIdAsync(id);
            if (investment == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Investment") });

            if (!AuthorizationHelper.IsAuthorized(User, investment.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Investment") });

            await _investmentService.DeleteAsync(investment);
            return Ok(new SuccessVM { Message = ConstantHelper.DeleteSuccess("Investment") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting investment {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }
}
