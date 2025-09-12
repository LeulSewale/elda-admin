"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
// import { packagesApi, type Package, type CreatePackageRequest, type UpdatePackageRequest } from "@/lib/api/packages"
import { dummyPackages, simulateApiDelay } from "@/lib/dummy-data"

// Define types locally since we're not using the API
interface Package {
  _id: string
  id: string
  title: string
  description: string
  price: number
  duration: number
  createdBy: {
    _id: string
    fullName: string
    role: string
  }
  createdAt: string
  updatedAt: string
  __v: number
}

interface CreatePackageRequest {
  title: string
  description: string
  price: number
  duration: number
}

interface UpdatePackageRequest {
  title: string
  description: string
  price: number
  duration: number
}
import { useAuth } from "@/hooks/use-auth"
import { useState, useCallback } from "react"
import { Plus, Edit, Trash2, RotateCcw, Package as PackageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTabVisibility } from "@/hooks/use-tab-visibility"
import { GlobalModal } from "@/components/modals/global-modal"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DeleteModal } from "@/components/modals/delete-modal"


export function PackagesPageClient() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(0);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const { isVisible, lastActivity } = useTabVisibility();

  // Form states - separate for create and edit
  const [createFormData, setCreateFormData] = useState<CreatePackageRequest>({
    title: "",
    description: "",
    price: 0,
    duration: 0,
  });
  
  const [editFormData, setEditFormData] = useState<CreatePackageRequest>({
    title: "",
    description: "",
    price: 0,
    duration: 0,
  });




  // DUMMY DATA: Fetch packages with performance optimizations
  const {
    data: packages,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      await simulateApiDelay();
      return dummyPackages || [];
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

  // DUMMY DATA: Create package mutation with optimistic updates
  const createPackageMutation = useMutation({
    mutationFn: async (data: CreatePackageRequest) => {
      await simulateApiDelay();
      const newPackage = {
        _id: `pkg_${Date.now()}`,
        id: `pkg_${Date.now()}`,
        title: data.title,
        description: data.description,
        price: Number(data.price),
        duration: Number(data.duration),
        createdBy: {
          _id: "admin_1",
          fullName: "Admin User",
          role: "admin"
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
      };
      return { data: newPackage };
    },
    onMutate: async (newPackage) => {
      await queryClient.cancelQueries({ queryKey: ["packages"] });
      const previousData = queryClient.getQueryData(["packages"]);
      
      // Optimistically add the new package
      queryClient.setQueryData(["packages"], (old: Package[] | undefined) => {
        if (!old) return old;
        const optimisticPackage: Package = {
          _id: `temp-${Date.now()}`,
          id: `temp-${Date.now()}`,
          title: newPackage.title,
          description: newPackage.description,
          price: Number(newPackage.price),
          duration: Number(newPackage.duration),
          createdBy: {
            _id: "temp",
            fullName: "You",
            role: "admin"
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0,
        };
        return [optimisticPackage, ...old];
      });
      
      return { previousData };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["packages"], context.previousData);
      }
      toast({ 
        title: "Error", 
        description: err?.response?.data?.message || "Failed to create package.", 
        variant: "destructive" 
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Package created successfully.", variant: "default" });
      setCreateModalOpen(false);
      resetCreateForm();
    },
  });

  // DUMMY DATA: Update package mutation with optimistic updates
  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePackageRequest }) => {
      await simulateApiDelay();
      return { success: true };
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["packages"] });
      const previousData = queryClient.getQueryData(["packages"]);
      
      queryClient.setQueryData(["packages"], (old: Package[] | undefined) => {
        if (!old) return old;
        return old.map((pkg) =>
          pkg._id === id 
            ? { ...pkg, ...data, updatedAt: new Date().toISOString() }
            : pkg
        );
      });
      
      return { previousData };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["packages"], context.previousData);
      }
      toast({ 
        title: "Error", 
        description: err?.response?.data?.message || "Failed to update package.", 
        variant: "destructive" 
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Package updated successfully.", variant: "default" });
      setEditModalOpen(false);
      setSelectedPackage(null);
      resetEditForm();
    },
  });

  // DUMMY DATA: Delete package mutation with optimistic updates
  const deletePackageMutation = useMutation({
    mutationFn: async (id: string) => {
      await simulateApiDelay();
      return { success: true };
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["packages"] });
      const previousData = queryClient.getQueryData(["packages"]);
      
      queryClient.setQueryData(["packages"], (old: Package[] | undefined) => {
        if (!old) return old;
        return old.filter((pkg) => pkg._id !== id);
      });
      
      return { previousData };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["packages"], context.previousData);
      }
      toast({ 
        title: "Error", 
        description: err?.response?.data?.message || "Failed to delete package.", 
        variant: "destructive" 
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Package deleted successfully.", variant: "default" });
      setDeleteModalOpen(false);
      setSelectedPackage(null);
    },
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

  
  // Form handlers
  const resetCreateForm = () => {
    setCreateFormData({
      title: "",
      description: "",
      price: 0,
      duration: 0,
    });
  };
  
  const resetEditForm = () => {
    setEditFormData({
      title: "",
      description: "",
      price: 0,
      duration: 0,
    });
  };

  const handleCreate = () => {
    console.log('handleCreate -> submitting', createFormData);
    createPackageMutation.mutate(createFormData);
  };

  const handleEdit = () => {
    if (!selectedPackage) return;
    console.log('handleEdit -> submitting', { id: selectedPackage._id, data: editFormData });
    updatePackageMutation.mutate({ 
      id: selectedPackage._id, 
      data: editFormData 
    });
  };

  const handleDelete = () => {
    if (!selectedPackage) return;
    console.log('handleDelete -> submitting', { id: selectedPackage._id, title: selectedPackage.title });
    deletePackageMutation.mutate(selectedPackage._id);
  };

  const openEditModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setEditFormData({
      title: pkg.title,
      description: pkg.description,
      price: pkg.price,
      duration: pkg.duration,
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setDeleteModalOpen(true);
  };

  const openCreateModal = () => {
    resetCreateForm();
    setCreateModalOpen(true);
  };

  const handleEditPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setEditFormData({
      title: pkg.title,
      description: pkg.description,
      price: pkg.price,
      duration: pkg.duration,
    });
    setEditModalOpen(true);
  };

  // Helper function to format duration for display
  const formatDuration = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      
      if (remainingDays === 0) {
        return years === 1 ? `${years} year` : `${years} years`;
      } else if (remainingDays >= 30) {
        const months = Math.floor(remainingDays / 30);
        const finalRemainingDays = remainingDays % 30;
        
        if (finalRemainingDays === 0) {
          return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
        } else {
          return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''} ${finalRemainingDays} day${finalRemainingDays !== 1 ? 's' : ''}`;
        }
      } else {
        return `${years} year${years !== 1 ? 's' : ''} ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
      }
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      
      if (remainingDays === 0) {
        return months === 1 ? `${months} month` : `${months} months`;
      } else {
        return `${months} month${months !== 1 ? 's' : ''} ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
      }
    } else if (days === 1) {
      return `${days} day`;
    } else {
      return `${days} days`;
    }
  };

  // Table columns
  const columns = [
    {
      id: "no",
      header: "No",
      cell: ({ visibleIndex }: any) => visibleIndex + 1,
      enableSorting: false,
    },
    {
      accessorKey: "title",
      header: "Package Name",
      cell: ({ row }: any) => (
        <div className="font-medium text-gray-900">{row.original.title}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: any) => (
        <div className="text-gray-600 max-w-xs truncate" title={row.original.description}>
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Price (Birr)",
      cell: ({ row }: any) => (
        <Badge className="bg-green-100 text-green-800 border border-green-200">
          {row.original.price} Birr
        </Badge>
      ),
    },
    {
      accessorKey: "duration",
      header: "Duration (Days)",
      cell: ({ row }: any) => (
        <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
          {formatDuration(row.original.duration)}
        </Badge>
      ),
    },
    {
      accessorKey: "createdBy.fullName",
      header: "Created By",
      cell: ({ row }: any) => (
        <div className="text-gray-600">{row.original.createdBy.fullName}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }: any) => (
        <div className="text-gray-600">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const pkg = row.original as Package;
        console.log('Render actions cell', pkg._id || pkg.id);
        return (
          <div className="flex items-center space-x-2">
            <Button
              data-packages-action
              variant="ghost"
              size="icon"
              onClick={() =>handleEditPackage(pkg)}
              onMouseDown={(e) => { e.stopPropagation(); }}
              className="hover:bg-blue-50 hover:text-blue-600 pointer-events-auto relative z-20"
              title="Edit package"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                console.log('Delete clicked', pkg._id || pkg.id);
                toast({ title: 'Confirm delete', description: pkg.title });
                setSelectedPackage(pkg);
                setDeleteModalOpen(true);
              }}
              onMouseDown={(e) => { e.stopPropagation(); }}
              className="hover:bg-red-50 hover:text-red-600 pointer-events-auto relative z-20"
              title="Delete package"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  // DUMMY DATA: Remove role restriction for UI-only development
  // if (role !== "admin") {
  //   return (
  //     <DashboardLayout title="Packages">
  //       <div className="text-center py-10 text-gray-500">
  //         You don't have permission to access this page.
  //       </div>
  //     </DashboardLayout>
  //   );
  // }

  return (
    <DashboardLayout title="Packages" isFetching={isFetching}>
      <div className="p-0">
        {/* Header with Refresh Button and Create Button */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Packages</h1>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="border-[#A4D65E] text-[#A4D65E] hover:bg-[#A4D65E]/10 flex items-center gap-2 transition-all duration-200"
              disabled={isFetching || isRefreshing}
              title={
                isRefreshing 
                  ? 'Refreshing packages...' 
                  : 'Refresh packages data'
              }
            >
              <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>

          </div>
          <Button
            onClick={openCreateModal}
            className="bg-[#A4D65E] hover:bg-[#A4D65E]/90 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Package
          </Button>
          {/* {process.env.NODE_ENV !== 'production' && (
            <div className="ml-3 flex items-center gap-2 text-xs text-gray-500">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Debug: clicked test open edit');
                  const first = (packages || [])[0];
                  if (first) {
                    setSelectedPackage(first);
                    setEditFormData({
                      title: first.title,
                      description: first.description,
                      price: first.price,
                      duration: first.duration,
                    });
                    setEditModalOpen(true);
                  } else {
                    console.log('Debug: no packages to open');
                  }
                }}
              >
                Debug: Open Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const overlay = document.querySelector('[data-packages-overlay]') as HTMLElement | null;
                  const actions = document.querySelectorAll('[data-packages-action]');
                  console.log('Debug: overlay present?', !!overlay);
                  if (overlay) console.log('Debug: overlay styles', { pe: getComputedStyle(overlay).pointerEvents, z: getComputedStyle(overlay).zIndex });
                  actions.forEach((el, i) => {
                    const rect = (el as HTMLElement).getBoundingClientRect();
                    console.log('Debug: action btn rect', i, rect);
                  });
                }}
              >
                Debug: Inspect
              </Button>
            </div>
          )} */}
        </div>

        {/* Packages Table */}
        {error ? (
          <div className="text-center py-10 text-red-500">
            Failed to load packages.
          </div>
        ) : (
          <div className="relative pointer-events-auto z-0">
            {isFetching && !isLoading && (
              <div data-packages-overlay className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 pointer-events-none">
                <div className="flex items-center gap-2 text-gray-600">
                  <PackageIcon className="animate-spin w-5 h-5" />
                  Syncing packages...
                </div>
              </div>
            )}
            <DataTable 
              columns={columns} 
              data={packages || []} 
              searchKey="title" 
              searchPlaceholder="Search packages by name..." 
            />
          </div>
        )}
      </div>

      {/* Create Package Modal */}
      <GlobalModal
        open={createModalOpen}
        onOpenChange={(open) => {
          console.log('CreateModal onOpenChange', open);
          if (!open) {
            toast({ title: 'Create modal closed' });
          }
          setCreateModalOpen(open);
        }}
        title="Create New Package"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Package Title</Label>
            <Input
              id="title"
              value={createFormData.title}
              onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
              placeholder="e.g., 1 Month Package"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={createFormData.description}
              onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
              placeholder="Describe the package features and benefits"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (Birr)</Label>
              <Input
                id="price"
                type="number"
                value={createFormData.price}
                onChange={(e) => setCreateFormData({ ...createFormData, price: Number(e.target.value) })}
                placeholder="100"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (Days)</Label>
              <Input
                id="duration"
                type="number"
                value={createFormData.duration}
                onChange={(e) => setCreateFormData({ ...createFormData, duration: Number(e.target.value) })}
                placeholder="30"
                min="1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createPackageMutation.isPending || !createFormData.title || !createFormData.description}
              className="bg-[#A4D65E] hover:bg-[#A4D65E]/90"
            >
              {createPackageMutation.isPending ? "Creating..." : "Create Package"}
            </Button>
          </div>
        </div>
      </GlobalModal>

      {/* Edit Package Modal */}
      <GlobalModal
        open={editModalOpen}
        onOpenChange={(open) => {
          console.log('EditModal onOpenChange', open);
          setEditModalOpen(open);
          if (!open) {
            setSelectedPackage(null);
            resetEditForm();
            toast({ title: 'Edit modal closed' });
          }
        }}
        title="Edit Package"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Package Title</Label>
            <Input
              id="edit-title"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              placeholder="e.g., 1 Month Package"
            />
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              placeholder="Describe the package features and benefits"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-price">Price (Birr)</Label>
              <Input
                id="edit-price"
                type="number"
                value={editFormData.price}
                onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                placeholder="100"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="edit-duration">Duration (Days)</Label>
              <Input
                id="edit-duration"
                type="number"
                value={editFormData.duration}
                onChange={(e) => setEditFormData({ ...editFormData, duration: Number(e.target.value) })}
                placeholder="30"
                min="1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setSelectedPackage(null);
                resetEditForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={updatePackageMutation.isPending || !editFormData.title || !editFormData.description}
              className="bg-[#A4D65E] hover:bg-[#A4D65E]/90"
            >
              {updatePackageMutation.isPending ? "Updating..." : "Update Package"}
            </Button>
          </div>
        </div>
      </GlobalModal>

      {/* Delete Package Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          console.log('DeleteModal onOpenChange', open);
          if (!open) {
            toast({ title: 'Delete modal closed' });
          }
          setDeleteModalOpen(open);
        }}
        onConfirm={handleDelete}
        title="Delete Package"
        description={`Are you sure you want to delete "${selectedPackage?.title}"? This action cannot be undone.`}
        isLoading={deletePackageMutation.isPending}
      />
    </DashboardLayout>
  );
}
