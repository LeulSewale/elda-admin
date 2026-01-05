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
import { useTranslations } from 'next-intl'

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
    
    const pendingRequests = filteredRequests.filter((r: any) => r.status === 'pending').length;
    const inProgressRequests = filteredRequests.filter((r: any) => r.status === 'in_progress').length;
    const completedRequests = filteredRequests.filter((r: any) => r.status === 'completed').length;
    const totalRequests = filteredRequests.length;
    
    cards.push(
      {
        label: t('pendingRequests'),
        value: pendingRequests,
        percentage: totalRequests > 0 ? ((pendingRequests / totalRequests) * 100).toFixed(1) : '0',
        loading: requestsLoading,
        icon: <FileText />,
        bgColor: 'from-blue-50 via-blue-50/50 to-white',
        textColor: 'text-blue-900 dark:text-blue-300',
        valueColor: 'text-blue-700 dark:text-blue-400',
      },
      {
        label: t('inProgressRequests'),
        value: inProgressRequests,
        percentage: totalRequests > 0 ? ((inProgressRequests / totalRequests) * 100).toFixed(1) : '0',
        loading: requestsLoading,
        icon: <User />,
        bgColor: 'from-green-50 via-green-50/50 to-white',
        textColor: 'text-green-900 dark:text-green-300',
        valueColor: 'text-green-700 dark:text-green-400',
      },
      {
        label: t('completedRequests'),
        value: completedRequests,
        percentage: totalRequests > 0 ? ((completedRequests / totalRequests) * 100).toFixed(1) : '0',
        loading: requestsLoading,
        icon: <FileText />,
        bgColor: 'from-purple-50 via-purple-50/50 to-white',
        textColor: 'text-purple-900 dark:text-purple-300',
        valueColor: 'text-purple-700 dark:text-purple-400',
      },
      {
        label: t('totalRequests'),
        value: totalRequests,
        percentage: '100',
        loading: requestsLoading,
        icon: <ListOrderedIcon />,
        bgColor: 'from-gray-50 via-gray-50/50 to-white',
        textColor: 'text-gray-900 dark:text-gray-100',
        valueColor: 'text-gray-700 dark:text-gray-300',
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
      <div className="text-gray-600 dark:text-gray-300">
        <div className="font-medium">{row.original.created_by_name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{row.original.created_by_email}</div>
      </div>
    )},
    { accessorKey: "service_type", header: tRequests('serviceType'), cell: ({ row }: any) => {
      const formatServiceType = (type: string) => {
        const types: Record<string, string> = {
          inperson_conusltation: tRequests('inpersonConsultation'),
          phone: tRequests('phoneConsultation') || tRequests('phoneService'),
          court_apperance: tRequests('courtAppearanceRepresentation') || tRequests('courtAppearance'),
          hotline: tRequests('hotline'),
          other: tRequests('other'),
        }
        return types[type] || type
      }
      return (
        <div className="text-gray-600 dark:text-gray-300">{formatServiceType(row.original.service_type)}</div>
      )
    }},
    { accessorKey: "priority", header: tRequests('priority'), cell: ({ row }: any) => {
      const priority = row.original.priority;
      const priorityColors: Record<string, string> = {
        low: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
        medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
        high: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
      };
      return <Badge className={priorityColors[priority] || "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}>{tRequests(priority)}</Badge>;
    }},
    { accessorKey: "status", header: tRequests('status'), cell: ({ row }: any) => {
      const status = row.original.status;
      const statusColors: Record<string, string> = {
        pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
        in_progress: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
        completed: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
        rejected: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
        cancelled: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
      };
      return <Badge className={statusColors[status] || "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}>{tRequests(status)}</Badge>;
    }},
    { accessorKey: "created_at", header: tRequests('createdAt'), cell: ({ row }: any) => (
        <div className="text-gray-600 dark:text-gray-300">
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
        <Card className="mb-8 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('overview')}</span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Time Period Tabs */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                  <button
                    onClick={() => setSelectedPeriod('daily')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      selectedPeriod === 'daily'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    {t('daily')}
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('weekly')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      selectedPeriod === 'weekly'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    {t('weekly')}
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('monthly')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      selectedPeriod === 'monthly'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    {t('monthly')}
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('yearly')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      selectedPeriod === 'yearly'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    {t('yearly')}
                  </button>
                </div>

                {/* Refresh Button */}
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
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card) => (
                <Card 
                  key={card.label} 
                  className={`relative overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br ${card.bgColor} dark:from-gray-800 dark:via-gray-800 dark:to-gray-800`}
                >
                  <CardContent className="pt-6 pb-6 px-6 flex flex-col items-center text-center space-y-3">
                    {/* Label/Title */}
                    <h3 className={`text-sm font-semibold uppercase tracking-wide ${card.textColor}`}>
                      {card.label}
                    </h3>
                    
                    {/* Main Value */}
                    {card.loading ? (
                      <div className="h-12 w-32 rounded bg-gray-200/50 dark:bg-gray-700/50 animate-pulse" />
                    ) : (
                      <div className={`text-5xl font-bold tabular-nums ${card.valueColor}`}>
                        {card.value.toLocaleString()}
                      </div>
                    )}
                    
                    {/* Subtitle */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {t('totalVolume')}
                    </p>
                    
                    {/* Percentage or Additional Info */}
                    {!card.loading && (
                      <div className="pt-2 border-t border-gray-200 w-full">
                        <p className={`text-sm font-semibold ${card.valueColor}`}>
                          {card.percentage}% {tCommon('of')} {t('totalRequests')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Requests Table */}
        <div className="p-0">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-2 py-2">
          <div>
             <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{tRequests('title')}</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500">{t('viewAndManage')}</p>
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
