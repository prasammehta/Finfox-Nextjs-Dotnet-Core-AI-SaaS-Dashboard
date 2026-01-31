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
import { InvestmentFormDialog } from "./investment-form-dialog"
import { InvestmentViewDialog } from "./investment-view-dialog"
import { InvestmentsFiltersDialog } from "./investments-filters-dialog"
import {
  type InvestmentDT as Investment,
  type InvestmentFormValuesDT as InvestmentFormValues,
  type InvestmentsDataTablePropsDT as DataTableProps
} from "@/types/datatable-schema"
import type { Investment as InvestmentSchema } from "@/types/schema"
import { deleteInvestment, exportInvestmentsToExcel } from "@/services/investmentService"
import { toast } from "sonner"

export function DataTable({
  investments,
  loading,
  pageIndex = 0,
  pageSize = 10,
  totalCount = 0,
  totalPages = 1,
  hasPreviousPage = false,
  hasNextPage = false,
  onPageIndexChange,
  onPageSizeChange,
  onDeleteInvestment,
  onEditInvestment,
  onInvestmentUpdated,
  // Filter props
  nameFilter = "",
  setNameFilter,
  typeFilter = "",
  setTypeFilter,
  gainLossGreaterThan = "",
  setGainLossGreaterThan,
  gainLossLessThan = "",
  setGainLossLessThan,
  returnPercentGreaterThan = "",
  setReturnPercentGreaterThan,
  dateAcquired = "",
  setDateAcquired,
}: DataTableProps & {
  pageIndex?: number
  pageSize?: number
  totalCount?: number
  totalPages?: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
  onPageIndexChange?: (pageIndex: number) => void
  onPageSizeChange?: (pageSize: number) => void
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentSchema | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case "STOCK":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
      case "CRYPTO":
        return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20"
      case "REAL_ESTATE":
        return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20"
      case "MUTUAL_FUND":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
      case "BOND":
        return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20"
      case "OTHER":
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
    }
  }

  const exactFilter = (row: Row<Investment>, columnId: string, value: string) => {
    return row.getValue(columnId) === value
  }

  const columns: ColumnDef<Investment>[] = [
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
      accessorKey: "investmentId",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-medium text-sm">{row.original.investmentId}</span>
      ),
      enableSorting: true,
      enableHiding: false,
      size: 80,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium text-sm">{row.original.name}</span>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type
        return (
          <Badge variant="secondary" className={getTypeColor(type)}>
            {type}
          </Badge>
        )
      },
      filterFn: exactFilter,
    },
    {
      accessorKey: "initialAmount",
      header: "Initial Amount",
      cell: ({ row }) => (
        <span className="text-sm font-semibold">
          ₹{row.original.initialAmount.toFixed(2)}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "currentValue",
      header: "Current Value",
      cell: ({ row }) => (
        <span className="text-sm font-semibold">
          ₹{row.original.currentValue.toFixed(2)}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "gain",
      header: "Gain/Loss",
      cell: ({ row }) => {
        const gain = row.original.currentValue - row.original.initialAmount
        const isPositive = gain >= 0
        return (
          <span className={`text-sm font-semibold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {isPositive ? "+" : ""}₹{gain.toFixed(2)}
          </span>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: "returnPercentage",
      header: "Return %",
      cell: ({ row }) => {
        const gain = row.original.currentValue - row.original.initialAmount
        const returnPercent = row.original.initialAmount > 0 ? (gain / row.original.initialAmount) * 100 : 0
        const isPositive = returnPercent >= 0
        return (
          <span className={`text-sm font-semibold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {isPositive ? "+" : ""}{returnPercent.toFixed(2)}%
          </span>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: "dateAcquired",
      header: "Date Acquired",
      cell: ({ row }) => {
        const date = new Date(row.original.dateAcquired)
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
        const investment = row.original
        const investmentSchema: InvestmentSchema = {
          investmentId: investment.investmentId,
          userId: investment.userId,
          name: investment.name,
          type: investment.type,
          initialAmount: investment.initialAmount,
          currentValue: investment.currentValue,
          dateAcquired: investment.dateAcquired,
          createdAt: investment.createdAt,
          updatedAt: investment.updatedAt,
        }
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => {
                setSelectedInvestment(investmentSchema)
                setViewDialogOpen(true)
              }}
            >
              <Eye className="size-4" />
              <span className="sr-only">View investment</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => {
                setSelectedInvestment(investmentSchema)
                setEditDialogOpen(true)
              }}
            >
              <Pencil className="size-4" />
              <span className="sr-only">Edit investment</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-red-600"
              onClick={() => onDeleteInvestment(investment.investmentId)}
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Delete investment</span>
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: investments,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  })

  const typeFilterValue = table.getColumn("type")?.getFilterValue() as string

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await exportInvestmentsToExcel({
        ...(nameFilter && { name: nameFilter }),
        ...(typeFilter && { type: typeFilter }),
        ...(gainLossGreaterThan && { gainLossGreaterThan: parseFloat(gainLossGreaterThan) }),
        ...(gainLossLessThan && { gainLossLessThan: parseFloat(gainLossLessThan) }),
        ...(returnPercentGreaterThan && { returnPercentGreaterThan: parseFloat(returnPercentGreaterThan) }),
        ...(dateAcquired && { dateAcquired }),
      })
      toast.success("Investments exported successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to export investments"
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
          <InvestmentFormDialog 
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onInvestmentSaved={() => {
              onInvestmentUpdated()
              setCreateDialogOpen(false)
            }}
          >
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add Investment
            </Button>
          </InvestmentFormDialog>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search investments..."
              value={nameFilter ?? ""}
              onChange={(event) => setNameFilter?.(String(event.target.value))}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={typeFilter || "all"}
            onValueChange={(value) => setTypeFilter?.(value === "all" ? "" : value)}
          >
            <SelectTrigger className="cursor-pointer w-40">
              <span className="text-muted-foreground">
                {typeFilter ? typeFilter : "All Types"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Stocks">Stocks</SelectItem>
              <SelectItem value="Bonds">Bonds</SelectItem>
              <SelectItem value="Mutual Funds">Mutual Funds</SelectItem>
              <SelectItem value="Real Estate">Real Estate</SelectItem>
              <SelectItem value="Cryptocurrency">Cryptocurrency</SelectItem>
            </SelectContent>
          </Select>

          <InvestmentsFiltersDialog
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            gainLossGreaterThan={gainLossGreaterThan}
            setGainLossGreaterThan={setGainLossGreaterThan}
            gainLossLessThan={gainLossLessThan}
            setGainLossLessThan={setGainLossLessThan}
            returnPercentGreaterThan={returnPercentGreaterThan}
            setReturnPercentGreaterThan={setReturnPercentGreaterThan}
            dateAcquired={dateAcquired}
            setDateAcquired={setDateAcquired}
            onClear={() => {
              setGainLossGreaterThan?.("")
              setGainLossLessThan?.("")
              setReturnPercentGreaterThan?.("")
              setDateAcquired?.("")
            }}
          />
        </div>
      </div>

      {loading ? (
        <DataTableSkeleton columns={10} rows={pageSize} />
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
          <Label htmlFor="page-size" className="text-sm font-medium">
            Show
          </Label>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange?.(Number(value))
            }}
          >
            <SelectTrigger className="w-20 cursor-pointer" id="page-size">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 text-sm text-muted-foreground text-center">
          Total: {totalCount} record(s)
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageIndexChange?.(pageIndex - 1)}
            disabled={!hasPreviousPage}
            className="cursor-pointer"
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
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      </div>

      <InvestmentViewDialog
        investment={selectedInvestment}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <InvestmentFormDialog
        investment={selectedInvestment}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onInvestmentSaved={() => {
          onInvestmentUpdated()
          setEditDialogOpen(false)
        }}
      />
    </div>
  )
} 