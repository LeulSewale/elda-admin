"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/data-table/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { dummyDocuments, dummyRequests, dummyUsers } from "@/lib/dummy-data"
import { useAuth } from "@/hooks/use-auth"
import { useRequests } from "@/hooks/use-requests"
import Link from "next/link"
import { Users, Building2, Gavel, FileText, RotateCcw, Eye, User, ListOrderedIcon } from "lucide-react"
import { useMemo, useCallback, useState, useEffect } from "react"
import { useTabVisibility } from "@/hooks/use-tab-visibility"
import { useTranslations } from 'next-intl'


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
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const { isVisible, lastActivity } = useTabVisibility();
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const tRequests = useTranslations('requests');

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

  // Filter requests based on selected time period
  const filterRequestsByPeriod = useCallback((requestsArray: any[], period: string) => {
    if (!Array.isArray(requestsArray)) return [];
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (period) {
      case 'daily':
        filterDate.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'yearly':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return requestsArray;
    }
    
    return requestsArray.filter((request: any) => {
      const requestDate = new Date(request.created_at);
      return requestDate >= filterDate;
    });
  }, []);

  // Stat cards config
  const statCards = useMemo(() => {
    const cards = [];
    
    // Calculate request statistics from real data filtered by period
    const requestsArray = Array.isArray(requests) ? requests : [];
    const filteredRequests = filterRequestsByPeriod(requestsArray, selectedPeriod);
    
    const totalRequests = filteredRequests.length;
    const pendingRequests = filteredRequests.filter((r: any) => r.status === 'pending').length;
    const inProgressRequests = filteredRequests.filter((r: any) => r.status === 'in_progress').length;
    const completedRequests = filteredRequests.filter((r: any) => r.status === 'completed').length;
    
    cards.push(
      {
        label: t('totalRequests'),
        value: totalRequests,
        loading: requestsLoading,
        icon: <ListOrderedIcon />,
      },
      {
        label: t('pendingRequests'),
        value: pendingRequests,
        loading: requestsLoading,
        icon: <FileText />,
      },
      {
        label: t('inProgressRequests'),
        value: inProgressRequests,
        loading: requestsLoading,
        icon: <User />,
      },
      {
        label: t('completedRequests'),
        value: completedRequests,
        loading: requestsLoading,
        icon: <FileText />,
      }
    );
    return cards;
  }, [requests, requestsLoading, selectedPeriod, filterRequestsByPeriod, t]);

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
    { accessorKey: "no", header: "#", cell: ({ row }: any) => <span className="font-medium">{row.original.no}</span> },
    { accessorKey: "description", header: tRequests('description'), cell: ({ row }: any) => (
      <div className="max-w-xs truncate" title={row.original.description}>
        {row.original.description}
      </div>
    )},
    { accessorKey: "created_by_name", header: tRequests('createdBy'), cell: ({ row }: any) => (
      <div className="text-gray-600">
        <div className="font-medium">{row.original.created_by_name}</div>
        <div className="text-xs text-gray-500">{row.original.created_by_email}</div>
      </div>
    )},
    { accessorKey: "service_type", header: tRequests('serviceType'), cell: ({ row }: any) => {
      const formatServiceType = (type: string) => {
        const types: Record<string, string> = {
          inperson_conusltation: tRequests('inpersonConsultation'),
          phone: tRequests('phoneService'),
          court_apperance: tRequests('courtAppearance'),
          hotline: tRequests('hotline'),
          other: tRequests('other'),
        }
        return types[type] || type
      }
      return (
        <div className="text-gray-600">{formatServiceType(row.original.service_type)}</div>
      )
    }},
    { accessorKey: "priority", header: tRequests('priority'), cell: ({ row }: any) => {
      const priority = row.original.priority;
      const priorityColors: Record<string, string> = {
        low: "bg-green-100 text-green-800",
        medium: "bg-yellow-100 text-yellow-800",
        high: "bg-red-100 text-red-800",
      };
      return <Badge className={priorityColors[priority] || "bg-gray-100 text-gray-800"}>{tRequests(priority)}</Badge>;
    }},
    { accessorKey: "status", header: tRequests('status'), cell: ({ row }: any) => {
      const status = row.original.status;
      const statusColors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        in_progress: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        cancelled: "bg-gray-100 text-gray-800",
      };
      return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{tRequests(status)}</Badge>;
    }},
    { accessorKey: "created_at", header: tRequests('createdAt'), cell: ({ row }: any) => (
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
          header: tCommon('actions'),
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
    <DashboardLayout title={t('title')} isFetching={isRefreshing || requestsFetching}>
      <div className="p-0">
        {/* Overview Card with Time Period Tabs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('overview')}</span>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                className="border-[#4082ea] text-[#4082ea] hover:bg-[#4082ea]/10 flex items-center gap-2 transition-all duration-200"
                disabled={isRefreshing}
                title={
                  isRefreshing 
                    ? t('refreshing') 
                    : t('refreshDashboard')
                }
              >
                <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
                {isRefreshing ? t('refreshing') : tCommon('refresh')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="daily">{t('daily')}</TabsTrigger>
                <TabsTrigger value="weekly">{t('weekly')}</TabsTrigger>
                <TabsTrigger value="monthly">{t('monthly')}</TabsTrigger>
                <TabsTrigger value="yearly">{t('yearly')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedPeriod} className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Requests Table */}
        <div className="p-0">
        <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-2 py-2">
          <div>
             <h1 className="text-xl font-semibold">{tRequests('title')}</h1>
            <p className="text-sm text-gray-400">{t('viewAndManage')}</p>
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
              searchPlaceholder={`${tCommon('search')} ${tRequests('title').toLowerCase()} ${tRequests('description').toLowerCase()}...`}
            />
          </div>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
