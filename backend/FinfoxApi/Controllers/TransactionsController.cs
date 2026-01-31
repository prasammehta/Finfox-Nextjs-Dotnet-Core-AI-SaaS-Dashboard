using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinfoxApi.Interfaces;
using FinfoxApi.ViewModels;
using FinfoxApi.Helper;

namespace FinfoxApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;
    private readonly IMapper _mapper;
    private readonly ILogger<TransactionsController> _logger;

    public TransactionsController(
        ITransactionService transactionService,
        IMapper mapper,
        ILogger<TransactionsController> logger)
    {
        _transactionService = transactionService;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportToExcel(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int? fromAccountId = null,
        [FromQuery] double? amountGreaterThan = null,
        [FromQuery] double? amountLessThan = null,
        [FromQuery] string? type = null,
        [FromQuery] string? category = null,
        [FromQuery] string? description = null)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Transaction") });

            var transactions = AuthorizationHelper.IsAdmin(User) 
                ? await _transactionService.GetAllForExportAsync(startDate, endDate, fromAccountId, amountGreaterThan, amountLessThan, type, category, description)
                : await _transactionService.GetByUserIdForExportAsync(userId!.Value, startDate, endDate, fromAccountId, amountGreaterThan, amountLessThan, type, category, description);

            var fileName = $"Transactions_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";
            var excelFile = _transactionService.GenerateExcelExport(transactions, "Transactions");
            return File(excelFile, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting transactions to Excel");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet]
    public async Task<ActionResult<PaginationResponseVM<TransactionResponseVM>>> GetAll(
        [FromQuery] int pageNumber = 0, 
        [FromQuery] int pageSize = 10,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int? fromAccountId = null,
        [FromQuery] double? amountGreaterThan = null,
        [FromQuery] double? amountLessThan = null,
        [FromQuery] string? type = null,
        [FromQuery] string? category = null,
        [FromQuery] string? description = null)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Transaction") });

            var (transactions, totalCount) = AuthorizationHelper.IsAdmin(User) 
                ? await _transactionService.GetAllWithFiltersAsync(pageNumber, pageSize, startDate, endDate, fromAccountId, amountGreaterThan, amountLessThan, type, category, description)
                : await _transactionService.GetByUserIdWithFiltersAsync(userId!.Value, pageNumber, pageSize, startDate, endDate, fromAccountId, amountGreaterThan, amountLessThan, type, category, description);
            
            var response = transactions.Select(t => _mapper.MapTransactionToTransactionResponseVM(t)).ToList();

            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<TransactionResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Transactions")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all transactions");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionResponseVM>> GetById(int id)
    {
        try
        {
            var transaction = await _transactionService.GetByIdAsync(id);
            if (transaction == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Transaction") });

            if (!AuthorizationHelper.IsAuthorized(User, transaction.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Transaction") });

            var response = _mapper.MapTransactionToTransactionResponseVM(transaction);

            return Ok(new SuccessVM
            {
                Data = response,
                Message = ConstantHelper.GetSuccess("Transaction")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting transaction {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<PaginationResponseVM<TransactionResponseVM>>> GetByUserId(
        Guid userId, 
        [FromQuery] int pageNumber = 0, 
        [FromQuery] int pageSize = 10,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int? fromAccountId = null,
        [FromQuery] double? amountGreaterThan = null,
        [FromQuery] double? amountLessThan = null,
        [FromQuery] string? type = null,
        [FromQuery] string? category = null)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, userId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Transaction") });

            var (transactions, totalCount) = await _transactionService.GetByUserIdWithFiltersAsync(userId, pageNumber, pageSize, startDate, endDate, fromAccountId, amountGreaterThan, amountLessThan, type, category);
            var response = transactions.Select(t => _mapper.MapTransactionToTransactionResponseVM(t)).ToList();

            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<TransactionResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Transactions")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting transactions for user {userId}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("account/{accountId}")]
    public async Task<ActionResult<PaginationResponseVM<TransactionResponseVM>>> GetByAccountId(int accountId, [FromQuery] int pageNumber = 0, [FromQuery] int pageSize = 10)
    {
        try
        {
            var (transactions, totalCount) = await _transactionService.GetByAccountIdAsync(accountId, pageNumber, pageSize);
            var response = transactions.Select(t => _mapper.MapTransactionToTransactionResponseVM(t)).ToList();

            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<TransactionResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Transactions")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting transactions for account {accountId}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("user/{userId}/date-range")]
    public async Task<ActionResult<PaginationResponseVM<TransactionResponseVM>>> GetByDateRange(Guid userId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int pageNumber = 0, [FromQuery] int pageSize = 10)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, userId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Transaction") });

            var (transactions, totalCount) = await _transactionService.GetByDateRangeAsync(userId, startDate, endDate, pageNumber, pageSize);
            var response = transactions.Select(t => _mapper.MapTransactionToTransactionResponseVM(t)).ToList();

            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<TransactionResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Transactions")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting transactions by date range");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TransactionResponseVM>> Create([FromBody] CreateTransactionVM request)
    {
        try
        {
            if (!ModelState.IsValid)
                return Ok(new ErrorVM { Message = ConstantHelper.INVALID_MODEL_ERR });

            if (!AuthorizationHelper.IsAuthorized(User, request.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Transaction") });

            var transaction = _mapper.MapCreateTransactionVMToTransaction(request);
            transaction.UserId = request.UserId;

            await _transactionService.AddAsync(transaction);

            return Ok(new SuccessVM
            {
                Data = transaction.TransactionId,
                Message = ConstantHelper.AddSuccess("Transaction")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating transaction");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTransactionVM request)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, request.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Transaction") });

            if (id != request.TransactionId)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotMatchErr("Transaction") });

            var existingTransaction = await _transactionService.GetByIdAsync(id);
            if (existingTransaction == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Transaction") });

            existingTransaction = _mapper.MapUpdateTransactionVMToTransaction(request, existingTransaction);

            await _transactionService.UpdateAsync(existingTransaction);
            return Ok(new SuccessVM { Message = ConstantHelper.UpdateSuccess("Transaction") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating transaction {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var transaction = await _transactionService.GetByIdAsync(id);
            if (transaction == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Transaction") });

            if (!AuthorizationHelper.IsAuthorized(User, transaction.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Transaction") });
                
            await _transactionService.DeleteAsync(transaction);
            return Ok(new SuccessVM { Message = ConstantHelper.DeleteSuccess("Transaction") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting transaction {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }
}
