// Dummy data for UI-only development
import type { User, Tender, Bid, Category, AnalyticsData, Notification } from "./types"

// Dummy Users/Companies
export const dummyUsers: User[] = [
  {
    id: "1",
    _id: "1",
    fullName: "Zelalem Tadesse",
    email: "zelalem.tadesse@gmail.com",
    phoneNumber: "+251911234567",
    profileImage: { url: "/placeholder-logo.png", publicId: "logo1" },
    status: "Active",
    role: "client",
    address: { country: "Ethiopia", city: "Addis Ababa" },
    description: "Visually impaired individual seeking legal assistance",
    createdBy: "admin",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    entitlement: {
      isActive: true,
      packageId: "premium",
      packageName: "Premium Package",
      endsAt: "2024-12-31T23:59:59Z"
    }
  },
  {
    id: "2",
    _id: "2",
    fullName: "Belaynesh Alemu",
    email: "belaynesh.alemu@gmail.com",
    phoneNumber: "+251922345678",
    profileImage: { url: "/placeholder-logo.png", publicId: "logo2" },
    status: "Active",
    role: "client",
    address: { country: "Ethiopia", city: "Bahir Dar" },
    description: "Person with mobility disability needing legal support",
    createdBy: "admin",
    createdAt: "2024-01-20T14:30:00Z",
    updatedAt: "2024-01-20T14:30:00Z"
  },
  {
    id: "3",
    _id: "3",
    fullName: "Dawit Bekele",
    email: "dawit.bekele@gmail.com",
    phoneNumber: "+251933456789",
    profileImage: { url: "/placeholder-logo.png", publicId: "logo3" },
    status: "Pending",
    role: "client",
    address: { country: "Ethiopia", city: "Dire Dawa" },
    description: "Deaf individual requiring accessible legal consultation",
    createdBy: "admin",
    createdAt: "2024-02-01T09:15:00Z",
    updatedAt: "2024-02-01T09:15:00Z"
  }
]

// Dummy Categories - Legal Service Categories for ELDA
export const dummyCategories: Category[] = [
  { id: "1", _id: "1", name: "Disability Rights", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "2", _id: "2", name: "Employment Law", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "3", _id: "3", name: "Social Security", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "4", _id: "4", name: "Accessibility Rights", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "5", _id: "5", name: "Family Law", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "6", _id: "6", name: "Property Rights", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "7", _id: "7", name: "Healthcare Rights", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
]

// Dummy Tenders
export const dummyTenders: Tender[] = [
  {
    id: "1",
    _id: "1",
    referenceNumber: "TND-2024-001",
    title: "Road Construction Project - Addis Ababa Ring Road",
    company: dummyUsers[0],
    category: dummyCategories[0],
    deadline: "2024-03-15T23:59:59Z",
    awardDate: "2024-03-20T10:00:00Z",
    createdBy: { _id: "admin1", fullName: "Admin User" },
    description: "Construction of 25km ring road around Addis Ababa with modern infrastructure including bridges, drainage systems, and street lighting.",
    documentPrice: 5000,
    isCPO: true,
    isTop: true,
    status: "open",
    documents: [
      { name: "Project_Specifications.pdf", url: "/docs/spec1.pdf", publicId: "doc1" },
      { name: "Technical_Requirements.docx", url: "/docs/tech1.docx", publicId: "doc2" }
    ],
    requiredDocumentTypes: ["business_license", "competency_certificate", "tin_certification"],
    CPO: {
      amount: 100000,
      dueDate: "2024-02-28T23:59:59Z",
      bankName: "Commercial Bank of Ethiopia",
      accountNumber: "1234567890"
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    _id: "2",
    referenceNumber: "TND-2024-002",
    title: "Hospital Management System Development",
    company: dummyUsers[1],
    category: dummyCategories[1],
    deadline: "2024-04-01T23:59:59Z",
    awardDate: "2024-04-05T10:00:00Z",
    createdBy: { _id: "admin1", fullName: "Admin User" },
    description: "Development of comprehensive hospital management system with patient records, billing, inventory management, and reporting modules.",
    documentPrice: 2500,
    isCPO: false,
    isTop: false,
    status: "open",
    documents: [
      { name: "System_Requirements.pdf", url: "/docs/sys_req.pdf", publicId: "doc3" }
    ],
    requiredDocumentTypes: ["business_license", "national_id"],
    createdAt: "2024-01-20T14:30:00Z",
    updatedAt: "2024-01-20T14:30:00Z"
  },
  {
    id: "3",
    _id: "3",
    referenceNumber: "TND-2024-003",
    title: "Office Supply and Equipment Procurement",
    company: dummyUsers[2],
    category: dummyCategories[3],
    deadline: "2024-02-28T23:59:59Z",
    awardDate: "2024-03-05T10:00:00Z",
    createdBy: { _id: "admin1", fullName: "Admin User" },
    description: "Procurement of office furniture, computers, printers, and other essential office equipment for new branch offices.",
    documentPrice: 1000,
    isCPO: true,
    isTop: false,
    status: "closed",
    documents: [
      { name: "Equipment_List.xlsx", url: "/docs/equipment.xlsx", publicId: "doc4" },
      { name: "Quality_Standards.pdf", url: "/docs/quality.pdf", publicId: "doc5" }
    ],
    requiredDocumentTypes: ["business_license", "tin_certification", "bank_statement"],
    CPO: {
      amount: 25000,
      dueDate: "2024-02-20T23:59:59Z",
      bankName: "Dashen Bank",
      accountNumber: "9876543210"
    },
    createdAt: "2024-02-01T09:15:00Z",
    updatedAt: "2024-02-01T09:15:00Z"
  }
]

// Dummy Bids
export const dummyBids: Bid[] = [
  {
    id: "1",
    _id: "1",
    cpo: { isPaid: true, transactionId: "TXN-001-2024" },
    user: {
      _id: "1",
      fullName: "Ethio Construction PLC",
      email: "contact@ethioconstruction.com",
      phoneNumber: "+251911234567"
    },
    tender: {
      _id: "1",
      title: "Road Construction Project - Addis Ababa Ring Road",
      id: "1",
      company: { _id: "1", fullName: "Ethio Construction PLC", id: "1" },
      category: { _id: "1", name: "Construction", id: "1" },
      createdBy: { _id: "admin1", fullName: "Admin User" },
      updatedBy: { _id: "admin1", fullName: "Admin User" }
    },
    documents: [
      { url: "/docs/bid_proposal.pdf", publicId: "bid1", name: "Bid_Proposal.pdf" },
      { url: "/docs/company_profile.pdf", publicId: "bid2", name: "Company_Profile.pdf" }
    ],
    requiredDocuments: [
      { name: "Business_License.pdf", url: "/docs/license.pdf", publicId: "req1" },
      { name: "Competency_Certificate.pdf", url: "/docs/competency.pdf", publicId: "req2" }
    ],
    status: "under_review",
    isAwarded: false,
    submittedAt: "2024-02-10T15:30:00Z",
    createdAt: "2024-02-10T15:30:00Z",
    updatedAt: "2024-02-10T15:30:00Z"
  },
  {
    id: "2",
    _id: "2",
    cpo: { isPaid: false, transactionId: "" },
    user: {
      _id: "2",
      fullName: "Nile Engineering Solutions",
      email: "info@nileeng.com",
      phoneNumber: "+251922345678"
    },
    tender: {
      _id: "2",
      title: "Hospital Management System Development",
      id: "2",
      company: { _id: "2", fullName: "Nile Engineering Solutions", id: "2" },
      category: { _id: "2", name: "IT Services", id: "2" },
      createdBy: { _id: "admin1", fullName: "Admin User" },
      updatedBy: { _id: "admin1", fullName: "Admin User" }
    },
    documents: [
      { url: "/docs/technical_proposal.pdf", publicId: "bid3", name: "Technical_Proposal.pdf" }
    ],
    requiredDocuments: [
      { name: "Business_License.pdf", url: "/docs/license2.pdf", publicId: "req3" }
    ],
    status: "awarded",
    isAwarded: true,
    submittedAt: "2024-02-15T11:20:00Z",
    createdAt: "2024-02-15T11:20:00Z",
    updatedAt: "2024-02-20T16:45:00Z"
  }
]

// Dummy Analytics
export const dummyAnalytics: AnalyticsData = {
  totalRevenue: 125000,
  documentSales: 45000,
  subscriptionRevenue: 80000,
  totalBids: 156,
  period: "2024-Q1"
}

// Dummy Notifications
export const dummyNotifications: Notification[] = [
  {
    id: "1",
    _id: "1",
    user: "1",
    title: "New Tender Available",
    body: "A new construction tender has been posted. Check it out!",
    read: false,
    createdAt: "2024-02-25T10:30:00Z",
    updatedAt: "2024-02-25T10:30:00Z"
  },
  {
    id: "2",
    _id: "2",
    user: "1",
    title: "Bid Status Update",
    body: "Your bid for Hospital Management System has been awarded!",
    read: true,
    createdAt: "2024-02-20T16:45:00Z",
    updatedAt: "2024-02-21T09:15:00Z"
  }
]

// Pagination helper
export const createPaginatedResponse = <T>(data: T[], page: number = 1, limit: number = 10) => {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedData = data.slice(startIndex, endIndex)
  
  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit),
      hasNextPage: endIndex < data.length,
      hasPrevPage: page > 1
    }
  }
}

// Simulate API delay for realistic UI behavior
export const simulateApiDelay = (ms: number = 800) => 
  new Promise(resolve => setTimeout(resolve, ms))

// API Response wrapper
export const createApiResponse = <T>(data: T, message: string = "Success") => ({
  data,
  message,
  success: true
})
