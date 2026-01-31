import { http } from "./http"
import { Investment, CreateInvestmentRequest, UpdateInvestmentRequest, TotalInvestmentValue, InvestmentGainLossResponse } from "@/types/schema"

export interface PaginationResponse<T> {
  data: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface InvestmentFilters {
  name?: string
  type?: string
  gainLossGreaterThan?: number
  gainLossLessThan?: number
  returnPercentGreaterThan?: number
  dateAcquired?: string
}

/**
 * Get all investments with pagination and filtering
 */
export async function getInvestments(pageNumber = 0, pageSize = 10, filters?: InvestmentFilters): Promise<PaginationResponse<Investment>> {
  try {
    const params: any = { pageNumber, pageSize }
    
    if (filters) {
      if (filters.name) params.name = filters.name
      if (filters.type) params.type = filters.type
      if (filters.gainLossGreaterThan !== undefined) params.gainLossGreaterThan = filters.gainLossGreaterThan
      if (filters.gainLossLessThan !== undefined) params.gainLossLessThan = filters.gainLossLessThan
      if (filters.returnPercentGreaterThan !== undefined) params.returnPercentGreaterThan = filters.returnPercentGreaterThan
      if (filters.dateAcquired) params.dateAcquired = filters.dateAcquired
    }
    
    const response = await http.get("/api/Investments", { params })
    return response.data
  } catch (error) {
    console.error("Error fetching investments:", error)
    throw error
  }
}

/**
 * Export investments to Excel with filters
 */
export async function exportInvestmentsToExcel(filters?: InvestmentFilters): Promise<void> {
  try {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.name) params.append('name', filters.name)
      if (filters.type) params.append('type', filters.type)
      if (filters.gainLossGreaterThan !== undefined) params.append('gainLossGreaterThan', filters.gainLossGreaterThan.toString())
      if (filters.gainLossLessThan !== undefined) params.append('gainLossLessThan', filters.gainLossLessThan.toString())
      if (filters.returnPercentGreaterThan !== undefined) params.append('returnPercentGreaterThan', filters.returnPercentGreaterThan.toString())
      if (filters.dateAcquired) params.append('dateAcquired', filters.dateAcquired)
    }

    const response = await http.get(`/api/Investments/export/excel?${params.toString()}`, {
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
    link.setAttribute('download', `investments-${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting investments:', error)
    throw error
  }
}

/**
 * Get all investments without pagination (for dropdowns)
 */
export async function getAllInvestments(): Promise<Investment[]> {
  try {
    const response = await http.get("/api/Investments", {
      params: { pageNumber: 0, pageSize: 10000 }
    })
    return response.data.data || []
  } catch (error) {
    console.error("Error fetching all investments:", error)
    throw error
  }
}

/**
 * Get a single investment by ID
 */
export async function getInvestmentById(id: number): Promise<Investment> {
  try {
    const response = await http.get(`/api/Investments/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching investment ${id}:`, error)
    throw error
  }
}

/**
 * Create a new investment
 */
export async function createInvestment(data: CreateInvestmentRequest): Promise<Investment> {
  try {
    const response = await http.post("/api/Investments", data)
    return response.data
  } catch (error) {
    console.error("Error creating investment:", error)
    throw error
  }
}

/**
 * Update an existing investment
 */
export async function updateInvestment(
  id: number,
  data: UpdateInvestmentRequest
): Promise<Investment> {
  try {
    const response = await http.put(`/api/Investments/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Error updating investment ${id}:`, error)
    throw error
  }
}

/**
 * Delete an investment
 */
export async function deleteInvestment(id: number): Promise<void> {
  try {
    await http.delete(`/api/Investments/${id}`)
  } catch (error) {
    console.error(`Error deleting investment ${id}:`, error)
    throw error
  }
}

/**
 * Get all investments for a specific user
 */
export async function getInvestmentsByUserId(userId: string): Promise<Investment[]> {
  try {
    const response = await http.get(`/api/Investments/user/${userId}`)
    return Array.isArray(response.data) ? response.data : response.data?.data || []
  } catch (error) {
    console.error(`Error fetching investments for user ${userId}:`, error)
    throw error
  }
}

/**
 * Get total investment value for a specific user
 */
export async function getTotalInvestmentValueByUserId(userId: string): Promise<TotalInvestmentValue> {
  try {
    const response = await http.get(`/api/Investments/user/${userId}/total-value`)
    return response.data
  } catch (error) {
    console.error(`Error fetching total investment value for user ${userId}:`, error)
    throw error
  }
}

/**
 * Get gain/loss for a specific investment
 */
export async function getInvestmentGainLoss(id: number): Promise<InvestmentGainLossResponse> {
  try {
    const response = await http.get(`/api/Investments/${id}/gain-loss`)
    return response.data
  } catch (error) {
    console.error(`Error fetching gain/loss for investment ${id}:`, error)
    throw error
  }
}
