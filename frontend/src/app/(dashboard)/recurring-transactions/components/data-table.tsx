"use client"

import { useState } from "react"
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
  Clock,
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
import { RecurringTransactionFormDialog } from "./recurring-transaction-form-dialog"
import { RecurringTransactionViewDialog } from "./recurring-transaction-view-dialog"
import { RecurringFiltersDialog } from "./recurring-filters-dialog"
import { deleteRecurringTransaction, exportRecurringTransactionsToExcel } from "@/services/recurringTransactionService"
import { toast } from "sonner"
import { 
  type RecurringTransactionDT as RecurringTransaction,
  type RecurringTransactionsDataTablePropsDT as DataTableProps
} from "@/types/datatable-schema"
import { RecurringTransaction as RecurringTransactionSchema } from "@/types/schema"
import { RECURRING_TRANSACTION_TYPES, FREQUENCIES, RECURRING_TRANSACTION_CATEGORIES } from "@/constants/enums"

interface Account {
  accountId: number
  name: string
}

export function DataTable({
  recurringTransactions,
  accounts = [],
  loading,
  onDeleteTransaction,
  onEditTransaction,
  onTransactionUpdated,
  pageIndex = 0,
  pageSize = 10,
  totalCount = 0,
  totalPages = 0,
  hasPreviousPage = false,
  hasNextPage = false,
  onPageIndexChange,
  onPageSizeChange,
  typeFilter = "",
  setTypeFilter,
  frequencyFilter = "",
  setFrequencyFilter,
  categoryFilter = "",
  setCategoryFilter,
  statusFilter = "",
  setStatusFilter,
  description = "",
  setDescription,
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
  typeFilter?: string
  setTypeFilter?: (value: string) => void
  frequencyFilter?: string
  setFrequencyFilter?: (value: string) => void
  categoryFilter?: string
  setCategoryFilter?: (value: string) => void
  statusFilter?: string
  setStatusFilter?: (value: string) => void
  description?: string
  setDescription?: (value: string) => void
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
  const [selectedRecurringTransaction, setSelectedRecurringTransaction] = useState<RecurringTransactionSchema | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await exportRecurringTransactionsToExcel({
        ...(description && { description }),
        ...(frequencyFilter && { frequency: frequencyFilter }),
        ...(typeFilter && { type: typeFilter }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(amountGreaterThan && { amountGreaterThan: parseFloat(amountGreaterThan) }),
        ...(amountLessThan && { amountLessThan: parseFloat(amountLessThan) }),
      })
      toast.success("Recurring transactions exported successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to export recurring transactions"
      toast.error(errorMessage)
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      "HOUSING": "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
      "SALARY": "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
      "ENTERTAINMENT": "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
      "FOOD": "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
      "PERSONAL_CARE": "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200",
      "INVESTMENT_INCOME": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
      "UTILITIES": "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
      "DEBT_PAYMENT": "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
      "INVESTMENT_TRANSFER": "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
      "OTHER_EXPENSE": "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200",
    }
    return colorMap[category] || "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200"
  }

  const getTypeColor = (type: string): string => {
    if (type === "INCOME") {
      return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
    } else {
      return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
    }
  }

  const getFrequencyColor = (frequency: string): string => {
    const colorMap: Record<string, string> = {
      "WEEKLY": "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200",
      "MONTHLY": "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
      "YEARLY": "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
    }
    return colorMap[frequency] || "bg-gray-100 text-gray-800"
  }

  const isActive = (transaction: RecurringTransaction): boolean => {
    const today = new Date()
    const startDate = new Date(transaction.startDate)
    const endDate = transaction.endDate ? new Date(transaction.endDate) : null
    
    return startDate <= today && (!endDate || today <= endDate)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const columns: ColumnDef<RecurringTransaction>[] = [
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
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("description")}</div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.getValue("amount"))}
        </div>
      ),
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
      cell: ({ row }) => {
        const frequency = row.getValue("frequency") as string
        return (
          <Badge className={getFrequencyColor(frequency)}>
            {frequency}
          </Badge>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string
        return (
          <Badge className={getCategoryColor(category)}>
            {category.replace(/_/g, " ")}
          </Badge>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return (
          <Badge className={getTypeColor(type)}>
            {type}
          </Badge>
        )
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const transaction = row.original
        const active = isActive(transaction)
        return (
          <Badge
            className={
              active
                ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200"
            }
          >
            <Clock className="me-1 size-3" />
            {active ? "Active" : "Inactive"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.getValue("startDate"))}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const transaction = row.original

        const handleDelete = async () => {
          try {
            await deleteRecurringTransaction(transaction.recurringTransactionId)
            toast.success("Recurring transaction deleted successfully")
            onTransactionUpdated()
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to delete recurring transaction"
            toast.error(errorMessage)
          }
        }

        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 cursor-pointer"
              onClick={() => {
                setSelectedRecurringTransaction(transaction as RecurringTransactionSchema)
                setViewDialogOpen(true)
              }}
            >
              <Eye className="size-4" />
              <span className="sr-only">View transaction</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => {
                setSelectedRecurringTransaction(transaction as RecurringTransactionSchema)
                setEditDialogOpen(true)
              }}
            >
              <Pencil className="size-4" />
              <span className="sr-only">Edit transaction</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-red-600"
              onClick={handleDelete}
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Delete transaction</span>
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: recurringTransactions,
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

  return (
    <div className="space-y-4">
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
          <RecurringTransactionFormDialog 
            accounts={accounts.map(acc => ({
              accountId: acc.accountId,
              name: acc.name
            }))}
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onTransactionSaved={() => {
              onTransactionUpdated()
              setCreateDialogOpen(false)
            }}
          >
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add Recurring Transaction
            </Button>
          </RecurringTransactionFormDialog>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={description ?? ""}
              onChange={(event) => setDescription?.(String(event.target.value))}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={typeFilter || "all"}
            onValueChange={(value) => setTypeFilter?.(value === "all" ? "" : value)}
          >
            <SelectTrigger className="cursor-pointer w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {RECURRING_TRANSACTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={frequencyFilter || "all"}
            onValueChange={(value) => setFrequencyFilter?.(value === "all" ? "" : value)}
          >
            <SelectTrigger className="cursor-pointer w-32">
              <SelectValue placeholder="Frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frequencies</SelectItem>
              {FREQUENCIES.map((freq) => (
                <SelectItem key={freq.value} value={freq.value}>
                  {freq.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter || "all"}
            onValueChange={(value) => setCategoryFilter?.(value === "all" ? "" : value)}
          >
            <SelectTrigger className="cursor-pointer w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {RECURRING_TRANSACTION_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <RecurringFiltersDialog
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            amountGreaterThan={amountGreaterThan}
            setAmountGreaterThan={setAmountGreaterThan}
            amountLessThan={amountLessThan}
            setAmountLessThan={setAmountLessThan}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onClear={() => {
              setStatusFilter?.("")
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
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
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
                  <TableCell colSpan={columns.length} className="text-center h-24">
                    No recurring transactions found.
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

          <span className="text-sm font-medium px-3 py-1 min-w-[100px] text-center">
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

      <RecurringTransactionViewDialog 
        recurringTransaction={selectedRecurringTransaction}
        accounts={accounts}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <RecurringTransactionFormDialog
        recurringTransaction={selectedRecurringTransaction}
        accounts={accounts}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onTransactionSaved={() => {
          onTransactionUpdated()
          setEditDialogOpen(false)
        }}
      />
    </div>
  )
}
