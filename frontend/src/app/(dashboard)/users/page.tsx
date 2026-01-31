"use client"

import { useState, useMemo } from "react"
import { StatCards } from "./components/stat-cards"
import { DataTable } from "./components/data-table"
import { useUsers } from "@/hooks/api/useUsers"
import type { UserFilters } from "@/services/userService"

export default function UsersPage() {
  // Filter states
  const [nameFilter, setNameFilter] = useState("")
  const [emailFilter, setEmailFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Build filters object, only including non-empty values
  const filters: UserFilters = useMemo(() => ({
    ...(nameFilter && { name: nameFilter }),
    ...(emailFilter && { email: emailFilter }),
    ...(roleFilter && { role: roleFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  }), [nameFilter, emailFilter, roleFilter, startDate, endDate])

  const { 
    data: users, 
    loading, 
    error, 
    removeUser, 
    refetch,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageIndex,
    setPageSize,
  } = useUsers(filters)

  const handleDeleteUser = async (userId: string) => {
    await removeUser(userId)
  }

  const handleEditUser = async () => {
    await refetch()
  }

  const handleAddUser = async () => {
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground my-2">Manage and view all users in the system.</p>
        </div>
        <StatCards users={users} />
      </div>

      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <DataTable 
          users={users}
          loading={loading}
          onDeleteUser={handleDeleteUser}
          onEditUser={handleEditUser}
          onAddUser={handleAddUser}
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
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </div>
    </div>
  )
}
