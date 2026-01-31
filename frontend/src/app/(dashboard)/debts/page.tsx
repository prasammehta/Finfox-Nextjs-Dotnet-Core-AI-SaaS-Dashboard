"use client"

import { useState, useMemo } from "react"
import { StatCards } from "./components/stat-cards"
import { DataTable } from "./components/data-table"
import { useDebts } from "@/hooks/api/useDebts"
import { useAccounts } from "@/hooks/api/useAccounts"

export default function DebtsPage() {
  // Filter states
  const [debtTypeFilter, setDebtTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [personName, setPersonName] = useState("")
  const [amountGreaterThan, setAmountGreaterThan] = useState("")
  const [amountLessThan, setAmountLessThan] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Build filters object, only including non-empty values
  const filters = useMemo(() => ({
    ...(debtTypeFilter && { debtType: debtTypeFilter }),
    ...(statusFilter && { status: statusFilter }),
    ...(personName && { personName }),
    ...(amountGreaterThan && { amountGreaterThan }),
    ...(amountLessThan && { amountLessThan }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  }), [debtTypeFilter, statusFilter, personName, amountGreaterThan, amountLessThan, startDate, endDate])

  const { 
    data: debts, 
    loading, 
    error, 
    removeDebt, 
    refetch,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageIndex,
    setPageSize,
  } = useDebts(filters)
  const { data: accounts } = useAccounts()

  const handleDeleteDebt = async (debtId: number) => {
    await removeDebt(debtId)
  }

  const handleEditDebt = (debt: any) => {
    console.log("Edit debt:", debt)
  }

  const handleDebtUpdated = async () => {
    await refetch()
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
        <StatCards debts={debts} />
      </div>
      
      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <DataTable
          debts={debts}
          accounts={accounts}
          loading={loading}
          onDeleteDebt={handleDeleteDebt}
          onEditDebt={handleEditDebt}
          onDebtUpdated={handleDebtUpdated}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onPageIndexChange={setPageIndex}
          onPageSizeChange={setPageSize}
          // Filter props
          debtTypeFilter={debtTypeFilter}
          setDebtTypeFilter={setDebtTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          personName={personName}
          setPersonName={setPersonName}
          amountGreaterThan={amountGreaterThan}
          setAmountGreaterThan={setAmountGreaterThan}
          amountLessThan={amountLessThan}
          setAmountLessThan={setAmountLessThan}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
       </div>
    </div>
  )
}
