"use client"

import { useState, useEffect, useMemo } from "react"
import { StatCards } from "./components/stat-cards"
import { DataTable } from "./components/data-table"
import { BillFormDialog } from "./components/bill-form-dialog"
import { useBills } from "@/hooks/api/useBills"
import { getAllBillCompanies } from "@/services/billCompanyService"
import { BillCompany } from "@/types/schema"
import type { BillFilters } from "@/services/billService"

export default function BillsPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [billCompanies, setBillCompanies] = useState<BillCompany[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [clientFilter, setClientFilter] = useState("")
  const [invoiceNumberFilter, setInvoiceNumberFilter] = useState("")
  const [amountGreaterThan, setAmountGreaterThan] = useState("")
  const [amountLessThan, setAmountLessThan] = useState("")
  const [dueDate, setDueDate] = useState("")

  const filters: BillFilters = useMemo(() => ({
    ...(clientFilter && { client: clientFilter }),
    ...(invoiceNumberFilter && { invoiceNumber: invoiceNumberFilter }),
    ...(amountGreaterThan && { amountGreaterThan: parseFloat(amountGreaterThan) }),
    ...(amountLessThan && { amountLessThan: parseFloat(amountLessThan) }),
    ...(dueDate && { dueDate }),
  }), [clientFilter, invoiceNumberFilter, amountGreaterThan, amountLessThan, dueDate])

  const { 
    data: bills, 
    loading, 
    error, 
    removeBill, 
    refetch,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageIndex,
    setPageSize,
  } = useBills(filters)

  // Fetch bill companies on component mount
  useEffect(() => {
    const fetchBillCompanies = async () => {
      try {
        setCompaniesLoading(true)
        const companies = await getAllBillCompanies()
        setBillCompanies(companies)
      } catch (err) {
        console.error("Error fetching bill companies:", err)
        setBillCompanies([])
      } finally {
        setCompaniesLoading(false)
      }
    }

    fetchBillCompanies()
  }, [])

  const handleDeleteBill = async (billId: number) => {
    await removeBill(billId)
  }

  const handleBillUpdated = async () => {
    // Refresh bills when one is updated
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bills</h1>
            <p className="text-muted-foreground my-2">Manage and track all your bills and invoices.</p>
          </div>
          <BillFormDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            onBillSaved={() => {
              setAddDialogOpen(false)
              handleBillUpdated()
            }}
            billCompanies={billCompanies}
          />
        </div>

        <StatCards bills={bills} />
      </div>
      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <DataTable
          bills={bills.map((bill) => ({
            ...bill,
            billItems: bill.billItems || [],
          }))}
          loading={loading || companiesLoading}
          onDeleteBill={handleDeleteBill}
          onEditBill={() => {
            // Handled by the data-table itself now
          }}
          onBillUpdated={handleBillUpdated}
          billCompanies={billCompanies}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onPageIndexChange={setPageIndex}
          onPageSizeChange={setPageSize}
          // Filter props
          clientFilter={clientFilter}
          setClientFilter={setClientFilter}
          invoiceNumberFilter={invoiceNumberFilter}
          setInvoiceNumberFilter={setInvoiceNumberFilter}
          amountGreaterThan={amountGreaterThan}
          setAmountGreaterThan={setAmountGreaterThan}
          amountLessThan={amountLessThan}
          setAmountLessThan={setAmountLessThan}
          dueDate={dueDate}
          setDueDate={setDueDate}
        />
      </div>
    </div>
  )
}
