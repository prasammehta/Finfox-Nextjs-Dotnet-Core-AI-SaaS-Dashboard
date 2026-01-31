import { http } from "./http"
import { Transaction, CreateTransactionRequest, UpdateTransactionRequest } from "@/types/schema"

export interface PaginationResponse<T> {
  data: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

/**
 * Get all transactions with pagination and filtering
 */
export async function getTransactions(
  pageNumber = 0,
  pageSize = 10,
  filters?: {
    type?: string
    category?: string
    startDate?: string
    endDate?: string
    fromAccountId?: string | number
    amountGreaterThan?: string | number
    amountLessThan?: string | number
    description?: string
  }
): Promise<PaginationResponse<Transaction>> {
  try {
    const params: any = { pageNumber, pageSize }
    
    // Add filter parameters if provided and not empty
    if (filters) {
      if (filters.type) params.type = filters.type
      if (filters.category) params.category = filters.category
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.fromAccountId) params.fromAccountId = filters.fromAccountId
      if (filters.amountGreaterThan) params.amountGreaterThan = filters.amountGreaterThan
      if (filters.amountLessThan) params.amountLessThan = filters.amountLessThan
      if (filters.description) params.description = filters.description
    }
    
    const response = await http.get("/api/Transactions", {
      params
    })
    return response.data
  } catch (error) {
    console.error("Error fetching transactions:", error)
    throw error
  }
}

/**
 * Get all transactions without pagination (for dropdowns)
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const response = await http.get("/api/Transactions", {
      params: { pageNumber: 0, pageSize: 10000 }
    })
    return response.data.data || []
  } catch (error) {
    console.error("Error fetching all transactions:", error)
    throw error
  }
}

/**
 * Get a single transaction by ID
 */
export async function getTransactionById(id: number): Promise<Transaction> {
  try {
    const response = await http.get(`/api/Transactions/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error)
    throw error
  }
}

/**
 * Create a new transaction
 */
export async function createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
  try {
    console.log("Creating transaction with data:", data);
    const response = await http.post("/api/Transactions", data)
    return response.data
  } catch (error) {
    console.error("Error creating transaction:", error)
    throw error
  }
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  id: number,
  data: UpdateTransactionRequest
): Promise<Transaction> {
  try {
    const response = await http.put(`/api/Transactions/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Error updating transaction ${id}:`, error)
    throw error
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: number): Promise<void> {
  try {
    await http.delete(`/api/Transactions/${id}`)
  } catch (error) {
    console.error(`Error deleting transaction ${id}:`, error)
    throw error
  }
}

/**
 * Get all transactions for a specific user
 */
export async function getTransactionsByUserId(userId: string): Promise<Transaction[]> {
  try {
    const response = await http.get(`/api/Transactions/user/${userId}`)
    return Array.isArray(response.data) ? response.data : response.data?.data || []
  } catch (error) {
    console.error(`Error fetching transactions for user ${userId}:`, error)
    throw error
  }
}

/**
 * Get all transactions for a specific account
 */
export async function getTransactionsByAccountId(accountId: number): Promise<Transaction[]> {
  try {
    const response = await http.get(`/api/Transactions/account/${accountId}`)
    return Array.isArray(response.data) ? response.data : response.data?.data || []
  } catch (error) {
    console.error(`Error fetching transactions for account ${accountId}:`, error)
    throw error
  }
}

/**
 * Get transactions for a user within a date range
 */
export async function getTransactionsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  try {
    const response = await http.get(
      `/api/Transactions/user/${userId}/date-range?startDate=${startDate}&endDate=${endDate}`
    )
    return Array.isArray(response.data) ? response.data : response.data?.data || []
  } catch (error) {
    console.error(`Error fetching transactions for user ${userId} in date range:`, error)
    throw error
  }
}

/**
 * Export transactions to Excel with filters
 */
export async function exportTransactionsToExcel(filters?: {
  type?: string
  category?: string
  startDate?: string
  endDate?: string
  fromAccountId?: string | number
  amountGreaterThan?: number
  amountLessThan?: number
  description?: string
}): Promise<void> {
  try {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.type) params.append('type', filters.type)
      if (filters.category) params.append('category', filters.category)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.fromAccountId) params.append('fromAccountId', filters.fromAccountId.toString())
      if (filters.amountGreaterThan !== undefined) params.append('amountGreaterThan', filters.amountGreaterThan.toString())
      if (filters.amountLessThan !== undefined) params.append('amountLessThan', filters.amountLessThan.toString())
      if (filters.description) params.append('description', filters.description)
    }

    const response = await http.get(`/api/Transactions/export/excel?${params.toString()}`, {
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
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting transactions:', error)
    throw error
  }
}
