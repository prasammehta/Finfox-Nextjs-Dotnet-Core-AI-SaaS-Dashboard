"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Bill } from "@/types/schema"
import { getAllBills, deleteBill, getBills, type BillFilters } from "@/services/billService"

export function useBills(filters?: BillFilters) {
  const [data, setData] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getBills(pageIndex, pageSize, filters)
      setData(response.data)
      setTotalCount(response.totalCount)
      setTotalPages(response.totalPages)
      setHasPreviousPage(response.hasPreviousPage)
      setHasNextPage(response.hasNextPage)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load bills"
      setError(errorMessage)
      toast.error(errorMessage)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [pageIndex, pageSize, filters])

  useEffect(() => {
    fetchBills()
  }, [fetchBills])

  const removeBill = async (id: number) => {
    try {
      await deleteBill(id)
      setData((prev) => prev.filter((bill) => bill.billId !== id))
      toast.success("Bill deleted successfully")
      await fetchBills()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete bill"
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const refetch = async () => {
    await fetchBills()
  }

  const getAllBillsList = async () => {
    try {
      return await getAllBills()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load bills"
      console.error(errorMessage)
      return []
    }
  }

  return {
    data,
    loading,
    error,
    removeBill,
    refetch,
    getAllBills: getAllBillsList,
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
