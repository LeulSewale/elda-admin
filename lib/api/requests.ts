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
  data: T
  paging?: {
    limit: number
    nextCursor?: string
    prevCursor?: string
    hasNextPage: boolean
    hasPrevPage: boolean
  }
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
  // Get all requests (admin only)
  getAllRequests: (params?: {
    limit?: number
    cursor?: string
    status?: string[]
    priority?: string[]
    disability_type?: string[]
    service_type?: string[]
    assigned_to_user_id?: string[]
    created_by?: string[]
    startDate?: string
    endDate?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => api.get<ApiResponse<RequestTableItem[]>>("/requests", { params }),
  
  // Get my requests (user/lawyer)
  getMyRequests: (params?: {
    limit?: number
    cursor?: string
    status?: string[]
    priority?: string[]
    disability_type?: string[]
    service_type?: string[]
    startDate?: string
    endDate?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => api.get<ApiResponse<RequestTableItem[]>>("/requests/mine", { params }),
  
  // Get a single request by ID
  getRequest: (id: string) => api.get<ApiResponse<Request>>(`/requests/${id}`),
  
  // Create a new request with file upload support
  createRequest: (data: CreateRequestInput, files?: File[]) => {
    const formData = new FormData();
    
    // Add form fields
    formData.append('priority', data.priority || 'medium');
    formData.append('disability_type', (data as any).disability_type || 'other');
    formData.append('service_type', (data as any).service_type || 'internet');
    formData.append('description', data.description || '');
    formData.append('contact_method', (data as any).contact_method || 'email');
    formData.append('remarks', (data as any).remarks || '');
    formData.append('is_confidential', String((data as any).is_confidential || false));
    
    // Add files if provided (0-5 files)
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append('files', file);
      });
    }
    
    console.debug("[Requests API] Creating request with FormData:", {
      priority: data.priority,
      disability_type: (data as any).disability_type,
      service_type: (data as any).service_type,
      description: data.description,
      contact_method: (data as any).contact_method,
      remarks: (data as any).remarks,
      is_confidential: (data as any).is_confidential,
      fileCount: files?.length || 0
    });
    
    return api.post<ApiResponse<Request>>("/requests", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
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
  }) => api.get<ApiResponse<PaginatedResponse<RequestTableItem>>>("/requests/assigned", { params }),
  
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
