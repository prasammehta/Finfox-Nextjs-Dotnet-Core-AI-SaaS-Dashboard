using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinfoxApi.Interfaces;
using FinfoxApi.ViewModels;
using FinfoxApi.Helper;

namespace FinfoxApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BillsController : ControllerBase
{
    private readonly IBillService _billService;
    private readonly IMapper _mapper;
    private readonly ILogger<BillsController> _logger;

    public BillsController(
        IBillService billService,
        IMapper mapper,
        ILogger<BillsController> logger)
    {
        _billService = billService;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportToExcel(
        [FromQuery] string? client = null,
        [FromQuery] string? invoiceNumber = null,
        [FromQuery] double? amountGreaterThan = null,
        [FromQuery] double? amountLessThan = null,
        [FromQuery] DateTime? dueDate = null)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill") });

            var bills = AuthorizationHelper.IsAdmin(User) 
                ? await _billService.GetAllForExportAsync(client, invoiceNumber, amountGreaterThan, amountLessThan, dueDate)
                : await _billService.GetByUserIdForExportAsync(userId!.Value, client, invoiceNumber, amountGreaterThan, amountLessThan, dueDate);

            var fileName = $"Bills_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";
            var excelFile = _billService.GenerateExcelExport(bills, "Bills");
            return File(excelFile, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting bills to Excel");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet]
    public async Task<ActionResult<PaginationResponseVM<BillResponseVM>>> GetAll(
        [FromQuery] int pageNumber = 0, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? client = null,
        [FromQuery] string? invoiceNumber = null,
        [FromQuery] double? amountGreaterThan = null,
        [FromQuery] double? amountLessThan = null,
        [FromQuery] DateTime? dueDate = null)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill") });

            var (bills, totalCount) = AuthorizationHelper.IsAdmin(User) 
                ? await _billService.GetAllWithFiltersAsync(pageNumber, pageSize, client, invoiceNumber, amountGreaterThan, amountLessThan, dueDate)
                : await _billService.GetByUserIdWithFiltersAsync(userId!.Value, pageNumber, pageSize, client, invoiceNumber, amountGreaterThan, amountLessThan, dueDate);
            
            var response = bills.Select(b => _mapper.MapBillToBillResponseVM(b)).ToList();

            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<BillResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Bills")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all bills");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BillResponseVM>> GetById(int id)
    {
        try
        {
            var bill = await _billService.GetByIdAsync(id);
            if (bill == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Bill") });

            if (!AuthorizationHelper.IsAuthorized(User, bill.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill") });

            return Ok(new SuccessVM
            {
                Data = _mapper.MapBillToBillResponseVM(bill),
                Message = ConstantHelper.GetSuccess("Bill")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting bill {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<PaginationResponseVM<BillResponseVM>>> GetByUserId(
        Guid userId, 
        [FromQuery] int pageNumber = 0, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? client = null,
        [FromQuery] string? invoiceNumber = null,
        [FromQuery] double? amountGreaterThan = null,
        [FromQuery] double? amountLessThan = null,
        [FromQuery] DateTime? dueDate = null)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, userId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill") });

            var (bills, totalCount) = await _billService.GetByUserIdWithFiltersAsync(userId, pageNumber, pageSize, client, invoiceNumber, amountGreaterThan, amountLessThan, dueDate);
            var response = bills.Select(b => _mapper.MapBillToBillResponseVM(b)).ToList();
            
            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<BillResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Bills")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting bills for user {userId}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("user/{userId}/overdue")]
    public async Task<ActionResult<PaginationResponseVM<BillResponseVM>>> GetOverdueBills(Guid userId, [FromQuery] int pageNumber = 0, [FromQuery] int pageSize = 10)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, userId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill") });

            var (bills, totalCount) = await _billService.GetOverdueBillsAsync(userId, pageNumber, pageSize);
            var response = bills.Select(b => _mapper.MapBillToBillResponseVM(b)).ToList();
            
            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<BillResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Overdue Bills")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting overdue bills");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPost]
    public async Task<ActionResult<BillResponseVM>> Create([FromBody] CreateBillVM request)
    {
        try
        {
            if (!ModelState.IsValid)
                return Ok(new ErrorVM { Message = ConstantHelper.INVALID_MODEL_ERR });

            if (!AuthorizationHelper.IsAuthorized(User, request.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill") });

            var bill = _mapper.MapCreateBillVMToBill(request);
            bill.UserId = request.UserId;

            await _billService.AddAsync(bill);

            return Ok(new SuccessVM
            {
                Data = bill.BillId,
                Message = ConstantHelper.AddSuccess("Bill")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating bill");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBillVM request)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, request.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill") });

            if (id != request.BillId)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotMatchErr("Bill") });

            var existingBill = await _billService.GetByIdAsync(id);
            if (existingBill == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Bill") });

            existingBill = _mapper.MapUpdateBillVMToBill(request, existingBill);

            await _billService.UpdateAsync(existingBill);
            return Ok(new SuccessVM { Message = ConstantHelper.UpdateSuccess("Bill") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating bill {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var bill = await _billService.GetByIdAsync(id);
            if (bill == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Bill") });

            if (!AuthorizationHelper.IsAuthorized(User, bill.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill") });

            await _billService.DeleteAsync(bill);
            return Ok(new SuccessVM { Message = ConstantHelper.DeleteSuccess("Bill") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting bill {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }
}
