using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinfoxApi.Interfaces;
using FinfoxApi.ViewModels;
using FinfoxApi.Helper;

namespace FinfoxApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RecurringTransactionsController : ControllerBase
{
    private readonly IRecurringTransactionService _recurringTransactionService;
    private readonly IMapper _mapper;
    private readonly ILogger<RecurringTransactionsController> _logger;

    public RecurringTransactionsController(
        IRecurringTransactionService recurringTransactionService,
        IMapper mapper,
        ILogger<RecurringTransactionsController> logger)
    {
        _recurringTransactionService = recurringTransactionService;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportToExcel(
        [FromQuery] string? description = null,
        [FromQuery] double? amountGreaterThan = null,
        [FromQuery] double? amountLessThan = null,
        [FromQuery] string? frequency = null,
        [FromQuery] string? category = null,
        [FromQuery] string? type = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Recurring Transaction") });

            var transactions = AuthorizationHelper.IsAdmin(User) 
                ? await _recurringTransactionService.GetAllForExportAsync(description, amountGreaterThan, amountLessThan, frequency, category, type, isActive, startDate, endDate)
                : await _recurringTransactionService.GetByUserIdForExportAsync(userId!.Value, description, amountGreaterThan, amountLessThan, frequency, category, type, isActive, startDate, endDate);

            var fileName = $"RecurringTransactions_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";
            var excelFile = _recurringTransactionService.GenerateExcelExport(transactions, "Recurring Transactions");
            Response.Headers.Add("Content-Disposition", $"attachment; filename=\"{fileName}\"");
            return File(excelFile, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting recurring transactions to Excel");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet]
    public async Task<ActionResult<PaginationResponseVM<RecurringTransactionResponseVM>>> GetAll(
        [FromQuery] int pageNumber = 0, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? description = null,
        [FromQuery] double? amountGreaterThan = null,
        [FromQuery] double? amountLessThan = null,
        [FromQuery] string? frequency = null,
        [FromQuery] string? category = null,
        [FromQuery] string? type = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Recurring Transaction") });

            var (transactions, totalCount) = AuthorizationHelper.IsAdmin(User) 
                ? await _recurringTransactionService.GetAllWithFiltersAsync(pageNumber, pageSize, description, amountGreaterThan, amountLessThan, frequency, category, type, isActive, startDate, endDate) 
                : await _recurringTransactionService.GetByUserIdWithFiltersAsync(userId!.Value, pageNumber, pageSize, description, amountGreaterThan, amountLessThan, frequency, category, type, isActive, startDate, endDate);
            var response = transactions.Select(t => _mapper.MapRecurringTransactionToRecurringTransactionResponseVM(t)).ToList();

            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<RecurringTransactionResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Recurring Transactions")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all recurring transactions");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RecurringTransactionResponseVM>> GetById(int id)
    {
        try
        {
            var transaction = await _recurringTransactionService.GetByIdAsync(id);
            if (transaction == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Recurring Transaction") });

            if (!AuthorizationHelper.IsAuthorized(User, transaction.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Recurring Transaction") });

            var response = _mapper.MapRecurringTransactionToRecurringTransactionResponseVM(transaction);

            return Ok(new SuccessVM
            {
                Data = response,
                Message = ConstantHelper.GetSuccess("Recurring Transaction")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting recurring transaction {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<PaginationResponseVM<RecurringTransactionResponseVM>>> GetByUserId(
        Guid userId, 
        [FromQuery] int pageNumber = 0, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? description = null,
        [FromQuery] double? amountGreaterThan = null,
        [FromQuery] double? amountLessThan = null,
        [FromQuery] string? frequency = null,
        [FromQuery] string? category = null,
        [FromQuery] string? type = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, userId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Recurring Transaction") });

            var (transactions, totalCount) = await _recurringTransactionService.GetByUserIdWithFiltersAsync(
                userId, 
                pageNumber, 
                pageSize, 
                description, 
                amountGreaterThan, 
                amountLessThan, 
                frequency, 
                category, 
                type, 
                isActive, 
                startDate, 
                endDate);
            var response = transactions.Select(t => _mapper.MapRecurringTransactionToRecurringTransactionResponseVM(t)).ToList();

            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<RecurringTransactionResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Recurring Transactions")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting recurring transactions for user {userId}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPost]
    public async Task<ActionResult<RecurringTransactionResponseVM>> Create([FromBody] CreateRecurringTransactionVM request)
    {
        try
        {
            if (!ModelState.IsValid)
                return Ok(new ErrorVM { Message = ConstantHelper.INVALID_MODEL_ERR });

            if (!AuthorizationHelper.IsAuthorized(User, request.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Recurring Transaction") });

            var transaction = _mapper.MapCreateRecurringTransactionVMToRecurringTransaction(request);
            transaction.UserId = request.UserId;

            await _recurringTransactionService.AddAsync(transaction);

            return Ok(new SuccessVM
            {
                Data = transaction.RecurringTransactionId,
                Message = ConstantHelper.AddSuccess("Recurring Transaction")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating recurring transaction");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRecurringTransactionVM request)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, request.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Recurring Transaction") });

            if (id != request.RecurringTransactionId)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotMatchErr("Recurring Transaction") });

            var existingTransaction = await _recurringTransactionService.GetByIdAsync(id);
            if (existingTransaction == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Recurring Transaction") });

            existingTransaction = _mapper.MapUpdateRecurringTransactionVMToRecurringTransaction(request, existingTransaction);

            await _recurringTransactionService.UpdateAsync(existingTransaction);
            return Ok(new SuccessVM { Message = ConstantHelper.UpdateSuccess("Recurring Transaction") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating recurring transaction {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var transaction = await _recurringTransactionService.GetByIdAsync(id);
            if (transaction == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Recurring Transaction") });

            if (!AuthorizationHelper.IsAuthorized(User, transaction.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Recurring Transaction") });

            await _recurringTransactionService.DeleteAsync(transaction);
            return Ok(new SuccessVM { Message = ConstantHelper.DeleteSuccess("Recurring Transaction") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting recurring transaction {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPost("{userId}/process")]
    public async Task<IActionResult> ProcessRecurringTransactions(Guid userId)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, userId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Recurring Transaction") });

            await _recurringTransactionService.ProcessRecurringTransactionsAsync(userId);
            return Ok(new SuccessVM { Message = "Recurring transactions processed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing recurring transactions");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }
}
