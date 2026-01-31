"use client"

import { useState, useMemo, useEffect } from "react"
import { StatCards } from "./components/stat-cards"
import { DataTable } from "./components/data-table"
import { useTransactions } from "@/hooks/api/useTransactions"
import { useAccounts } from "@/hooks/api/useAccounts"

export default function TransactionsPage() {
  // Filter states
  const [typeFilter, setTypeFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [fromAccountId, setFromAccountId] = useState("")
  const [amountGreaterThan, setAmountGreaterThan] = useState("")
  const [amountLessThan, setAmountLessThan] = useState("")
  const [searchDescription, setSearchDescription] = useState("")
  const [debouncedSearchDescription, setDebouncedSearchDescription] = useState("")

  // Debounce search description
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchDescription(searchDescription)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchDescription])

  // Build filters object, only including non-empty values
  const filters = useMemo(() => ({
    ...(typeFilter && typeFilter !== "all" && { type: typeFilter }),
    ...(categoryFilter && categoryFilter !== "all" && { category: categoryFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(fromAccountId && { fromAccountId }),
    ...(amountGreaterThan && { amountGreaterThan }),
    ...(amountLessThan && { amountLessThan }),
    ...(debouncedSearchDescription && { description: debouncedSearchDescription }),
  }), [typeFilter, categoryFilter, startDate, endDate, fromAccountId, amountGreaterThan, amountLessThan, debouncedSearchDescription])

  const { 
    data: transactions, 
    loading, 
    error, 
    removeTransaction, 
    refetch,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageIndex,
    setPageSize,
  } = useTransactions(filters)
  const { data: accounts } = useAccounts()

  const handleDeleteTransaction = async (transactionId: number) => {
    await removeTransaction(transactionId)
  }

  const handleEditTransaction = (transaction: any) => {
    // This will be handled by the edit modal in the table
    console.log("Edit transaction:", transaction)
  }

  const handleTransactionUpdated = async () => {
    // Refresh transactions when one is updated
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
        <StatCards transactions={transactions} />
      </div>
      
      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <DataTable 
          transactions={transactions}
          accounts={accounts}
          loading={loading}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onPageIndexChange={setPageIndex}
          onPageSizeChange={setPageSize}
          onDeleteTransaction={handleDeleteTransaction}
          onEditTransaction={handleEditTransaction}
          onTransactionUpdated={handleTransactionUpdated}
          // Pass filter states and setters to DataTable
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          fromAccountId={fromAccountId}
          setFromAccountId={setFromAccountId}
          amountGreaterThan={amountGreaterThan}
          setAmountGreaterThan={setAmountGreaterThan}
          amountLessThan={amountLessThan}
          setAmountLessThan={setAmountLessThan}
          searchDescription={searchDescription}
          setSearchDescription={setSearchDescription}
        />
      </div>
    </div>
  )
}
