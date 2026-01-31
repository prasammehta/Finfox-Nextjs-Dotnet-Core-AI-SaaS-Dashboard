import { http } from "./http"
import { Bill, CreateBillRequest, UpdateBillRequest } from "@/types/schema"

export interface PaginationResponse<T> {
  data: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface BillFilters {
  client?: string
  invoiceNumber?: string
  amountGreaterThan?: number
  amountLessThan?: number
  dueDate?: string
}

/**
 * Get all bills with pagination and filtering
 */
export async function getBills(pageNumber = 0, pageSize = 10, filters?: BillFilters): Promise<PaginationResponse<Bill>> {
  try {
    const params: any = { pageNumber, pageSize }
    
    if (filters) {
      if (filters.client) params.client = filters.client
      if (filters.invoiceNumber) params.invoiceNumber = filters.invoiceNumber
      if (filters.amountGreaterThan !== undefined) params.amountGreaterThan = filters.amountGreaterThan
      if (filters.amountLessThan !== undefined) params.amountLessThan = filters.amountLessThan
      if (filters.dueDate) params.dueDate = filters.dueDate
    }
    
    const response = await http.get("/api/Bills", { params })
    return response.data
  } catch (error) {
    console.error("Error fetching bills:", error)
    throw error
  }
}

/**
 * Export bills to Excel with filters
 */
export async function exportBillsToExcel(filters?: BillFilters): Promise<void> {
  try {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.client) params.append('client', filters.client)
      if (filters.invoiceNumber) params.append('invoiceNumber', filters.invoiceNumber)
      if (filters.amountGreaterThan !== undefined) params.append('amountGreaterThan', filters.amountGreaterThan.toString())
      if (filters.amountLessThan !== undefined) params.append('amountLessThan', filters.amountLessThan.toString())
      if (filters.dueDate) params.append('dueDate', filters.dueDate)
    }

    const response = await http.get(`/api/Bills/export/excel?${params.toString()}`, {
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
    link.setAttribute('download', `bills-${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting bills:', error)
    throw error
  }
}

/**
 * Get all bills without pagination (for dropdowns)
 */
export async function getAllBills(): Promise<Bill[]> {
  try {
    const response = await http.get("/api/Bills", {
      params: { pageNumber: 0, pageSize: 10000 }
    })
    return response.data.data || []
  } catch (error) {
    console.error("Error fetching all bills:", error)
    throw error
  }
}

/**
 * Get a single bill by ID
 */
export async function getBillById(id: number): Promise<Bill> {
  try {
    const response = await http.get(`/api/Bills/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching bill ${id}:`, error)
    throw error
  }
}

/**
 * Create a new bill
 */
export async function createBill(data: CreateBillRequest): Promise<Bill> {
  try {
    const response = await http.post("/api/Bills", data)
    return response.data
  } catch (error) {
    console.error("Error creating bill:", error)
    throw error
  }
}

/**
 * Update an existing bill
 */
export async function updateBill(id: number, data: UpdateBillRequest): Promise<Bill> {
  try {
    const response = await http.put(`/api/Bills/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Error updating bill ${id}:`, error)
    throw error
  }
}

/**
 * Delete a bill
 */
export async function deleteBill(id: number): Promise<void> {
  try {
    await http.delete(`/api/Bills/${id}`)
  } catch (error) {
    console.error(`Error deleting bill ${id}:`, error)
    throw error
  }
}

/**
 * Get all bills for a specific user
 */
export async function getBillsByUserId(userId: string): Promise<Bill[]> {
  try {
    const response = await http.get(`/api/Bills/user/${userId}`)
    return Array.isArray(response.data) ? response.data : response.data?.data || []
  } catch (error) {
    console.error(`Error fetching bills for user ${userId}:`, error)
    throw error
  }
}

/**
 * Get overdue bills for a specific user
 */
export async function getOverdueBillsByUserId(userId: string): Promise<Bill[]> {
  try {
    const response = await http.get(`/api/Bills/user/${userId}/overdue`)
    return Array.isArray(response.data) ? response.data : response.data?.data || []
  } catch (error) {
    console.error(`Error fetching overdue bills for user ${userId}:`, error)
    throw error
  }
}
