"use client"

import { useState, useMemo } from "react"
import { StatCards } from "./components/stat-cards"
import { DataTable } from "./components/data-table"
import { ProjectedExpensesChart } from "./components/projected-expenses-chart"
import { CategoryBreakdownChart } from "./components/category-breakdown-chart"
import { FrequencyDistributionChart } from "./components/frequency-distribution-chart"
import { MonthlyTrendChart } from "./components/monthly-trend-chart"
import { useRecurringTransactions } from "@/hooks/api/useRecurringTransactions"
import { useAccounts } from "@/hooks/api/useAccounts"

export default function RecurringTransactionsPage() {
  // Filter states
  const [typeFilter, setTypeFilter] = useState("")
  const [frequencyFilter, setFrequencyFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [description, setDescription] = useState("")
  const [amountGreaterThan, setAmountGreaterThan] = useState("")
  const [amountLessThan, setAmountLessThan] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Build filters object, only including non-empty values
  const filters = useMemo(() => ({
    ...(typeFilter && { type: typeFilter }),
    ...(frequencyFilter && { frequency: frequencyFilter }),
    ...(categoryFilter && { category: categoryFilter }),
    ...(statusFilter && { isActive: statusFilter === "true" }),
    ...(description && { description }),
    ...(amountGreaterThan && { amountGreaterThan }),
    ...(amountLessThan && { amountLessThan }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  }), [typeFilter, frequencyFilter, categoryFilter, statusFilter, description, amountGreaterThan, amountLessThan, startDate, endDate])

  const { 
    data: recurringTransactions, 
    loading, 
    error, 
    removeRecurringTransaction, 
    refetch,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageIndex,
    setPageSize,
  } = useRecurringTransactions(filters)
  const { data: accounts } = useAccounts()

  const handleDeleteTransaction = async (recurringTransactionId: number) => {
    await removeRecurringTransaction(recurringTransactionId)
  }

  const handleEditTransaction = (transaction: any) => {
    console.log("Edit recurring transaction:", transaction)
  }

  const handleTransactionUpdated = async () => {
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
    <div className="flex flex-col gap-6">
      <div className="@container/main px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recurring Transactions</h1>
          <p className="text-muted-foreground my-2">Manage and track recurring bills, subscriptions, and income.</p>
        </div>
        <StatCards recurringTransactions={recurringTransactions} />
      </div>

      <div className="@container/main px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <ProjectedExpensesChart recurringTransactions={recurringTransactions} />
          <CategoryBreakdownChart recurringTransactions={recurringTransactions} />
        </div>
      </div>

      <div className="@container/main px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <FrequencyDistributionChart recurringTransactions={recurringTransactions} />
          <MonthlyTrendChart recurringTransactions={recurringTransactions} />
        </div>
      </div>
      
      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <DataTable 
          recurringTransactions={recurringTransactions}
          accounts={accounts}
          loading={loading}
          onDeleteTransaction={handleDeleteTransaction}
          onEditTransaction={() => {}}
          onTransactionUpdated={handleTransactionUpdated}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onPageIndexChange={setPageIndex}
          onPageSizeChange={setPageSize}
          // Filter props
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          frequencyFilter={frequencyFilter}
          setFrequencyFilter={setFrequencyFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          description={description}
          setDescription={setDescription}
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
