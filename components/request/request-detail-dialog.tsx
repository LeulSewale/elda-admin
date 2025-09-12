import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

type User = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  avatar?: string
}

type RequestDetail = {
  id: string
  requestNumber: string
  serviceType: string
  requestType: string
  description: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in_progress" | "completed" | "rejected"
  requestedDate: Date
  updatedAt: Date
  user: User
  attachments?: Array<{
    id: string
    name: string
    url: string
    type: string
    size: number
  }>
  notes?: string
}

type RequestDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: RequestDetail | null
}

const PriorityBadge = ({ priority }: { priority: string }) => {
  const priorityMap = {
    low: { label: "Low", color: "bg-green-100 text-green-800" },
    medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    high: { label: "High", color: "bg-red-100 text-red-800" },
  }

  const priorityInfo = priorityMap[priority as keyof typeof priorityMap] || { label: priority, color: "bg-gray-100 text-gray-800" }
  return <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>
}

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

export function RequestDetailDialog({ open, onOpenChange, request }: RequestDetailDialogProps) {
  if (!request) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">
              Request #{request.requestNumber}
            </DialogTitle>
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button> */}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {/* Left Column - User Information */}
          <div className="md:col-span-1">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4 pb-2 border-b">Requester Information</h3>
              
              <div className="flex items-start space-x-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-[#A4D65E] flex items-center justify-center text-white font-medium">
                  {request.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{request.user.name}</p>
                  <p className="text-sm text-gray-500">{request.user.email}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{request.user.email}</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{request.user.phone}</span>
                </div>
                <div className="flex items-start">
                  <svg className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="break-words">{request.user.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Request Details */}
          <div className="md:col-span-2">
            <div className="space-y-6">
              {/* Request Overview */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-4 pb-2 border-b">Request Details</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Service Type</p>
                    <p className="font-medium">{request.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Request Type</p>
                    <p className="font-medium">{request.requestType}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Priority</p>
                    <PriorityBadge priority={request.priority} />
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <StatusBadge status={request.status} />
                  </div>
                  <div>
                    <p className="text-gray-500">Requested Date</p>
                    <p className="font-medium">{format(new Date(request.requestedDate), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium">{format(new Date(request.updatedAt), "MMM dd, yyyy")}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {request.description || "No description provided."}
                </p>
              </div>

              {/* Notes */}
              {request.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <h3 className="font-medium text-yellow-800 mb-2">Notes</h3>
                  <p className="text-yellow-700 whitespace-pre-line">{request.notes}</p>
                </div>
              )}

              {/* Attachments
              {request.attachments && request.attachments.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-medium text-gray-900 mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {request.attachments.map((file) => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-2 border rounded hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 bg-gray-100 rounded mr-3">
                          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {file.type.toUpperCase()} • {formatFileSize(file.size)}
                          </p>
                        </div>
                        <div className="ml-4">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="bg-[#A4D65E] hover:bg-[#A4D65E]/90 text-white">
            Update Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
