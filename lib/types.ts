// types.ts

// 🔁 Reusable base type for documents from MongoDB
export interface BaseDocument {
  id: string
  _id?: string
  createdAt: string
  updatedAt: string
}

// ✅ Reusable enums
export type StatusType = "Active" | "Suspended" | "Locked";
export type RequestType = "Company Verification" | "Tender Request"
export type RequestStatus = "Pending" | "Approved" | "Rejected"
export type UserRole = "admin" | "lawyer" | "user" | "HR-manager";

// ✅ Document type
export interface Document {
  name: string
  url: string
  publicId: string
}

// ✅ Logo type
export interface Logo {
  url: string
  publicId: string
}

// ✅ Address
export interface Address {
  country: string
  city: string
}

// ✅ User
export interface User extends BaseDocument {
  fullName: string
  email: string
  phoneNumber: string 
  profileImage:Logo
  status: StatusType
  role: UserRole
  company?: string // For lawyer and user roles
  address: Address
  description: string
  createdBy: string
  is_active?: boolean // Backend API field (alternative to status)
  name?: string // Alternative field name from API
  phone?: string // Alternative field name from API
  created_at?: string // Alternative field name from API
  // documents?: Document[]
  entitlement?: {
    isActive: boolean
    packageId: string
    packageName: string
    endsAt: string
  }
}

// ✅ Category
export interface Category extends BaseDocument {
  name: string
}

// ✅ Company
// export interface Company extends BaseDocument {
//   name: string
//   email: string
//   phoneNumber: string
//   address: Address
//   description: string
//   logo: Logo
//   createdBy: string
// }

// ✅ Tender
export interface Tender extends BaseDocument {
  referenceNumber: string
  title: string
  company: User | string
  category: Category | string
  deadline: string
  awardDate: string
  createdBy: {
    _id: string
    fullName: string
  }
  description: string
  documentPrice: number
  isCPO: boolean
  isTop?: boolean
  status: string
  documents: Document[]
  requiredDocumentTypes: string[]
  CPO?: {
    amount: number
    dueDate: string
    bankName: string
    accountNumber: string
  }
}

// ✅ Bid
export interface Bid extends BaseDocument {
  cpo: {
    isPaid: boolean
    transactionId: string
  }
  user: {
    _id: string
    fullName: string
    email: string
    phoneNumber: string
  }
  tender: {
    _id: string
    title: string
    id: string
    company: {
      _id: string
      fullName: string
      id: string
    }
    category: {
      _id: string
      name: string
      id: string
    }
    createdBy: {
      _id: string
      fullName: string
    }
    updatedBy: {
      _id: string
      fullName: string
    }
  }
  // Documents uploaded by the bidder for this bid
  documents?: Array<{
    url: string
    publicId: string
    _id?: string
    id?: string
    name?: string
  }>
  requiredDocuments: Document[]
  status: string
  isAwarded: boolean
  submittedAt: string
}

// ✅ Request
export interface Request extends BaseDocument {
  type: RequestType
  requester: string
  description: string
  status: RequestStatus
}

// ✅ Analytics
export interface AnalyticsData {
  totalRevenue: number
  documentSales: number
  subscriptionRevenue: number
  totalBids: number
  period: string
}

// ✅ Notification
export interface Notification {
  id: string
  _id?: string
  user_id: string
  type: string
  title: string
  body: string
  data?: Record<string, any>
  link?: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
  createdAt?: string // Compatibility field
  read?: boolean // Compatibility field
}

// ✅ Generic API responses
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
