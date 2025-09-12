"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/data-table/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuery, useQueryClient } from "@tanstack/react-query"
// import { usersApi } from "@/lib/api/users"
// import { companiesApi } from "@/lib/api/companies"
// import { bidsApi } from "@/lib/api/bids"
// import { tendersApi } from "@/lib/api/tenders"
import { dummyDocuments, dummyRequests, dummyUsers } from "@/lib/dummy-data"
import { useAuth } from "@/hooks/use-auth"
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

const statCardStyle = "relative flex flex-col justify-between gap-4 p-6 rounded-xl shadow-md bg-gradient-to-br from-[#e7eeff] via-[#f0f5ff] to-white border-0 transition-transform duration-200 hover:scale-[1.03] group"
const iconStyle = "w-14 h-14 p-3 rounded-xl bg-[#4082ea]/20 text-[#4082ea] shadow group-hover:bg-[#4082ea]/30 transition-all duration-200"

export default function DashboardPageClient() {
  const { role, user } = useAuth();
  const companyId = user && typeof user === 'object' && '_id' in user ? (user as any)._id : undefined;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(0);
  const { isVisible, lastActivity } = useTabVisibility();

  // DUMMY DATA: Fetch counts with dummy data
  const usersQuery = useQuery({
    queryKey: ["dashboard-users-count"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
      return dummyUsers.length;
    },
    enabled: role === "admin" && isVisible,
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
      return dummyUsers.filter((u: any) => u.role === 'company').length;
    },
    enabled: role === "admin" && isVisible,
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
      if (role === "admin") {
        return dummyRequests.length;
      } else if (role === "user" && companyId) {
        return dummyRequests.filter((bid: any) => bid.user._id === companyId).length;
      }
      return 0;
    },
    enabled: !!role && (role === "admin" || (role === "user" && !!companyId)) && isVisible,
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
      if (role === "admin") {
        return dummyDocuments.length;
      } else if (role === "company" && companyId) {
        return dummyDocuments.filter((document: any) => 
          typeof document.company === 'object' && document.company._id === companyId
        ).length;
      }
      return 0;
    },
    enabled: !!role && (role === "admin" || (role === "company" && !!companyId)) && isVisible,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchInterval: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // DUMMY DATA: Fetch recent bids with dummy data
  const recentBidsQuery = useQuery({
    queryKey: ["dashboard-recent-bids", role, companyId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 400)) // Simulate API delay
      if (role === "admin") {
        return dummyRequests.slice(0, 10);
      } else if (role === "user" && companyId) {
        return dummyRequests.filter((bid: any) => bid.user._id === companyId).slice(0, 10);
      }
      return [];
    },
    enabled: !!role && (role === "admin" || (role === "user" && !!companyId)) && isVisible,
    staleTime: 5 * 60 * 1000, // 5 minutes (more frequent for recent data)
    gcTime: 15 * 60 * 1000, // 15 minutes
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
        recentBidsQuery.refetch && recentBidsQuery.refetch(),
      ]);
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [lastRefresh, lastActivity, isRefreshing, usersQuery, companiesQuery, bidsQuery, tendersQuery, recentBidsQuery]);

  // Log when tab becomes active after long inactivity
  useEffect(() => {
    if (isVisible && Date.now() - lastActivity > 5 * 60 * 1000) {
      console.log('Dashboard tab became active after long inactivity, data may be stale');
    }
  }, [isVisible, lastActivity]);

  // Stat cards config
  const statCards = useMemo(() => {
    const cards = [];
    
    cards.push(
      {
        label: "Unread Orders",
        value: bidsQuery.data ?? 0,
        loading: bidsQuery.isLoading,
        icon: <ListOrderedIcon className={iconStyle} />,
      },
      {
        label: "Unsent Document",
        value: tendersQuery.data ?? 0,
        loading: tendersQuery.isLoading,
        icon: <FileText className={iconStyle} />,
      }, {
        label: "Total Users",
        value: bidsQuery.data ?? 0,
        loading: bidsQuery.isLoading,
        icon: <User className={iconStyle} />,
      },
      {
        label: "Expiring Documents",
        value: tendersQuery.data ?? 0,
        loading: tendersQuery.isLoading,
        icon: <FileText className={iconStyle} />,
      }
    );
    return cards;
  }, [role, usersQuery.data, usersQuery.isLoading, companiesQuery.data, companiesQuery.isLoading, bidsQuery.data, bidsQuery.isLoading, tendersQuery.data, tendersQuery.isLoading]);

  // Flatten recent bids data for table and search
  const tableData = useMemo(() => {
    const requests = recentBidsQuery.data || [];
    // Ensure maximum 10 bids are displayed
    const limitedRecent = requests.slice(0, 10);
    
    return limitedRecent;
  }, [recentBidsQuery.data]);

  // Table columns for recent bids
  const columns = [
    { accessorKey: "no", header: "No", cell: ({ row }: any) => <span className="font-medium">{row.original.no}</span> },
    { accessorKey: "id", header: "ID", cell: ({ row }: any) => <span className="font-medium">{row.original.id}</span> },
    { accessorKey: "title", header: "Title", cell: ({ row }: any) => <div className="font-medium">{row.original.title}</div> },
    { accessorKey: "phone", header: "Contact", cell: ({ row }: any) => <div className="text-gray-600">{row.original.phone}</div> },
    { accessorKey: "serviceType", header: "Service Type", cell: ({ row }: any) => <div className="text-gray-600">{row.original.email}</div> },
    { accessorKey: "status", header: "Status", cell: ({ row }: any) => {
      const status = row.original.status;
      const statusColors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        completed: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
      };
      return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    } },
    { accessorKey: "createdAt",
       header: "Created At", 
       cell: ({ row }: any) => (
        <div className="text-gray-600">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      ),
     },   
    
     {
          id: "actions",
          header: "Actions",
          cell: ({ row }: any) => {
            const user = row.original
            return (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  // onClick={() => {
                  //   setSelectedUser(user)
                  //   setDetailModalOpen(true)
                  // }}
                  className="hover:bg-blue-50 hover:text-blue-600"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {/* <Button
                  variant="ghost"
                  size="icon"
                  // onClick={() => {
                  //   setSelectedUser(user)
                  //   setDeleteModalOpen(true)
                  // }}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button> */}
              </div>
            )
          },
          enableSorting: false,
        },
  ];

  return (
    <DashboardLayout title="Dashboard" isFetching={isRefreshing}>
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
              <div className="flex items-center justify-between w-full">
                <span className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  {card.icon}
                  {card.label}
                </span>
              </div>
              <div className="flex-1 flex items-end justify-end">
                {card.loading ? (
                  <div className="h-10 w-24 bg-gray-100 animate-pulse rounded" />
                ) : (
                  <div className="text-4xl font-extrabold text-[#4082ea] drop-shadow-lg">{card.value}</div>
                )}
              </div>
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
              searchKey="title"
              searchPlaceholder="Search request by title..."
            />
          </div>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
