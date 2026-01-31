namespace FinfoxApi.ViewModels;

public class ErrorVM
{
    public object? Data { get; set; }
    public string Message { get; set; } = "Exception occurred";
    public bool Status { get; set; } = false;
}

public class SuccessVM
{
    public object? Data { get; set; }
    public string? Message { get; set; }
    public bool Status { get; set; } = true;
}
