/**
 * Authentication utilities and helpers
 */

import { authService } from "@/services/authService"

export const authUtils = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return authService.isAuthenticated()
  },

  /**
   * Get current user from storage
   */
  getCurrentUser() {
    return authService.getUser()
  },

  /**
   * Get auth token
   */
  getToken(): string | null {
    return authService.getToken()
  },

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    return authService.isTokenExpired()
  },

  /**
   * Validate token expiration and redirect to login if needed
   */
  validateToken(): boolean {
    if (authService.isTokenExpired()) {
      authService.clearAuth()
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in"
      }
      return false
    }
    return true
  },

  /**
   * Logout user and clear auth data
   */
  async logoutUser(): Promise<void> {
    await authService.logout()
  },

  /**
   * Get user ID from current session
   */
  getUserId(): string | null {
    const user = authService.getUser()
    return user?.userId || null
  },

  /**
   * Get user email from current session
   */
  getUserEmail(): string | null {
    const user = authService.getUser()
    return user?.email || null
  },

  /**
   * Get user name from current session
   */
  getUserName(): string | null {
    const user = authService.getUser()
    return user?.name || null
  },

  /**
   * Clear all auth data
   */
  clearAuthData(): void {
    authService.clearAuth()
  },
}
