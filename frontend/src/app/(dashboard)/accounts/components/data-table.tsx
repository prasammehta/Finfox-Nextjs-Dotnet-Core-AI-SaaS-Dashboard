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
  EllipsisVertical,
  Eye,
  Pencil,
  Trash2,
  Search,
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
} from "lucide-react"
import { toast } from "sonner"

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
import { Account } from "@/types/schema"
import { deleteAccount, exportAccountsToExcel } from "@/services/accountService"
import { AccountFormDialog } from "./account-form-dialog"
import { AccountViewDialog } from "./account-view-dialog"
import { AccountsFiltersDialog } from "./accounts-filters-dialog"

interface DataTableProps {
  accounts: Account[]
  loading?: boolean
  onDeleteAccount?: (id: number) => void
  onEditAccount?: (account: Account) => void
  onAccountUpdated?: () => void
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
  startDate?: string
  setStartDate?: (value: string) => void
  endDate?: string
  setEndDate?: (value: string) => void
}

export function DataTable({
  accounts,
  loading = false,
  onDeleteAccount,
  onEditAccount,
  onAccountUpdated,
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
  startDate = "",
  setStartDate,
  endDate = "",
  setEndDate,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

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

  const getBalanceStatus = (
    initialBalance: number,
    currentBalance: number
  ): { status: string; color: string; isPositive: boolean } => {
    const difference = currentBalance - initialBalance
    if (difference > 0) {
      return {
        status: `+${formatCurrency(difference)}`,
        color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
        isPositive: true,
      }
    } else if (difference < 0) {
      return {
        status: `${formatCurrency(difference)}`,
        color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
        isPositive: false,
      }
    } else {
      return {
        status: "No change",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200",
        isPositive: false,
      }
    }
  }

  const handleView = (account: Account) => {
    setSelectedAccount(account)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setIsFormDialogOpen(true)
  }

  const handleDelete = async (accountId: number) => {
    if (!confirm("Are you sure you want to delete this account?")) return

    try {
      setIsDeleting(true)
      await deleteAccount(accountId)
      toast.success("Account deleted successfully")
      onAccountUpdated?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete account"
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFormSuccess = () => {
    setEditingAccount(null)
    setIsFormDialogOpen(false)
    onAccountUpdated?.()
  }

  const columns: ColumnDef<Account>[] = [
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
      accessorKey: "name",
      header: "Account Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "initialBalance",
      header: "Initial Balance",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {formatCurrency(row.getValue("initialBalance"))}
        </div>
      ),
    },
    {
      accessorKey: "currentBalance",
      header: "Current Balance",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.getValue("currentBalance"))}
        </div>
      ),
    },
    {
      id: "change",
      header: "Balance Change",
      cell: ({ row }) => {
        const account = row.original
        const { status, color, isPositive } = getBalanceStatus(
          account.initialBalance,
          account.currentBalance
        )
        return (
          <Badge className={color}>
            {isPositive ? (
              <TrendingUp className="me-1 size-3" />
            ) : (
              <TrendingDown className="me-1 size-3" />
            )}
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.getValue("createdAt"))}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const account = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isDeleting}>
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(account)}>
                <Eye className="me-2 size-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(account)}>
                <Pencil className="me-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(account.accountId)}
                className="text-red-600 dark:text-red-400"
                disabled={isDeleting}
              >
                <Trash2 className="me-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: accounts,
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
      await exportAccountsToExcel({
        ...(nameFilter && { name: nameFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      })
      toast.success("Accounts exported successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to export accounts"
      toast.error(errorMessage)
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

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
          <AccountFormDialog
            account={editingAccount}
            open={isFormDialogOpen}
            onOpenChange={setIsFormDialogOpen}
            onSuccess={handleFormSuccess}
          >
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </AccountFormDialog>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={nameFilter ?? ""}
              onChange={(event) => setNameFilter?.(String(event.target.value))}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AccountsFiltersDialog
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onClear={() => {
              setStartDate?.("")
              setEndDate?.("")
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
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24">
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
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24">
                  No accounts found.
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

      <AccountFormDialog
        account={editingAccount}
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSuccess={handleFormSuccess}
      />

      <AccountViewDialog
        account={selectedAccount}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    </div>
  )
}
