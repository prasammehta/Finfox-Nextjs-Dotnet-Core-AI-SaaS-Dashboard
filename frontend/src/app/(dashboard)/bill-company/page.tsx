"use client"

import { useState, useMemo } from "react"
import { DataTable } from "./components/data-table"
import { BillCompanyFormDialog } from "./components/billcompany-form-dialog"
import { useBillCompanies } from "@/hooks/api/useBillCompanies"
import type { BillCompanyFilters } from "@/services/billCompanyService"

export default function BillCompanyPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [nameFilter, setNameFilter] = useState("")
  const [emailFilter, setEmailFilter] = useState("")
  const [gstinFilter, setGstinFilter] = useState("")

  const filters: BillCompanyFilters = useMemo(() => ({
    ...(nameFilter && { name: nameFilter }),
    ...(emailFilter && { email: emailFilter }),
    ...(gstinFilter && { gstin: gstinFilter }),
  }), [nameFilter, emailFilter, gstinFilter])

  const { 
    data: companies, 
    loading, 
    error, 
    removeBillCompany, 
    refetch,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageIndex,
    setPageSize,
  } = useBillCompanies(undefined, filters)

  const handleDeleteCompany = async (companyId: number) => {
    await removeBillCompany(companyId)
  }

  const handleCompanyUpdated = async () => {
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
            <h1 className="text-3xl font-bold tracking-tight">Bill Companies</h1>
            <p className="text-muted-foreground my-2">Manage all your bill companies and vendors.</p>
          </div>
          <BillCompanyFormDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            onCompanySaved={() => {
              setAddDialogOpen(false)
              handleCompanyUpdated()
            }}
          />
        </div>
      </div>
      <div className="@container/main px-4 lg:px-6">
        <DataTable
          companies={companies}
          loading={loading}
          onDeleteCompany={handleDeleteCompany}
          onEditCompany={() => {
            // Handled by the data-table itself now
          }}
          onCompanyUpdated={handleCompanyUpdated}
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
          emailFilter={emailFilter}
          setEmailFilter={setEmailFilter}
          gstinFilter={gstinFilter}
          setGstinFilter={setGstinFilter}
        />
      </div>
    </div>
  )
}