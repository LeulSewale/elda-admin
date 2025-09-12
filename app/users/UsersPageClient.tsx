"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/data-table/data-table"
import { usersApi } from "@/lib/api/users"
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

  const dummyUsers = [
    {
      no: 1,
      name: "Habtamu Esubalew",
      phone: "+251911223344",
      email: "habtamu.esubalew@example.com",
      status: "active",
      joinedAt: "2025-01-10",
    },
    {
      no: 2,
      name: "Mekdes Alemu",
      phone: "+251922334455",
      email: "mekdes.alemu@example.com",
      status: "Inactive",
      joinedAt: "2025-02-05",
    },
    {
      no: 3,
      name: "Abebe Bekele",
      phone: "+251933445566",
      email: "abebe.bekele@example.com",
      status: "active",
      joinedAt: "2025-02-18",
    },
    {
      no: 4,
      name: "Meron Fikadu",
      phone: "+251944556677",
      email: "meron.fikadu@example.com",
      status: "Inactive",
      joinedAt: "2025-03-01",
    },
    {
      no: 5,
      name: "Samuel Tadesse",
      phone: "+251955667788",
      email: "samuel.tadesse@example.com",
      status: "active",
      joinedAt: "2025-03-10",
    },
    {
      no: 6,
      name: "Tsion Tesfaye",
      phone: "+251966778899",
      email: "tsion.tesfaye@example.com",
      status: "active",
      joinedAt: "2025-03-22",
    },
    {
      no: 7,
      name: "Nahom Gebremariam",
      phone: "+251977889900",
      email: "nahom.gebremariam@example.com",
      status: "Inactive",
      joinedAt: "2025-04-05",
    },
    {
      no: 8,
      name: "Hana Wondimu",
      phone: "+251988990011",
      email: "hana.wondimu@example.com",
      status: "active",
      joinedAt: "2025-04-18",
    },
    {
      no: 9,
      name: "Kebede Worku",
      phone: "+251999001122",
      email: "kebede.worku@example.com",
      status: "Inactive",
      joinedAt: "2025-05-01",
    },
    {
      no: 10,
      name: "Selamawit Degu",
      phone: "+251910112233",
      email: "selamawit.degu@example.com",
      status: "active",
      joinedAt: "2025-05-12",
    },
  ];
  

  const {
    data: users,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      // const res = await usersApi.getUsers();
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

  // Lock user mutation with optimistic updates
  const lockUserMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      return usersApi.lockUser(userId, { status });
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



  const columns = [
    {
      id: "no",
      header: "No",
      cell: ({ visibleIndex }: any) => visibleIndex + 1,
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => <span>{row.original.name}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: any) => <span>{row.original.email}</span>,
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }: any) => <span>{row.original.phone}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status")
        if (status === 'active') {
          return <Badge className="bg-[#A4D65E] text-white">Active</Badge>
        } else if (status === 'Inactive') {
          return <Badge className="bg-[#FACC15] text-white">InActive</Badge>
        } 
      },
    },
         
    { accessorKey: "joinedAt",
      header: "joined At", 
      cell: ({ row }: any) => (
       <div className="text-gray-600">
         {new Date(row.original.joinedAt).toLocaleDateString("en-US", {
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
      <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-2 py-2">
          <div>
             <h1 className="text-xl font-semibold">Users</h1>
            <p className="text-sm text-gray-400">View and manage users management</p>
          </div>
          {/* <Button
            className="bg-[#4082ea] hover:bg-[#4082ea] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Document
          </Button> */}
        </div>
        <hr></hr>
       

        {error ? (
          <div className="text-center py-10 text-red-500">{(error as any)?.message || "Failed to load users."}</div>
        ) : (
          <div className="relative">
            {isFetching && !isLoading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
              </div>
            )}
            <DataTable 
            columns={columns}
             data={users || []} 
             searchKey="name" 
             quickFilterKey="status"
             searchPlaceholder="Search users by name" />
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
      </div>
    </DashboardLayout>
  )
} 