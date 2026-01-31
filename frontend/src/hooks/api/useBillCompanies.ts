"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { BillCompany } from "@/types/schema"
import { getBillCompanies, deleteBillCompany, getAllBillCompanies, type BillCompanyFilters } from "@/services/billCompanyService"

export function useBillCompanies(userId?: string, filters?: BillCompanyFilters) {
  const [data, setData] = useState<BillCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getBillCompanies(pageIndex, pageSize, filters)
      setData(response.data)
      setTotalCount(response.totalCount)
      setTotalPages(response.totalPages)
      setHasPreviousPage(response.hasPreviousPage)
      setHasNextPage(response.hasNextPage)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load bill companies"
      setError(errorMessage)
      toast.error(errorMessage)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [pageIndex, pageSize, filters])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const removeBillCompany = async (id: number) => {
    try {
      await deleteBillCompany(id)
      setData((prev) => prev.filter((company) => company.billCompanyId !== id))
      toast.success("Bill company deleted successfully")
      await fetchCompanies()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete bill company"
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const refetch = async () => {
    await fetchCompanies()
  }

  const getAllCompanies = async () => {
    try {
      return await getAllBillCompanies()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load bill companies"
      console.error(errorMessage)
      return []
    }
  }

  return {
    data,
    loading,
    error,
    removeBillCompany,
    refetch,
    getAllCompanies,
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
