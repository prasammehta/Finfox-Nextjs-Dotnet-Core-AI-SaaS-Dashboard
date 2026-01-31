namespace FinfoxApi.ViewModels;

public class CreateBillVM
{
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
    public List<string> BillItems { get; set; } = new();
}

public class UpdateBillVM
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
    public List<string> BillItems { get; set; } = new();
}

public class BillResponseVM
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
    public List<string> BillItems { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
