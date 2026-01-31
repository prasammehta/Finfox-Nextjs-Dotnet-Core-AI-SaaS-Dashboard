import { http, getAssetUrl } from "./http"
import { BillCompany, CreateBillCompanyRequest, UpdateBillCompanyRequest } from "@/types/schema"

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
 * Helper function to add full URLs to logo assets
 */
const addLogoUrl = (company: BillCompany | null): BillCompany | null => {
  if (!company) return null
  return {
    ...company,
    logoUrl: company.logoUrl ? getAssetUrl(company.logoUrl) : null,
  }
}

export interface BillCompanyFilters {
  name?: string
  email?: string
  gstin?: string
}

/**
 * Get all bill companies with pagination and filtering
 */
export async function getBillCompanies(pageNumber = 0, pageSize = 10, filters?: BillCompanyFilters): Promise<PaginationResponse<BillCompany>> {
  try {
    const params: any = { pageNumber, pageSize }
    
    if (filters) {
      if (filters.name) params.name = filters.name
      if (filters.email) params.email = filters.email
      if (filters.gstin) params.gstin = filters.gstin
    }
    
    const response = await http.get("/api/BillCompany", { params })
    return {
      ...response.data,
      data: response.data.data.map((c: BillCompany | null) => addLogoUrl(c)).filter((c: BillCompany | null) => c !== null) as BillCompany[]
    }
  } catch (error) {
    console.error("Error fetching bill companies:", error)
    throw error
  }
}

/**
 * Export bill companies to Excel with filters
 */
export async function exportBillCompaniesToExcel(filters?: BillCompanyFilters): Promise<void> {
  try {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.name) params.append('name', filters.name)
      if (filters.email) params.append('email', filters.email)
      if (filters.gstin) params.append('gstin', filters.gstin)
    }

    const response = await http.get(`/api/BillCompany/export/excel?${params.toString()}`, {
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
    link.setAttribute('download', `bill-companies-${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting bill companies:', error)
    throw error
  }
}

/**
 * Get all bill companies without pagination (for dropdowns)
 */
export async function getAllBillCompanies(): Promise<BillCompany[]> {
  try {
    const response = await http.get("/api/BillCompany", {
      params: { pageNumber: 0, pageSize: 10000 }
    })
    return (response.data.data || []).map((c: BillCompany | null) => addLogoUrl(c)).filter((c: BillCompany | null) => c !== null) as BillCompany[]
  } catch (error) {
    console.error("Error fetching all bill companies:", error)
    throw error
  }
}

/**
 * Get a single bill company by ID
 */
export async function getBillCompanyById(id: number): Promise<BillCompany> {
  try {
    const responseData = await http.get<BillCompany>(`/api/BillCompany/${id}`)
    const company = addLogoUrl(responseData as unknown as BillCompany | null)
    if (!company) throw new Error("Invalid company data")
    return company
  } catch (error) {
    console.error(`Error fetching bill company ${id}:`, error)
    throw error
  }
}

/**
 * Create a new bill company
 */
export async function createBillCompany(data: CreateBillCompanyRequest): Promise<BillCompany> {
  try {
    const responseData = await http.post<BillCompany>("/api/BillCompany", data)
    const company = addLogoUrl(responseData as unknown as BillCompany | null)
    if (!company) throw new Error("Invalid company data")
    return company
  } catch (error) {
    console.error("Error creating bill company:", error)
    throw error
  }
}

/**
 * Update an existing bill company
 */
export async function updateBillCompany(id: number, data: UpdateBillCompanyRequest): Promise<BillCompany> {
  try {
    const responseData = await http.put<BillCompany>(`/api/BillCompany/${id}`, data)
    const company = addLogoUrl(responseData as unknown as BillCompany | null)
    if (!company) throw new Error("Invalid company data")
    return company
  } catch (error) {
    console.error(`Error updating bill company ${id}:`, error)
    throw error
  }
}

/**
 * Delete a bill company
 */
export async function deleteBillCompany(id: number): Promise<void> {
  try {
    await http.delete(`/api/BillCompany/${id}`)
  } catch (error) {
    console.error(`Error deleting bill company ${id}:`, error)
    throw error
  }
}

/**
 * Get all bill companies for a specific user
 */
export async function getBillCompaniesByUserId(userId: string): Promise<BillCompany[]> {
  try {
    const companies = await http.get(`/api/BillCompany/user/${userId}`)
    const companiesArray = Array.isArray(companies) ? companies : companies?.data || []
    return companiesArray.map((bc: BillCompany | null) => addLogoUrl(bc)).filter((c: BillCompany | null) => c !== null) as BillCompany[]
  } catch (error) {
    console.error(`Error fetching bill companies for user ${userId}:`, error)
    throw error
  }
}

/**
 * Upload company logo
 */
export async function uploadBillCompanyLogo(id: number, file: File): Promise<BillCompany> {
  try {
    const formData = new FormData()
    formData.append("file", file)
    
    const response = await http.post(`/api/BillCompany/${id}/upload-logo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    const company = addLogoUrl(response.data)
    if (!company) throw new Error("Invalid company data")
    return company
  } catch (error) {
    console.error(`Error uploading logo for bill company ${id}:`, error)
    throw error
  }
}

/**
 * Delete company logo
 */
export async function deleteBillCompanyLogo(id: number): Promise<void> {
  try {
    await http.delete(`/api/BillCompany/${id}/delete-logo`)
  } catch (error) {
    console.error(`Error deleting logo for bill company ${id}:`, error)
    throw error
  }
}
