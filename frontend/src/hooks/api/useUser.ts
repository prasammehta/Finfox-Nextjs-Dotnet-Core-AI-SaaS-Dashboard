"use client"

import { useAuth } from "@/contexts/authContext"
import { User } from "@/types/schema"

/**
 * Hook to access current user globally across the app
 * Returns user info, loading state, and utility methods
 * 
 * @example
 * const { user, userId, userName, userEmail } = useUser()
 * const { user, isLoading } = useUser()
 */
export function useUser() {
  const { user, isLoading, isAuthenticated } = useAuth()

  return {
    user: user as User | null,
    userId: user?.userId || null,
    userName: user?.name || null,
    userEmail: user?.email || null,
    isLoading,
    isAuthenticated,
    hasUser: !!user,
  }
}
