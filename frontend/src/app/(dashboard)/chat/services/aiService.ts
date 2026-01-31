import { http } from "@/services/http"

export interface AiChatRequest {
  userId: string
  chatSessionId?: number | null
  message: string
  botType?: number
}

export interface AiChatResponse {
  data: {
    sessionId: number
    response: string
    timestamp: string
  }
  message: string
  status: boolean
}

export interface AiHistoryResponse {
  data: Array<{
    sessionId: number
    messages: Array<{
      role: string
      content: string
      timestamp: string
    }>
  }>
  message: string
  status: boolean
}

export interface AiSessionResponse {
  data: {
    sessionId: number
    userId: string
    messages: Array<{
      role: string
      content: string
      timestamp?: string
      createdAt?: string
    }>
    createdAt: string
    updatedAt?: string
  }
  message: string
  status: boolean
}

export interface AiSessionsResponse {
  data: Array<{
    chatSessionId: number
    title: string
    createdAt: string
    messageCount: number
  }>
  message: string
  status: boolean
}

export async function sendAiMessage(request: AiChatRequest): Promise<any> {
  try {
    console.log("=== AI Service: Sending message ===")
    console.log("Request payload:", JSON.stringify(request, null, 2))
    
    const response = await http.post("/api/Ai/chat", request)
    
    console.log("=== AI Service: Response received ===")
    console.log("Full response:", JSON.stringify(response, null, 2))
    
    // Validate response structure
    if (!response) {
      console.error("Response is null or undefined")
      throw new Error("No response from server")
    }
    
    if (typeof response !== 'object') {
      console.warn("Response is not an object:", typeof response)
      return response
    }
    
    // Log response structure for debugging
    console.log("Response status:", response.status)
    console.log("Response data:", response.data)
    
    return response
  } catch (error) {
    console.error("=== AI Service: Error sending message ===")
    console.error("Error details:", error)
    
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    
    throw error
  }
}

export async function getAiHistory(): Promise<AiHistoryResponse> {
  try {
    const response = await http.get<any, AiHistoryResponse>("/api/Ai/history")
    return response
  } catch (error) {
    console.error("Error fetching AI history:", error)
    throw error
  }
}

export async function getAiSession(sessionId: number): Promise<AiSessionResponse> {
  try {
    const response = await http.get<any, AiSessionResponse>(`/api/Ai/session/${sessionId}`)
    return response
  } catch (error) {
    console.error("Error fetching AI session:", error)
    throw error
  }
}

export async function getAiSessions(): Promise<AiSessionsResponse> {
  try {
    const response = await http.get<any, AiSessionsResponse>("/api/Ai/sessions")
    return response
  } catch (error) {
    console.error("Error fetching AI sessions:", error)
    throw error
  }
}

export async function deleteAiSession(sessionId: number): Promise<void> {
  try {
    await http.delete(`/api/Ai/session/${sessionId}`)
  } catch (error) {
    console.error("Error deleting AI session:", error)
    throw error
  }
}
