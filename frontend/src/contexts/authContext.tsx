"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { authService, type AuthResponse } from "@/services/authService"
import { User, type LoginCredentials, type RegisterCredentials } from "@/types/schema"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  register: (credentials: RegisterCredentials) => Promise<void>
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  getCurrentUser: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        
        // Check if user is already authenticated
        if (authService.isAuthenticated()) {
          try {
            await authService.getCurrentUser()
            const currentUser = authService.getUser()
            if (currentUser) {
              setUser(currentUser)
            }
          } catch (err) {
            // Token might be invalid, clear auth
            authService.clearAuth()
            setUser(null)
          }
        }
        
        setError(null)
      } catch (err) {
        console.error("Failed to initialize auth:", err)
        setError(err instanceof Error ? err.message : "Failed to initialize authentication")
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await authService.register(credentials)
      if (response.status && response.data) {
        const currentUser = authService.getUser()
        if (currentUser) {
          setUser(currentUser)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await authService.login(credentials)
      if (response.status && response.data) {
        // Get the user that was set by authService.login
        const currentUser = authService.getUser()
        if (currentUser) {
          setUser(currentUser)
        } else if (response.data.user) {
          // Fallback if getUser() returns null
          setUser(response.data.user)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      await authService.logout()
      setUser(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Logout failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentUser = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await authService.getCurrentUser()
      if (response.status && response.data) {
        setUser(response.data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch user"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && authService.isAuthenticated(),
        isLoading,
        error,
        register,
        login,
        logout,
        getCurrentUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
