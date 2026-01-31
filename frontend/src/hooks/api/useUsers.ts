"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { User } from "@/types/schema"
import { getUsers, deleteUser, type UserFilters } from "@/services/userService"

export function useUsers(filters?: UserFilters) {
  const [data, setData] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getUsers(pageIndex, pageSize, filters)
      setData(response.data)
      setTotalCount(response.totalCount)
      setTotalPages(response.totalPages)
      setHasPreviousPage(response.hasPreviousPage)
      setHasNextPage(response.hasNextPage)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load users"
      setError(errorMessage)
      setData([])
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [pageIndex, pageSize, filters])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const removeUser = async (id: string) => {
    try {
      await deleteUser(id)
      setData((prev) => prev.filter((user) => user.userId !== id))
      toast.success("User deleted successfully")
      await fetchUsers()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete user"
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const refetch = async () => {
    await fetchUsers()
  }

  return {
    data,
    loading,
    error,
    removeUser,
    refetch,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageIndex,
    setPageSize,
  }
}
