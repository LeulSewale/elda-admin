"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { GlobalModal } from "./global-modal"
import { Employee, employeesApi } from "@/lib/api/employees"
import { FileText, Upload, Download, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from 'next-intl'
import { getErrorMessage, getErrorTitle } from "@/lib/error-utils"

interface UploadEmployeeFilesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee | null
}

export function UploadEmployeeFilesModal({ open, onOpenChange, employee }: UploadEmployeeFilesModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const t = useTranslations('employees')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [downloadingDocs, setDownloadingDocs] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch employee attachments
  const { data: attachmentsData, isLoading: isLoadingAttachments, refetch: refetchAttachments } = useQuery({
    queryKey: ['employee-attachments', employee?.id],
    queryFn: async () => {
      if (!employee?.id) return []
      const response = await employeesApi.getEmployeeAttachments(employee.id)
      return response.data?.data || []
    },
    enabled: open && !!employee?.id,
    staleTime: 5 * 60 * 1000,
  })

  const attachments = attachmentsData || []

  // Upload attachments mutation
  const uploadAttachmentsMutation = useMutation({
    mutationFn: async (files: File[]) => {
      if (!employee?.id) throw new Error("Employee ID is required")
      return employeesApi.uploadEmployeeAttachments(employee.id, files)
    },
    onSuccess: () => {
      toast({
        title: tCommon('success') || "Success",
        description: "Files uploaded successfully",
      })
      setSelectedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      refetchAttachments()
      queryClient.invalidateQueries({ queryKey: ['employee-attachments', employee?.id] })
    },
    onError: (error: any) => {
      console.error("[Upload Employee Files] Upload error:", error)
      const errorTitle = getErrorTitle(error, tErrors)
      const errorMessage = getErrorMessage(error, tErrors)
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (open && employee) {
      setSelectedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [open, employee])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files])
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUploadFiles = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      })
      return
    }
    uploadAttachmentsMutation.mutate(selectedFiles)
  }

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
      console.error("[Upload Employee Files] Download error:", error)
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

  if (!employee) return null

  return (
    <GlobalModal
      open={open}
      onOpenChange={onOpenChange}
      title={`${t('uploadFiles') || "Upload Files"} - ${employee.user_name || employee.user_email}`}
      actions={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon('close') || "Close"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Upload Files Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#4082ea]" />
              {t('uploadFiles') || "Upload Files"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="employee-file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadAttachmentsMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {t('selectFiles') || "Select Files"}
                </Button>
                {selectedFiles.length > 0 && (
                  <Button
                    type="button"
                    onClick={handleUploadFiles}
                    disabled={uploadAttachmentsMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {uploadAttachmentsMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {tCommon('uploading') || "Uploading..."}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {t('uploadFiles') || "Upload Files"}
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Existing Attachments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#4082ea]" />
              {t('existingAttachments') || "Existing Attachments"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingAttachments ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-[#4082ea]" />
              </div>
            ) : attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((attachment) => {
                  const isDownloading = downloadingDocs.has(`attachment-${attachment.id}`)
                  const fileIcon = getFileIcon(attachment.mime_type)
                  const fileSize = formatFileSize(attachment.size)
                  
                  return (
                    <div 
                      key={attachment.id} 
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-[#4082ea] transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-[#4082ea]/10 rounded-lg text-xl">
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
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
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
              <div className="p-4 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No attachments found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </GlobalModal>
  )
}

