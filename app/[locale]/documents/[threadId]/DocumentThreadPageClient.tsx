"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect, useRef } from "react"
import { 
  ArrowLeft,
  FileText,
  Download,
  Eye,
  MoreVertical,
  Trash2
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { docThreadsApi, type DocThread, type Document, type DocumentsResponse } from "@/lib/api/docThreads"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { FileUploadArea } from "@/components/documents/file-upload-area"
import { DownloadDestinationDialog } from "@/components/modals/download-destination-dialog"
import { config } from "@/lib/config"
import { downloadDocument, previewDocument, formatFileSize, getFileIcon, formatRelativeDate, getDocumentDisplayName } from "@/lib/utils/document-utils"
import { getErrorMessage, getErrorTitle } from "@/lib/error-utils"
import { useTranslations } from 'next-intl'


export default function DocumentThreadPageClient() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAuthenticated, user, role } = useAuth({ redirectOnFail: false })
  const tErrors = useTranslations('errors')
  const [threadId, setThreadId] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [downloadedFiles, setDownloadedFiles] = useState<Set<string>>(new Set())
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeleteDocumentDialog, setShowDeleteDocumentDialog] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [documentToDownload, setDocumentToDownload] = useState<Document | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get threadId from URL
  useEffect(() => {
    const pathParts = window.location.pathname.split('/')
    const id = pathParts[pathParts.length - 1]
    setThreadId(id)
  }, [])

  // Fetch thread details
  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ["doc-thread", threadId],
    queryFn: async () => {
      if (!threadId) return null
      const res = await docThreadsApi.getById(threadId)
      return (res as any)?.data?.data as DocThread
    },
    enabled: Boolean(threadId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  // Fetch documents for this thread
  const { data: documentsData, isLoading: documentsLoading, refetch: refetchDocuments } = useQuery({
    queryKey: ["doc-thread-documents", threadId],
    queryFn: async () => {
      if (!threadId) return null
      const res = await docThreadsApi.getDocuments(threadId, { limit: 20 })
      return res.data as DocumentsResponse
    },
    enabled: Boolean(threadId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  })

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ files, metas }: { files: File[], metas?: Array<{ title: string; is_confidential: boolean }> }) => {
      if (!threadId) throw new Error("No thread ID")
      if (files.length === 0) throw new Error("No files selected")
      if (files.length > 5) throw new Error("Maximum 5 files allowed")
      
      const formData = new FormData()
      
      // Add files
      files.forEach((file, index) => {
        formData.append("files", file)
      })
      
      // Add metadata if provided
      if (metas && metas.length > 0) {
        formData.append("metas", JSON.stringify(metas))
      }
      
      return docThreadsApi.uploadDocument(threadId, formData)
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Documents uploaded successfully",
      })
      refetchDocuments()
    },
    onError: (error: any) => {
      console.error("[Document Upload] Error:", error)
      console.error("[Document Upload] Error response:", error?.response?.data)
      console.error("[Document Upload] Error status:", error?.response?.status)
      console.error("[Document Upload] Request data:", error?.config?.data)
      
      const errorTitle = getErrorTitle(error, tErrors)
      const errorMessage = getErrorMessage(error, tErrors)
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    },
  })

  // Delete thread mutation
  const deleteFolderMutation = useMutation({
    mutationFn: async () => {
      if (!threadId) throw new Error("No thread ID")
      return docThreadsApi.delete(threadId)
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      })
      // Clear related queries
      queryClient.removeQueries({ queryKey: ["doc-thread", threadId] })
      queryClient.removeQueries({ queryKey: ["doc-thread-documents", threadId] })
      // Navigate back to documents list
      router.push("/documents")
    },
    onError: (error: any) => {
      console.error("[Delete Folder] Error:", error)
      console.error("[Delete Folder] Error response:", error?.response?.data)
      console.error("[Delete Folder] Error status:", error?.response?.status)
      
      const errorTitle = getErrorTitle(error, tErrors)
      const errorMessage = getErrorMessage(error, tErrors)
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    },
  })

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      if (!threadId) throw new Error("No thread ID")
      if (!documentId) throw new Error("No document ID")
      return docThreadsApi.deleteDocument(threadId, documentId)
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document deleted successfully",
      })
      refetchDocuments()
    },
    onError: (error: any) => {
      console.error("[Delete Document] Error:", error)
      console.error("[Delete Document] Error response:", error?.response?.data)
      console.error("[Delete Document] Error status:", error?.response?.status)
      
      const errorTitle = getErrorTitle(error, tErrors)
      const errorMessage = getErrorMessage(error, tErrors)
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    },
  })

  // Auto-scroll to bottom when new messages arrive (newest documents at bottom)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [documentsData])

  const handleFileUpload = async (files: File[], metas?: Array<{ title: string; is_confidential: boolean }>) => {
    setIsUploading(true)
    try {
      await uploadMutation.mutateAsync({ files, metas })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFolder = () => {
    setShowDeleteDialog(true)
  }

  const confirmDeleteFolder = () => {
    deleteFolderMutation.mutate()
    setShowDeleteDialog(false)
  }

  const handleDeleteDocument = (doc: Document) => {
    setDocumentToDelete(doc)
    setShowDeleteDocumentDialog(true)
  }

  const confirmDeleteDocument = () => {
    if (documentToDelete) {
      deleteDocumentMutation.mutate(documentToDelete.id)
      setShowDeleteDocumentDialog(false)
      setDocumentToDelete(null)
    }
  }

  const handleDownload = async (doc: Document) => {
    // Show download destination dialog instead of direct download
    setDocumentToDownload(doc)
    setShowDownloadDialog(true)
  }

  const handleDownloadWithDestination = async (destination: FileSystemDirectoryHandle | null) => {
    if (!documentToDownload) return

    try {
      // Set loading state
      setDownloadingFiles(prev => new Set([...prev, documentToDownload.id]))
      
      await downloadDocument(documentToDownload, destination)
      
      // Mark file as downloaded and remove from loading
      setDownloadedFiles(prev => new Set([...prev, documentToDownload.id]))
      setDownloadingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(documentToDownload.id)
        return newSet
      })
      
      const destinationName = destination ? destination.name : 'default location'
      toast({
        title: "Download completed",
        description: `${getDocumentDisplayName(documentToDownload)} has been saved${destination ? ` to ${destinationName}` : ' to default location'}`,
      })
      
      // Close dialog
      setShowDownloadDialog(false)
      setDocumentToDownload(null)
    } catch (error) {
      // Remove from loading state on error
      setDownloadingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(documentToDownload.id)
        return newSet
      })
      
      console.error('Download error:', error)
      const errorTitle = getErrorTitle(error, tErrors)
      const errorMessage = getErrorMessage(error, tErrors)
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    }
  }


  // Sort documents by creation date (oldest first, newest at bottom - like real chat)
  const documents = (documentsData?.data || []).sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  if (threadLoading) {
    return (
      <DashboardLayout title="Loading..." isFetching={true}>
        <div className="p-4">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (!thread) {
    return (
      <DashboardLayout title="Thread Not Found" isFetching={false}>
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Thread not found</h2>
          <Button onClick={() => router.push("/documents")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documents
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={`Thread: ${thread.subject}`} isFetching={false}>
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/documents")}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{thread.subject}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>with {thread.user_name}</span>
                  <Badge className={`text-xs ${
                    thread.status === 'open' 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {thread.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={handleDeleteFolder}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Folder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          {documentsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex justify-start">
                  <Skeleton className="h-16 w-80" />
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No documents yet</p>
                <p className="text-sm">Start the conversation by uploading a document</p>
              </div>
            </div>
          ) : (
            documents.map((doc) => {
              const isOwnMessage = user?.id === doc.owner.id
              const isDownloaded = downloadedFiles.has(doc.id)
              const isDownloading = downloadingFiles.has(doc.id)
              return (
                <div
                  key={doc.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-sm lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-sm ${
                      isOwnMessage ? 'bg-blue-600' : 'bg-gray-600'
                    }`}>
                      {doc.owner.name.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'} rounded-2xl px-4 py-3 shadow-sm max-w-sm hover:shadow-md transition-shadow duration-200`}>
                      {/* Document Title */}
                      <div className="mb-2">
                        <div className="font-semibold text-sm mb-1">
                          {getDocumentDisplayName(doc)}
                        </div>
                        {doc.title && doc.title.trim() !== '' && (
                          <div className="text-xs opacity-75 dark:opacity-60 italic">
                            {doc.original_name}
                          </div>
                        )}
                      </div>
                      
                      {/* File Info */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{getFileIcon(doc.mime_type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs opacity-75 dark:opacity-60">{formatFileSize(doc.size)}</div>
                        </div>
                      </div>
                      
                      {/* Actions and Time */}
                      <div className="flex items-center justify-between text-xs opacity-75 dark:opacity-60">
                        <span>{formatRelativeDate(doc.created_at)}</span>
                        <div className="flex items-center gap-1">
                          {/* Download status indicators */}
                          {isDownloading && (
                            <div className="h-6 w-6 flex items-center justify-center" title="Downloading...">
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                          {isDownloaded && !isDownloading && (
                            <div className="h-6 w-6 flex items-center justify-center" title="Downloaded">
                              <span className="text-xs">✓</span>
                            </div>
                          )}
                          
                          {/* 3-Dot Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-white/20 dark:hover:bg-gray-700/50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {/* <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  previewDocument(doc)
                                }}
                                className="cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview Document
                              </DropdownMenuItem> */}
                              
                              {!isDownloaded && !isDownloading && (
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownload(doc)
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Document
                                </DropdownMenuItem>
                              )}
                              
                              {/* Delete option - only show for own messages */}
                              {isOwnMessage && (
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteDocument(doc)
                                  }}
                                  className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Document
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* File Upload Area */}
        <FileUploadArea 
          onUpload={handleFileUpload}
          isUploading={isUploading}
          disabled={!threadId}
        />
      </div>

      {/* Delete Document Confirmation Dialog */}
      <AlertDialog open={showDeleteDocumentDialog} onOpenChange={setShowDeleteDocumentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone and will permanently remove:
              <br />
              <br />
              • Document: <strong>{documentToDelete?.title || documentToDelete?.original_name}</strong>
              <br />
              • File: <strong>{documentToDelete?.original_name}</strong>
              <br />
              • Size: <strong>{documentToDelete ? formatFileSize(documentToDelete.size) : ''}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteDocument}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteDocumentMutation.isPending}
            >
              {deleteDocumentMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Document
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Download Destination Dialog */}
      <DownloadDestinationDialog
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
        document={documentToDownload}
        onDownload={handleDownloadWithDestination}
        isLoading={downloadingFiles.has(documentToDownload?.id || '')}
      />
    </DashboardLayout>
  )
}
