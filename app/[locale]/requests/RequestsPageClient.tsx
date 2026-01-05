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
import { useRouter, usePathname } from "next/navigation"
import { getCurrentLocaleFromPath, getPreferredLanguage } from "@/lib/language-utils"

import { CreateRequestModal } from "@/components/modals/create-request-modal"
import { AssignRequestModal } from "@/components/modals/assign-request-modal"
import { ChangeStatusModal } from "@/components/modals/change-status-modal"
import { RequestDetailModal } from "@/components/modals/request-detail-modal"
import { DateRangeFilter } from "@/components/ui/date-range-filter"
import { useAuth } from "@/hooks/use-auth"
import { useRequests } from "@/hooks/use-requests"
import { requestsApi } from "@/lib/api/requests"
import { toast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { Request } from "@/lib/types/requests"
import { getErrorMessage, getErrorTitle } from "@/lib/error-utils"

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
  const router = useRouter();
  const pathname = usePathname();
  const { isVisible, lastActivity } = useTabVisibility();
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<{ startDate: string | null; endDate: string | null }>({
    startDate: null,
    endDate: null
  });
  
  // Translation hooks
  const t = useTranslations('requests');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const { role, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  // Redirect to login if not authenticated (after loading completes)
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      const currentLocale = getCurrentLocaleFromPath(pathname) || getPreferredLanguage();
      router.replace(`/${currentLocale}/login`);
    }
  }, [isAuthenticated, isAuthLoading, router, pathname]);

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

  // Use the custom hook for role-based request fetching with date range
  const { requests, isLoading: isRequestsLoading, isFetching, refetch, userRole } = useRequests({
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined
  });

  // Create request mutation for users
  const createRequestMutation = useMutation({
    mutationFn: ({ data, files, titles }: { data: any, files: File[], titles?: string[] }) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug("[Requests] Mutation received data:", data);
        console.debug("[Requests] Mutation received files:", files);
        console.debug("[Requests] Mutation received titles:", titles);
      }
      return requestsApi.createRequest(data, files, titles);
    },
    onSuccess: async (response) => {
      toast({
        title: "Request Created",
        description: "Your request has been submitted successfully.",
      });
      
      // Close modal first
      setOpenModal(false);
      
      // Invalidate all request queries to ensure fresh data
      await queryClient.invalidateQueries({ 
        queryKey: ["requests"],
        refetchType: 'active' // Only refetch active queries
      });
      
      // Explicitly refetch the current query to get updated data
      await refetch();
    },
    onError: (error: any) => {
      console.error("[Requests] Create request error:", error);
      console.error("[Requests] Error response:", error?.response?.data);
      console.error("[Requests] Error response (full):", JSON.stringify(error?.response?.data, null, 2));
      console.error("[Requests] Error status:", error?.response?.status);
      console.error("[Requests] Error headers:", error?.response?.headers);
      
      // Get base error message first
      const errorTitle = getErrorTitle(error, tErrors);
      const baseErrorMessage = getErrorMessage(error, tErrors);
      
      // Try to extract detailed error message from response
      const errorData = error?.response?.data;
      let errorMessage = baseErrorMessage;
      
      if (errorData) {
        // Check for validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map((e: any) => e.message || e).join(', ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : (errorData.error.message || baseErrorMessage);
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
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

  // Handle date range changes
  const handleDateRangeChange = useCallback((startDate: string | null, endDate: string | null) => {
    setDateRange({ startDate, endDate });
  }, []);

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
        <div className="text-gray-600 dark:text-gray-300 text-sm">
          <div className="font-medium">{row.original.created_by_name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{row.original.created_by_email}</div>
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
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{row.original.assigned_to_email}</div>
          )}
        </div>
      )
    },
    { 
      accessorKey: "service_type", 
      header: t('serviceType'),
      size: 100,
      cell: ({ row }: any) => {
        const formatServiceType = (type: string) => {
          const types: Record<string, string> = {
            inperson_conusltation: t('inpersonConsultation'),
            phone: t('phoneConsultation') || t('phoneService'),
            court_apperance: t('courtAppearanceRepresentation') || t('courtAppearance'),
            hotline: t('hotline'),
            other: t('other'),
          }
          return types[type] || type
        }
        return (
          <div className="text-gray-600 dark:text-gray-300 text-sm">{formatServiceType(row.original.service_type)}</div>
        )
      }
    },
    { 
      accessorKey: "priority", 
      header: t('priority'),
      size: 100,
      cell: ({ row }: any) => {
        const priority = row.original.priority;
        const priorityColors: Record<string, string> = {
          low: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
          medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
          high: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
          critical: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
        };
        return <Badge className={`${priorityColors[priority] || "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"} text-xs px-2 py-1`}>{t(priority)}</Badge>;
      }
    },
    { 
      accessorKey: "status", 
      header: t('status'),
      size: 110,
      cell: ({ row }: any) => {
        const status = row.original.status;
        const statusColors: Record<string, string> = {
          pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
          in_progress: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
          completed: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
          rejected: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
          cancelled: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
        };
        return <Badge className={`${statusColors[status] || "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"} text-xs px-2 py-1`}>{t(status)}</Badge>;
      }
    },
    { 
      accessorKey: "created_at", 
      header: t('createdAt'),
      size: 100,
      cell: ({ row }: any) => (
        <div className="text-gray-600 dark:text-gray-300 text-sm">
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



  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <DashboardLayout title="Request Management" isFetching={true}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4082ea] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If not authenticated, the useEffect will redirect, but show loading in the meantime
  if (!isAuthenticated) {
    return (
      <DashboardLayout title="Request Management" isFetching={false}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4082ea] mx-auto mb-4"></div>
              <p className="text-gray-600">Redirecting to login...</p>
            </div>
              </div>
              </div>
      </DashboardLayout>
    );
  }

  // Show loading state for requests
  if (isRequestsLoading) {
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

  return (
    <DashboardLayout title={t('title')} isFetching={isFetching}>
      <div className="p-0"> 
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-2 py-2">
          <div>
             <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('pageTitle')}</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500">{t('pageSubtitle')}</p>
          </div>
          <div className="flex items-center gap-4">
            <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
            {role === "user" && <Button
            onClick={() => setOpenModal(true)}
              className="bg-[#4082ea] hover:bg-[#4082ea] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('createRequest')}
            </Button>
           }
          </div>
          </div>

          <hr></hr>
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={tableData}
              quickFilterKey="status"
              searchKey="description"
              searchPlaceholder={t('searchPlaceholder')}
              onRefresh={async () => {
                await refetch();
              }}
            />
          </div>
        </div>
        <CreateRequestModal
                  open={openModal}
                  onOpenChange={(open) => setOpenModal(open)}
                  onSubmit={(payload) => {
                    // Prevent double submission - only submit if mutation is not already pending
                    if (!createRequestMutation.isPending) {
                      createRequestMutation.mutate(payload)
                    }
                  }}
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
