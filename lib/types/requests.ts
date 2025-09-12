import { BaseDocument } from "../types"

export type RequestStatus = 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled'
export type RequestPriority = 'low' | 'medium' | 'high' | 'critical'

export interface RequestDocument {
  name: string
  url: string
  publicId: string
  type: string
  size: number
}

export interface RequestNote {
  id: string
  content: string
  createdBy: {
    id: string
    name: string
    role: string
  }
  createdAt: string
  updatedAt: string
}

export interface Request extends BaseDocument {
  title: string
  description: string
  status: RequestStatus
  priority: RequestPriority
  type: string
  category: string
  assignedTo?: {
    id: string
    name: string
    role: string
  }
  createdBy: {
    id: string
    name: string
    role: string
  }
  company: string
  dueDate?: string
  documents: RequestDocument[]
  notes: RequestNote[]
  metadata?: Record<string, any>
}

// For the requests table view
export interface RequestTableItem {
  id: string
  _id: string
  title: string
  status: RequestStatus
  priority: RequestPriority
  type: string
  category: string
  assignedTo?: string
  createdBy: string
  company: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

// For request filters
export interface RequestFilters {
  status?: RequestStatus[]
  priority?: RequestPriority[]
  type?: string[]
  category?: string[]
  assignedTo?: string[]
  createdBy?: string[]
  company?: string[]
  dateRange?: {
    from: string
    to: string
  }
  search?: string
}

// For request creation
export interface CreateRequestInput {
  title: string
  description: string
  priority: RequestPriority
  type: string
  category: string
  dueDate?: string
  documents?: File[]
  metadata?: Record<string, any>
}

// For request update
export interface UpdateRequestInput {
  title?: string
  description?: string
  status?: RequestStatus
  priority?: RequestPriority
  type?: string
  category?: string
  assignedTo?: string
  dueDate?: string | null
  metadata?: Record<string, any>
}

// For adding a note to a request
export interface AddNoteInput {
  requestId: string
  content: string
}

// For updating a note
export interface UpdateNoteInput {
  requestId: string
  noteId: string
  content: string
}

// For uploading documents to a request
export interface UploadDocumentsInput {
  requestId: string
  files: File[]
}
