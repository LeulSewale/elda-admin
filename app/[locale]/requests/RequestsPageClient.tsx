"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import React, { useState, useEffect, useCallback } from "react"
import { Eye, Plus, UserPlus, Edit } from "lucide-react"
import { useTranslations } from 'next-intl'

import { CreateRequestModal } from "@/components/modals/create-request-modal"
import { AssignRequestModal } from "@/components/modals/assign-request-modal"
import { ChangeStatusModal } from "@/components/modals/change-status-modal"
import { RequestDetailModal } from "@/components/modals/request-detail-modal"
import { useAuth } from "@/hooks/use-auth"
import { useRequests } from "@/hooks/use-requests"
import { requestsApi } from "@/lib/api/requests"
import { toast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { Request } from "@/lib/types/requests"

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

export default function RequestsPageClient() {
  const queryClient = useQueryClient();
  const { isVisible, lastActivity } = useTabVisibility();
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Translation hooks
  const t = useTranslations('requests');
  const tCommon = useTranslations('common');
  const { role } = useAuth();

  // Fetch request details by ID
  const { data: requestDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["request-detail", selectedRequestId],
    queryFn: async () => {
      if (!selectedRequestId) return null;
      const response = await requestsApi.getRequest(selectedRequestId);
      return response.data?.data as Request;
    },
    enabled: !!selectedRequestId && detailModalOpen,
    staleTime: 5 * 60 * 1000,
  });

  // Use the custom hook for role-based request fetching
  const { requests, isLoading, isFetching, refetch, userRole } = useRequests();

  // Create request mutation for users
  const createRequestMutation = useMutation({
    mutationFn: ({ data, files }: { data: any, files: File[] }) => {
      console.debug("[Requests] Mutation received data:", data);
      console.debug("[Requests] Mutation received files:", files);
      return requestsApi.createRequest(data, files);
    },
    onSuccess: () => {
      toast({
        title: "Request Created",
        description: "Your request has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["requests", userRole] });
      setOpenModal(false);
    },
    onError: (error: any) => {
      console.error("[Requests] Create request error:", error);
      console.error("[Requests] Error response:", error?.response?.data);
      console.error("[Requests] Error status:", error?.response?.status);
      console.error("[Requests] Request data:", error?.config?.data);
      
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to create request.",
        variant: "destructive",
      });
    },
  });

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

  // Flatten data for table with proper error handling
  const tableData = React.useMemo(() => {
    console.debug("[Requests] Processing requests data:", requests);
    
    // Handle different data structures
    let requestsArray: any[] = [];
    
    if (Array.isArray(requests)) {
      requestsArray = requests;
    } else if (requests && typeof requests === 'object') {
      // If requests is an object with a data property
      if ('data' in requests && Array.isArray((requests as any).data)) {
        requestsArray = (requests as any).data;
      } else if ('requests' in requests && Array.isArray((requests as any).requests)) {
        requestsArray = (requests as any).requests;
      } else {
        console.warn("[Requests] Unexpected requests data structure:", requests);
        requestsArray = [];
      }
    } else {
      console.warn("[Requests] Requests is not an array or object:", requests);
      requestsArray = [];
    }
    
    return requestsArray.map((request: any, i: number) => ({
      ...request,
    no: i + 1,
      id: request.id,
      description: request.description || "",
      created_by_name: request.created_by_name || "",
      created_by_email: request.created_by_email || "",
      assigned_to_name: request.assigned_to_name || "",
      assigned_to_email: request.assigned_to_email || "",
      service_type: request.service_type || "",
      disability_type: request.disability_type || "",
      priority: request.priority || "",
      status: request.status || "",
      created_at: request.created_at,
      updated_at: request.updated_at,
    }));
  }, [requests]);

  // Table columns
  const columns = [
    { 
      accessorKey: "no", 
      header: "#", 
      size: 50,
      cell: ({ row }: any) => <span className="font-medium">{row.original.no}</span> 
    },
    { 
      accessorKey: "description", 
      header: t('description'),
      size: 150,
      cell: ({ row }: any) => {
        const desc = row.original.description || "";
        const truncatedDesc = desc.length > 60 ? desc.substring(0, 60) + "..." : desc;
        return (
          <div className="max-w-[150px] truncate text-sm" title={row.original.description}>
            {truncatedDesc}
          </div>
        );
      }
    },
    { 
      accessorKey: "created_by_name", 
      header: t('createdBy'),
      size: 180,
      cell: ({ row }: any) => (
        <div className="text-gray-600 text-sm">
          <div className="font-medium">{row.original.created_by_name}</div>
          <div className="text-xs text-gray-500 truncate max-w-[150px]">{row.original.created_by_email}</div>
        </div>
      )
    },
    { 
      accessorKey: "assigned_to_name", 
      header: t('assignedTo'),
      size: 180,
      cell: ({ row }: any) => (
        <div className="text-gray-600 text-sm">
          <div className="font-medium">{row.original.assigned_to_name || "Unassigned"}</div>
          {row.original.assigned_to_email && (
            <div className="text-xs text-gray-500 truncate max-w-[150px]">{row.original.assigned_to_email}</div>
          )}
        </div>
      )
    },
    { 
      accessorKey: "service_type", 
      header: "Service",
      size: 100,
      cell: ({ row }: any) => (
        <div className="text-gray-600 capitalize text-sm">{row.original.service_type}</div>
      )
    },
    { 
      accessorKey: "priority", 
      header: t('priority'),
      size: 100,
      cell: ({ row }: any) => {
        const priority = row.original.priority;
        const priorityColors: Record<string, string> = {
          low: "bg-green-100 text-green-800",
          medium: "bg-yellow-100 text-yellow-800",
          high: "bg-red-100 text-red-800",
          critical: "bg-red-100 text-red-800",
        };
        return <Badge className={`${priorityColors[priority] || "bg-gray-100 text-gray-800"} text-xs px-2 py-1`}>{t(priority)}</Badge>;
      }
    },
    { 
      accessorKey: "status", 
      header: t('status'),
      size: 110,
      cell: ({ row }: any) => {
        const status = row.original.status;
        const statusColors: Record<string, string> = {
          pending: "bg-yellow-100 text-yellow-800",
          in_progress: "bg-blue-100 text-blue-800",
          completed: "bg-green-100 text-green-800",
          rejected: "bg-red-100 text-red-800",
          cancelled: "bg-gray-100 text-gray-800",
        };
        return <Badge className={`${statusColors[status] || "bg-gray-100 text-gray-800"} text-xs px-2 py-1`}>{t(status)}</Badge>;
      }
    },
    { 
      accessorKey: "created_at", 
      header: t('createdAt'),
      size: 100,
      cell: ({ row }: any) => (
        <div className="text-gray-600 text-sm">
          {new Date(row.original.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      )
    },   
     {
          id: "actions",
          header: t('actions'),
          size: 150,
          cell: ({ row }: any) => {
            const request = row.original
            return (
              <div className="flex items-center gap-1 min-w-[120px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedRequestId(request.id)
                    setDetailModalOpen(true)
                  }}
                  className="h-8 px-2 hover:bg-blue-50 hover:text-blue-600"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                {/* Admin-only actions */}
                {role === "admin" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request)
                        setAssignModalOpen(true)
                      }}
                      className="h-8 px-2 hover:bg-green-50 hover:text-green-600"
                      title="Assign to Lawyer"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request)
                        setStatusModalOpen(true)
                      }}
                      className="h-8 px-2 hover:bg-purple-50 hover:text-purple-600"
                      title="Change Status"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )
          },
          enableSorting: false,
        },
  ];



  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Request Management" isFetching={true}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4082ea] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading requests...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state if authentication fails
  if (!role) {
    return (
      <DashboardLayout title="Request Management" isFetching={false}>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Authentication Required</h3>
                <p className="text-sm text-red-700 mt-1">
                  Please log in to view requests. You will be redirected to the login page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('title')} isFetching={isFetching}>
      <div className="p-0"> 
        
        <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-2 py-2">
          <div>
             <h1 className="text-xl font-semibold">{t('pageTitle')}</h1>
            <p className="text-sm text-gray-400">{t('pageSubtitle')}</p>
          </div>
          {role === "user" && <Button
          onClick={() => setOpenModal(true)}
            className="bg-[#4082ea] hover:bg-[#4082ea] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('createRequest')}
          </Button>

         }
          </div>

          <hr></hr>
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={tableData}
              quickFilterKey="status"
              searchKey="description"
              searchPlaceholder={t('searchPlaceholder')}
            />
          </div>
        </div>
        <CreateRequestModal
                  open={openModal}
                  onOpenChange={(open) => setOpenModal(open)}
                  onSubmit={(payload) => createRequestMutation.mutate(payload)}
                />
        
        {/* Admin-only modals */}
        {role === "admin" && selectedRequest && (
          <>
            <AssignRequestModal
              open={assignModalOpen}
              onOpenChange={setAssignModalOpen}
              requestId={selectedRequest.id}
              currentAssignee={selectedRequest.assigned_to_user_id}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["requests", userRole] });
                toast({
                  title: "Request Assigned",
                  description: "Request has been assigned to lawyer successfully.",
                });
              }}
            />
            <ChangeStatusModal
              open={statusModalOpen}
              onOpenChange={setStatusModalOpen}
              requestId={selectedRequest.id}
              currentStatus={selectedRequest.status}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["requests", userRole] });
                toast({
                  title: "Status Updated",
                  description: "Request status has been updated successfully.",
                });
              }}
            />
          </>
        )}

        {/* Request Detail Modal */}
        <RequestDetailModal
          open={detailModalOpen}
          onOpenChange={(open) => {
            setDetailModalOpen(open);
            if (!open) {
              setSelectedRequestId(null);
            }
          }}
          request={requestDetail || null}
        />
      </div>
    </DashboardLayout>
  );
}
