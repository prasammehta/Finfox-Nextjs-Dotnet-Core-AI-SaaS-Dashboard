"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { getAccounts, deleteAccount, getAllAccounts, type AccountFilters } from "@/services/accountService"
import { Account } from "@/types/schema"

export function useAccounts(filters?: AccountFilters) {
  const [data, setData] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getAccounts(pageIndex, pageSize, filters)
      setData(response.data)
      setTotalCount(response.totalCount)
      setTotalPages(response.totalPages)
      setHasPreviousPage(response.hasPreviousPage)
      setHasNextPage(response.hasNextPage)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load accounts"
      setError(errorMessage)
      toast.error(errorMessage)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [pageIndex, pageSize, filters])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const removeAccount = async (id: number) => {
    try {
      await deleteAccount(id)
      setData((prev) => prev.filter((account) => account.accountId !== id))
      toast.success("Account deleted successfully")
      await fetchAccounts()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete account"
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const refetch = async () => {
    await fetchAccounts()
  }

  const getAllAccountsList = async () => {
    try {
      return await getAllAccounts()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load accounts"
      console.error(errorMessage)
      return []
    }
  }

  return {
    data,
    loading,
    error,
    removeAccount,
    refetch,
    getAllAccounts: getAllAccountsList,
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
