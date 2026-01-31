using FinfoxApi.Models;

namespace FinfoxApi.Helper;

/// <summary>
/// Helper class for enum conversions and parsing
/// </summary>
public static class EnumHelper
{
    /// <summary>
    /// Parse string to TransactionType enum
    /// </summary>
    public static TransactionType ParseTransactionType(string? value, TransactionType defaultValue = TransactionType.EXPENSE)
    {
        if (string.IsNullOrEmpty(value))
            return defaultValue;

        return Enum.TryParse<TransactionType>(value, ignoreCase: true, out var result) 
            ? result 
            : defaultValue;
    }

    /// <summary>
    /// Parse string to Category enum
    /// </summary>
    public static Category? ParseCategory(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return null;

        return Enum.TryParse<Category>(value, ignoreCase: true, out var result) 
            ? result 
            : null;
    }

    /// <summary>
    /// Parse string to Frequency enum
    /// </summary>
    public static Frequency ParseFrequency(string? value, Frequency defaultValue = Frequency.MONTHLY)
    {
        if (string.IsNullOrEmpty(value))
            return defaultValue;

        return Enum.TryParse<Frequency>(value, ignoreCase: true, out var result) 
            ? result 
            : defaultValue;
    }

    /// <summary>
    /// Parse string to InvestmentType enum
    /// </summary>
    public static InvestmentType ParseInvestmentType(string? value, InvestmentType defaultValue = InvestmentType.OTHER)
    {
        if (string.IsNullOrEmpty(value))
            return defaultValue;

        return Enum.TryParse<InvestmentType>(value, ignoreCase: true, out var result) 
            ? result 
            : defaultValue;
    }

    /// <summary>
    /// Convert enum to string
    /// </summary>
    public static string EnumToString<T>(T value) where T : Enum
    {
        return value.ToString();
    }
}
