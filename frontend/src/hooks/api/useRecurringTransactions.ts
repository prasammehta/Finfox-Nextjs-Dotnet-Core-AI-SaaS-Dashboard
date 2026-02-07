"use client"

import { useEffect, useState, useCallback } from "react"
import { RecurringTransaction } from "@/types/schema"
import { getRecurringTransactions, deleteRecurringTransaction, getAllRecurringTransactions } from "@/services/recurringTransactionService"
import { toast } from "sonner"

export function useRecurringTransactions(
  initialFilters?: {
    description?: string
    amountGreaterThan?: string | number
    amountLessThan?: string | number
    frequency?: string
    category?: string
    type?: string
    isActive?: boolean
    startDate?: string
    endDate?: string
  },
  initialPageSize = 10
) {
  const [filters, setFilters] = useState(initialFilters)
  const [data, setData] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)

  const fetchRecurringTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getRecurringTransactions(pageIndex, pageSize, filters)
      setData(response.data)
      setTotalCount(response.totalCount)
      setTotalPages(response.totalPages)
      setHasPreviousPage(response.hasPreviousPage)
      setHasNextPage(response.hasNextPage)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load recurring transactions"
      setError(errorMessage)
      setData([])
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [pageIndex, pageSize, filters])

  useEffect(() => {
    fetchRecurringTransactions()
  }, [fetchRecurringTransactions])

  const removeRecurringTransaction = async (id: number) => {
    try {
      await deleteRecurringTransaction(id)
      setData((prev) => prev.filter((transaction) => transaction.recurringTransactionId !== id))
      toast.success("Recurring transaction deleted successfully")
      await fetchRecurringTransactions()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete recurring transaction"
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const refetch = async () => {
    await fetchRecurringTransactions()
  }

  const getAllRecurringTransactionsList = async () => {
    try {
      return await getAllRecurringTransactions()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load recurring transactions"
      console.error(errorMessage)
      return []
    }
  }

  return {
    data,
    loading,
    error,
    removeRecurringTransaction,
    refetch,
    getAllRecurringTransactions: getAllRecurringTransactionsList,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageIndex,
    setPageSize,
    filters,
    setFilters
  }
}
