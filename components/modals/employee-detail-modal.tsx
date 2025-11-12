"use client"

import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { GlobalModal } from "./global-modal"
import { Employee, employeesApi } from "@/lib/api/employees"
import { FileText, Download, Loader2, User, Mail, Phone, Briefcase, Building2, MapPin, DollarSign, Calendar, Clock, UserCircle, Building } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from 'next-intl'
import { getErrorMessage, getErrorTitle } from "@/lib/error-utils"
import { useState } from "react"

interface EmployeeDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee | null
}

export function EmployeeDetailModal({ open, onOpenChange, employee }: EmployeeDetailModalProps) {
  const { toast } = useToast()
  const t = useTranslations('employees')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
  const [downloadingDocs, setDownloadingDocs] = useState<Set<string>>(new Set())

  // Fetch full employee details by ID when modal opens
  const { data: employeeData, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ['employee', employee?.id],
    queryFn: async () => {
      if (!employee?.id) return null
      const response = await employeesApi.getEmployee(employee.id)
      return response.data?.data || null
    },
    enabled: open && !!employee?.id,
    staleTime: 5 * 60 * 1000,
  })

  // Use fetched employee data or fallback to passed employee prop
  const currentEmployee = employeeData || employee

  // Fetch employee attachments
  const { data: attachmentsData, isLoading: isLoadingAttachments } = useQuery({
    queryKey: ['employee-attachments', currentEmployee?.id],
    queryFn: async () => {
      if (!currentEmployee?.id) return []
      const response = await employeesApi.getEmployeeAttachments(currentEmployee.id)
      return response.data?.data || []
    },
    enabled: open && !!currentEmployee?.id,
    staleTime: 5 * 60 * 1000,
  })

  const attachments = attachmentsData || []

  const handleDownloadAttachment = async (attachmentId: string, downloadPath: string, originalName: string) => {
    const docId = `attachment-${attachmentId}`
    setDownloadingDocs(prev => new Set(prev).add(docId))
    
    try {
      const response = await employeesApi.downloadEmployeeAttachmentByPath(downloadPath)
      const blob = response.data
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = originalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: tCommon('success') || "Success",
        description: "File downloaded successfully",
      })
    } catch (error: any) {
      console.error("[Employee Detail] Download error:", error)
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

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || 'active'
    if (statusLower === 'active') {
      return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Active</Badge>
    }
    return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!currentEmployee) {
    if (isLoadingEmployee) {
      return (
        <GlobalModal
          open={open}
          onOpenChange={onOpenChange}
          title="Employee Details"
          maxWidth="4xl"
          actions={
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tCommon('close') || "Close"}
            </Button>
          }
        >
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#4082ea]" />
          </div>
        </GlobalModal>
      )
    }
    return null
  }

  return (
    <GlobalModal
      open={open}
      onOpenChange={onOpenChange}
      title={`${t('employeeDetails') || "Employee Details"} - ${currentEmployee.user_name || currentEmployee.user_email}`}
      maxWidth="4xl"
      actions={
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          {tCommon('close') || "Close"}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#4082ea] rounded-full">
              <UserCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{currentEmployee.user_name || "N/A"}</h3>
              <p className="text-sm text-gray-600 mt-1">{currentEmployee.user_email || "N/A"}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(currentEmployee.status)}
            <span className="text-xs text-gray-500">ID: {currentEmployee.id.slice(0, 8)}...</span>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase">Job Title</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#4082ea]" />
                <p className="text-sm font-semibold text-gray-900">{currentEmployee.job_title || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase">Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-green-600" />
                <p className="text-sm font-semibold text-gray-900">{currentEmployee.department || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase">Employment Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-600" />
                <Badge variant="outline" className="text-xs">
                  {currentEmployee.employment_type || "N/A"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase">Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-semibold text-gray-900">
                  {typeof currentEmployee.salary === 'number' 
                    ? currentEmployee.salary.toLocaleString() 
                    : parseFloat(String(currentEmployee.salary || 0)).toLocaleString()} ETB
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-[#4082ea]" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900">{currentEmployee.user_email || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{currentEmployee.user_phone || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">District</p>
                  <p className="text-sm font-medium text-gray-900">{currentEmployee.district || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Role</p>
                  <Badge variant="outline" className="mt-1">
                    {currentEmployee.user_role || "N/A"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#4082ea]" />
              Employment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Hired At</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(currentEmployee.hired_at)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Terminated At</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(currentEmployee.terminated_at)}</p>
                </div>
              </div>
              {currentEmployee.manager_name && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                  <UserCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Manager</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{currentEmployee.manager_name}</p>
                      {currentEmployee.manager_email && (
                        <span className="text-xs text-gray-500">({currentEmployee.manager_email})</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attachments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#4082ea]" />
              {t('attachments') || "Attachments"}
              {attachments.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {attachments.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAttachments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#4082ea]" />
              </div>
            ) : attachments.length > 0 ? (
              <div className="space-y-3">
                {attachments.map((attachment) => {
                  const isDownloading = downloadingDocs.has(`attachment-${attachment.id}`)
                  const fileIcon = getFileIcon(attachment.mime_type)
                  const fileSize = formatFileSize(attachment.size)
                  
                  return (
                    <div 
                      key={attachment.id} 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-[#4082ea] hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="p-3 bg-[#4082ea]/10 rounded-lg text-2xl shrink-0">
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
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{fileSize}</span>
                            <span>•</span>
                            <span className="capitalize">{attachment.mime_type?.split('/')[1] || 'file'}</span>
                            <span>•</span>
                            <span>{new Date(attachment.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadAttachment(
                            attachment.id,
                            attachment.download_path,
                            attachment.original_name
                          )}
                          disabled={isDownloading}
                          className="border-[#4082ea] text-[#4082ea] hover:bg-[#4082ea] hover:text-white"
                        >
                          {isDownloading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              {tCommon('downloading') || "Downloading..."}
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
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">No attachments found</p>
                <p className="text-xs text-gray-400 mt-1">Upload files using the upload icon in the employee table</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </GlobalModal>
  )
}

