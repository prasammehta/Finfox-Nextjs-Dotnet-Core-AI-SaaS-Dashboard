namespace FinfoxApi.Models;

public class Bill
{
    public int BillId { get; set; }
    public Guid UserId { get; set; }
    public int BillFromId { get; set; }
    public int BillToId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string Client { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public double GstRate { get; set; }
    public double TdsPercent { get; set; }
    public double Subtotal { get; set; }
    public double GstAmount { get; set; }
    public double TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<string> BillItems { get; set; } = new();

    // Navigation properties
    public BillCompany? BillFrom { get; set; }
    public BillCompany? BillTo { get; set; }
}
