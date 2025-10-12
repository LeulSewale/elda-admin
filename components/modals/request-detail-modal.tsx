"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Request } from "@/lib/types/requests"
import { Calendar, User, Mail, Phone, FileText, AlertCircle, Shield } from "lucide-react"

type RequestDetailModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: Request | null
}

export function RequestDetailModal({ open, onOpenChange, request }: RequestDetailModalProps) {
  if (!request) return null

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-700 border-gray-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      high: "bg-orange-100 text-orange-700 border-orange-200",
      critical: "bg-red-100 text-red-700 border-red-200",
    }
    return colors[priority] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  const formatDisabilityType = (type: string) => {
    const types: Record<string, string> = {
      hearing_impaired: "Hearing Impaired",
      visually_impaired: "Visually Impaired",
      mobility_impaired: "Mobility Impaired",
      cognitive_impaired: "Cognitive Impaired",
      other: "Other",
    }
    return types[type] || type
  }

  const formatServiceType = (type: string) => {
    const types: Record<string, string> = {
      tv: "TV Service",
      internet: "Internet Service",
      phone: "Phone Service",
      bundle: "Bundle Service",
      other: "Other",
    }
    return types[type] || type
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-[#4082ea]">
              Request Details
            </DialogTitle>
            {request.is_confidential && (
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                <Shield className="w-3 h-3 mr-1" />
                Confidential
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="mt-1">
                <Badge className={`${getStatusColor(request.status)} px-3 py-1`}>
                  {request.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-600">Priority</label>
              <div className="mt-1">
                <Badge className={`${getPriorityColor(request.priority)} px-3 py-1`}>
                  {request.priority.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Service Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Disability Type</label>
              <div className="mt-1 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{formatDisabilityType(request.disability_type)}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Service Type</label>
              <div className="mt-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{formatServiceType(request.service_type)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-600">Description</label>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.description}</p>
            </div>
          </div>

          {/* Remarks */}
          {request.remarks && (
            <div>
              <label className="text-sm font-medium text-gray-600">Remarks</label>
              <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.remarks}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Created by:</span>
                <span className="text-sm font-medium">{request.created_by_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium">{request.created_by_email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Preferred Contact:</span>
                <span className="text-sm font-medium">{request.contact_method.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Assignment Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Assignment Information</h3>
            {request.assigned_to_name ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Assigned to:</span>
                  <span className="text-sm font-medium">{request.assigned_to_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium">{request.assigned_to_email}</span>
                </div>
                {request.assigned_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Assigned at:</span>
                    <span className="text-sm font-medium">{formatDate(request.assigned_at)}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Not assigned yet</p>
            )}
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Created At</label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{formatDate(request.created_at)}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Last Updated</label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{formatDate(request.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Attachment ID */}
          {request.rep_attachment_id && (
            <div>
              <label className="text-sm font-medium text-gray-600">Attachment Reference</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                <code className="text-xs text-gray-600">{request.rep_attachment_id}</code>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

