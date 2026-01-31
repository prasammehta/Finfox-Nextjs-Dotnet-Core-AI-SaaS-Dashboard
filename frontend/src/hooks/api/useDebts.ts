"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { getDebts, deleteDebt, getAllDebts } from "@/services/debtService"
import { Debt } from "@/types/schema"

export function useDebts(filters?: {
  personName?: string
  amountGreaterThan?: string | number
  amountLessThan?: string | number
  debtType?: string
  status?: string
  startDate?: string
  endDate?: string
}) {
  const [data, setData] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)

  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getDebts(pageIndex, pageSize, filters)
      setData(response.data)
      setTotalCount(response.totalCount)
      setTotalPages(response.totalPages)
      setHasPreviousPage(response.hasPreviousPage)
      setHasNextPage(response.hasNextPage)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load debts"
      setError(errorMessage)
      toast.error(errorMessage)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [pageIndex, pageSize, filters])

  useEffect(() => {
    fetchDebts()
  }, [fetchDebts])

  const removeDebt = async (id: number) => {
    try {
      await deleteDebt(id)
      setData((prev) => prev.filter((debt) => debt.debtId !== id))
      toast.success("Debt deleted successfully")
      await fetchDebts()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete debt"
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  const refetch = async () => {
    await fetchDebts()
  }

  const getAllDebtsList = async () => {
    try {
      return await getAllDebts()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load debts"
      console.error(errorMessage)
      return []
    }
  }

  return {
    data,
    loading,
    error,
    removeDebt,
    refetch,
    getAllDebts: getAllDebtsList,
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
