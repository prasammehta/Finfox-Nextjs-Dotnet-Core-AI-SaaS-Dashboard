using System;

namespace FinfoxApi.Helper;

public static class ConstantHelper
{
    public const string INVALID_MODEL_ERR = "Invalid data! Please try again. Please contact admin if you see this error again.";
    public const string EXCEPTION_ERR = "Something went wrong. Please contact admin";

    public static string IdNotMatchErr(string value)
    {
        return $"Provided {value} id doesn't match. Please try again";
    }
    public static string IdNotFoundErr(string value)
    {
        return $"Provided {value} not found. Please try again";
    }
    public static string SameNameErr(string value)
    {
        return $"A {value} with the same name already exists";
    }

    public static string AccessDeniedErr(string value)
    {
        return $"You do not have permission to perform this action on the specified {value}";
    }

    public static string GetSuccess(string value)
    {
        return $"{value} data fetched successfully";
    }
    public static string AddSuccess(string value)
    {
        return $"{value} added successfully";
    }
    public static string UpdateSuccess(string value)
    {
        return $"{value} updated successfully";
    }
    public static string DeleteSuccess(string value)
    {
        return $"{value} deleted successfully";
    }
    public static string DeactivateSuccess(string value)
    {
        return $"{value} deactivated successfully";
    }
}