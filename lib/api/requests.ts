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
    before?: string
    after?: string
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
    before?: string
    after?: string
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
    console.debug("[Requests API] Raw data received:", data);
    console.debug("[Requests API] Raw files received:", files);
    
    // Safety check
    if (!data) {
      console.error("[Requests API] No data provided!");
      throw new Error("No data provided for request creation");
    }
    
    const formData = new FormData();
    
    // Add form fields - ensure all required fields are present
    formData.append('priority', (data as any).priority || 'medium');
    formData.append('disability_type', (data as any).disability_type || 'other');
    formData.append('service_type', (data as any).service_type || 'internet');
    formData.append('description', (data as any).description || '');
    formData.append('contact_method', (data as any).contact_method || 'email');
    formData.append('remarks', (data as any).remarks || '');
    formData.append('is_confidential', String((data as any).is_confidential || false));
    
    // Add files if provided (0-5 files) - use 'files' as the key
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append('files', file);
      });
    }
    
    // Debug FormData contents BEFORE sending
    console.debug("[Requests API] FormData contents BEFORE sending:");
    console.debug("FormData entries:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.debug(`  ${key}:`, `File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.debug(`  ${key}:`, value);
      }
    }
    
    // Also log FormData as object for easier inspection
    const formDataObj: Record<string, any> = {};
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        formDataObj[key] = `File(${value.name}, ${value.size} bytes, ${value.type})`;
      } else {
        formDataObj[key] = value;
      }
    }
    console.debug("[Requests API] FormData as object:", formDataObj);
    
    console.debug("[Requests API] Creating request with processed data:", {
      priority: (data as any).priority,
      disability_type: (data as any).disability_type,
      service_type: (data as any).service_type,
      description: (data as any).description,
      contact_method: (data as any).contact_method,
      remarks: (data as any).remarks,
      is_confidential: (data as any).is_confidential,
      fileCount: files?.length || 0
    });
    
    // Make FormData available in console for manual inspection
    (window as any).debugFormData = formData;
    console.debug("[Requests API] FormData available as window.debugFormData for manual inspection");
    
    console.debug("[Requests API] About to send POST request to /requests");
    console.debug("[Requests API] Request headers:", {
      'Content-Type': 'multipart/form-data'
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
  
  // Patch request (admin only) - assign to lawyer or change status
  patchRequest: (id: string, data: {
    assigned_to_user_id?: string
    priority?: string
    remarks?: string
    status?: string
  }) => api.patch<ApiResponse<Request>>(`/requests/${id}`, data),
  
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
    }>>('/requests/stats'),
  
  // Get lawyers for assignment (admin only)
  getLawyers: () => 
    api.get<ApiResponse<Array<{
      _id: string
      name: string
      email: string
      role: string
    }>>>('/users?role=lawyer').catch(() => {
      // Fallback: return empty array if endpoint doesn't exist
      console.warn("[Requests API] Lawyers endpoint not available, using empty array");
      return { data: { data: [] } };
    })
}
