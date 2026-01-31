"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Investment } from "@/types/schema"
import { getInvestments, deleteInvestment, getAllInvestments, type InvestmentFilters } from "@/services/investmentService"

export function useInvestments(filters?: InvestmentFilters) {
  const [data, setData] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)

  const fetchInvestments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getInvestments(pageIndex, pageSize, filters)
      setData(response.data)
      setTotalCount(response.totalCount)
      setTotalPages(response.totalPages)
      setHasPreviousPage(response.hasPreviousPage)
      setHasNextPage(response.hasNextPage)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load investments"
      setError(errorMessage)
      toast.error(errorMessage)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [pageIndex, pageSize, filters])

  useEffect(() => {
    fetchInvestments()
  }, [fetchInvestments])

  const removeInvestment = async (id: number) => {
    try {
      await deleteInvestment(id)
      setData((prev) => prev.filter((investment) => investment.investmentId !== id))
      toast.success("Investment deleted successfully")
      await fetchInvestments()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete investment"
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const refetch = async () => {
    await fetchInvestments()
  }

  const getAllInvestmentsList = async () => {
    try {
      return await getAllInvestments()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load investments"
      console.error(errorMessage)
      return []
    }
  }

  return {
    data,
    loading,
    error,
    removeInvestment,
    refetch,
    getAllInvestments: getAllInvestmentsList,
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
