import { ApiResponse, AuthTokenData, LoginCredentials, RegisterCredentials, User } from "@/types/schema"
import { http } from "./http"

export type AuthResponse = ApiResponse<AuthTokenData>

const TOKEN_KEY = "auth_token"
const REFRESH_TOKEN_KEY = "refresh_token"
const USER_KEY = "current_user"

export const authService = {
  // Register a new user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response: AuthResponse = await http.post("/api/Auth/register", credentials)
    
    if (response.status && response.data) {
      const { token } = response.data

      this.setToken(token)

      const decodedToken = this.decodeToken(token)
      if (decodedToken) {
        const user: User = {
          userId: decodedToken.UserId ,
          name: decodedToken.Name || "",
          email: decodedToken.Email || ""
        }
        this.setUser(user)
      }
    }
    
    return response
  },

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AuthResponse = await http.post("/api/Auth/login", credentials)
    
    if (response.status && response.data) {
      const { token, refreshToken } = response.data
      this.setToken(token)

      const decodedToken = this.decodeToken(token)
      if (decodedToken) {
        const user: User = {
           userId: decodedToken.UserId ,
          name: decodedToken.Name || "",
          email: decodedToken.Email || ""
        }
        this.setUser(user)
      }
      
      if (refreshToken) {
        this.setRefreshToken(refreshToken)
      }
    }
    
    return response
  },

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response: ApiResponse<User> = await http.get("/api/Auth/me")
    if (response.status && response.data) {
      this.setUser(response.data)
    }
    return response
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await http.get("/api/Auth/logout")
    } finally {
      this.clearAuth()
    }
  },

  // Token management
  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(TOKEN_KEY, token)
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  setRefreshToken(token: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },

  // User management
  getUser(): User | null {
    if (typeof window === "undefined") return null
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  setUser(user: User): void {
    if (typeof window === "undefined") return
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  // Clear auth data
  clearAuth(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  // Decode JWT token (simple implementation)
  decodeToken(token: string): any {
    try {
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
      return JSON.parse(jsonPayload)
    } catch (e) {
      return null
    }
  },

  // Check if token is expired
  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getToken()
    if (!tokenToCheck) return true

    const decoded = this.decodeToken(tokenToCheck)
    if (!decoded || !decoded.exp) return true

    return decoded.exp * 1000 < Date.now()
  },
}
