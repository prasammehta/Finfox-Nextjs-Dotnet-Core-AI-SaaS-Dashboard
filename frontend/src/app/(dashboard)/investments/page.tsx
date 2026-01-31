"use client"

import { useState, useMemo } from "react"
import { StatCards } from "./components/stat-cards"
import { DataTable } from "./components/data-table"
import { useInvestments } from "@/hooks/api/useInvestments"
import type { InvestmentFilters } from "@/services/investmentService"

export default function InvestmentsPage() {
  const [nameFilter, setNameFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [gainLossGreaterThan, setGainLossGreaterThan] = useState("")
  const [gainLossLessThan, setGainLossLessThan] = useState("")
  const [returnPercentGreaterThan, setReturnPercentGreaterThan] = useState("")
  const [dateAcquired, setDateAcquired] = useState("")

  const filters: InvestmentFilters = useMemo(() => ({
    ...(nameFilter && { name: nameFilter }),
    ...(typeFilter && { type: typeFilter }),
    ...(gainLossGreaterThan && { gainLossGreaterThan: parseFloat(gainLossGreaterThan) }),
    ...(gainLossLessThan && { gainLossLessThan: parseFloat(gainLossLessThan) }),
    ...(returnPercentGreaterThan && { returnPercentGreaterThan: parseFloat(returnPercentGreaterThan) }),
    ...(dateAcquired && { dateAcquired }),
  }), [nameFilter, typeFilter, gainLossGreaterThan, gainLossLessThan, returnPercentGreaterThan, dateAcquired])

  const { 
    data: investments, 
    loading, 
    error, 
    removeInvestment, 
    refetch,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageIndex,
    setPageSize,
  } = useInvestments(filters)

  const handleDeleteInvestment = async (investmentId: number) => {
    await removeInvestment(investmentId)
  }

  const handleEditInvestment = (investment: any) => {
    // This will be handled by the edit modal in the table
    console.log("Edit investment:", investment)
  }

  const handleInvestmentUpdated = async () => {
    // Refresh investments when one is updated
    await refetch()
  }

  const handleAddInvestment = (investment: any) => {
    // Data will be added via the form dialog
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="@container/main px-4 lg:px-6">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <StatCards investments={investments} />
      </div>
      
      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <DataTable 
          investments={investments}
          loading={loading}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onPageIndexChange={setPageIndex}
          onPageSizeChange={setPageSize}
          onDeleteInvestment={handleDeleteInvestment}
          onEditInvestment={handleEditInvestment}
          onInvestmentUpdated={handleInvestmentUpdated}
          // Filter props
          nameFilter={nameFilter}
          setNameFilter={setNameFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          gainLossGreaterThan={gainLossGreaterThan}
          setGainLossGreaterThan={setGainLossGreaterThan}
          gainLossLessThan={gainLossLessThan}
          setGainLossLessThan={setGainLossLessThan}
          returnPercentGreaterThan={returnPercentGreaterThan}
          setReturnPercentGreaterThan={setReturnPercentGreaterThan}
          dateAcquired={dateAcquired}
          setDateAcquired={setDateAcquired}
        />
      </div>
    </div>
  )
}
