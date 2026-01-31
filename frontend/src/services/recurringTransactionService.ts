import { http } from "./http"
import { RecurringTransaction, CreateRecurringTransactionRequest, UpdateRecurringTransactionRequest } from "@/types/schema"

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
 * Get all recurring transactions with pagination and filtering
 */
export async function getRecurringTransactions(
  pageNumber = 0,
  pageSize = 10,
  filters?: {
    description?: string
    amountGreaterThan?: string | number
    amountLessThan?: string | number
    frequency?: string
    category?: string
    type?: string
    isActive?: boolean
    startDate?: string
    endDate?: string
  }
): Promise<PaginationResponse<RecurringTransaction>> {
  try {
    const params: any = { pageNumber, pageSize }
    
    // Add filter parameters if provided and not empty
    if (filters) {
      if (filters.description) params.description = filters.description
      if (filters.amountGreaterThan) params.amountGreaterThan = filters.amountGreaterThan
      if (filters.amountLessThan) params.amountLessThan = filters.amountLessThan
      if (filters.frequency) params.frequency = filters.frequency
      if (filters.category) params.category = filters.category
      if (filters.type) params.type = filters.type
      if (filters.isActive !== undefined) params.isActive = filters.isActive
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
    }
    
    const response = await http.get("/api/RecurringTransactions", {
      params
    })
    return response.data
  } catch (error) {
    console.error("Error fetching recurring transactions:", error)
    throw error
  }
}

/**
 * Get all recurring transactions without pagination (for dropdowns)
 */
export async function getAllRecurringTransactions(): Promise<RecurringTransaction[]> {
  try {
    const response = await http.get("/api/RecurringTransactions", {
      params: { pageNumber: 0, pageSize: 10000 }
    })
    return response.data.data || []
  } catch (error) {
    console.error("Error fetching all recurring transactions:", error)
    throw error
  }
}

/**
 * Get a single recurring transaction by ID
 */
export async function getRecurringTransactionById(id: number): Promise<RecurringTransaction> {
  try {
    const response = await http.get(`/api/RecurringTransactions/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching recurring transaction ${id}:`, error)
    throw error
  }
}

/**
 * Create a new recurring transaction
 */
export async function createRecurringTransaction(
  data: CreateRecurringTransactionRequest
): Promise<RecurringTransaction> {
  try {
    const response = await http.post("/api/RecurringTransactions", data)
    return response.data
  } catch (error) {
    console.error("Error creating recurring transaction:", error)
    throw error
  }
}

/**
 * Update an existing recurring transaction
 */
export async function updateRecurringTransaction(
  id: number,
  data: UpdateRecurringTransactionRequest
): Promise<RecurringTransaction> {
  try {
    const response = await http.put(`/api/RecurringTransactions/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Error updating recurring transaction ${id}:`, error)
    throw error
  }
}

/**
 * Delete a recurring transaction
 */
export async function deleteRecurringTransaction(id: number): Promise<void> {
  try {
    await http.delete(`/api/RecurringTransactions/${id}`)
  } catch (error) {
    console.error(`Error deleting recurring transaction ${id}:`, error)
    throw error
  }
}

/**
 * Get all recurring transactions for a specific user
 */
export async function getRecurringTransactionsByUserId(
  userId: string
): Promise<RecurringTransaction[]> {
  try {
    const response = await http.get(`/api/RecurringTransactions/user/${userId}`)
    return Array.isArray(response.data) ? response.data : response.data?.data || []
  } catch (error) {
    console.error(`Error fetching recurring transactions for user ${userId}:`, error)
    throw error
  }
}

/**
 * Process recurring transactions for a specific user
 */
export async function processRecurringTransactions(userId: string): Promise<void> {
  try {
    await http.post(`/api/RecurringTransactions/${userId}/process`)
  } catch (error) {
    console.error(`Error processing recurring transactions for user ${userId}:`, error)
    throw error
  }
}

/**
 * Export recurring transactions to Excel
 */
export async function exportRecurringTransactionsToExcel(filters?: {
  description?: string
  frequency?: string
  type?: string
  category?: string
  isActive?: boolean
  amountGreaterThan?: number
  amountLessThan?: number
}): Promise<void> {
  try {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.description) params.append('description', filters.description)
      if (filters.frequency) params.append('frequency', filters.frequency)
      if (filters.type) params.append('type', filters.type)
      if (filters.category) params.append('category', filters.category)
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())
      if (filters.amountGreaterThan !== undefined) params.append('amountGreaterThan', filters.amountGreaterThan.toString())
      if (filters.amountLessThan !== undefined) params.append('amountLessThan', filters.amountLessThan.toString())
    }

    const response = await http.get(`/api/RecurringTransactions/export/excel?${params.toString()}`, {
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
    link.setAttribute('download', `recurring-transactions-${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting recurring transactions:', error)
    throw error
  }
}
