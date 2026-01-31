using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinfoxApi.Interfaces;
using FinfoxApi.ViewModels;
using FinfoxApi.Helper;
using FinfoxApi.Models;

namespace FinfoxApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BillCompanyController : ControllerBase
{
    private readonly IBillCompanyService _billCompanyService;
    private readonly IFileService _fileService;
    private readonly IMapper _mapper;
    private readonly ILogger<BillCompanyController> _logger;

    public BillCompanyController(
        IBillCompanyService billCompanyService,
        IFileService fileService,
        IMapper mapper,
        ILogger<BillCompanyController> logger)
    {
        _billCompanyService = billCompanyService;
        _fileService = fileService;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportToExcel(
        [FromQuery] string? name = null,
        [FromQuery] string? email = null,
        [FromQuery] string? gstin = null)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill Company") });

            var companies = AuthorizationHelper.IsAdmin(User) 
                ? await _billCompanyService.GetAllForExportAsync(name, email, gstin)
                : await _billCompanyService.GetByUserIdForExportAsync(userId!.Value, name, email, gstin);

            var fileName = $"BillCompanies_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";
            var excelFile = _billCompanyService.GenerateExcelExport(companies, "Bill Companies");
            return File(excelFile, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting bill companies to Excel");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet]
    public async Task<ActionResult<PaginationResponseVM<BillCompanyResponseVM>>> GetAll(
        [FromQuery] int pageNumber = 0, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? name = null,
        [FromQuery] string? email = null,
        [FromQuery] string? gstin = null)
    {
        try
        {
            var userId = AuthorizationHelper.GetUserIdFromClaims(User);
            if (userId == null)
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill Company") });

            var (companies, totalCount) = AuthorizationHelper.IsAdmin(User) 
                ? await _billCompanyService.GetAllWithFiltersAsync(pageNumber, pageSize, name, email, gstin)
                : await _billCompanyService.GetByUserIdWithFiltersAsync(userId!.Value, pageNumber, pageSize, name, email, gstin);
            
            var response = companies.Select(bc => _mapper.MapBillCompanyToBillCompanyResponseVM(bc)).ToList();

            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<BillCompanyResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Bill Companies")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all bill companies");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BillCompanyResponseVM>> GetById(int id)
    {
        try
        {
            var company = await _billCompanyService.GetByIdAsync(id);
            if (company == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Bill Company") });

            if (!AuthorizationHelper.IsAuthorized(User, company.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill Company") });

            return Ok(new SuccessVM
            {
                Data = _mapper.MapBillCompanyToBillCompanyResponseVM(company),
                Message = ConstantHelper.GetSuccess("Bill Company")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting bill company {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<PaginationResponseVM<BillCompanyResponseVM>>> GetByUserId(
        Guid userId, 
        [FromQuery] int pageNumber = 0, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? name = null,
        [FromQuery] string? email = null,
        [FromQuery] string? gstin = null)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, userId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill Company") });

            var (companies, totalCount) = await _billCompanyService.GetByUserIdWithFiltersAsync(userId, pageNumber, pageSize, name, email, gstin);
            var response = companies.Select(bc => _mapper.MapBillCompanyToBillCompanyResponseVM(bc)).ToList();
            
            return Ok(new SuccessVM
            {
                Data = new PaginationResponseVM<BillCompanyResponseVM>
                {
                    Data = response,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                Message = ConstantHelper.GetSuccess("Bill Companies")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting bill companies for user {userId}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPost]
    public async Task<ActionResult<BillCompanyResponseVM>> Create([FromBody] CreateBillCompanyVM request)
    {
        try
        {
            if (!ModelState.IsValid)
                return Ok(new ErrorVM { Message = ConstantHelper.INVALID_MODEL_ERR });

            if (!AuthorizationHelper.IsAuthorized(User, request.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill Company") });

            var company = _mapper.MapCreateBillCompanyVMToBillCompany(request);
            company.UserId = request.UserId;

            await _billCompanyService.AddAsync(company);

            return Ok(new SuccessVM
            {
                Data = company.BillCompanyId,
                Message = ConstantHelper.AddSuccess("Bill Company")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating bill company");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBillCompanyVM request)
    {
        try
        {
            if (!AuthorizationHelper.IsAuthorized(User, request.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill Company") });

            if (id != request.BillCompanyId)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotMatchErr("Bill Company") });

            var existingCompany = await _billCompanyService.GetByIdAsync(id);
            if (existingCompany == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Bill Company") });

            existingCompany = _mapper.MapUpdateBillCompanyVMToBillCompany(request, existingCompany);

            await _billCompanyService.UpdateAsync(existingCompany);
            return Ok(new SuccessVM { Message = ConstantHelper.UpdateSuccess("Bill Company") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating bill company {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var company = await _billCompanyService.GetByIdAsync(id);
            if (company == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Bill Company") });

            if (!AuthorizationHelper.IsAuthorized(User, company.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill Company") });

            await _billCompanyService.DeleteAsync(company);
            return Ok(new SuccessVM { Message = ConstantHelper.DeleteSuccess("Bill Company") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting bill company {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpPost("{id}/upload-logo")]
    public async Task<IActionResult> UploadLogo(int id, IFormFile file)
    {
        try
        {
            var company = await _billCompanyService.GetByIdAsync(id);
            if (company == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Bill Company") });

            if (!AuthorizationHelper.IsAuthorized(User, company.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill Company") });

            if (file == null || file.Length == 0)
                return Ok(new ErrorVM { Message = "No file provided" });

            // Delete old logo if it exists
            if (!string.IsNullOrEmpty(company.LogoUrl))
            {
                await _fileService.DeleteCompanyLogoAsync(company.LogoUrl);
            }

            // Upload new logo
            var logoUrl = await _fileService.UploadCompanyLogoAsync(file, company.UserId);
            company.LogoUrl = logoUrl;

            await _billCompanyService.UpdateAsync(company);

            return Ok(new SuccessVM
            {
                Data = new { logoUrl = logoUrl },
                Message = "Logo uploaded successfully"
            });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, $"Invalid file for bill company {id}");
            return Ok(new ErrorVM { Message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error uploading logo for bill company {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }

    [HttpDelete("{id}/delete-logo")]
    public async Task<IActionResult> DeleteLogo(int id)
    {
        try
        {
            var company = await _billCompanyService.GetByIdAsync(id);
            if (company == null)
                return Ok(new ErrorVM { Message = ConstantHelper.IdNotFoundErr("Bill Company") });

            if (!AuthorizationHelper.IsAuthorized(User, company.UserId))
                return Unauthorized(new ErrorVM { Message = ConstantHelper.AccessDeniedErr("Bill Company") });

            if (string.IsNullOrEmpty(company.LogoUrl))
                return Ok(new ErrorVM { Message = "No logo found for this company" });

            await _fileService.DeleteCompanyLogoAsync(company.LogoUrl);
            company.LogoUrl = null;

            await _billCompanyService.UpdateAsync(company);

            return Ok(new SuccessVM { Message = "Logo deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting logo for bill company {id}");
            return StatusCode(500, new ErrorVM { Message = ConstantHelper.EXCEPTION_ERR });
        }
    }
}
