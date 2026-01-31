using System.Security.Claims;

namespace FinfoxApi.Helper;

public static class AuthorizationHelper
{
    /// <summary>
    /// Checks if the current user is authorized to perform an operation on a resource.
    /// Returns true if user is the owner OR is an admin.
    /// Returns false if user is not the owner and not an admin.
    /// </summary>
    /// <param name="user">The ClaimsPrincipal from HttpContext.User</param>
    /// <param name="resourceUserId">The userId of the resource being accessed</param>
    /// <returns>True if authorized, false otherwise</returns>
    public static bool IsAuthorized(ClaimsPrincipal user, Guid resourceUserId)
    {
        try
        {
            // Extract userId from claims
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return false;

            // Check if user is admin
            var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value ?? user.FindFirst("Role")?.Value;
            if (!string.IsNullOrEmpty(roleClaim) && roleClaim.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                return true;

            // Check if user owns the resource
            return userId == resourceUserId;
        }
        catch (Exception)
        {
            return false;
        }
    }

    /// <summary>
    /// Extracts the current user's ID from the JWT token claims.
    /// </summary>
    /// <param name="user">The ClaimsPrincipal from HttpContext.User</param>
    /// <returns>The user's ID, or null if extraction fails</returns>
    public static Guid? GetUserIdFromClaims(ClaimsPrincipal user)
    {
        try
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return null;

            return userId;
        }
        catch (Exception)
        {
            return null;
        }
    }

    /// <summary>
    /// Checks if the current user has admin role.
    /// </summary>
    /// <param name="user">The ClaimsPrincipal from HttpContext.User</param>
    /// <returns>True if user is admin, false otherwise</returns>
    public static bool IsAdmin(ClaimsPrincipal user)
    {
        try
        {
            var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value ?? user.FindFirst("Role")?.Value;
            return !string.IsNullOrEmpty(roleClaim) && roleClaim.Equals("Admin", StringComparison.OrdinalIgnoreCase);
        }
        catch (Exception)
        {
            return false;
        }
    }
}
