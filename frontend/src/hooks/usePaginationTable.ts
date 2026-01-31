"use client"

import { useState, useCallback, useMemo } from "react"

export interface PaginationState {
  pageIndex: number
  pageSize: number
}

export interface UsePaginationTableOptions {
  initialPageSize?: number
  onPageChange?: (pageIndex: number, pageSize: number) => void
}

export function usePaginationTable(options: UsePaginationTableOptions = {}) {
  const { initialPageSize = 10, onPageChange } = options
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = useMemo(() => Math.ceil(totalCount / pagination.pageSize) || 1, [totalCount, pagination.pageSize])
  const hasPreviousPage = pagination.pageIndex > 0
  const hasNextPage = pagination.pageIndex < totalPages - 1

  const handlePaginationChange = useCallback(
    (newPageIndex: number, newPageSize: number) => {
      setPagination({ pageIndex: newPageIndex, pageSize: newPageSize })
      onPageChange?.(newPageIndex, newPageSize)
    },
    [onPageChange]
  )

  const setPageIndex = useCallback(
    (pageIndex: number) => {
      handlePaginationChange(pageIndex, pagination.pageSize)
    },
    [pagination.pageSize, handlePaginationChange]
  )

  const setPageSize = useCallback(
    (pageSize: number) => {
      handlePaginationChange(0, pageSize)
    },
    [handlePaginationChange]
  )

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPageIndex(pagination.pageIndex + 1)
    }
  }, [pagination.pageIndex, hasNextPage, setPageIndex])

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPageIndex(pagination.pageIndex - 1)
    }
  }, [pagination.pageIndex, hasPreviousPage, setPageIndex])

  return {
    pagination,
    totalCount,
    setTotalCount,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageIndex,
    setPageSize,
    nextPage,
    previousPage,
    setPagination,
  }
}
