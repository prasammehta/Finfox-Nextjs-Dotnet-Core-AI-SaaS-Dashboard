using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FinfoxApi.Interfaces;
using FinfoxApi.ViewModels;
using FinfoxApi.Helper;

namespace FinfoxApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(
        IDashboardService dashboardService,
        ILogger<DashboardController> logger)
    {
        _dashboardService = dashboardService;
        _logger = logger;
    }

    /// <summary>
    /// Get complete dashboard data for authenticated user
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<SuccessVM>> GetDashboard()
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = "Invalid user information in token" });

            var dashboard = await _dashboardService.GetDashboardAsync(userId.Value);
            
            return Ok(new SuccessVM
            {
                Data = dashboard,
                Message = ConstantHelper.GetSuccess("Dashboard")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching dashboard");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    /// <summary>
    /// Get key metrics (summary cards)
    /// </summary>
    [HttpGet("metrics")]
    public async Task<ActionResult<SuccessVM>> GetKeyMetrics()
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = "Invalid user information in token" });

            var metrics = await _dashboardService.GetKeyMetricsAsync(userId.Value);
            
            return Ok(new SuccessVM
            {
                Data = metrics,
                Message = ConstantHelper.GetSuccess("Key Metrics")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching key metrics");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    /// <summary>
    /// Get account summary with all accounts
    /// </summary>
    [HttpGet("accounts")]
    public async Task<ActionResult<SuccessVM>> GetAccountSummary()
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = "Invalid user information in token" });

            var accountSummary = await _dashboardService.GetAccountSummaryAsync(userId.Value);
            
            return Ok(new SuccessVM
            {
                Data = accountSummary,
                Message = ConstantHelper.GetSuccess("Account Summary")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching account summary");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    /// <summary>
    /// Get transaction summary with categories breakdown
    /// </summary>
    [HttpGet("transactions")]
    public async Task<ActionResult<SuccessVM>> GetTransactionSummary()
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = "Invalid user information in token" });

            var transactionSummary = await _dashboardService.GetTransactionSummaryAsync(userId.Value);
            
            return Ok(new SuccessVM
            {
                Data = transactionSummary,
                Message = ConstantHelper.GetSuccess("Transaction Summary")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching transaction summary");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    /// <summary>
    /// Get debt summary with all debts
    /// </summary>
    [HttpGet("debts")]
    public async Task<ActionResult<SuccessVM>> GetDebtSummary()
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = "Invalid user information in token" });

            var debtSummary = await _dashboardService.GetDebtSummaryAsync(userId.Value);
            
            return Ok(new SuccessVM
            {
                Data = debtSummary,
                Message = ConstantHelper.GetSuccess("Debt Summary")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching debt summary");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    /// <summary>
    /// Get investment summary
    /// </summary>
    [HttpGet("investments")]
    public async Task<ActionResult<SuccessVM>> GetInvestmentSummary()
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = "Invalid user information in token" });

            var investmentSummary = await _dashboardService.GetInvestmentSummaryAsync(userId.Value);
            
            return Ok(new SuccessVM
            {
                Data = investmentSummary,
                Message = ConstantHelper.GetSuccess("Investment Summary")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching investment summary");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    /// <summary>
    /// Get recent transactions
    /// </summary>
    [HttpGet("recent-transactions")]
    public async Task<ActionResult<SuccessVM>> GetRecentTransactions([FromQuery] int limit = 10)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = "Invalid user information in token" });

            var recentTransactions = await _dashboardService.GetRecentTransactionsAsync(userId.Value, limit);
            
            return Ok(new SuccessVM
            {
                Data = recentTransactions,
                Message = ConstantHelper.GetSuccess("Recent Transactions")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching recent transactions");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    /// <summary>
    /// Get budget overview
    /// </summary>
    [HttpGet("budget")]
    public async Task<ActionResult<SuccessVM>> GetBudgetOverview()
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = "Invalid user information in token" });

            var budgetOverview = await _dashboardService.GetBudgetOverviewAsync(userId.Value);
            
            return Ok(new SuccessVM
            {
                Data = budgetOverview,
                Message = ConstantHelper.GetSuccess("Budget Overview")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching budget overview");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    /// <summary>
    /// Get monthly trends for chart
    /// </summary>
    [HttpGet("trends")]
    public async Task<ActionResult<SuccessVM>> GetMonthlyTrends([FromQuery] int months = 6)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = "Invalid user information in token" });

            var trends = await _dashboardService.GetMonthlyTrendsAsync(userId.Value, months);
            
            return Ok(new SuccessVM
            {
                Data = trends,
                Message = ConstantHelper.GetSuccess("Monthly Trends")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching monthly trends");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    /// <summary>
    /// Get asset distribution
    /// </summary>
    [HttpGet("asset-distribution")]
    public async Task<ActionResult<SuccessVM>> GetAssetDistribution()
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = "Invalid user information in token" });

            var distribution = await _dashboardService.GetAssetDistributionAsync(userId.Value);
            
            return Ok(new SuccessVM
            {
                Data = distribution,
                Message = ConstantHelper.GetSuccess("Asset Distribution")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching asset distribution");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

}
