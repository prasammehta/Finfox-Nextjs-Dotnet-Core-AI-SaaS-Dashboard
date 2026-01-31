import { http } from "./http"
import { User, CreateUserRequest, UpdateUserRequest } from "@/types/schema"

export interface PaginationResponse<T> {
  data: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface UserFilters {
  name?: string
  email?: string
  role?: string
  startDate?: string
  endDate?: string
}

/**
 * Get all users with pagination and filtering
 */
export async function getUsers(pageNumber = 0, pageSize = 10, filters?: UserFilters): Promise<PaginationResponse<User>> {
  try {
    const params: any = { pageNumber, pageSize }
    
    if (filters) {
      if (filters.name) params.name = filters.name
      if (filters.email) params.email = filters.email
      if (filters.role) params.role = filters.role
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
    }
    
    const response = await http.get("/api/Users", { params })
    return response.data
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

/**
 * Export users to Excel with filters
 */
export async function exportUsersToExcel(filters?: UserFilters): Promise<void> {
  try {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.name) params.append('name', filters.name)
      if (filters.email) params.append('email', filters.email)
      if (filters.role) params.append('role', filters.role)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
    }

    const response = await http.get(`/api/Users/export/excel?${params.toString()}`, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    })
    
    // Create blob from response data
    let blob: Blob
    if (response instanceof Blob) {
      blob = response
    } else if (response instanceof ArrayBuffer) {
      blob = new Blob([response], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
    } else {
      blob = new Blob([response.data || response], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
    }
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `users-${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting users:', error)
    throw error
  }
}

/**
 * Get a single user by ID
 */
export async function getUserById(id: string): Promise<User> {
  try {
    const response = await http.get(`/api/Users/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error)
    throw error
  }
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserRequest): Promise<User> {
  try {
    const response = await http.post("/api/Users", data)
    return response.data
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

/**
 * Update an existing user
 */
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User> {
  try {
    const response = await http.put(`/api/Users/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Error updating user ${id}:`, error)
    throw error
  }
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    await http.delete(`/api/Users/${id}`)
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error)
    throw error
  }
}
