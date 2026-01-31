"use client"

import { useState } from "react"
import Image from "next/image"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  Search,
  Plus,
  Download,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableSkeleton } from "@/components/data-table-skeleton"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BillCompany } from "@/types/schema"
import { deleteBillCompany, exportBillCompaniesToExcel } from "@/services/billCompanyService"
import { BillCompanyFormDialog } from "./billcompany-form-dialog"
import { BillCompanyViewDialog } from "./billcompany-view-dialog"
import { BillCompanyFiltersDialog } from "./bill-company-filters-dialog"
import { toast } from "sonner"

interface DataTableProps {
  companies: BillCompany[]
  loading?: boolean
  onDeleteCompany: (id: number) => void
  onEditCompany: (company: BillCompany) => void
  onCompanyUpdated: () => void
  pageIndex?: number
  pageSize?: number
  totalCount?: number
  totalPages?: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
  onPageIndexChange?: (pageIndex: number) => void
  onPageSizeChange?: (pageSize: number) => void
  // Filter props
  nameFilter?: string
  setNameFilter?: (value: string) => void
  emailFilter?: string
  setEmailFilter?: (value: string) => void
  gstinFilter?: string
  setGstinFilter?: (value: string) => void
}

export function DataTable({
  companies,
  loading = false,
  onDeleteCompany,
  onEditCompany,
  onCompanyUpdated,
  pageIndex = 0,
  pageSize = 10,
  totalCount = 0,
  totalPages = 0,
  hasPreviousPage = false,
  hasNextPage = false,
  onPageIndexChange,
  onPageSizeChange,
  // Filter props
  nameFilter = "",
  setNameFilter,
  emailFilter = "",
  setEmailFilter,
  gstinFilter = "",
  setGstinFilter,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingCompany, setEditingCompany] = useState<BillCompany | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewingCompany, setViewingCompany] = useState<BillCompany | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const columns: ColumnDef<BillCompany>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "logo",
      header: "Logo",
      cell: ({ row }) => {
        const company = row.original
        return company.logoUrl ? (
          <Image
            src={company.logoUrl}
            alt={company.name}
            width={32}
            height={32}
            className="object-contain rounded"
          />
        ) : (
          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
            {company.name.charAt(0).toUpperCase()}
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: "Company Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue("address")}</div>,
    },
    {
      accessorKey: "gstin",
      header: "GSTIN",
      cell: ({ row }) => {
        const gstin = row.getValue("gstin")
        return gstin ? <Badge variant="outline">{row.getValue("gstin")}</Badge> : <span className="text-muted-foreground">—</span>
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.getValue("email")
        return email ? <div className="text-sm">{row.getValue("email")}</div> : <span className="text-muted-foreground">—</span>
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.getValue("phone")
        return phone ? <div className="text-sm">{row.getValue("phone")}</div> : <span className="text-muted-foreground">—</span>
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const company = row.original

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => {
                setViewingCompany(company)
                setViewDialogOpen(true)
              }}
              disabled={isDeleting}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">View</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => {
                setEditingCompany(company)
                setEditDialogOpen(true)
              }}
              disabled={isDeleting}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => handleDelete(company.billCompanyId)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        )
      },
    },
  ]

  const handleDelete = async (companyId: number) => {
    if (!confirm("Are you sure you want to delete this company?")) return

    try {
      setIsDeleting(true)
      await deleteBillCompany(companyId)
      onDeleteCompany(companyId)
      onCompanyUpdated()
    } catch (error) {
      console.error("Error deleting company:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const table = useReactTable({
    data: companies,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  const filteredRows = table.getRowModel().rows

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await exportBillCompaniesToExcel({
        ...(nameFilter && { name: nameFilter }),
        ...(emailFilter && { email: emailFilter }),
        ...(gstinFilter && { gstin: gstinFilter }),
      })
      toast.success("Bill companies exported successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to export bill companies"
      toast.error(errorMessage)
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <div className="w-full space-y-4">
      {/* Top Bar with Export and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div></div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="cursor-pointer"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="mr-2 size-4" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <BillCompanyFormDialog onCompanySaved={onCompanyUpdated} />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={nameFilter ?? ""}
              onChange={(event) => setNameFilter?.(String(event.target.value))}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BillCompanyFiltersDialog
            emailFilter={emailFilter}
            setEmailFilter={setEmailFilter}
            gstinFilter={gstinFilter}
            setGstinFilter={setGstinFilter}
            onClear={() => {
              setEmailFilter?.("")
              setGstinFilter?.("")
            }}
          />
        </div>
      </div>

      {loading ? (
        <DataTableSkeleton columns={6} rows={pageSize} />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center h-24"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center h-24"
                  >
                    No companies found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        
      )}

      <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="page-size">Show</Label>
            <Select value={`${pageSize}`} onValueChange={(value) => onPageSizeChange?.(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        <div className="flex-1 text-center text-sm text-muted-foreground">
          Total: {totalCount} result(s)
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageIndexChange?.(pageIndex - 1)}
            disabled={!hasPreviousPage}
          >
            Previous
          </Button>

          <span className="text-sm font-medium px-3 py-1 min-w-25 text-center">
            Page {pageIndex + 1} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageIndexChange?.(pageIndex + 1)}
            disabled={!hasNextPage}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Company Dialog */}
      <BillCompanyFormDialog
        company={editingCompany}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onCompanySaved={() => {
          setEditingCompany(null)
          setEditDialogOpen(false)
          onCompanyUpdated()
        }}
      />

      {/* View Company Dialog */}
      {viewingCompany && (
        <BillCompanyViewDialog
          company={viewingCompany}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />
      )}
    </div>
  )
}
