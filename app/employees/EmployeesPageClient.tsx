"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { packagesApi, type Package, type CreatePackageRequest, type UpdatePackageRequest } from "@/lib/api/packages"
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


export function EmployeesPageClient() {
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


  const employees = [
    {
      no: 1,
      name: "Abebe Bekele",
      position: "Software Engineer",
      phone: "+251911223344",
      email: "abebe.bekele@example.com",
      salary: 25000,
      district: "Bole",
      type: "Permanent",
      joinedAt: "2023-02-15"
    },
    {
      no: 2,
      name: "Mekdes Alemu",
      position: "HR Manager",
      phone: "+251921334455",
      email: "mekdes.alemu@example.com",
      salary: 22000,
      district: "Yeka",
      type: "Contractual",
      joinedAt: "2022-07-01"
    },
    {
      no: 3,
      name: "Samuel Girma",
      position: "Accountant",
      phone: "+251911556677",
      email: "samuel.girma@example.com",
      salary: 18000,
      district: "Nifas Silk",
      type: "Permanent",
      joinedAt: "2021-11-20"
    },
    {
      no: 4,
      name: "Hanna Tesfaye",
      position: "Marketing Specialist",
      phone: "+251931667788",
      email: "hanna.tesfaye@example.com",
      salary: 15000,
      district: "Kolfe",
      type: "Part-time",
      joinedAt: "2024-04-10"
    },
    {
      no: 5,
      name: "Getachew Yonas",
      position: "Project Manager",
      phone: "+251911778899",
      email: "getachew.yonas@example.com",
      salary: 30000,
      district: "Bole",
      type: "Permanent",
      joinedAt: "2020-09-05"
    },
    {
      no: 6,
      name: "Selamawit Dagne",
      position: "UI/UX Designer",
      phone: "+251941889900",
      email: "selamawit.dagne@example.com",
      salary: 19000,
      district: "Yeka",
      type: "Contractual",
      joinedAt: "2023-06-18"
    },
    {
      no: 7,
      name: "Yohannes Fikru",
      position: "System Administrator",
      phone: "+251911990011",
      email: "yohannes.fikru@example.com",
      salary: 21000,
      district: "Gullele",
      type: "Permanent",
      joinedAt: "2021-01-25"
    },
    {
      no: 8,
      name: "Rahel Asrat",
      position: "Business Analyst",
      phone: "+251931112233",
      email: "rahel.asrat@example.com",
      salary: 20000,
      district: "Addis Ketema",
      type: "Part-time",
      joinedAt: "2024-01-12"
    },
    {
      no: 9,
      name: "Mesfin Tadesse",
      position: "Data Scientist",
      phone: "+251921223344",
      email: "mesfin.tadesse@example.com",
      salary: 28000,
      district: "Arada",
      type: "Permanent",
      joinedAt: "2022-05-30"
    },
    {
      no: 10,
      name: "Lidya Gebremariam",
      position: "Operations Officer",
      phone: "+251911334455",
      email: "lidya.gebremariam@example.com",
      salary: 17000,
      district: "Kirkos",
      type: "Contractual",
      joinedAt: "2023-09-14"
    }
  ];
  

  // Fetch packages with performance optimizations
  const {
    data: packages,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      // const res = await packagesApi.getPackages();
      return employees;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchInterval: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: isVisible && role === "admin",
  });

  // Create package mutation with optimistic updates
  const createPackageMutation = useMutation({
    mutationFn: async (data: CreatePackageRequest) => {
      return packagesApi.createPackage(data);
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

  // Update package mutation with optimistic updates
  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePackageRequest }) => {
      return packagesApi.updatePackage(id, data);
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

  // Delete package mutation with optimistic updates
  const deletePackageMutation = useMutation({
    mutationFn: async (id: string) => {
      return packagesApi.deletePackage(id);
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
      accessorKey: "name",
      header: "Full Name",
      cell: ({ row }: any) => (
        <div className="font-medium text-gray-900">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }: any) => (
        <div className="text-gray-600 max-w-xs truncate" title={row.original.phone}>
          {row.original.phone}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: any) => (
        <div className="text-gray-600">{row.original.email}</div>
      ),
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }: any) => (
        <div className="text-gray-600">{row.original.position}</div>
      ),
    },
    {
      accessorKey: "salary",
      header: "Salary (Birr)",
      cell: ({ row }: any) => (
        <Badge className="bg-green-100 text-green-800 border border-green-200">
          {row.original.salary} Br
        </Badge>
      ),
    },
    {
      accessorKey: "district",
      header: "District",
      cell: ({ row }: any) => (
        <div className="text-gray-600">{row.original.district}</div>
      ),
    },
    {
      accessorKey: "type",
      header: "Employment Type",
      cell: ({ row }: any) => {
        const type = row.original.type;
        const typeColors: Record<string, string> = {
          Permanent: "bg-emerald-50 text-emerald-700 border border-emerald-200",
          "Part-time": "bg-blue-50 text-blue-700 border border-blue-200",
          Contractual: "bg-rose-50 text-rose-700 border border-rose-200",
        };
    
        return (
          <Badge
            className={`${typeColors[type] || "bg-gray-50 text-gray-700 border border-gray-200"} 
              px-3 py-1 rounded-full text-xs font-medium`}
          >
            {type}
          </Badge>
        );
      },
    },
    
    // {
    //   accessorKey: "email",
    //   header: "DuraEmailtion (Days)",
    //   cell: ({ row }: any) => (
    //     <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
    //       {formatDuration(row.original.duration)}
    //     </Badge>
    //   ),
    // },
   
    { accessorKey: "joinedAt",
      header: "Joined At", 
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
        const pkg = row.original as Package;
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
            {/* <Button
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
            </Button> */}
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  if (role !== "admin") {
    return (
      <DashboardLayout title="Packages">
        <div className="text-center py-10 text-gray-500">
          You don't have permission to access this page.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Employees" isFetching={isFetching}>
      <div className="p-0">
      <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-2 py-2">
            <div>
              <h1 className="text-xl font-semibold">Employees</h1>
              <p className="text-sm text-gray-400">View and manage employees lists</p>
            </div>
            <div className="flex gap-2">
                {/* Employee Documents - Blue */}
                <Button
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Employee Documents
                </Button>

                {/* Attendance Tracking - Green */}
                <Button
                  className="bg-[#10B981] hover:bg-[#059669] text-white transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Attendance Tracking
                </Button>

                {/* Employee Profile - Amber */}
                <Button
                  className="bg-[#F59E0B] hover:bg-[#D97706] text-white transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Employee Profile
                </Button>
              </div>



          </div>
          <hr></hr>

        {/* Packages Table */}
        {error ? (
          <div className="text-center py-10 text-red-500">
            {(error as any)?.message || "Failed to load packages."}
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
              searchKey="name" 
              quickFilterKey="type"
              searchPlaceholder="Search Employees by name..." 
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
      </div>
    </DashboardLayout>
  );
}
