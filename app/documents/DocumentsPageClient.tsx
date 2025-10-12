"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect, useCallback } from "react"
import { 
  Eye, 
  Plus, 
  RefreshCw, 
  FileText,
  FolderOpen,
  Folder,
  FileText as DocumentIcon,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  Download,
  Trash2
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { UploadDocumentModal } from "@/components/modals/create-document-modal"
import { CreateDocThreadModal } from "@/components/modals/create-doc-thread-modal"
import { docThreadsApi, type DocThread, type DocThreadsResponse } from "@/lib/api/docThreads"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"


// Custom hook for tab visibility and activity tracking
function useTabVisibility() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
      if (!document.hidden) {
        setLastActivity(Date.now());
      }
    };

    const handleFocus = () => {
      setIsVisible(true);
      setLastActivity(Date.now());
    };

    const handleBlur = () => {
      setIsVisible(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return { isVisible, lastActivity };
}

export default function DocumentsPageClient() {
  const { isAuthenticated, role } = useAuth({ redirectOnFail: false })
  const { isVisible, lastActivity } = useTabVisibility();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [createThreadOpen, setCreateThreadOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [threads, setThreads] = useState<DocThread[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<DocThread | null>(null);

  // Fetch doc threads with ADVANCED PERFORMANCE OPTIMIZATIONS
  const { data, isLoading, refetch, isFetching, error } = useQuery({
    queryKey: ["doc-threads", cursor],
    queryFn: async () => {
      const res = await docThreadsApi.list(cursor ? { after: cursor, limit: 20 } : { limit: 20 })
      const payload = (res as any)?.data as DocThreadsResponse
      return payload
    },
    // 🚀 ADVANCED CACHING CONFIGURATION
    staleTime: 15 * 60 * 1000, // 15 minutes - data considered fresh for 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes - cache kept in memory for 30 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on component mount if data exists
    refetchOnReconnect: true, // Refetch on network reconnect for data consistency
    refetchInterval: false, // Disable automatic refetching
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors (authentication issues)
      if (error?.response?.status === 401) {
        console.warn('[Documents] 401 error detected - not retrying')
        return false
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    enabled: isVisible && isAuthenticated, // Only fetch when tab is visible and user is authenticated
  });

  // Delete thread mutation
  const deleteThreadMutation = useMutation({
    mutationFn: async (threadId: string) => {
      return docThreadsApi.delete(threadId)
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      })
      // Refresh the threads list
      refetch()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete folder",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    const resp = data as DocThreadsResponse | undefined
    if (resp?.data) {
      // When cursor changes, append; when refreshed from top (cursor undefined), replace
      setThreads((prev) => (cursor ? [...prev, ...resp.data] : [...resp.data]))
      setHasNextPage(Boolean(resp.paging?.hasNextPage) && Boolean(resp.paging?.nextCursor))
    }
  }, [data, cursor])

  // 🔄 SMART REFRESH FUNCTION WITH TAB ACTIVITY AWARENESS
  const handleRefresh = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefresh;
    const timeSinceLastActivity = now - lastActivity;
    
    // Debounce: prevent refresh if last refresh was less than 2 seconds ago
    if (timeSinceLastRefresh < 2000) {
      console.log('Refresh blocked: Too frequent');
      return;
    }
    
    // Smart refresh logic: refresh if inactive for >5 minutes or if last refresh was >30 seconds ago
    const shouldRefresh = timeSinceLastActivity > 5 * 60 * 1000 || timeSinceLastRefresh > 30 * 1000;
    
    if (!shouldRefresh && !isRefreshing) {
      console.log('Refresh blocked: Data is fresh');
      return;
    }

    try {
      setIsRefreshing(true);
      setLastRefresh(now);
      await refetch();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [lastRefresh, lastActivity, refetch, isRefreshing]);

  // Handler functions for card actions
  const handleDeleteThread = (thread: DocThread) => {
    setThreadToDelete(thread)
    setShowDeleteDialog(true)
  }

  const confirmDeleteThread = () => {
    if (threadToDelete) {
      deleteThreadMutation.mutate(threadToDelete.id)
      setShowDeleteDialog(false)
      setThreadToDelete(null)
    }
  }

  const handlePreviewThread = (thread: DocThread) => {
    router.push(`/documents/${thread.id}`)
  }

  const handleDownloadThread = (thread: DocThread) => {
    // For now, navigate to the thread page where users can download individual documents
    // In the future, this could be enhanced to download all documents as a zip
    router.push(`/documents/${thread.id}`)
  }

  // 📱 TAB VISIBILITY EFFECTS FOR PERFORMANCE MONITORING
  useEffect(() => {
    if (isVisible && lastActivity) {
      const timeSinceLastActivity = Date.now() - lastActivity;
      // Log when tab becomes active after long inactivity (10+ minutes)
      if (timeSinceLastActivity > 10 * 60 * 1000) {
        console.log('Tab became active after long inactivity, data might be stale');
      }
    }
  }, [isVisible, lastActivity]);

  const items = threads

  // Folder-like UI component for document threads
  const DocumentThreadFolder = ({ thread }: { thread: DocThread }) => {
    const statusColors: Record<string, string> = {
      open: "bg-emerald-100 text-emerald-800 border-emerald-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const getFolderIcon = () => {
      if (thread.status === 'open') {
        return <FolderOpen className="h-16 w-16 text-yellow-500" />;
      }
      return <Folder className="h-16 w-16 text-yellow-500" />;
    };

    const getPreviewContent = () => {
      if (thread.status === 'open') {
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-1">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              <div className="w-8 h-1 bg-blue-200 rounded"></div>
              <div className="w-6 h-1 bg-blue-200 rounded"></div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-1">
              <CheckCircle className="h-6 w-6 text-gray-600" />
              <div className="w-8 h-1 bg-gray-300 rounded"></div>
              <div className="w-6 h-1 bg-gray-300 rounded"></div>
            </div>
          </div>
        );
      }
    };

    return (
      <div 
        className="relative group cursor-pointer transition-all duration-200 hover:scale-105"
        onClick={() => router.push(`/documents/${thread.id}`)}
      >
        {/* Folder Container */}
        <div className="relative w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 border-2 border-yellow-300">
          {/* Folder Icon */}
          <div className="absolute top-2 left-2">
            {getFolderIcon()}
          </div>
          
          {/* Preview Content */}
          {getPreviewContent()}
          
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[thread.status] || "bg-gray-100 text-gray-800"}`}>
              {thread.status}
            </div>
          </div>

        </div>
        
        {/* Folder Label */}
        <div className="mt-2 text-center">
          <h3 className="text-sm font-medium text-gray-900 truncate max-w-32" title={thread.subject}>
            {thread.subject}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {thread.user_name}
          </p>
          <div className="flex items-center justify-center mt-1 text-xs text-gray-400">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(thread.last_document_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Document Management" isFetching={isFetching}>
      <div className="p-0">       
        <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm overflow-hidden">
           <div className="flex justify-between items-center px-2 py-2">
          <div>
             <h1 className="text-xl font-semibold">Document Folders</h1>
            <p className="text-sm text-gray-400">Start and track document conversations</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setCreateThreadOpen(true)}
              className="bg-[#4082ea] hover:bg-[#4082ea] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Folder
            </Button>
          </div>
        </div>
        <hr></hr>
          <div className="px-2 pb-3 py-5">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-40 w-32" />
                ))}
              </div>
            ) : error && (error as any)?.response?.status === 401 ? (
              <div className="py-8 text-center">
                <div className="text-red-500 mb-4">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Session Expired</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Your session has expired. Please log in again to continue.
                  </p>
                        </div>
                          <Button
                  onClick={() => router.push('/login')}
                  className="bg-[#4082ea] hover:bg-[#4082ea] text-white"
                >
                  Go to Login
                          </Button>
                        </div>
            ) : items && items.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
                {items.map((thread) => (
                  <DocumentThreadFolder key={thread.id} thread={thread} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                No threads found.
              </div>
            )}
            {hasNextPage && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    const resp = data as DocThreadsResponse | undefined
                    const next = resp?.paging?.nextCursor
                    if (next) setCursor(next)
                  }}
                >
                  Load more
                </Button>
              </div>
            )}
          </div>
        </div>
       <UploadDocumentModal open={modalOpen} onOpenChange={setModalOpen} />
       <CreateDocThreadModal
         open={createThreadOpen}
         onOpenChange={setCreateThreadOpen}
         onCreated={(thread) => {
           setThreads((prev) => [thread, ...prev])
         }}
       />

      {/* Delete Folder Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this folder? This action cannot be undone and will permanently remove:
              <br />
              <br />
              • Folder: <strong>{threadToDelete?.subject}</strong>
              <br />
              • All documents in this folder
              <br />
              • All conversation history
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteThread}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteThreadMutation.isPending}
            >
              {deleteThreadMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Folder
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
