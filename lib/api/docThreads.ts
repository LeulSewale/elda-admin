import { api } from "../axios"

export interface DocThread {
  id: string
  subject: string
  user_id: string
  created_by: string
  status: string
  last_document_at: string
  created_at: string
  updated_at: string
  user_name: string
  user_email: string
  created_by_name: string
  created_by_email: string
}

export interface DocThreadsResponse {
  data: DocThread[]
  paging: {
    limit: number
    nextCursor?: string
    prevCursor?: string
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface Document {
  id: string
  thread_id: string
  original_name: string
  title: string
  mime_type: string
  size: string
  owner: {
    id: string
    name: string
    email: string
  }
  created_at: string
  updated_at: string
  download_path: string
  preview_path: string
  thumbnail_path: string
}

export interface DocumentsResponse {
  data: Document[]
  paging: {
    limit: number
    nextCursor?: string
    prevCursor?: string
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export const docThreadsApi = {
  list: (params?: { cursor?: string; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.cursor) searchParams.set("cursor", params.cursor)
    if (params?.limit) searchParams.set("limit", String(params.limit))
    const qs = searchParams.toString()
    const url = qs ? `/doc-threads?${qs}` : `/doc-threads`
    return api.get<DocThreadsResponse>(url)
  },
  create: (data: { subject: string; user_id?: string }) => api.post<DocThread>(`/doc-threads`, data),
  getById: (id: string) => api.get<{ data: DocThread }>(`/doc-threads/${id}`),
  delete: (id: string) => api.delete<{ id: string }>(`/doc-threads/${id}`),
  
  // Document management endpoints
  getDocuments: (threadId: string, params?: { cursor?: string; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.cursor) searchParams.set("cursor", params.cursor)
    if (params?.limit) searchParams.set("limit", String(params.limit))
    const qs = searchParams.toString()
    const url = qs ? `/doc-threads/${threadId}/documents?${qs}` : `/doc-threads/${threadId}/documents`
    return api.get<DocumentsResponse>(url)
  },
  uploadDocument: (threadId: string, formData: FormData) => 
    api.post<{ data: Document }>(`/doc-threads/${threadId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  deleteDocument: (threadId: string, documentId: string) =>
    api.delete<{ id: string }>(`/doc-threads/${threadId}/documents/${documentId}`),
}


