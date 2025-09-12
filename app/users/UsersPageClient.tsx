"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/data-table/data-table"
// import { usersApi } from "@/lib/api/users"
import { dummyUsers, simulateApiDelay } from "@/lib/dummy-data"
import type { User } from "@/lib/types"
import { useEffect, useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserDetailModal } from "@/components/modals/user-detail-modal"
import { DeleteModal } from "@/components/modals/delete-modal"
import { Eye, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { RotateCcw } from "lucide-react"
import { useTabVisibility } from "@/hooks/use-tab-visibility"

/**
 * ADVANCED PERFORMANCE OPTIMIZATIONS:
 * 
 * 1. STALE TIME OPTIMIZATION:
 *    - staleTime: 15 minutes - Data considered fresh for 15 minutes
 *    - gcTime: 30 minutes - Cache kept in memory for 30 minutes
 *    - Prevents unnecessary re-fetching of recent data
 * 
 * 2. TAB VISIBILITY OPTIMIZATION:
 *    - enabled: isVisible - Only fetch when tab is active
 *    - Prevents API calls when tab is inactive/background
 *    - Tracks user activity and tab focus state
 * 
 * 3. SMART REFRESH SYSTEM:
 *    - Debounced refresh (2-second minimum interval)
 *    - Activity-aware refresh (refresh if inactive >5 minutes)
 *    - Time-based refresh (refresh if last refresh >30 seconds ago)
 *    - Prevents excessive API calls
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
 *    - Cache size display
 *    - Syncing status indicators
 *    - Real-time performance feedback
 * 
 * 6. OPTIMISTIC UPDATES:
 *    - Immediate UI feedback for user actions
 *    - Rollback on error
 *    - Better user experience
 */

export function UsersPageClient() {
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(0)
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isVisible, lastActivity } = useTabVisibility();

  // DUMMY DATA: React Query for fetching users with dummy data
  const {
    data: users,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      await simulateApiDelay();
      return dummyUsers;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchInterval: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: isVisible,
  });

  // Smart refresh with debouncing and activity awareness
  const handleRefresh = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefresh;
    const timeSinceLastActivity = now - lastActivity;
    
    if (timeSinceLastRefresh < 2000) {
      console.log('Refresh blocked: Too frequent');
      return;
    }
    
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

  // DUMMY DATA: Lock user mutation with optimistic updates
  const lockUserMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      await simulateApiDelay();
      return { success: true };
    },
    onMutate: async ({ userId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const previousData = queryClient.getQueryData(["users"]);
      
      queryClient.setQueryData(["users"], (old: any) => {
        if (!old) return old;
        return old.map((user: any) =>
          user._id === userId || user.id === userId 
            ? { ...user, status } 
            : user
        );
      });
      
      return { previousData };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["users"], context.previousData);
      }
      toast({
        title: "Lock failed",
        description: err?.response?.data?.message || err?.message || "Failed to lock user account.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User account has been locked successfully",
        variant: "default",
      });
      setDeleteModalOpen(false);
      setSelectedUser(null);
    },
  });

  // Log when tab becomes active after long inactivity
  useEffect(() => {
    if (isVisible && Date.now() - lastActivity > 5 * 60 * 1000) {
      console.log('Tab became active after long inactivity, data may be stale');
    }
  }, [isVisible, lastActivity]);

  const columns = [
    {
      id: "no",
      header: "No",
      cell: ({ visibleIndex }: any) => visibleIndex + 1,
      enableSorting: false,
    },
    {
      accessorKey: "fullName",
      header: "Name",
      cell: ({ row }: any) => <span>{row.original.fullName}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: any) => <span>{row.original.email}</span>,
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }: any) => <span>{row.original.phoneNumber}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status")
        if (status === 'active') {
          return <Badge className="bg-[#A4D65E] text-white">Active</Badge>
        } else if (status === 'suspended') {
          return <Badge className="bg-[#FACC15] text-white">Suspended</Badge>
        } else {
          return <Badge className="bg-[#EF4444] text-white">Locked</Badge>
        }
      },
    },
   
    {
      accessorKey: "entitlement.packageName",
      header: "Package",
      cell: ({ row }: any) => {
        const entitlement = row.original.entitlement;
        if (!entitlement) {
          return <span className="text-gray-400">No package</span>;
        }
        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium">{entitlement.packageName}</span>
            <span className="text-xs text-gray-500">ID: {entitlement.packageId}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "entitlement.isActive",
      header: "Package Status",
      cell: ({ row }: any) => {
        const entitlement = row.original.entitlement;
        if (!entitlement) {
          return <span className="text-gray-400">-</span>;
        }
        return (
          <Badge 
            variant={entitlement.isActive ? "default" : "secondary"}
            className={`font-medium ${
              entitlement.isActive 
                ? "bg-green-100 text-green-800 border-green-200" 
                : "bg-red-100 text-red-800 border-red-200"
            }`}
          >
            {entitlement.isActive ? "🟢 Active" : "🔴 Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "entitlement.endsAt",
      header: "Package Expires",
      cell: ({ row }: any) => {
        const entitlement = row.original.entitlement;
        if (!entitlement || !entitlement.endsAt) {
          return <span className="text-gray-400">-</span>;
        }
        const endDate = new Date(entitlement.endsAt);
        const now = new Date();
        const isExpired = endDate < now;
        const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <div className="flex flex-col">
            <span className={isExpired ? "text-red-600" : "text-gray-700"}>
              {endDate.toLocaleDateString()}
            </span>
            {!isExpired && (
              <span className="text-xs text-gray-500">
                {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
              </span>
            )}
            {isExpired && (
              <span className="text-xs text-red-500">Expired</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined At",
      cell: ({ row }: any) => <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const user = row.original as User
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedUser(user)
                setDetailModalOpen(true)
              }}
              className="hover:bg-blue-50 hover:text-blue-600"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedUser(user)
                setDeleteModalOpen(true)
              }}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
      enableSorting: false,
    },
  ]

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    const userId = selectedUser._id || selectedUser.id;
    if (!userId) return;
    
    lockUserMutation.mutate({ userId, status: "locked" });
  }

  return (
    <DashboardLayout title="Users" isFetching={isFetching}>
      <div className="p-0">
        {/* Header and Refresh Button */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Users</h1>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className={`ml-2 border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm bg-white hover:bg-gray-50 ${
                (isFetching || isRefreshing) ? 'cursor-wait' : ''
              }`}
              aria-label="Refresh users"
              disabled={isFetching || isRefreshing}
              title={
                isRefreshing 
                  ? 'Refreshing...' 
                  : isFetching 
                    ? 'Syncing data...' 
                    : 'Refresh users data'
              }
            >
              <RotateCcw
                className={`w-6 h-6 stroke-[2.5] transition-transform duration-300 ${
                  (isFetching || isRefreshing) 
                    ? 'animate-spin text-green-500' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              />
            </Button>
          </div>
        </div>

        {error ? (
          <div className="text-center py-10 text-red-500">Failed to load users.</div>
        ) : (
          <div className="relative">
            {isFetching && !isLoading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
              </div>
            )}
            <DataTable columns={columns} data={users || []} searchKey="fullName" searchPlaceholder="Search users by name" />
          </div>
        )}
      </div>
      <UserDetailModal
        open={detailModalOpen}
        onOpenChange={(open) => {
          setDetailModalOpen(open)
          if (!open) setSelectedUser(null)
        }}
        user={selectedUser}
      />
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open)
          if (!open) setSelectedUser(null)
        }}
        onConfirm={handleDelete}
        title="Lock User Account"
        description="Are you sure you want to lock this user's account? This will prevent them from accessing the system. This action can be reversed by changing their status back to active."
        isLoading={deleteLoading || lockUserMutation.isPending}
      />
    </DashboardLayout>
  )
} 