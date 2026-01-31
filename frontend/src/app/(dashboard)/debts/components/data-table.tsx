"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDown,
  EllipsisVertical,
  Eye,
  Pencil,
  Trash2,
  Download,
  Search,
  Plus,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableSkeleton } from "@/components/data-table-skeleton"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { toast } from "sonner"
import { DebtFormDialog } from "./debt-form-dialog"
import { DebtViewDialog } from "./debt-view-dialog"
import { DebtsFiltersDialog } from "./debts-filters-dialog"
import { exportDebtsToExcel } from "@/services/debtService"
import { 
  type DebtDT as Debt,
  type DebtFormValuesDT as DebtFormValues,
  type DebtsDataTablePropsDT as DataTableProps
} from "@/types/datatable-schema"
import type { Debt as DebtSchema } from "@/types/schema"

export function DataTable({ 
  debts, 
  loading, 
  onDeleteDebt, 
  onEditDebt, 
  onDebtUpdated,
  pageIndex = 0,
  pageSize = 10,
  totalCount = 0,
  totalPages = 0,
  hasPreviousPage = false,
  hasNextPage = false,
  onPageIndexChange,
  onPageSizeChange,
  debtTypeFilter = "",
  setDebtTypeFilter,
  statusFilter = "",
  setStatusFilter,
  personName = "",
  setPersonName,
  amountGreaterThan = "",
  setAmountGreaterThan,
  amountLessThan = "",
  setAmountLessThan,
  startDate = "",
  setStartDate,
  endDate = "",
  setEndDate,
}: DataTableProps & {
  pageIndex?: number
  pageSize?: number
  totalCount?: number
  totalPages?: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
  onPageIndexChange?: (pageIndex: number) => void
  onPageSizeChange?: (pageSize: number) => void
  debtTypeFilter?: string
  setDebtTypeFilter?: (value: string) => void
  statusFilter?: string
  setStatusFilter?: (value: string) => void
  personName?: string
  setPersonName?: (value: string) => void
  amountGreaterThan?: string
  setAmountGreaterThan?: (value: string) => void
  amountLessThan?: string
  setAmountLessThan?: (value: string) => void
  startDate?: string
  setStartDate?: (value: string) => void
  endDate?: string
  setEndDate?: (value: string) => void
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<DebtSchema | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await exportDebtsToExcel({
        ...(debtTypeFilter && { type: debtTypeFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      })
      toast.success("Debts exported successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to export debts"
      toast.error(errorMessage)
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const getDebtTypeColor = (debtType: string) => {
    switch (debtType?.toUpperCase()) {
      case "LOAN":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
      case "CREDIT_CARD":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
      case "PERSONAL":
        return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20"
      case "EDUCATION":
        return "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20"
      case "HOUSING":
        return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20"
      case "VEHICLE":
        return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20"
      case "HEALTH":
        return "text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-900/20"
      case "BILL":
        return "text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/20"
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20"
      case "PAID":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20"
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
    }
  }

  const exactFilter = (row: Row<Debt>, columnId: string, value: string) => {
    return row.getValue(columnId) === value
  }

  const columns: ColumnDef<Debt>[] = [
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
      accessorKey: "personName",
      header: "Creditor/Person",
      cell: ({ row }) => (
        <span className="font-medium text-sm">{row.original.personName}</span>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="text-sm font-semibold">
          ₹{row.original.amount.toFixed(2)}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "paidAmount",
      header: "Paid",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
          ₹{row.original.paidAmount.toFixed(2)}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "remaining",
      header: "Remaining",
      cell: ({ row }) => {
        const remaining = row.original.amount - row.original.paidAmount
        return (
          <span className="text-sm font-semibold text-red-600 dark:text-red-400">
            ₹{remaining.toFixed(2)}
          </span>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: "debtType",
      header: "Type",
      cell: ({ row }) => {
        const debtType = row.original.debtType
        return (
          <Badge variant="secondary" className={getDebtTypeColor(debtType)}>
            {debtType}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant="secondary" className={getStatusColor(status)}>
            {status}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.date)
        return (
          <span className="text-sm">
            {date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const debt = row.original
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 cursor-pointer"
              onClick={() => {
                setSelectedDebt(debt)
                setViewDialogOpen(true)
              }}
            >
              <Eye className="size-4" />
              <span className="sr-only">View debt</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => {
                setSelectedDebt(debt)
                setEditDialogOpen(true)
              }}
            >
              <Pencil className="size-4" />
              <span className="sr-only">Edit debt</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-red-600"
              onClick={() => onDeleteDebt(debt.debtId)}
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Delete debt</span>
            </Button>
          </div>
        )
      },
    },
  ]
  const table = useReactTable({
    data: debts,
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

  const debtTypes = Array.from(new Set(debts.map(d => d.debtType))).sort()
  const statuses = Array.from(new Set(debts.map(d => d.status))).sort()

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
          <DebtFormDialog 
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onDebtSaved={() => {
              onDebtUpdated()
              setCreateDialogOpen(false)
            }}
          >
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add Debt
            </Button>
          </DebtFormDialog>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search debts..."
              value={personName ?? ""}
              onChange={(event) => setPersonName?.(String(event.target.value))}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={debtTypeFilter || "all"}
            onValueChange={(value) => setDebtTypeFilter?.(value === "all" ? "" : value)}
          >
            <SelectTrigger className="cursor-pointer w-32">
              <span className="text-muted-foreground">
                {debtTypeFilter ? debtTypeFilter : "All Types"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Loan">Loan</SelectItem>
              <SelectItem value="Borrowed">Borrowed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => setStatusFilter?.(value === "all" ? "" : value)}
          >
            <SelectTrigger className="cursor-pointer w-32">
              <span className="text-muted-foreground">
                {statusFilter ? statusFilter : "All Status"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <DebtsFiltersDialog
            amountGreaterThan={amountGreaterThan}
            setAmountGreaterThan={setAmountGreaterThan}
            amountLessThan={amountLessThan}
            setAmountLessThan={setAmountLessThan}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onClear={() => {
              setAmountGreaterThan?.("")
              setAmountLessThan?.("")
              setStartDate?.("")
              setEndDate?.("")
            }}
          />
        </div>
      </div>

      {loading ? (
        <DataTableSkeleton columns={9} rows={pageSize} />
      ) : (
        <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
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

      {/* Dialogs */}
      <DebtViewDialog
        debt={selectedDebt}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
      <DebtFormDialog
        debt={selectedDebt}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onDebtSaved={() => {
          onDebtUpdated()
          setEditDialogOpen(false)
          setSelectedDebt(null)
        }}
      />
    </div>
  )
}
