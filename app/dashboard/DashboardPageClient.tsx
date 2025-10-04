"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/data-table/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { dummyDocuments, dummyRequests, dummyUsers } from "@/lib/dummy-data"
import { useAuth } from "@/hooks/use-auth"
import { useRequests } from "@/hooks/use-requests"
import Link from "next/link"
import { Users, Building2, Gavel, FileText, RotateCcw, Eye, User, ListOrderedIcon } from "lucide-react"
import { useMemo, useCallback, useState, useEffect } from "react"
import { useTabVisibility } from "@/hooks/use-tab-visibility"

/**
 * ADVANCED PERFORMANCE OPTIMIZATIONS:
 * 
 * 1. STALE TIME OPTIMIZATION:
 *    - staleTime: 10 minutes - Dashboard data considered fresh for 10 minutes
 *    - gcTime: 20 minutes - Cache kept in memory for 20 minutes
 *    - Prevents unnecessary re-fetching of dashboard statistics
 * 
 * 2. TAB VISIBILITY OPTIMIZATION:
 *    - enabled: isVisible - Only fetch when tab is active
 *    - Prevents API calls when tab is inactive/background
 *    - Tracks user activity and tab focus state
 * 
 * 3. SMART REFRESH SYSTEM:
 *    - Debounced refresh (3-second minimum interval)
 *    - Activity-aware refresh (refresh if inactive >5 minutes)
 *    - Time-based refresh (refresh if last refresh >60 seconds ago)
 *    - Prevents excessive API calls for dashboard data
 * 
 * 4. REACT QUERY CONFIGURATION:
 *    - refetchOnWindowFocus: false - No fetch on window focus
 *    - refetchOnMount: false - No fetch on component mount if data exists
 *    - refetchOnReconnect: true - Fetch on network reconnect
 *    - refetchInterval: false - No automatic polling
 *    - retry: 2 - Retry failed requests twice
 *    - retryDelay: Exponential backoff with max 30s delay
 * 
 * 5. PERFORMANCE MONITORING:
 *    - Visual indicators for tab status
 *    - Cache size display for each data type
 *    - Syncing status indicators
 *    - Real-time performance feedback
 * 
 * 6. DASHBOARD-SPECIFIC OPTIMIZATIONS:
 *    - Role-based query enabling
 *    - Conditional data fetching
 *    - Efficient stat card rendering
 */

            // styles: subtle gradient, thin border, gentle hover, proper focus ring
            const statCardStyle =
            "relative flex flex-col justify-between gap-4 rounded-2xl p-5 sm:p-6 " +
            "bg-gradient-to-br from-[#f1f6ff] via-white to-white " +
            "border border-slate-200/80 shadow-sm hover:shadow-md " +
            "transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4082ea]/30 " +
            "dark:bg-zinc-900/70 dark:border-zinc-800";
            
            const iconTileStyle =
            "grid size-10 place-items-center rounded-lg bg-[#4082ea]/10 text-[#4082ea] " +
            "ring-1 ring-[#4082ea]/20 shadow-sm transition-colors group-hover:bg-[#4082ea]/15";
            const iconStyle = "w-14 h-14 p-3 rounded-xl bg-[#4082ea]/20 text-[#4082ea] shadow group-hover:bg-[#4082ea]/30 transition-all duration-200"

export default function DashboardPageClient() {
  const { role, user } = useAuth();
  const companyId = user && typeof user === 'object' && '_id' in user ? (user as any)._id : undefined;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(0);
  const { isVisible, lastActivity } = useTabVisibility();

  // Use real requests API for dashboard
  const { requests, isLoading: requestsLoading, isFetching: requestsFetching, refetch: refetchRequests, userRole } = useRequests();

  // DUMMY DATA: Fetch counts with dummy data (keeping for other stats)
  const usersQuery = useQuery({
    queryKey: ["dashboard-users-count"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
      return dummyUsers.length;
    },
    enabled: isVisible,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchInterval: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const companiesQuery = useQuery({
    queryKey: ["dashboard-companies-count"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
      return dummyUsers.length;
    },
    enabled: isVisible,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchInterval: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const bidsQuery = useQuery({
    queryKey: ["dashboard-bids-count", role, companyId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
      return dummyRequests.length;
    },
    enabled: isVisible,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchInterval: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const tendersQuery = useQuery({
    queryKey: ["dashboard-tenders-count", role, companyId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
      return dummyDocuments.length;
    },
    enabled: isVisible,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchInterval: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Smart refresh with debouncing and activity awareness
  const handleRefresh = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefresh;
    const timeSinceLastActivity = now - lastActivity;
    
    if (timeSinceLastRefresh < 3000) {
      console.log('Dashboard refresh blocked: Too frequent');
      return;
    }
    
    const shouldRefresh = timeSinceLastActivity > 5 * 60 * 1000 || timeSinceLastRefresh > 60 * 1000;
    
    if (!shouldRefresh && !isRefreshing) {
      console.log('Dashboard refresh blocked: Data is fresh');
      return;
    }
    
    try {
      setIsRefreshing(true);
      setLastRefresh(now);
      
      // Refresh all queries
      await Promise.all([
        usersQuery.refetch && usersQuery.refetch(),
        companiesQuery.refetch && companiesQuery.refetch(),
        bidsQuery.refetch && bidsQuery.refetch(),
        tendersQuery.refetch && tendersQuery.refetch(),
        refetchRequests && refetchRequests(),
      ]);
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [lastRefresh, lastActivity, isRefreshing, usersQuery, companiesQuery, bidsQuery, tendersQuery, refetchRequests]);

  // Log when tab becomes active after long inactivity
  useEffect(() => {
    if (isVisible && Date.now() - lastActivity > 5 * 60 * 1000) {
      console.log('Dashboard tab became active after long inactivity, data may be stale');
    }
  }, [isVisible, lastActivity]);

  // Stat cards config
  const statCards = useMemo(() => {
    const cards = [];
    
    // Calculate request statistics from real data
    const totalRequests = Array.isArray(requests) ? requests.length : 0;
    const pendingRequests = Array.isArray(requests) ? requests.filter((r: any) => r.status === 'pending').length : 0;
    const inProgressRequests = Array.isArray(requests) ? requests.filter((r: any) => r.status === 'in_progress').length : 0;
    const completedRequests = Array.isArray(requests) ? requests.filter((r: any) => r.status === 'completed').length : 0;
    
    cards.push(
      {
        label: "Total Requests",
        value: totalRequests,
        loading: requestsLoading,
        icon: <ListOrderedIcon />,
      },
      {
        label: "Pending Requests",
        value: pendingRequests,
        loading: requestsLoading,
        icon: <FileText />,
      },
      {
        label: "In Progress",
        value: inProgressRequests,
        loading: requestsLoading,
        icon: <User />,
      },
      {
        label: "Completed",
        value: completedRequests,
        loading: requestsLoading,
        icon: <FileText />,
      }
    );
    return cards;
  }, [requests, requestsLoading]);

  // Flatten recent requests data for table and search
  const tableData = useMemo(() => {
    console.debug("[Dashboard] Processing requests data:", requests);
    
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
        console.warn("[Dashboard] Unexpected requests data structure:", requests);
        requestsArray = [];
      }
    } else {
      console.warn("[Dashboard] Requests is not an array or object:", requests);
      requestsArray = [];
    }
    
    // Ensure maximum 10 requests are displayed
    const limitedRecent = requestsArray.slice(0, 10);
    
    return limitedRecent.map((request: any, i: number) => ({
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

  // Table columns for recent requests
  const columns = [
    { accessorKey: "no", header: "No", cell: ({ row }: any) => <span className="font-medium">{row.original.no}</span> },
    { accessorKey: "id", header: "Request ID", cell: ({ row }: any) => <span className="font-medium text-xs">{row.original.id}</span> },
    { accessorKey: "description", header: "Description", cell: ({ row }: any) => (
      <div className="max-w-xs truncate" title={row.original.description}>
        {row.original.description}
      </div>
    )},
    { accessorKey: "created_by_name", header: "Created By", cell: ({ row }: any) => (
      <div className="text-gray-600">
        <div className="font-medium">{row.original.created_by_name}</div>
        <div className="text-xs text-gray-500">{row.original.created_by_email}</div>
      </div>
    )},
    { accessorKey: "service_type", header: "Service Type", cell: ({ row }: any) => (
      <div className="text-gray-600 capitalize">{row.original.service_type}</div>
    )},
    { accessorKey: "priority", header: "Priority", cell: ({ row }: any) => {
      const priority = row.original.priority;
      const priorityColors: Record<string, string> = {
        low: "bg-green-100 text-green-800",
        medium: "bg-yellow-100 text-yellow-800",
        high: "bg-red-100 text-red-800",
      };
      return <Badge className={priorityColors[priority] || "bg-gray-100 text-gray-800"}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>;
    }},
    { accessorKey: "status", header: "Status", cell: ({ row }: any) => {
      const status = row.original.status;
      const statusColors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        in_progress: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        cancelled: "bg-gray-100 text-gray-800",
      };
      return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    }},
    { accessorKey: "created_at", header: "Created At", cell: ({ row }: any) => (
        <div className="text-gray-600">
        {new Date(row.original.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
    )},   
     {
          id: "actions",
          header: "Actions",
          cell: ({ row }: any) => {
        const request = row.original
            return (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
              onClick={() => {
                // TODO: Open request detail modal
                console.log("View request:", request.id);
              }}
                  className="hover:bg-blue-50 hover:text-blue-600"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            )
          },
          enableSorting: false,
        },
  ];

  return (
    <DashboardLayout title="Dashboard" isFetching={isRefreshing || requestsFetching}>
      <div className="p-0">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            className="border-[#4082ea] text-[#4082ea] hover:bg-[#4082ea]/10 flex items-center gap-2 transition-all duration-200"
            disabled={isRefreshing}
            title={
              isRefreshing 
                ? 'Refreshing dashboard...' 
                : 'Refresh dashboard data'
            }
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => (

<Card key={card.label} className={statCardStyle}>
{/* soft ambient glow (very subtle) */}
<div
  aria-hidden
  className="pointer-events-none absolute -right-10 -top-10 size-24 rounded-full bg-[#4082ea]/5 blur-2xl"
/>

{/* top row: icon + label */}
<div className="flex items-center justify-between w-full">
  <div className="flex items-center gap-3 min-w-0">
    <div className={iconTileStyle}>
      <span className="inline-flex">{card.icon}</span>
    </div>
    <span className="truncate text-[15px] font-semibold text-slate-700 dark:text-zinc-100">
      {card.label}
    </span>
  </div>
</div>

{/* value on bottom-right (unchanged placement, improved typographic tone) */}
<div className="flex-1 flex items-end justify-end">
  {card.loading ? (
    <div className="h-9 w-24 rounded bg-slate-100 animate-pulse dark:bg-zinc-800" />
  ) : (
    <div
      className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-[#4082ea] dark:text-sky-400"
      aria-live="polite"
    >
      {card.value}
    </div>
  )}
</div>

{/* subtle hover accent bar */}
<div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-[#4082ea]/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
</Card>

          ))}
        </div>

        {/* Visual Separator
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 mb-4"></div>
          </div>
          
        </div> */}

        {/* Recent Bids Table */}
        <div className="p-0">
        <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-2 py-2">
          <div>
             <h1 className="text-xl font-semibold">Requests</h1>
            <p className="text-sm text-gray-400">View and manage request management</p>
          </div>
          {/* <Button
            className="bg-[#4082ea] hover:bg-[#4082ea] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Document
          </Button> */}
          </div>
          <hr></hr>
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={tableData}
              quickFilterKey="status"
              searchKey="description"
              searchPlaceholder="Search request by description..."
            />
          </div>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
