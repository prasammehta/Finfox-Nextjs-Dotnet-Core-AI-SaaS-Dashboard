"use client"

import { useState, useMemo } from "react"
import { DataTable } from "./components/data-table"
import { AccountFormDialog } from "./components/account-form-dialog"
import { useAccounts } from "@/hooks/api/useAccounts"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { AccountFilters } from "@/services/accountService"

export default function AccountsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [nameFilter, setNameFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filters: AccountFilters = useMemo(() => ({
    ...(nameFilter && { name: nameFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  }), [nameFilter, startDate, endDate])

  const { 
    data: accounts, 
    loading, 
    error, 
    removeAccount, 
    refetch,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageIndex,
    setPageSize,
  } = useAccounts(filters)

  const handleDeleteAccount = async (accountId: number) => {
    await removeAccount(accountId)
  }

  const handleAccountCreated = () => {
    setIsFormOpen(false)
    refetch()
  }

  const handleAccountUpdated = () => {
    refetch()
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0)
  const totalChange = accounts.reduce((sum, account) => sum + (account.currentBalance - account.initialBalance), 0)
  const accountCount = accounts.length

  const statCards = [
    {
      title: "Total Balance",
      value: `₹${totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "Wallet",
      description: `${accountCount} accounts`,
    },
    {
      title: "Total Change",
      value: `₹${Math.abs(totalChange).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "TrendingUp",
      description: totalChange >= 0 ? "Positive growth" : "Declining balance",
    },
    {
      title: "Accounts",
      value: accountCount.toString(),
      icon: "CreditCard",
      description: "Active accounts",
    },
  ]

  return (
    <div className="flex flex-col gap-6">

      <div className="@container/main px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
            <p className="text-muted-foreground my-2">Manage and track all your bank accounts and wallets.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <DataTable
          accounts={accounts}
          loading={loading}
          onDeleteAccount={handleDeleteAccount}
          onAccountUpdated={handleAccountUpdated}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onPageIndexChange={setPageIndex}
          onPageSizeChange={setPageSize}
          // Filter props
          nameFilter={nameFilter}
          setNameFilter={setNameFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </div>
    </div>
  )
}
