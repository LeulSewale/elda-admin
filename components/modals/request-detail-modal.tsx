"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Request, RequestDocument } from "@/lib/types/requests"
import { Calendar, User, Mail, Phone, FileText, AlertCircle, Shield, Download, MapPin, Clock, UserCircle, Building2, Info, Eye } from "lucide-react"
import { useTranslations } from 'next-intl'
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { requestsApi } from "@/lib/api/requests"
import { toast } from "@/hooks/use-toast"
import { getErrorMessage, getErrorTitle } from "@/lib/error-utils"
import { config } from "@/lib/config"

type RequestDetailModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: Request | null
}

export function RequestDetailModal({ open, onOpenChange, request }: RequestDetailModalProps) {
  const t = useTranslations('requests')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
  const [downloadingDocs, setDownloadingDocs] = useState<Set<string>>(new Set())
  const [downloadedFiles, setDownloadedFiles] = useState<Map<string, string>>(new Map()) // Track downloaded files and their locations

  // Fetch attachments when modal is open
  const { data: attachmentsData, isLoading: isLoadingAttachments } = useQuery({
    queryKey: ['request-attachments', request?.id],
    queryFn: async () => {
      if (!request?.id) return []
      const response = await requestsApi.getRequestAttachments(request.id)
      return response.data?.data || []
    },
    enabled: open && !!request?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const attachments = attachmentsData || []

  // Early return after all hooks
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
      seeing: t('seeing'),
      hearing: t('hearing'),
      walking_or_climbing_steps: t('walkingOrClimbingSteps'),
      remembering_or_concentrating: t('rememberingOrConcentrating'),
      'self-Care': t('selfCare'),
      communication: t('communication'),
    }
    return types[type] || type
  }

  const formatServiceType = (type: string) => {
    const types: Record<string, string> = {
      inperson_conusltation: t('inpersonConsultation'),
      phone: t('phoneService'),
      court_apperance: t('courtAppearance'),
      hotline: t('hotline'),
      other: t('other'),
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

  const handleDownloadDocument = async (doc: RequestDocument, index: number) => {
    if (!request) return
    
    const docId = doc.publicId || (doc as any).id || `${request.id}-${index}`
    setDownloadingDocs(prev => new Set(prev).add(docId))
    
    try {
      // Try using the document ID with the API endpoint
      const documentId = doc.publicId || doc.id
      if (documentId) {
        const response = await requestsApi.downloadDocument(request.id, documentId)
        const blob = response.data
        
        // Determine file extension from document type or name
        const fileName = doc.name || `document-${index + 1}`
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast({
          title: tCommon('success') || "Success",
          description: t('documentDownloaded') || "Document downloaded successfully",
        })
      } else if (doc.url) {
        // Fallback: try using document URL directly
        const response = await fetch(doc.url, {
          method: 'GET',
          credentials: 'include',
        })
        
        if (!response.ok) throw new Error('Failed to download document')
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = doc.name || `document-${index + 1}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast({
          title: tCommon('success') || "Success",
          description: t('documentDownloaded') || "Document downloaded successfully",
        })
      } else {
        // Final fallback: try using attachment ID
        if (request.rep_attachment_id) {
          const response = await requestsApi.downloadAttachment(request.rep_attachment_id)
          const blob = response.data
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = doc.name || `attachment-${request.rep_attachment_id}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          
          toast({
            title: tCommon('success') || "Success",
            description: t('documentDownloaded') || "Document downloaded successfully",
          })
        } else {
          toast({
            title: tCommon('error') || "Error",
            description: t('noDownloadUrl') || "No download URL available for this document",
            variant: "destructive",
          })
        }
      }
    } catch (error: any) {
      console.error("[Request Detail] Download error:", error)
      const errorTitle = getErrorTitle(error, tErrors)
      const errorMessage = getErrorMessage(error, tErrors)
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setDownloadingDocs(prev => {
        const newSet = new Set(prev)
        newSet.delete(docId)
        return newSet
      })
    }
  }

  const handleDownloadAttachment = async () => {
    if (!request?.rep_attachment_id) {
      toast({
        title: tErrors('error') || "Error",
        description: "No attachment ID available",
        variant: "destructive",
      })
      return
    }
    
    const attachmentId = `attachment-${request.rep_attachment_id}`
    setDownloadingDocs(prev => new Set(prev).add(attachmentId))
    
    try {
      console.debug("[Request Detail] Downloading representative attachment:", { 
        attachmentId: request.rep_attachment_id,
        requestId: request.id 
      })
      
      const response = await requestsApi.downloadAttachment(request.rep_attachment_id)
      const blob = response.data
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `client-document-${request.rep_attachment_id}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // Save the download location (safe because we checked above)
      const repAttachmentId = request.rep_attachment_id as string
      const downloadLocation = `Downloads/client-document-${repAttachmentId}`
      setDownloadedFiles(prev => new Map(prev).set(repAttachmentId, downloadLocation))
      
      toast({
        title: tCommon('success') || "Success",
        description: t('documentDownloaded') || `Document downloaded successfully. Location: ${downloadLocation}`,
      })
    } catch (error: any) {
      console.error("[Request Detail] Download representative attachment error:", error)
      console.error("[Request Detail] Error details:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url,
        attachmentId: request.rep_attachment_id,
        requestId: request.id
      })
      
      const errorTitle = getErrorTitle(error, tErrors)
      let errorMessage = getErrorMessage(error, tErrors)
      
      // Add more helpful error message for 404
      if (error?.response?.status === 404) {
        errorMessage = `File not found. The attachment may have been deleted or the ID is invalid. (ID: ${request.rep_attachment_id})`
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setDownloadingDocs(prev => {
        const newSet = new Set(prev)
        newSet.delete(attachmentId)
        return newSet
      })
    }
  }

  const handleDownloadAttachmentByPath = async (attachmentId: string, downloadPath: string, originalName: string) => {
    const docId = `attachment-${attachmentId}`
    
    // Check if file was already downloaded
    if (downloadedFiles.has(attachmentId)) {
      const savedLocation = downloadedFiles.get(attachmentId)
      toast({
        title: tCommon('info') || "File Location",
        description: `File already downloaded. Location: ${savedLocation || 'Downloads folder'}`,
      })
      return
    }
    
    setDownloadingDocs(prev => new Set(prev).add(docId))
    
    try {
      console.debug("[Request Detail] Downloading attachment:", { 
        attachmentId, 
        downloadPath, 
        originalName,
        requestId: request?.id 
      })
      
      // Validate download path
      if (!downloadPath || downloadPath === 'null' || downloadPath === 'undefined') {
        console.warn("[Request Detail] Invalid download_path, trying fallback method")
        
        // Fallback: Try direct attachment download by ID
        if (request?.id) {
          console.debug("[Request Detail] Using fallback: /requests/:requestId/attachments/:attachmentId/download")
          const response = await requestsApi.downloadDocument(request.id, attachmentId)
          const blob = response.data
          
          // Create download link
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = originalName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          
          // Save the download location
          const downloadLocation = `Downloads/${originalName}`
          setDownloadedFiles(prev => new Map(prev).set(attachmentId, downloadLocation))
          
          toast({
            title: tCommon('success') || "Success",
            description: `Document downloaded successfully. Location: ${downloadLocation}`,
          })
          return
        }
        
        throw new Error("Cannot download: invalid download path and no request ID available")
      }
      
      // Use axios to download with proper authentication
      // download_path is like "/api/v1/requests/.../attachments/.../download"
      // The API function will handle the path correctly
      const response = await requestsApi.downloadAttachmentByPath(downloadPath)
      const blob = response.data
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = originalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // Save the download location (typically browser's default download folder)
      const downloadLocation = `Downloads/${originalName}`
      setDownloadedFiles(prev => new Map(prev).set(attachmentId, downloadLocation))
      
      toast({
        title: tCommon('success') || "Success",
        description: `Document downloaded successfully. Location: ${downloadLocation}`,
      })
    } catch (error: any) {
      console.error("[Request Detail] Download attachment error:", error)
      console.error("[Request Detail] Error details:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url,
        method: error?.config?.method,
        downloadPath,
        attachmentId,
        requestId: request?.id
      })
      
      const errorTitle = getErrorTitle(error, tErrors)
      let errorMessage = getErrorMessage(error, tErrors)
      
      // Add more helpful error message for 404
      if (error?.response?.status === 404) {
        errorMessage = `File not found. The download link may be invalid or the file may have been deleted. (Path: ${downloadPath})`
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setDownloadingDocs(prev => {
        const newSet = new Set(prev)
        newSet.delete(docId)
        return newSet
      })
    }
  }

  const formatFileSize = (bytes: string | number) => {
    const size = typeof bytes === 'string' ? parseInt(bytes) : bytes
    if (size === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(size) / Math.log(k))
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.includes('pdf')) return '📄'
    if (mimeType?.includes('image')) return '🖼️'
    if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝'
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return '📊'
    return '📎'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#4082ea]/10 rounded-lg">
                <FileText className="w-5 h-5 text-[#4082ea]" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {t('requestDetails') || "Request Details"}
            </DialogTitle>
                <p className="text-sm text-gray-500 mt-1">ID: {request.id.slice(0, 8)}...</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
            {request.is_confidential && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 px-3 py-1.5">
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                Confidential
              </Badge>
            )}
              <Badge className={`${getStatusColor(request.status)} px-3 py-1.5 font-semibold`}>
                {request.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-[#4082ea]">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
              </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Priority</p>
                    <Badge className={`${getPriorityColor(request.priority)} mt-1 px-2 py-0.5 text-xs font-semibold`}>
                  {request.priority.toUpperCase()}
                </Badge>
              </div>
            </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-4 h-4 text-green-600" />
          </div>
            <div>
                    <p className="text-xs text-gray-500 font-medium">Service Type</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {formatServiceType(request.service_type)}
                    </p>
              </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Info className="w-4 h-4 text-orange-600" />
            </div>
            <div>
                    <p className="text-xs text-gray-500 font-medium">Disability Type</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {formatDisabilityType(request.disability_type)}
                    </p>
              </div>
            </div>
              </CardContent>
            </Card>
          </div>

          {/* Description Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4082ea]" />
                {t('description') || "Description"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {request.description}
                </p>
            </div>
            </CardContent>
          </Card>

          {/* Remarks */}
          {request.remarks && (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-blue-900">
                  <Info className="w-4 h-4 text-blue-600" />
                  {t('remarks') || "Remarks"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {request.remarks}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Person Information (Self or Other) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-[#4082ea]" />
                {request.is_for_other 
                  ? (t('requestForOtherPerson') || "Request for Other Person")
                  : (t('requestForSelf') || "Request for Self")
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {request.is_for_other ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {request.other_name && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                      <div className="mt-1.5 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{request.other_name}</span>
                      </div>
                    </div>
                  )}
                  {request.other_sex && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sex</label>
                      <div className="mt-1.5">
                        <span className="text-sm font-medium text-gray-900 capitalize">{request.other_sex}</span>
                      </div>
                    </div>
                  )}
                  {request.other_age !== null && request.other_age !== undefined && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Age</label>
                      <div className="mt-1.5">
                        <span className="text-sm font-medium text-gray-900">{request.other_age} years</span>
                      </div>
                    </div>
                  )}
                  {request.other_phone_1 && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone 1</label>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{request.other_phone_1}</span>
                      </div>
                    </div>
                  )}
                  {request.other_phone_2 && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone 2</label>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{request.other_phone_2}</span>
                      </div>
                    </div>
                  )}
                  {(request.other_region || request.other_city || request.other_subcity || request.other_kebele) && (
                    <div className="md:col-span-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Location
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                        {request.other_region && (
                          <div>
                            <p className="text-xs text-gray-500">Region</p>
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{request.other_region}</p>
                          </div>
                        )}
                        {request.other_city && (
                          <div>
                            <p className="text-xs text-gray-500">City</p>
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{request.other_city}</p>
                          </div>
                        )}
                        {request.other_subcity && (
                          <div>
                            <p className="text-xs text-gray-500">Sub City</p>
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{request.other_subcity}</p>
                          </div>
                        )}
                        {request.other_kebele && (
            <div>
                            <p className="text-xs text-gray-500">Kebele</p>
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{request.other_kebele}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {request.sex && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sex</label>
                      <div className="mt-1.5">
                        <span className="text-sm font-medium text-gray-900 capitalize">{request.sex}</span>
                      </div>
                    </div>
                  )}
                  {request.age !== null && request.age !== undefined && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Age</label>
                      <div className="mt-1.5">
                        <span className="text-sm font-medium text-gray-900">{request.age} years</span>
              </div>
            </div>
          )}
                  {(request.region || request.city || request.sub_city || request.kebele) && (
                    <div className="md:col-span-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Location
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                        {request.region && (
                          <div>
                            <p className="text-xs text-gray-500">Region</p>
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{request.region}</p>
                          </div>
                        )}
                        {request.city && (
                          <div>
                            <p className="text-xs text-gray-500">City</p>
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{request.city}</p>
                          </div>
                        )}
                        {request.sub_city && (
          <div>
                            <p className="text-xs text-gray-500">Sub City</p>
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{request.sub_city}</p>
              </div>
                        )}
                        {request.kebele && (
                          <div>
                            <p className="text-xs text-gray-500">Kebele</p>
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{request.kebele}</p>
              </div>
                        )}
              </div>
            </div>
                  )}
          </div>
              )}
            </CardContent>
          </Card>

          {/* Contact & Assignment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-[#4082ea]" />
                  {t('createdBy') || "Created By"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{request.created_by_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{request.created_by_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Phone className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Preferred Contact</p>
                    <p className="text-sm font-semibold text-gray-900">{request.contact_method.toUpperCase()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#4082ea]" />
                  {t('assignedTo') || "Assignment"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {request.assigned_to_name ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Assigned to</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{request.assigned_to_name}</p>
                      </div>
                    </div>
                    {request.assigned_to_email && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                          <Mail className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{request.assigned_to_email}</p>
                        </div>
                      </div>
                    )}
                    {request.assigned_at && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="p-1.5 bg-orange-100 rounded-lg">
                          <Calendar className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">Assigned at</p>
                          <p className="text-sm font-semibold text-gray-900">{formatDate(request.assigned_at)}</p>
                        </div>
                  </div>
                )}
              </div>
            ) : (
                  <div className="p-4 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-sm text-gray-500 italic">Not assigned yet</p>
                  </div>
            )}
              </CardContent>
            </Card>
          </div>

          {/* Timestamps & Attachments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#4082ea]" />
                  Timestamps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Created At</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(request.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(request.updated_at)}</p>
              </div>
                </div>
              </CardContent>
            </Card>

            {request.attachment_count !== undefined && request.attachment_count !== null && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#4082ea]" />
                    Attachments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                      <p className="text-2xl font-bold text-gray-900">{request.attachment_count}</p>
                      <p className="text-xs text-gray-500">
                        {Number(request.attachment_count) === 1 ? 'attachment' : 'attachments'}
                      </p>
              </div>
            </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Attachments Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4082ea]" />
                {t('attachments') || "Attachments"}
                {isLoadingAttachments && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Loading...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAttachments ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[#4082ea] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : attachments.length > 0 ? (
                <div className="space-y-3">
                  {attachments.map((attachment) => {
                    const isDownloading = downloadingDocs.has(`attachment-${attachment.id}`)
                    const isDownloaded = downloadedFiles.has(attachment.id)
                    const downloadLocation = downloadedFiles.get(attachment.id)
                    const fileIcon = getFileIcon(attachment.mime_type)
                    const fileSize = formatFileSize(attachment.size)
                    
                    return (
                      <div 
                        key={attachment.id} 
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-[#4082ea] transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="p-2 bg-[#4082ea]/10 rounded-lg text-2xl">
                            {fileIcon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {attachment.original_name}
                              </p>
                              {attachment.title && (
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {attachment.title}
                                </Badge>
                              )}
                              {isDownloaded && (
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs shrink-0">
                                  Downloaded
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{fileSize}</span>
                              <span>•</span>
                              <span className="capitalize">{attachment.mime_type?.split('/')[1] || 'file'}</span>
                              {attachment.created_at && (
                                <>
                                  <span>•</span>
                                  <span>{formatDate(attachment.created_at)}</span>
                                </>
                              )}
                            </div>
                            {isDownloaded && downloadLocation && (
                              <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                <p className="text-xs text-green-700">
                                  <span className="font-medium">Location:</span> {downloadLocation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2 shrink-0">
                          {attachment.preview_path && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const baseUrl = config.api.host || config.api.baseUrl || ''
                                const fullUrl = attachment.preview_path!.startsWith('http') 
                                  ? attachment.preview_path! 
                                  : `${baseUrl}${attachment.preview_path}`
                                window.open(fullUrl, '_blank')
                              }}
                              className="border-gray-300 text-gray-700 hover:bg-gray-100"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadAttachmentByPath(
                              attachment.id,
                              attachment.download_path,
                              attachment.original_name
                            )}
                            disabled={isDownloading}
                            className={isDownloaded 
                              ? "border-green-500 text-green-700 hover:bg-green-50" 
                              : "border-[#4082ea] text-[#4082ea] hover:bg-[#4082ea] hover:text-white"
                            }
                            title={isDownloaded ? `File location: ${downloadLocation}` : "Download file"}
                          >
                            {isDownloading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-[#4082ea] border-t-transparent rounded-full animate-spin mr-2" />
                                {tCommon('downloading') || "Downloading..."}
                              </>
                            ) : isDownloaded ? (
                              <>
                                <FileText className="w-4 h-4 mr-2" />
                                {tCommon('showLocation') || "Location"}
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                {tCommon('download') || "Download"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : request.rep_attachment_id ? (
                (() => {
                  const isDownloading = downloadingDocs.has(`attachment-${request.rep_attachment_id}`)
                  const isDownloaded = downloadedFiles.has(request.rep_attachment_id)
                  const downloadLocation = downloadedFiles.get(request.rep_attachment_id)
                  
                  return (
                    <div className="space-y-3">
                      <div 
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:border-[#4082ea] transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="p-2 bg-[#4082ea]/10 rounded-lg text-2xl">
                            📎
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-gray-900">
                                Client Document
                              </p>
                              <Badge variant="outline" className="text-xs shrink-0">
                                Representative Attachment
                              </Badge>
                              {isDownloaded && (
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs shrink-0">
                                  Downloaded
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>ID: {request.rep_attachment_id}</span>
                            </div>
                            {isDownloaded && downloadLocation && (
                              <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                <p className="text-xs text-green-700">
                                  <span className="font-medium">Location:</span> {downloadLocation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadAttachment}
                            disabled={isDownloading}
                            className={isDownloaded 
                              ? "border-green-500 text-green-700 hover:bg-green-50" 
                              : "border-[#4082ea] text-[#4082ea] hover:bg-[#4082ea] hover:text-white"
                            }
                            title={isDownloaded ? `File location: ${downloadLocation}` : "Download file"}
                          >
                            {isDownloading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-[#4082ea] border-t-transparent rounded-full animate-spin mr-2" />
                                {tCommon('downloading') || "Downloading..."}
                              </>
                            ) : isDownloaded ? (
                              <>
                                <FileText className="w-4 h-4 mr-2" />
                                {tCommon('showLocation') || "Location"}
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                {tCommon('download') || "Download"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })()
              ) : (
                <div className="p-4 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No attachments found</p>
                </div>
              )}
            </CardContent>
          </Card>

        
        </div>
      </DialogContent>
    </Dialog>
  )
}

