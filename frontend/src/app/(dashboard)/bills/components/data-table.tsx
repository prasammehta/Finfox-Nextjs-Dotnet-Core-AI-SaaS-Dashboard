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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { BillFormDialog } from "./bill-form-dialog"
import { BillsFiltersDialog } from "./bills-filters-dialog"
import { 
  type BillItemDT as BillItem,
  type BillDT,
  type BillsDataTablePropsDT as DataTableProps
} from "@/types/datatable-schema"
import { BillCompany } from "@/types/schema"
import { generateBillPDF as generatePDFUtil } from "./generate-bill-pdf"
import { deleteBill, exportBillsToExcel } from "@/services/billService"
import { toast } from "sonner"

interface DataTableWithCompaniesProps extends DataTableProps {
  billCompanies?: BillCompany[]
  // Pagination props
  pageIndex?: number
  pageSize?: number
  totalCount?: number
  totalPages?: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
  onPageIndexChange?: (pageIndex: number) => void
  onPageSizeChange?: (pageSize: number) => void
  // Filter props
  clientFilter?: string
  setClientFilter?: (value: string) => void
  invoiceNumberFilter?: string
  setInvoiceNumberFilter?: (value: string) => void
  amountGreaterThan?: string
  setAmountGreaterThan?: (value: string) => void
  amountLessThan?: string
  setAmountLessThan?: (value: string) => void
  dueDate?: string
  setDueDate?: (value: string) => void
}

export function DataTable({ 
  bills, 
  loading, 
  onDeleteBill, 
  onEditBill, 
  onBillUpdated,
  pageIndex = 0,
  pageSize = 10,
  totalCount = 0,
  totalPages = 0,
  hasPreviousPage = false,
  hasNextPage = false,
  onPageIndexChange,
  onPageSizeChange,
  billCompanies = [],
  // Filter props
  clientFilter = "",
  setClientFilter,
  invoiceNumberFilter = "",
  setInvoiceNumberFilter,
  amountGreaterThan = "",
  setAmountGreaterThan,
  amountLessThan = "",
  setAmountLessThan,
  dueDate = "",
  setDueDate,
}: DataTableWithCompaniesProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingBill, setEditingBill] = useState<BillDT | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewingBill, setViewingBill] = useState<BillDT | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const getCompanyName = (companyId: number): string => {
    const company = billCompanies.find(c => c.billCompanyId === companyId)
    return company?.name || "Unknown"
  }

  const getBillStatus = (dueDate: string): { status: string; color: string } => {
    const now = new Date()
    const due = new Date(dueDate)
    const daysUntilDue = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue < 0) {
      return { status: "Overdue", color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200" }
    } else if (daysUntilDue <= 7) {
      return { status: "Due Soon", color: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200" }
    } else {
      return { status: "Upcoming", color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200" }
    }
  }



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const generateBillPDF = (bill: BillDT) => {
    generatePDFUtil(bill, billCompanies)
  }

  const columns: ColumnDef<BillDT>[] = [
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
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("invoiceNumber")}</div>
      ),
    },
    {
      accessorKey: "client",
      header: "Client",
      cell: ({ row }) => {
        const bill = row.original
        return (
          <div className="text-sm">
            <div className="font-medium">{row.getValue("client")}</div>
            <div className="text-xs text-muted-foreground">{getCompanyName(bill.billToId)}</div>
          </div>
        )
      },
    },
    {
      id: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const bill = row.original
        return <div className="font-medium">{formatCurrency(bill.totalAmount)}</div>
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => (
        <div className="text-sm">{formatDate(row.getValue("dueDate"))}</div>
      ),
    },

    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const bill = row.original
        const { status, color } = getBillStatus(bill.dueDate)
        return (
          <Badge className={color}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const bill = row.original

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => {
                setViewingBill(bill)
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
              onClick={() => generateBillPDF(bill)}
              disabled={isDeleting}
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Download PDF</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => {
                setEditingBill(bill)
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
              onClick={() => handleDelete(bill.billId)}
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

  const handleDelete = async (billId: number) => {
    if (!confirm("Are you sure you want to delete this bill?")) return

    try {
      setIsDeleting(true)
      await deleteBill(billId)
      toast.success("Bill deleted successfully")
      onDeleteBill(billId)
      onBillUpdated()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete bill"
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const table = useReactTable({
    data: bills,
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
      await exportBillsToExcel({
        ...(clientFilter && { client: clientFilter }),
        ...(invoiceNumberFilter && { invoiceNumber: invoiceNumberFilter }),
        ...(amountGreaterThan && { amountGreaterThan: parseFloat(amountGreaterThan) }),
        ...(amountLessThan && { amountLessThan: parseFloat(amountLessThan) }),
        ...(dueDate && { dueDate }),
      })
      toast.success("Bills exported successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to export bills"
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
          <BillFormDialog 
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onBillSaved={() => {
              onBillUpdated()
              setCreateDialogOpen(false)
            }}
            billCompanies={billCompanies}
          >
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add Bill
            </Button>
          </BillFormDialog>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bills..."
              value={invoiceNumberFilter ?? ""}
              onChange={(event) => setInvoiceNumberFilter?.(String(event.target.value))}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={clientFilter || "all"}
            onValueChange={(value) => setClientFilter?.(value === "all" ? "" : value)}
          >
            <SelectTrigger className="cursor-pointer w-40">
              <span className="text-muted-foreground">
                {clientFilter ? clientFilter : "All Clients"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {bills && bills.length > 0 && Array.from(new Set(bills.map(b => b.client))).map(client => (
                <SelectItem key={client} value={client}>{client}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <BillsFiltersDialog
            amountGreaterThan={amountGreaterThan}
            setAmountGreaterThan={setAmountGreaterThan}
            amountLessThan={amountLessThan}
            setAmountLessThan={setAmountLessThan}
            dueDate={dueDate}
            setDueDate={setDueDate}
            onClear={() => {
              setAmountGreaterThan?.("")
              setAmountLessThan?.("")
              setDueDate?.("")
            }}
          />
        </div>
      </div>

      {loading ? (
        <DataTableSkeleton columns={7} rows={pageSize} />
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
                  No bills found.
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
      {/* Edit Bill Dialog */}
      <BillFormDialog
        bill={editingBill}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onBillSaved={() => {
          setEditingBill(null)
          setEditDialogOpen(false)
          onBillUpdated()
        }}
        billCompanies={billCompanies}
      />

      {/* View Bill Dialog */}
      {viewingBill && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bill Details</DialogTitle>
              <DialogDescription>
                View complete bill information and items
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Invoice & Client Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Invoice Number</label>
                  <p className="text-lg font-semibold mt-1">{viewingBill.invoiceNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Client</label>
                  <p className="text-lg font-semibold mt-1">{viewingBill.client}</p>
                </div>
              </div>

              {/* Bill From & To */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bill From</label>
                  <p className="text-base mt-1">{getCompanyName(viewingBill.billFromId)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bill To</label>
                  <p className="text-base mt-1">{getCompanyName(viewingBill.billToId)}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Issue Date</label>
                  <p className="text-base mt-1">{new Date(viewingBill.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                  <p className="text-base mt-1">{new Date(viewingBill.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Tax Rates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">GST Rate (%)</label>
                  <p className="text-base mt-1">{viewingBill.gstRate.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">TDS Rate (%)</label>
                  <p className="text-base mt-1">{viewingBill.tdsPercent.toFixed(2)}</p>
                </div>
              </div>

              {/* Bill Items */}
              {viewingBill.billItems && viewingBill.billItems.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Bill Items</h3>
                  <div className="space-y-2">
                    {viewingBill.billItems.map((item: BillItem, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm py-2 border-b last:border-b-0">
                        <span className="font-medium">{item.item || "Item"}</span>
                        <span>₹ {((item.quantity as number || 0) * (item.amount as number || 0)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(viewingBill.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST Amount:</span>
                  <span>{formatCurrency(viewingBill.gstAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(viewingBill.totalAmount)}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}