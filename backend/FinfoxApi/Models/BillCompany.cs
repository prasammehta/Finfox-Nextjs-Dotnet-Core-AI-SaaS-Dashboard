namespace FinfoxApi.Models;

public class BillCompany
{
    public int BillCompanyId { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Gstin { get; set; }
    public string? Pan { get; set; }
    public string? TdsPercent { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? AccountName { get; set; }
    public string? AccountNumber { get; set; }
    public string? IfscCode { get; set; }
    public string? LogoUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
