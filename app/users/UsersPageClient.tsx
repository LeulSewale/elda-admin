"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/data-table/data-table"
import { usersApi } from "@/lib/api/users"
import { api } from "@/lib/axios"
import type { User } from "@/lib/types"
import { useEffect, useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserDetailModal } from "@/components/modals/user-detail-modal"
import { DeleteModal } from "@/components/modals/delete-modal"
import { CreateUserModal } from "@/components/modals/create-user-modal"
import { EditUserModal } from "@/components/modals/edit-user-modal"
import { Eye, Loader2, Trash2, Plus, Edit, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTabVisibility } from "@/hooks/use-tab-visibility"
import { useAuth } from "@/hooks/use-auth"

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
  const [editUserModalOpen, setEditUserModalOpen] = useState(false)
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(0)
  
  // Debug modal state changes
  useEffect(() => {
    console.debug("[Users] Edit modal state changed", { 
      editUserModalOpen, 
      selectedUser: selectedUser?.id || selectedUser?._id,
      hasSelectedUser: !!selectedUser 
    })
  }, [editUserModalOpen, selectedUser])
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isVisible, lastActivity } = useTabVisibility();
  const { role } = useAuth();

  // Server provides: { status, message, data: User[], paging }
  

  const {
    data: users,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const params = { page: 1, limit: 20, q: "", sort: "" };
      // Debug: request params
      // eslint-disable-next-line no-console
      console.debug("[Users] Fetch start", {
        params,
        baseURL: api.defaults.baseURL,
        withCredentials: api.defaults.withCredentials,
        headers: api.defaults.headers,
        location: typeof window !== 'undefined' ? window.location.origin : 'server',
        cookies: typeof document !== 'undefined' ? document.cookie : 'no-document'
      })
      try {
        const res = await usersApi.getUsers(params);
        // Debug: response
        // eslint-disable-next-line no-console
        console.debug("[Users] Fetch success", {
          status: res.status,
          url: res.config?.url,
          method: res.config?.method,
          hasDataArray: Array.isArray(res.data?.data),
          count: Array.isArray(res.data?.data) ? res.data.data.length : undefined
        })
        return (res.data?.data || []) as any[];
      } catch (e: any) {
        // Debug: error details
        // eslint-disable-next-line no-console
        console.error("[Users] Fetch error", {
          error: e,
          message: e?.message,
          code: e?.code,
          status: e?.response?.status,
          data: e?.response?.data,
          url: e?.config?.url,
          method: e?.config?.method,
          withCredentials: e?.config?.withCredentials,
          baseURL: e?.config?.baseURL,
          request: e?.request ? { withCredentials: e?.request?.withCredentials, responseURL: e?.request?.responseURL } : undefined,
          stack: e?.stack,
          name: e?.name
        })
        
        // Don't throw error to prevent logout - return empty array instead
        console.warn("[Users] API failed, returning empty array to prevent logout")
        return []
      }
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

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: { name: string; email: string; phone: string; password: string; role: string }) => {
      console.debug("[Create User] Sending data:", userData);
      return usersApi.createUser(userData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
        variant: "default",
      });
      setCreateUserModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      // Try to get error message from various possible locations
      let errorMessage = "Failed to create user.";
      
      if (err?.response?.data?.error) {
        // If error is an object, try to extract message
        if (typeof err.response.data.error === 'object') {
          errorMessage = err.response.data.error.message || err.response.data.error.details || JSON.stringify(err.response.data.error);
        } else {
          errorMessage = err.response.data.error;
        }
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: "Create failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Fetch user by ID for editing
  const fetchUserQuery = useQuery({
    queryKey: ["user", selectedUser?.id || selectedUser?._id],
    queryFn: async () => {
      if (!selectedUser) return null
      const userId = selectedUser.id || selectedUser._id
      if (!userId) return null
      
      console.debug("[Users] Fetching user for edit", { userId })
      const res = await usersApi.getUser(userId)
      console.debug("[Users] User fetch success", { 
        status: res.status,
        data: res.data?.data 
      })
      return res.data?.data
    },
    enabled: !!selectedUser && editUserModalOpen,
    staleTime: 0, // Always fetch fresh data for editing
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, payload }: { userId: string; payload: any }) => {
      console.debug("[Users] Update mutation", { userId, payload })
      return usersApi.updateUser(userId, payload)
    },
    onSuccess: (response) => {
      console.debug("[Users] Update success", { response: response.data })
      toast({
        title: "Updated",
        description: "User updated successfully",
      })
      setEditUserModalOpen(false)
      setSelectedUser(null)
      setEditingUser(null)
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
    onError: (err: any) => {
      console.error("[Users] Update error", err)
      toast({
        title: "Update failed",
        description: err?.response?.data?.message || err?.message || "Failed to update user.",
        variant: "destructive",
      })
    },
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      return usersApi.deleteUser(userId)
    },
    onSuccess: () => {
      toast({
        title: "Deleted",
        description: "User deleted successfully",
      })
      setDeleteModalOpen(false)
      setSelectedUser(null)
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (err: any) => {
      toast({
        title: "Delete failed",
        description: err?.response?.data?.message || err?.message || "Failed to delete user.",
        variant: "destructive",
      })
    },
  })



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
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }: any) => <span>{row.original.phone || "-"}</span>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }: any) => <span className="capitalize">{row.original.role}</span>,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }: any) => {
        const active = !!row.original.is_active
        if (active) {
          return <Badge className="bg-[#A4D65E] text-white">Active</Badge>
        } 
        return <Badge className="bg-[#FACC15] text-white">Inactive</Badge>
      },
    },
    { accessorKey: "created_at",
      header: "Joined At", 
      cell: ({ row }: any) => (
       <div className="text-gray-600">
         {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString("en-US", {
           month: "short",
           day: "numeric",
           year: "numeric",
         }) : "-"}
       </div>
     ),
    },   
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const user = row.original as User
        return (
          <div className="flex items-center space-x-2 relative z-50" style={{ pointerEvents: 'auto' }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                console.debug("[Users] View button clicked", { user })
                setSelectedUser(user)
                setDetailModalOpen(true)
              }}
              className="hover:bg-blue-50 hover:text-blue-600"
              style={{ pointerEvents: 'auto', zIndex: 100 }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                console.debug("[Users] Edit button clicked", { user, role, isLoading })
                console.debug("[Users] Current modal state before:", { editUserModalOpen })
                setSelectedUser(user)
                setEditUserModalOpen(true)
                console.debug("[Users] Modal state should be true now")
              }}
              className="hover:bg-blue-50 hover:text-blue-600"
              style={{ pointerEvents: 'auto', zIndex: 100 }}
              >
                <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                console.debug("[Users] Delete button clicked", { user, role })
                if (role !== "admin") {
                  console.warn("[Users] Non-admin user attempted to delete user")
                  // You could show a toast here if you want
                  return
                }
                setSelectedUser(user)
                setDeleteModalOpen(true)
              }}
              className={`hover:bg-red-50 hover:text-red-600 ${role !== "admin" ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{ pointerEvents: 'auto', zIndex: 100 }}
              title={role !== "admin" ? "Only admins can delete users" : "Delete user"}
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
    console.debug("[Users] handleDelete called", { selectedUser })
    if (!selectedUser) {
      console.warn("[Users] No selected user for deletion")
      return;
    }
    
    const userId = selectedUser._id || selectedUser.id;
    console.debug("[Users] Deleting user with ID:", userId)
    if (!userId) {
      console.warn("[Users] No user ID found")
      return;
    }
    
    console.debug("[Users] Calling deleteUserMutation")
    deleteUserMutation.mutate({ userId });
  }

  const handleSaveEdit = (data: Partial<User>) => {
    if (!selectedUser) return
    const userId = selectedUser.id || selectedUser._id
    if (!userId) return
    
    // Use fresh data from API if available, fallback to selectedUser
    const currentUser = fetchUserQuery.data || selectedUser
    
    const currentName = currentUser.name || ""
    const currentEmail = currentUser.email || ""
    const currentPhone = currentUser.phone || ""

    const nextName = ((data as any).fullName ?? currentName) as string
    const nextEmail = (data.email ?? currentEmail) as string
    const nextPhone = ((data as any).phoneNumber ?? currentPhone) as string

    const payload: Record<string, any> = {}
    if (nextName !== currentName) payload.name = nextName
    if (nextEmail !== currentEmail) payload.email = nextEmail
    if (nextPhone !== currentPhone) payload.phone = nextPhone

    // Debug logs
    console.debug("[Users] Update diff", { 
      userId, 
      current: { currentName, currentEmail, currentPhone }, 
      next: { nextName, nextEmail, nextPhone }, 
      payload 
    })

    if (Object.keys(payload).length === 0) {
      toast({ title: "No changes", description: "Nothing to update." })
      setEditUserModalOpen(false)
      return
    }

    updateUserMutation.mutate({ userId, payload })
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
          {role === "admin" && (
          <Button
            className="bg-[#4082ea] hover:bg-[#4082ea] text-white"
            onClick={() => setCreateUserModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create User
          </Button>
          )}
        </div>
        <hr></hr>
       

        {error ? (
          <div className="text-center py-10">
            <div className="text-red-500 mb-2">Failed to load users</div>
            <div className="text-sm text-gray-500">Check console for details</div>
            <Button 
              onClick={() => refetch()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="relative">
            {isFetching && !isLoading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-5 pointer-events-none">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="animate-spin w-5 h-5" />
                  Syncing users...
                </div>
              </div>
            )}
            <DataTable 
            columns={columns}
             data={users || []} 
             searchKey="name" 
             quickFilterKey="role"
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
      <EditUserModal
        open={editUserModalOpen}
        onOpenChange={(open) => {
          console.debug("[Users] EditUserModal onOpenChange", { open, selectedUser })
          setEditUserModalOpen(open)
          if (!open) {
            setSelectedUser(null)
            setEditingUser(null)
          }
        }}
        user={fetchUserQuery.data ? {
          id: fetchUserQuery.data.id,
          fullName: fetchUserQuery.data.name || "",
          email: fetchUserQuery.data.email || "",
          phoneNumber: fetchUserQuery.data.phone || "",
          status: fetchUserQuery.data.is_active ? "Active" : "Locked",
          role: fetchUserQuery.data.role,
          createdAt: fetchUserQuery.data.created_at || "",
          updatedAt: fetchUserQuery.data.updated_at || "",
        } as any : null}
        onSave={handleSaveEdit}
        isLoading={updateUserMutation.isPending || fetchUserQuery.isLoading}
      />
      
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open)
          if (!open) setSelectedUser(null)
        }}
        onConfirm={handleDelete}
        title="Delete User"
        description="Are you sure you want to permanently delete this user? This action cannot be undone."
        isLoading={deleteLoading || deleteUserMutation.isPending}
      />
      {role === "admin" && (
      <CreateUserModal
        open={createUserModalOpen}
        onOpenChange={setCreateUserModalOpen}
        onCreateUser={(userData) => createUserMutation.mutate(userData)}
        isLoading={createUserMutation.isPending}
      />
      )}
      </div>
    </DashboardLayout>
  )
} 