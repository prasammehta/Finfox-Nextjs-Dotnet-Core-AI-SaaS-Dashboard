import { http } from "./http"
import { Debt, CreateDebtRequest, UpdateDebtRequest, TotalDebt } from "@/types/schema"

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
 * Get all debts with pagination and filtering
 */
export async function getDebts(
  pageNumber = 0,
  pageSize = 10,
  filters?: {
    personName?: string
    amountGreaterThan?: string | number
    amountLessThan?: string | number
    debtType?: string
    status?: string
    startDate?: string
    endDate?: string
  }
): Promise<PaginationResponse<Debt>> {
  try {
    const params: any = { pageNumber, pageSize }
    
    // Add filter parameters if provided and not empty
    if (filters) {
      if (filters.personName) params.personName = filters.personName
      if (filters.amountGreaterThan) params.amountGreaterThan = filters.amountGreaterThan
      if (filters.amountLessThan) params.amountLessThan = filters.amountLessThan
      if (filters.debtType) params.debtType = filters.debtType
      if (filters.status) params.status = filters.status
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
    }
    
    const response = await http.get("/api/Debts", {
      params
    })
    return response.data
  } catch (error) {
    console.error("Error fetching debts:", error)
    throw error
  }
}

/**
 * Get all debts without pagination (for dropdowns)
 */
export async function getAllDebts(): Promise<Debt[]> {
  try {
    const response = await http.get("/api/Debts", {
      params: { pageNumber: 0, pageSize: 10000 }
    })
    return response.data.data || []
  } catch (error) {
    console.error("Error fetching all debts:", error)
    throw error
  }
}

/**
 * Get a single debt by ID
 */
export async function getDebtById(id: number): Promise<Debt> {
  try {
    const response = await http.get(`/api/Debts/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching debt ${id}:`, error)
    throw error
  }
}

/**
 * Create a new debt
 */
export async function createDebt(data: CreateDebtRequest): Promise<Debt> {
  try {
    const response = await http.post("/api/Debts", data)
    return response.data
  } catch (error) {
    console.error("Error creating debt:", error)
    throw error
  }
}

/**
 * Update an existing debt
 */
export async function updateDebt(id: number, data: UpdateDebtRequest): Promise<Debt> {
  try {
    const response = await http.put(`/api/Debts/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Error updating debt ${id}:`, error)
    throw error
  }
}

/**
 * Delete a debt
 */
export async function deleteDebt(id: number): Promise<void> {
  try {
    await http.delete(`/api/Debts/${id}`)
  } catch (error) {
    console.error(`Error deleting debt ${id}:`, error)
    throw error
  }
}

/**
 * Get all debts for a specific user
 */
export async function getDebtsByUserId(userId: string): Promise<Debt[]> {
  try {
    const response = await http.get(`/api/Debts/user/${userId}`)
    return Array.isArray(response.data) ? response.data : response.data?.data || []
  } catch (error) {
    console.error(`Error fetching debts for user ${userId}:`, error)
    throw error
  }
}

/**
 * Get active debts for a specific user
 */
export async function getActiveDebtsByUserId(userId: string): Promise<Debt[]> {
  try {
    const response = await http.get(`/api/Debts/user/${userId}/active`)
    return Array.isArray(response.data) ? response.data : response.data?.data || []
  } catch (error) {
    console.error(`Error fetching active debts for user ${userId}:`, error)
    throw error
  }
}

/**
 * Get total debt amount for a specific user
 */
export async function getTotalDebtByUserId(userId: string): Promise<TotalDebt> {
  try {
    const response = await http.get(`/api/Debts/user/${userId}/total`)
    return response.data
  } catch (error) {
    console.error(`Error fetching total debt for user ${userId}:`, error)
    throw error
  }
}

/**
 * Export debts to Excel
 */
export async function exportDebtsToExcel(filters?: {
  type?: string
  status?: string
  startDate?: string
  endDate?: string
}): Promise<void> {
  try {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.type) params.append('type', filters.type)
      if (filters.status) params.append('status', filters.status)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
    }

    const response = await http.get(`/api/Debts/export/excel?${params.toString()}`, {
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
    link.setAttribute('download', `debts-${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting debts:', error)
    throw error
  }
}
