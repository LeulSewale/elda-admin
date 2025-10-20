"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { employeesApi, type Employee, type EmployeesResponse } from "@/lib/api/employees"
import { useAuth } from "@/hooks/use-auth"
import { useState, useCallback, useEffect, useMemo } from "react"
import { Plus, Edit, Trash2, Package as PackageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTabVisibility } from "@/hooks/use-tab-visibility"
import { CreateEmployeeModal } from "@/components/modals/create-employee-modal"
import { EditEmployeeModal } from "@/components/modals/edit-employee-modal"
import { DeleteModal } from "@/components/modals/delete-modal"
import { useTranslations } from 'next-intl'


export function EmployeesPageClient() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [createEmployeeModalOpen, setCreateEmployeeModalOpen] = useState(false);
  const [editEmployeeModalOpen, setEditEmployeeModalOpen] = useState(false);
  const [deleteEmployeeModalOpen, setDeleteEmployeeModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(0);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { role, user, isAuthenticated } = useAuth();
  const { isVisible, lastActivity } = useTabVisibility();
  
  // Translation hooks
  const t = useTranslations('employees');
  const tCommon = useTranslations('common');

  // Debug authentication state
  console.debug("[Employees] Auth state:", {
    role,
    isAuthenticated,
    userId: user?.id,
    userEmail: user?.email,
    isVisible,
    timestamp: new Date().toISOString()
  });


  

  // Fetch employees with performance optimizations
  const {
    data: employees,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      console.debug("[Employees] Fetch start", { 
        params: { limit: 20 },
        isVisible,
        role,
        timestamp: new Date().toISOString()
      });
      try {
        const res = await employeesApi.getEmployees({ limit: 20 });
        console.debug("[Employees] Fetch success", { 
          status: res.status,
          dataLength: res.data?.data?.length || 0,
          paging: res.data?.paging
        });
        return (res.data?.data || []) as Employee[];
      } catch (e: any) {
        // Enhanced error logging
        console.error("[Employees] Fetch error", {
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
        });
        
        // Don't throw error to prevent logout - return empty array instead
        console.warn("[Employees] API failed, returning empty array to prevent logout");
        return [];
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
    enabled: isVisible && role === "admin" && isAuthenticated,
  });

  // Monitor error state for debugging
  useEffect(() => {
    if (error) {
      console.error("[Employees] Query error detected:", {
        error,
        message: error?.message,
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data,
        stack: error?.stack,
        timestamp: new Date().toISOString()
      });
    }
  }, [error]);

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.debug("[Update Employee] Sending data:", { id, data });
      return employeesApi.updateEmployee(id, data);
    },
    onSuccess: (response) => {
      console.debug("[Update Employee] Success:", response.data);
      toast({
        title: "Success",
        description: "Employee updated successfully",
        variant: "default",
      });
      setEditEmployeeModalOpen(false);
      setSelectedEmployee(null);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err: any) => {
      console.error("[Update Employee] Error:", err);
      console.error("[Update Employee] Error response:", err?.response?.data);
      console.error("[Update Employee] Error details:", err?.response?.data?.error?.details);
      
      let errorMessage = "Failed to update employee.";
      
      if (err?.response?.data?.error) {
        const error = err.response.data.error;
        if (error.details && Array.isArray(error.details) && error.details.length > 0) {
          // Show specific validation errors
          errorMessage = error.details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
        } else if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else {
          errorMessage = JSON.stringify(error);
        }
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      console.debug("[Delete Employee] Deleting employee with ID:", id);
      return employeesApi.deleteEmployee(id);
    },
    onSuccess: (response) => {
      console.debug("[Delete Employee] Success:", response.data);
      toast({
        title: "Success",
        description: "Employee deleted successfully",
        variant: "default",
      });
      setDeleteEmployeeModalOpen(false);
      setSelectedEmployee(null);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err: any) => {
      console.error("[Delete Employee] Error:", err);
      console.error("[Delete Employee] Error response:", err?.response?.data);
      console.error("[Delete Employee] Error details:", err?.response?.data?.error?.details);
      
      let errorMessage = "Failed to delete employee.";
      let errorTitle = "Delete failed";
      
      // Handle 409 Conflict errors specifically
      if (err?.response?.status === 409) {
        errorTitle = "Cannot delete employee";
        errorMessage = "This employee cannot be deleted because they have associated records (tickets, documents, or other data). Please reassign or remove these records first.";
      } else if (err?.response?.data?.error) {
        const error = err.response.data.error;
        if (error.details && Array.isArray(error.details) && error.details.length > 0) {
          errorMessage = error.details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
        } else if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else {
          errorMessage = JSON.stringify(error);
        }
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      console.debug("[Create Employee] Sending data:", employeeData);
      return employeesApi.createEmployee(employeeData);
    },
    onSuccess: (response) => {
      console.debug("[Create Employee] Success:", response.data);
      toast({
        title: "Success",
        description: "Employee created successfully",
        variant: "default",
      });
      setCreateEmployeeModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err: any) => {
      
      let errorMessage = "Failed to create employee.";
      
      if (err?.response?.data?.error) {
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

  
  const handleEditEmployee = (employee: Employee) => {
    console.log('[Edit Employee] Button clicked, employee:', employee);
    setSelectedEmployee(employee);
    setEditEmployeeModalOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    console.log('[Delete Employee] Button clicked, employee:', employee);
    setSelectedEmployee(employee);
    setDeleteEmployeeModalOpen(true);
  };

  const handleUpdateEmployee = (id: string, data: any) => {
    updateEmployeeMutation.mutate({ id, data });
  };

  const handleConfirmDelete = () => {
    if (selectedEmployee) {
      deleteEmployeeMutation.mutate(selectedEmployee.id);
    }
  };


  // Table columns with useMemo to prevent recreation on every render
  const columns = useMemo(() => [
    {
      id: "no",
      header: "No",
      cell: ({ visibleIndex }: any) => visibleIndex + 1,
      enableSorting: false,
    },
    {
      accessorKey: "user_name",
      header: "Full Name",
      cell: ({ row }: any) => (
        <div className="font-medium text-gray-900">{row.original.user_name}</div>
      ),
    },
    {
      accessorKey: "user_phone",
      header: "Phone",
      cell: ({ row }: any) => (
        <div className="text-gray-600 max-w-xs truncate" title={row.original.user_phone || "No phone"}>
          {row.original.user_phone || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "user_email",
      header: "Email",
      cell: ({ row }: any) => (
        <div className="text-gray-600">{row.original.user_email}</div>
      ),
    },
    {
      accessorKey: "job_title",
      header: "Job Title",
      cell: ({ row }: any) => (
        <div className="text-gray-600">{row.original.job_title}</div>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }: any) => (
        <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
          {row.original.department}
        </Badge>
      ),
    },
    {
      accessorKey: "salary",
      header: "Salary (Birr)",
      cell: ({ row }: any) => (
        <Badge className="bg-green-100 text-green-800 border border-green-200">
          {parseFloat(row.original.salary).toLocaleString()} Br
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
      accessorKey: "employment_type",
      header: "Employment Type",
      cell: ({ row }: any) => {
        const type = row.original.employment_type;
        const typeColors: Record<string, string> = {
          full_time: "bg-emerald-50 text-emerald-700 border border-emerald-200",
          part_time: "bg-blue-50 text-blue-700 border border-blue-200",
          contractual: "bg-rose-50 text-rose-700 border border-rose-200",
        };
    
        return (
          <Badge
            className={`${typeColors[type] || "bg-gray-50 text-gray-700 border border-gray-200"} 
              px-3 py-1 rounded-full text-xs font-medium`}
          >
            {type.replace('_', ' ').toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        const statusColors: Record<string, string> = {
          active: "bg-green-50 text-green-700 border border-green-200",
          inactive: "bg-red-50 text-red-700 border border-red-200",
          terminated: "bg-gray-50 text-gray-700 border border-gray-200",
        };
    
        return (
          <Badge
            className={`${statusColors[status] || "bg-gray-50 text-gray-700 border border-gray-200"} 
              px-3 py-1 rounded-full text-xs font-medium`}
          >
            {status.toUpperCase()}
          </Badge>
        );
      },
    },
    { 
      accessorKey: "hired_at",
      header: "Hired At", 
      cell: ({ row }: any) => (
       <div className="text-gray-600">
         {new Date(row.original.hired_at).toLocaleDateString("en-US", {
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
        const employee = row.original as Employee;
        
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedEmployee(employee);
                setEditEmployeeModalOpen(true);
              }}
              className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors cursor-pointer"
              title="Edit employee"
              type="button"
              style={{ pointerEvents: 'auto', zIndex: 100, position: 'relative' }}
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedEmployee(employee);
                setDeleteEmployeeModalOpen(true);
              }}
              className="p-2 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors cursor-pointer"
              title="Delete employee"
              type="button"
              style={{ pointerEvents: 'auto', zIndex: 100, position: 'relative' }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
      enableSorting: false,
    },
  ], [setSelectedEmployee, setEditEmployeeModalOpen, setDeleteEmployeeModalOpen]);

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
    <DashboardLayout title={t('title')} isFetching={isFetching}>
      <div className="p-0">
      <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-2 py-2">
            <div>
              <h1 className="text-xl font-semibold">{t('pageTitle')}</h1>
              <p className="text-sm text-gray-400">{t('pageSubtitle')}</p>
            </div>
            <div className="flex gap-2">
                {/* Create Employee - Primary */}
                <Button
                  className="bg-[#4082ea] hover:bg-[#4082ea] text-white transition-colors shadow-sm"
                  onClick={() => setCreateEmployeeModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('createEmployee')}
                </Button>

                {/* Employee Documents - Blue */}
                {/* <Button
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Employee Documents
                </Button> */}

                {/* Attendance Tracking - Green */}
                {/* <Button
                  className="bg-[#10B981] hover:bg-[#059669] text-white transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Attendance Tracking
                </Button> */}

                {/* Employee Profile - Amber */}
                {/* <Button
                  className="bg-[#F59E0B] hover:bg-[#D97706] text-white transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Employee Profile
                </Button> */}
              </div>



          </div>
          <hr></hr>

        {/* Employees Table */}
        {error ? (
          <div className="text-center py-10">
            <div className="text-red-500 mb-2">Failed to load employees</div>
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
              <div data-employees-overlay className="absolute inset-0 bg-white/60 flex items-center justify-center z-[5] pointer-events-none">
                <div className="flex items-center gap-2 text-gray-600">
                  <PackageIcon className="animate-spin w-5 h-5" />
                  Syncing employees...
                </div>
              </div>
            )}
            <div className="relative z-[10]">
            <DataTable 
              columns={columns} 
              data={Array.isArray(employees) ? employees : []} 
              searchKey="user_name" 
              quickFilterKey="employment_type"
                quickFilterLabel="Employment Type"
              searchPlaceholder="Search Employees by name..." 
            />
            </div>
          </div>
        )}
      </div>

      <CreateEmployeeModal
        open={createEmployeeModalOpen}
        onOpenChange={setCreateEmployeeModalOpen}
        onCreateEmployee={(employeeData) => createEmployeeMutation.mutate(employeeData)}
        isLoading={createEmployeeMutation.isPending}
      />

      <EditEmployeeModal
        open={editEmployeeModalOpen}
        onOpenChange={setEditEmployeeModalOpen}
        onUpdateEmployee={handleUpdateEmployee}
        employee={selectedEmployee}
        isLoading={updateEmployeeMutation.isPending}
      />

      <DeleteModal
        open={deleteEmployeeModalOpen}
        onOpenChange={setDeleteEmployeeModalOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        description={`Are you sure you want to delete ${selectedEmployee?.user_name}? This action cannot be undone.`}
        isLoading={deleteEmployeeMutation.isPending}
      />
      </div>
    </DashboardLayout>
  );
}
