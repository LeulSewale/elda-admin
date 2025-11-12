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
  
  // Get request attachments (admin only)
  getRequestAttachments: (requestId: string) => api.get<ApiResponse<Array<{
    id: string
    original_name: string
    title: string
    mime_type: string
    size: string
    created_at: string
    download_path: string
    preview_path: string | null
    thumbnail_path: string | null
  }>>>(`/requests/${requestId}/attachments`),
  
  // Create a new request with file upload support
  createRequest: (data: CreateRequestInput, files?: File[], titles?: string[]) => {
    console.debug("[Requests API] Raw data received:", data);
    console.debug("[Requests API] Raw files received:", files);
    console.debug("[Requests API] Raw titles received:", titles);
    
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
    // Only append remarks if it has a value (not empty string)
    if ((data as any).remarks && String((data as any).remarks).trim()) {
      formData.append('remarks', String((data as any).remarks));
    }
    formData.append('is_confidential', String((data as any).is_confidential || false));
    
    // Add request_for field and is_for_other
    const requestFor = (data as any).request_for || 'self';
    if (requestFor) {
      formData.append('request_for', requestFor);
    }
    // Add is_for_other field (true if request_for is 'other', false otherwise)
    formData.append('is_for_other', requestFor === 'other' ? 'true' : 'false');
    
    // Add self details if request is for self
    if (requestFor === 'self') {
      // Always send required fields (validation ensures they're not empty)
      if ((data as any).sex !== undefined && (data as any).sex !== null) {
        formData.append('sex', String((data as any).sex));
      }
      if ((data as any).region !== undefined && (data as any).region !== null) {
        formData.append('region', String((data as any).region));
      }
      if ((data as any).city !== undefined && (data as any).city !== null) {
        formData.append('city', String((data as any).city));
      }
      if ((data as any).sub_city !== undefined && (data as any).sub_city !== null) {
        formData.append('sub_city', String((data as any).sub_city));
      }
      if ((data as any).kebele !== undefined && (data as any).kebele !== null) {
        formData.append('kebele', String((data as any).kebele));
      }
      if ((data as any).age !== null && (data as any).age !== undefined) {
        formData.append('age', String((data as any).age));
      }
    }
    
    // Add other person details if request is for other person
    if (requestFor === 'other') {
      // Always send required fields (validation ensures they're not empty)
      if ((data as any).other_name !== undefined && (data as any).other_name !== null) {
        formData.append('other_name', String((data as any).other_name));
      }
      if ((data as any).other_sex !== undefined && (data as any).other_sex !== null) {
        formData.append('other_sex', String((data as any).other_sex));
      }
      if ((data as any).other_region !== undefined && (data as any).other_region !== null) {
        formData.append('other_region', String((data as any).other_region));
      }
      if ((data as any).other_city !== undefined && (data as any).other_city !== null) {
        formData.append('other_city', String((data as any).other_city));
      }
      if ((data as any).other_subcity !== undefined && (data as any).other_subcity !== null) {
        formData.append('other_subcity', String((data as any).other_subcity));
      }
      if ((data as any).other_kebele !== undefined && (data as any).other_kebele !== null) {
        formData.append('other_kebele', String((data as any).other_kebele));
      }
      if ((data as any).other_age !== null && (data as any).other_age !== undefined) {
        formData.append('other_age', String((data as any).other_age));
      }
      // Handle other_phone - split by comma if it contains multiple phone numbers
      if ((data as any).other_phone !== undefined && (data as any).other_phone !== null && String((data as any).other_phone).trim()) {
        const phoneNumbers = String((data as any).other_phone).split(',').map(p => p.trim()).filter(p => p);
        if (phoneNumbers.length > 0) {
          formData.append('other_phone_1', phoneNumbers[0]);
        }
        if (phoneNumbers.length > 1) {
          formData.append('other_phone_2', phoneNumbers[1]);
        }
      }
    }
    
    // Add files if provided (0-5 files) - use 'files' as the key
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append('files', file);
      });
    }
    
    // Add titles array if files are provided - send as JSON string array to match API format
    // Titles array must match the order of files (first file = first title, etc.)
    if (files && files.length > 0) {
      // Ensure titles array matches files array length exactly
      // If titles provided, use them (pad with empty strings if shorter, truncate if longer)
      // If no titles provided, use empty strings for all files
      // Ensure titles match files order exactly and trim any extra spaces
      const finalTitles = files.map((_, index) => {
        if (titles && titles[index] !== undefined) {
          return String(titles[index] || '').trim();
        }
        return '';
      });
      formData.append('titles', JSON.stringify(finalTitles));
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
      request_for: requestFor,
      is_for_other: requestFor === 'other' ? 'true' : 'false',
      fileCount: files?.length || 0,
      titlesCount: titles?.length || 0,
      titles: files && files.length > 0 
        ? files.map((_, index) => titles?.[index] || '')
        : []
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
  
  // Download a document from a request
  downloadDocument: (requestId: string, documentId: string) =>
    api.get(`/requests/${requestId}/documents/${documentId}/download`, {
      responseType: 'blob',
    }),
  
  // Download attachment by path (from API response)
  downloadAttachmentByPath: (downloadPath: string) => {
    // download_path is like "/api/v1/requests/.../attachments/.../download"
    // axios baseURL is "https://elda-backend.onrender.com/api/v1"
    // When path starts with /, axios treats it as absolute and ignores baseURL
    // So we need to remove /api/v1 from the path to make it relative to baseURL
    let path = downloadPath
    
    if (downloadPath.startsWith('/api/v1/')) {
      // Remove /api/v1 prefix since api instance already has baseURL with /api/v1
      // This makes it relative to baseURL: /requests/.../attachments/.../download
      path = downloadPath.replace('/api/v1', '')
    } else if (downloadPath.startsWith('/')) {
      // Path starts with /, use as is
      path = downloadPath
    } else {
      // Relative path, add leading slash
      path = `/${downloadPath}`
    }
    
    console.debug("[Requests API] Download path:", { 
      original: downloadPath, 
      processed: path, 
      baseURL: api.defaults.baseURL,
      expectedFullURL: path.startsWith('/') && !path.startsWith('/api/v1')
        ? `${api.defaults.baseURL}${path}`
        : (path.startsWith('/api/v1')
          ? `https://elda-backend.onrender.com${path}`
          : `${api.defaults.baseURL}${path}`)
    })
    
    return api.get(path, {
      responseType: 'blob',
    })
  },
  
  // Download attachment by attachment ID
  downloadAttachment: (attachmentId: string) =>
    api.get(`/requests/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    }),
  
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
