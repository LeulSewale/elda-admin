import { BaseDocument } from "../types"

export type RequestStatus = 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled'
export type RequestPriority = 'low' | 'medium' | 'high' | 'critical'

export interface RequestDocument {
  id?: string
  name: string
  url?: string
  publicId?: string
  type?: string
  size?: number
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
  id: string
  user_id: string
  assigned_to_user_id: string | null
  assigned_at: string | null
  status: RequestStatus
  priority: RequestPriority
  disability_type: string
  service_type: string
  description: string
  contact_method: string
  remarks: string | null
  is_confidential?: boolean
  is_for_other?: boolean
  // Self person details (when is_for_other is false)
  sex?: string
  region?: string
  city?: string
  sub_city?: string
  kebele?: string
  age?: number | null
  // Other person details (when is_for_other is true)
  other_name?: string | null
  other_sex?: string | null
  other_age?: number | null
  other_phone_1?: string | null
  other_phone_2?: string | null
  other_region?: string | null
  other_city?: string | null
  other_subcity?: string | null
  other_kebele?: string | null
  created_at: string
  updated_at: string
  created_by_name: string
  created_by_email: string
  assigned_to_name: string | null
  assigned_to_email: string | null
  attachment_count?: string | number
  rep_attachment_id: string | null
  // Legacy fields for backward compatibility
  title?: string
  type?: string
  category?: string
  assignedTo?: {
    id: string
    name: string
    role: string
  }
  createdBy?: {
    id: string
    name: string
    role: string
  }
  company?: string
  dueDate?: string
  documents?: RequestDocument[]
  notes?: RequestNote[]
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
