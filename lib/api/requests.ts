import { api } from "../axios"
import { 
  Request, 
  RequestTableItem, 
  CreateRequestInput, 
  UpdateRequestInput,
  AddNoteInput,
  UpdateNoteInput,
  RequestDocument,
  RequestNote
} from "@/lib/types/requests"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  error?: string
  statusCode?: number
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const requestsApi = {
  // Get requests with filters and pagination
  getRequests: (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string[]
    priority?: string[]
    type?: string[]
    category?: string[]
    assignedTo?: string[]
    createdBy?: string[]
    company?: string[]
    startDate?: string
    endDate?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => api.get<ApiResponse<PaginatedResponse<RequestTableItem>>>("/requests", { params }),
  
  // Get a single request by ID
  getRequest: (id: string) => api.get<ApiResponse<Request>>(`/requests/${id}`),
  
  // Create a new request
  createRequest: (data: CreateRequestInput) => api.post<ApiResponse<Request>>("/requests", data),
  
  // Update an existing request
  updateRequest: (id: string, data: UpdateRequestInput) => 
    api.put<ApiResponse<Request>>(`/requests/${id}`, data),
  
  // Delete a request
  deleteRequest: (id: string) => api.delete<ApiResponse<{ id: string }>>(`/requests/${id}`),
  
  // Get requests assigned to the current user
  getMyAssignedRequests: (params?: {
    page?: number
    limit?: number
    status?: string[]
  }) => api.get<ApiResponse<PaginatedResponse<RequestTableItem>>>("/requests/assigned-to-me", { params }),
  
  // Get requests created by the current user
  getMyCreatedRequests: (params?: {
    page?: number
    limit?: number
    status?: string[]
  }) => api.get<ApiResponse<PaginatedResponse<RequestTableItem>>>("/requests/my-requests", { params }),
  
  // Add a note to a request
  addNote: ({ requestId, content }: AddNoteInput) => 
    api.post<ApiResponse<RequestNote>>(`/requests/${requestId}/notes`, { content }),
  
  // Update a note
  updateNote: ({ requestId, noteId, content }: UpdateNoteInput) => 
    api.put<ApiResponse<RequestNote>>(`/requests/${requestId}/notes/${noteId}`, { content }),
  
  // Delete a note
  deleteNote: (requestId: string, noteId: string) => 
    api.delete<ApiResponse<{ id: string }>>(`/requests/${requestId}/notes/${noteId}`),
  
  // Upload documents to a request
  uploadDocuments: (requestId: string, formData: FormData) =>
    api.post<ApiResponse<RequestDocument[]>>(`/requests/${requestId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // Delete a document from a request
  deleteDocument: (requestId: string, documentId: string) =>
    api.delete<ApiResponse<{ id: string }>>(`/requests/${requestId}/documents/${documentId}`),
  
  // Change request status
  changeStatus: (requestId: string, status: string, comment?: string) =>
    api.post<ApiResponse<Request>>(`/requests/${requestId}/status`, { status, comment }),
  
  // Assign request to a user
  assignRequest: (requestId: string, userId: string) =>
    api.post<ApiResponse<Request>>(`/requests/${requestId}/assign`, { userId }),
  
  // Get request statistics
  getStats: () => 
    api.get<ApiResponse<{
      total: number
      byStatus: Record<string, number>
      byPriority: Record<string, number>
      byType: Record<string, number>
      byCategory: Record<string, number>
    }>>('/requests/stats')
}
