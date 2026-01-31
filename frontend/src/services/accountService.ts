import { http } from "./http"
import { Account, CreateAccountRequest, UpdateAccountRequest, AccountBalance } from "@/types/schema"

export interface PaginationResponse<T> {
  data: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface AccountFilters {
  name?: string
  startDate?: string
  endDate?: string
}

/**
 * Get all accounts with pagination and filtering
 */
export async function getAccounts(pageNumber = 0, pageSize = 10, filters?: AccountFilters): Promise<PaginationResponse<Account>> {
  try {
    const params: any = { pageNumber, pageSize }
    
    if (filters) {
      if (filters.name) params.name = filters.name
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
    }
    
    const response = await http.get("/api/Accounts", { params })
    return response.data
  } catch (error) {
    console.error("Error fetching accounts:", error)
    throw error
  }
}

/**
 * Export accounts to Excel with filters
 */
export async function exportAccountsToExcel(filters?: AccountFilters): Promise<void> {
  try {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.name) params.append('name', filters.name)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
    }

    const response = await http.get(`/api/Accounts/export/excel?${params.toString()}`, {
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
    link.setAttribute('download', `accounts-${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting accounts:', error)
    throw error
  }
}

/**
 * Get all accounts without pagination (for dropdowns)
 */
export async function getAllAccounts(): Promise<Account[]> {
  try {
    const response = await http.get("/api/Accounts", {
      params: { pageNumber: 0, pageSize: 10000 }
    })
    return response.data.data || []
  } catch (error) {
    console.error("Error fetching all accounts:", error)
    throw error
  }
}

/**
 * Get a single account by ID
 */
export async function getAccountById(id: number): Promise<Account> {
  try {
    const response = await http.get(`/api/Accounts/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching account ${id}:`, error)
    throw error
  }
}

/**
 * Create a new account
 */
export async function createAccount(data: CreateAccountRequest): Promise<Account> {
  try {
    const response = await http.post("/api/Accounts", data)
    return response.data
  } catch (error) {
    console.error("Error creating account:", error)
    throw error
  }
}

/**
 * Update an existing account
 */
export async function updateAccount(
  id: number,
  data: UpdateAccountRequest
): Promise<Account> {
  try {
    const response = await http.put(`/api/Accounts/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Error updating account ${id}:`, error)
    throw error
  }
}

/**
 * Delete an account
 */
export async function deleteAccount(id: number): Promise<void> {
  try {
    await http.delete(`/api/Accounts/${id}`)
  } catch (error) {
    console.error(`Error deleting account ${id}:`, error)
    throw error
  }
}

/**
 * Get all accounts for a specific user
 */
export async function getAccountsByUserId(userId: string): Promise<Account[]> {
  try {
    const response = await http.get(`/api/Accounts/user/${userId}`)
    return Array.isArray(response.data) ? response.data : response.data?.data || []
  } catch (error) {
    console.error(`Error fetching accounts for user ${userId}:`, error)
    throw error
  }
}

/**
 * Get the current balance of a specific account
 */
export async function getAccountBalance(id: number): Promise<AccountBalance> {
  try {
    const response = await http.get(`/api/Accounts/${id}/balance`)
    return response.data
  } catch (error) {
    console.error(`Error fetching balance for account ${id}:`, error)
    throw error
  }
}
