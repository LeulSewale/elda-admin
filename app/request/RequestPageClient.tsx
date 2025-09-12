"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter, Download, MoreVertical, Mail, Phone, MapPin, User, FileText, Calendar, Clock } from "lucide-react"
import { DataTable } from "@/components/data-table/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RequestDetailDialog } from "@/components/request/request-detail-dialog"
import { CreateRequestModal } from "@/components/modals/create-request-modal"

// Types for our request data
type Request = {
  id: string
  requestNumber: string
  serviceType: string
  requestType: string
  requestedBy: string
  requestedDate: Date
  status: "pending" | "in_progress" | "completed" | "rejected"
  priority: "low" | "medium" | "high"
}

// Dummy data - ELDA Legal Services Requests
const dummyRequests = [
  {
    id: "1",
    requestNumber: "ELDA-2024-001",
    serviceType: "Disability Rights Advocacy",
    requestType: "Discrimination Case",
    description: "I was denied employment at a government office due to my visual impairment, despite being qualified for the position. I need legal assistance to file a discrimination complaint and seek justice.",
    requestedBy: "Zelalem Tadesse",
    requestedDate: new Date(2024, 2, 15),
    updatedAt: new Date(2024, 2, 15),
    status: "pending",
    priority: "high",
    user: {
      id: "user1",
      name: "Zelalem Tadesse",
      email: "zelalem.tadesse@gmail.com",
      phone: "+251911234567",
      address: "Kirkos Sub-city, Woreda 08, House No. 123, Addis Ababa, Ethiopia"
    },
    attachments: [
      {
        id: "file1",
        name: "job_rejection_letter.pdf",
        url: "#",
        type: "pdf",
        size: 1024000 // 1MB
      },
      {
        id: "file2",
        name: "qualification_certificates.pdf",
        url: "#",
        type: "pdf",
        size: 2048000 // 2MB
      }
    ],
    notes: "Urgent: Deadline for filing complaint is approaching. Client has strong case with clear evidence of discrimination."
  },
  {
    id: "2",
    requestNumber: "ELDA-2024-002",
    serviceType: "Employment Law Assistance",
    requestType: "Reasonable Accommodation",
    description: "My employer refuses to provide wheelchair accessibility modifications to my workspace. I need legal support to enforce my right to reasonable accommodation under Ethiopian disability law.",
    requestedBy: "Belaynesh Alemu",
    requestedDate: new Date(2024, 2, 20),
    updatedAt: new Date(2024, 2, 22),
    status: "in_progress",
    priority: "medium",
    user: {
      id: "user2",
      name: "Belaynesh Alemu",
      email: "belaynesh.alemu@gmail.com",
      phone: "+251922345678",
      address: "Bahir Dar, Amhara Region, Ethiopia"
    },
    attachments: [
      {
        id: "file3",
        name: "workplace_photos.jpg",
        url: "#",
        type: "image",
        size: 3072000 // 3MB
      },
      {
        id: "file4",
        name: "medical_certificate.pdf",
        url: "#",
        type: "pdf",
        size: 1536000 // 1.5MB
      }
    ],
    notes: "Meeting scheduled with employer next week. Preparing accommodation request documentation."
  },
  {
    id: "3",
    requestNumber: "ELDA-2024-003",
    serviceType: "Social Security Claims",
    requestType: "Disability Pension Application",
    description: "I need assistance with applying for disability pension benefits. The application process is complex and I require help with documentation and legal requirements.",
    requestedBy: "Dawit Bekele",
    requestedDate: new Date(2024, 1, 10),
    updatedAt: new Date(2024, 2, 5),
    status: "completed",
    priority: "low",
    user: {
      id: "user3",
      name: "Dawit Bekele",
      email: "dawit.bekele@gmail.com",
      phone: "+251933456789",
      address: "Dire Dawa, Ethiopia"
    },
    attachments: [
      {
        id: "file5",
        name: "medical_reports.pdf",
        url: "#",
        type: "pdf",
        size: 4096000 // 4MB
      }
    ],
    notes: "Application successfully submitted. Client approved for disability pension benefits."
  },
  {
    id: "4",
    requestNumber: "ELDA-2024-004",
    serviceType: "Accessibility Rights",
    requestType: "Public Access Violation",
    description: "The new shopping mall in Mekelle has no wheelchair ramps or accessible facilities. This violates accessibility laws and I want to file a complaint to ensure compliance.",
    requestedBy: "Meron Haile",
    requestedDate: new Date(2024, 2, 25),
    updatedAt: new Date(2024, 2, 26),
    status: "pending",
    priority: "medium",
    user: {
      id: "user4",
      name: "Meron Haile",
      email: "meron.haile@gmail.com",
      phone: "+251944567890",
      address: "Mekelle, Tigray Region, Ethiopia"
    },
    attachments: [
      {
        id: "file6",
        name: "accessibility_violations_photos.jpg",
        url: "#",
        type: "image",
        size: 2560000 // 2.5MB
      },
      {
        id: "file7",
        name: "building_permit_copy.pdf",
        url: "#",
        type: "pdf",
        size: 1024000 // 1MB
      }
    ],
    notes: "Contacted building management first. No response received. Proceeding with formal complaint."
  },
]

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusMap = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800" },
    completed: { label: "Completed", color: "bg-green-100 text-green-800" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
  }

  const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, color: "bg-gray-100 text-gray-800" }

  return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
}

// Priority badge component
const PriorityBadge = ({ priority }: { priority: string }) => {
  const priorityMap = {
    low: { label: "Low", color: "bg-green-100 text-green-800" },
    medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    high: { label: "High", color: "bg-red-100 text-red-800" },
  }

  const priorityInfo = priorityMap[priority as keyof typeof priorityMap] || { label: priority, color: "bg-gray-100 text-gray-800" }

  return <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>
}

export function RequestPageClient() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [requests, setRequests] = useState(dummyRequests)

  // Define table columns
  const columns: ColumnDef<Request>[] = [
    {
      accessorKey: "requestNumber",
      header: "Request #",
      cell: ({ row }) => (
        <div className="font-medium text-[#A4D65E] hover:underline cursor-pointer"
             onClick={() => router.push(`/requests/${row.original.id}`)}>
          {row.getValue("requestNumber")}
        </div>
      ),
    },
    {
      accessorKey: "serviceType",
      header: "Service Type",
    },
    {
      accessorKey: "requestType",
      header: "Request Type",
    },
    {
      accessorKey: "requestedBy",
      header: "Requested By",
    },
    {
      accessorKey: "requestedDate",
      header: "Requested Date",
      cell: ({ row }) => format(new Date(row.getValue("requestedDate")), "MMM dd, yyyy"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => <PriorityBadge priority={row.getValue("priority")} />,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const request = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setSelectedRequest(request)
                setIsDetailOpen(true)
              }}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Handle new request creation
  const handleCreateRequest = (newRequestData: any) => {
    setRequests(prev => [newRequestData, ...prev])
  }

  // Filter requests based on search term and status filter
  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Request Management</h1>
          <p className="text-muted-foreground">
            Manage and track all service requests
          </p>
        </div>
        <Button className="bg-[#A4D65E] hover:bg-[#A4D65E]/90 text-white" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Request
        </Button>
      </div>

      <div className="rounded-md border bg-white p-6 shadow-sm">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests..."
              className="w-full rounded-lg bg-background pl-8 md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-300">
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilter === "all" ? "All Status" : statusFilter.replace('_', ' ')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
                  Rejected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="border-gray-300">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredRequests}
          // searchKey="requestNumber"
          placeholder="No requests found"
        />
      </div>
      
      {/* Request Detail Dialog */}
      {selectedRequest && (
        <RequestDetailDialog
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          request={selectedRequest}
        />
      )}

      {/* Create Request Modal */}
      <CreateRequestModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateRequest}
      />
    </div>
  )
}
