"use client"

import { useState, useEffect } from "react"
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
import { TransactionFormDialog } from "./transaction-form-dialog"
import { TransactionViewDialog } from "./transaction-view-dialog"
import { MoreFiltersDialog } from "./more-filters-dialog"
import { toast } from "sonner"
import { exportTransactionsToExcel, deleteTransaction } from "@/services/transactionService"
import {
  type TransactionDT as Transaction,
  type AccountDTForTransactions as Account,
  type TransactionFormValuesDT as TransactionFormValues,
  type TransactionsDataTablePropsDT as DataTableProps
} from "@/types/datatable-schema"
import type { Transaction as TransactionSchema } from "@/types/schema"
import { TRANSACTION_TYPES, CATEGORIES, getTransactionTypeLabel, getCategoryLabel, getTypeColor, getCategoryColor } from "@/constants/enums"

export function DataTable({
  transactions,
  accounts,
  loading,
  pageIndex = 0,
  pageSize = 10,
  totalCount = 0,
  totalPages = 1,
  hasPreviousPage = false,
  hasNextPage = false,
  onPageIndexChange,
  onPageSizeChange,
  onDeleteTransaction,
  onEditTransaction,
  onTransactionUpdated,
  typeFilter = "",
  setTypeFilter,
  categoryFilter = "",
  setCategoryFilter,
  startDate = "",
  setStartDate,
  endDate = "",
  setEndDate,
  fromAccountId = "",
  setFromAccountId,
  amountGreaterThan = "",
  setAmountGreaterThan,
  amountLessThan = "",
  setAmountLessThan,
  searchDescription = "",
  setSearchDescription,
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
  categoryFilter?: string
  setCategoryFilter?: (value: string) => void
  startDate?: string
  setStartDate?: (value: string) => void
  endDate?: string
  setEndDate?: (value: string) => void
  fromAccountId?: string
  setFromAccountId?: (value: string) => void
  amountGreaterThan?: string
  setAmountGreaterThan?: (value: string) => void
  amountLessThan?: string
  setAmountLessThan?: (value: string) => void
  searchDescription?: string
  setSearchDescription?: (value: string) => void
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionSchema | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await exportTransactionsToExcel({
        type: typeFilter || undefined,
        category: categoryFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        fromAccountId: fromAccountId || undefined,
        amountGreaterThan: amountGreaterThan ? parseFloat(amountGreaterThan) : undefined,
        amountLessThan: amountLessThan ? parseFloat(amountLessThan) : undefined,
        description: searchDescription || undefined,
      })
      toast.success("Transactions exported successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to export transactions"
      toast.error(errorMessage)
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const exactFilter = (row: Row<Transaction>, columnId: string, value: string) => {
    if (!value) return true
    const cellValue = row.getValue(columnId) as string
    return cellValue?.toUpperCase() === value.toUpperCase()
  }

  const columns: ColumnDef<Transaction>[] = [
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
      accessorKey: "transactionId",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-medium text-sm">{row.original.transactionId}</span>
      ),
      enableSorting: true,
      enableHiding: false,
      size: 80,
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
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt)
        return (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.description}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.original.amount
        const isExpense = row.original.type?.toLowerCase() === "expense"
        return (
          <span className={`font-semibold text-sm ${isExpense ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
            {isExpense ? "-" : "+"}₹{Math.abs(amount).toFixed(2)}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type
        return (
          <Badge variant="secondary" className={getTypeColor(type)}>
            {getTransactionTypeLabel(type)}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category
        return (
          <Badge variant="secondary" className={getCategoryColor(category)}>
            {getCategoryLabel(category)}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "fromAccountId",
      header: "Account",
      cell: ({ row }) => {
        const account = accounts.find(acc => acc.accountId === row.original.fromAccountId)
        return <span className="text-sm">{account?.name || "Unknown"}</span>
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const transaction = row.original
        const transactionSchema: TransactionSchema = {
          transactionId: transaction.transactionId,
          amount: transaction.amount,
          date: transaction.date,
          description: transaction.description,
          type: transaction.type,
          category: transaction.category,
          fromAccountId: transaction.fromAccountId,
          createdAt: transaction.createdAt,
          userId: transaction.userId,
        }
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => {
                setSelectedTransaction(transactionSchema)
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
                setSelectedTransaction(transactionSchema)
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
              onClick={() => onDeleteTransaction(transaction.transactionId)}
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
    data: transactions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full space-y-4">
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
          <TransactionFormDialog
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
              Add Transaction
            </Button>
          </TransactionFormDialog>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchDescription ?? ""}
              onChange={(event) => setSearchDescription?.(String(event.target.value))}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={typeFilter || "all"}
            onValueChange={(value) => {
              setTypeFilter(value)
              table.getColumn("type")?.setFilterValue(value === "all" ? "" : value)
            }}
          >
            <SelectTrigger className="cursor-pointer w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Income">Income</SelectItem>
              <SelectItem value="Expense">Expense</SelectItem>
              <SelectItem value="Transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter || "all"}
            onValueChange={(value) => {
              setCategoryFilter(value)
              table.getColumn("category")?.setFilterValue(value === "all" ? "" : value)
            }}
          >
            <SelectTrigger className="cursor-pointer w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Food">Food</SelectItem>
              <SelectItem value="Transport">Transport</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
              <SelectItem value="Shopping">Shopping</SelectItem>
              <SelectItem value="Salary">Salary</SelectItem>
              <SelectItem value="Investment">Investment</SelectItem>
            </SelectContent>
          </Select>

          <MoreFiltersDialog
            startDate={startDate}
            endDate={endDate}
            fromAccountId={fromAccountId}
            amountGreaterThan={amountGreaterThan}
            amountLessThan={amountLessThan}
            accounts={accounts}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onFromAccountIdChange={setFromAccountId}
            onAmountGreaterThanChange={setAmountGreaterThan}
            onAmountLessThanChange={setAmountLessThan}
            onApply={() => {
              // Dialog will close automatically
            }}
            onClear={() => {
              setStartDate("")
              setEndDate("")
              setFromAccountId("")
              setAmountGreaterThan("")
              setAmountLessThan("")
            }}
          />
        </div>
      </div>

      {loading ? (
        <DataTableSkeleton columns={8} rows={pageSize} />
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

      <TransactionViewDialog
        transaction={selectedTransaction}
        accounts={accounts.map(acc => ({
          accountId: acc.accountId,
          name: acc.name
        }))}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <TransactionFormDialog
        transaction={selectedTransaction}
        accounts={accounts.map(acc => ({
          accountId: acc.accountId,
          name: acc.name
        }))}
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
