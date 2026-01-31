"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DataTablePaginationProps {
  pageIndex: number
  pageSize: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  onPageChange: (pageIndex: number) => void
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  totalCount,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
}: DataTablePaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const startItem = pageIndex * pageSize + 1
  const endItem = Math.min((pageIndex + 1) * pageSize, totalCount)

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalCount} results
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!hasPreviousPage}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center justify-center space-x-1">
          <span className="text-sm font-medium">
            Page {pageIndex + 1} of {totalPages}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!hasNextPage}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
