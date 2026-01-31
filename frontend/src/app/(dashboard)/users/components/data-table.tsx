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
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { User } from "@/types/schema"
import { deleteUser, exportUsersToExcel } from "@/services/userService"
import { UserFormDialog } from "./user-form-dialog"
import { UserViewDialog } from "./user-view-dialog"
import { UsersFiltersDialog } from "./users-filters-dialog"
import { DataTableSkeleton } from "@/components/data-table-skeleton"

interface DataTableProps {
  users: User[]
  loading?: boolean
  onDeleteUser?: (id: string) => void
  onEditUser?: (user: User) => void
  onAddUser?: () => void
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
  roleFilter?: string
  setRoleFilter?: (value: string) => void
  startDate?: string
  setStartDate?: (value: string) => void
  endDate?: string
  setEndDate?: (value: string) => void
}

export function DataTable({ 
  users, 
  loading = false,
  onDeleteUser, 
  onEditUser, 
  onAddUser,
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
  roleFilter = "",
  setRoleFilter,
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const generateAvatar = (name: string) => {
    const names = name.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleView = (user: User) => {
    setSelectedUser(user)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsFormDialogOpen(true)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      setIsDeleting(true)
      onDeleteUser?.(userId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete user"
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFormSuccess = () => {
    setEditingUser(null)
    setIsFormDialogOpen(false)
    // Refetch the list after form submission
    onAddUser?.()
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await exportUsersToExcel({
        ...(nameFilter && { name: nameFilter }),
        ...(emailFilter && { email: emailFilter }),
        ...(roleFilter && { role: roleFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      })
      toast.success("Users exported successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to export users"
      toast.error(errorMessage)
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const exactFilter = (row: Row<User>, columnId: string, value: string) => {
    return row.getValue(columnId) === value
  }

  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-medium">
                {generateAvatar(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isDeleting}>
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(user)}>
                <Eye className="me-2 size-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(user)}>
                <Pencil className="me-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(user.userId)}
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
    data: users,
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
          <UserFormDialog 
            user={editingUser}
            open={isFormDialogOpen}
            onOpenChange={setIsFormDialogOpen}
            onSuccess={handleFormSuccess}
          >
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </UserFormDialog>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={nameFilter ?? ""}
              onChange={(event) => setNameFilter?.(String(event.target.value))}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={roleFilter || "all"}
            onValueChange={(value) => setRoleFilter?.(value === "all" ? "" : value)}
          >
            <SelectTrigger className="cursor-pointer w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="User">User</SelectItem>
            </SelectContent>
          </Select>

          <UsersFiltersDialog
            emailFilter={emailFilter}
            setEmailFilter={setEmailFilter}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onClear={() => {
              setEmailFilter?.("")
              setStartDate?.("")
              setEndDate?.("")
            }}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns
                <ChevronDown className="ms-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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

      <UserViewDialog
        user={selectedUser}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    </div>
  )
}
