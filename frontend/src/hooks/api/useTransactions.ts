"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Transaction } from "@/types/schema"
import { getTransactions, deleteTransaction, getAllTransactions } from "@/services/transactionService"

export function useTransactions(filters?: {
  type?: string
  category?: string
  startDate?: string
  endDate?: string
  fromAccountId?: string | number
  amountGreaterThan?: string | number
  amountLessThan?: string | number
  description?: string
}) {
  const [data, setData] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getTransactions(pageIndex, pageSize, filters)
      setData(response.data)
      setTotalCount(response.totalCount)
      setTotalPages(response.totalPages)
      setHasPreviousPage(response.hasPreviousPage)
      setHasNextPage(response.hasNextPage)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load transactions"
      setError(errorMessage)
      toast.error(errorMessage)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [pageIndex, pageSize, filters])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const removeTransaction = async (id: number) => {
    try {
      await deleteTransaction(id)
      setData((prev) => prev.filter((transaction) => transaction.transactionId !== id))
      toast.success("Transaction deleted successfully")
      await fetchTransactions()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete transaction"
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const refetch = async () => {
    await fetchTransactions()
  }

  const getAllTransactionsList = async () => {
    try {
      return await getAllTransactions()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load transactions"
      console.error(errorMessage)
      return []
    }
  }

  return {
    data,
    loading,
    error,
    removeTransaction,
    refetch,
    getAllTransactions: getAllTransactionsList,
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
