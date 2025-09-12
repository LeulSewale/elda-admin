"use client"

/**
 * 🏢 Companies Management Page
 * 
 * FEATURES:
 * - View all companies with their details
 * - Lock companies (sets status to "Locked" using lockUser API)
 * - Edit company information
 * - Create new companies
 * - Document management with optimized column width
 * 
 * OPTIMIZATIONS:
 * - Documents column width limited to prevent horizontal scrolling
 * - Long filenames truncated with ellipsis (...)
 * - Proper status handling for locked companies
 * - Uses lockUser API endpoint instead of delete
 * - React Query with optimized caching (staleTime: 5min, gcTime: 10min)
 * - Targeted cache updates instead of full invalidation
 * - Prevents unnecessary refetching on window focus/mount
 */

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeleteModal } from "@/components/modals/delete-modal"
import type { User } from "@/lib/types"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2, Plus, Building2, RotateCcw, Loader2, File, ExternalLink, Download, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
// import { companiesApi } from "@/lib/api/companies"
// import { usersApi } from "@/lib/api/users"
import { dummyUsers, createApiResponse } from "@/lib/dummy-data"
import { Skeleton } from "@/components/ui/skeleton"
import { GlobalModal } from "@/components/modals/global-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "@tanstack/react-form"
import { CreateCompanyModal } from "@/components/modals/create-company-modal"
import { log } from "console"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export default function CompaniesPage() {
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; company: User | null }>({
    open: false,
    company: null,
  })
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModal, setEditModal] = useState<{ open: boolean; company: User | null }>({
    open: false,
    company: null,
  })
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // 🚀 DUMMY DATA: React Query with dummy data
  const {
    data: companies = [],
    isLoading: loading,
    isFetching: fetching,
    error,
    refetch
  } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
      return dummyUsers.filter(user => user.role === 'company')
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 10 * 60 * 1000,   // 10 minutes - keep in cache
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false,      // Prevent refetch on component mount
    refetchOnReconnect: true,   // Only refetch on network reconnect
  })

  // 🚀 OPTIMIZED: Memoized computed values
  const hasLockedCompanies = useMemo(() => 
    companies.some((company: User) => company.status === "Locked"), 
    [companies]
  )

  const lockedCompaniesCount = useMemo(() => 
    companies.filter((company: User) => company.status === "Locked").length, 
    [companies]
  )

  const downloadDocument = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  // 🚀 OPTIMIZED: Proper refresh function with error handling
  const handleRefresh = async () => {
    try {
      await refetch()
      toast({
        title: "Refreshed",
        description: "Companies data has been refreshed successfully.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh companies data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = (company: User) => {
    setDeleteModal({ open: true, company })
  }

  const handleEdit = (company: User) => {
    setEditModal({ open: true, company })
  }

  // 🚀 DUMMY DATA: Lock company mutation with dummy data
  const lockCompanyMutation = useMutation({
    mutationFn: async ({ companyId, status }: { companyId: string, status: string }) => {
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
      return createApiResponse({ id: companyId, status }, 'Company locked successfully')
    },
    onSuccess: (_, { companyId, status }) => {
      // ✅ OPTIMIZED: Direct cache update instead of full invalidation
      queryClient.setQueryData(['companies'], (oldData: User[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map(company => 
          company.id === companyId 
            ? { ...company, status: status as any }
            : company
        )
      })
      
      toast({
        title: "Company locked successfully",
        description: "Company has been locked and cannot access the system.",
        variant: "default",
      })
    },
    onError: (err: any) => {
      toast({
        title: "Lock failed",
        description: err?.response?.data?.message || err?.message || "Failed to lock company.",
        variant: "destructive",
      })
    }
  })

  const confirmDelete = async () => {
    if (!deleteModal.company) return
    setDeleteLoading(true)
    try {
      await lockCompanyMutation.mutateAsync({ 
        companyId: deleteModal.company.id, 
        status: "Locked" 
      })
    } finally {
      setDeleteModal({ open: false, company: null })
      setDeleteLoading(false)
    }
  }

  // 🚀 DUMMY DATA: Edit company mutation with dummy data
  const editCompanyMutation = useMutation({
    mutationFn: async ({ companyId, data }: { companyId: string, data: any }) => {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      return createApiResponse({ id: companyId, ...data }, 'Company updated successfully')
    },
    onSuccess: (_, { companyId, data }) => {
      // ✅ OPTIMIZED: Direct cache update instead of full invalidation
      queryClient.setQueryData(['companies'], (oldData: User[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map(company => 
          company.id === companyId 
            ? { 
                ...company, 
                fullName: data.name,
                description: data.description,
                phoneNumber: data.phoneNumber,
                email: data.email,
                address: {
                  country: data.country,
                  city: data.city
                },
                // Update profile image if logo was changed
                profileImage: data.logo ? company.profileImage : company.profileImage,
                // Update documents if any were removed
                ...(data.existingDocuments && { documents: data.existingDocuments })
              } as User
            : company
        )
      })
      
      toast({
        title: "Company updated successfully",
        description: `"${data.name}" has been updated successfully.`,
        variant: "default",
      })
    },
    onError: (err: any) => {
      toast({
        title: "Update failed",
        description: err?.response?.data?.message || err?.message || "Failed to update company.",
        variant: "destructive",
      })
    }
  })

  const handleEditSave = async (data: any) => {
    if (!editModal.company) return
    setEditLoading(true)
    try {
      await editCompanyMutation.mutateAsync({ 
        companyId: editModal.company.id, 
        data 
      })
    } finally {
      setEditModal({ open: false, company: null })
      setEditLoading(false)
    }
  }

  // 🚀 DUMMY DATA: Create company mutation with dummy data
  const createCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 1200)) // Simulate API delay
      const newCompany = {
        id: `new-${Date.now()}`,
        _id: `new-${Date.now()}`,
        ...data,
        role: 'company' as const,
        status: 'Active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin'
      }
      return createApiResponse(newCompany, 'Company created successfully')
    },
    onSuccess: (newCompany) => {
      // ✅ OPTIMIZED: Add new company to cache
      queryClient.setQueryData(['companies'], (oldData: User[] | undefined) => {
        if (!oldData) return [newCompany]
        return [...oldData, newCompany]
      })
      
      toast({
        title: "Company created successfully",
        description: "New company has been added successfully.",
        variant: "default",
      })
    },
    onError: (err: any) => {
      toast({
        title: "Creation failed",
        description: err?.response?.data?.message || err?.message || "Failed to create company.",
        variant: "destructive",
      })
    }
  })

  const handleCreateSuccess = (data: any) => {
    createCompanyMutation.mutate(data)
    setCreateModalOpen(false)
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: "No",
      cell: ({ row }) => <span className="font-medium">{row.index + 1}</span>,
    },
    {
      accessorKey: "logo.profileImage",
      header: "Logo",
      cell: ({ row }) => {
        const logoUrl = row.original?.profileImage?.url;
        const name = row.original?.fullName ?? "Logo";
    
        return (
          <img
            src={logoUrl || "/placeholder-logo.png"}
            alt={`${name} logo`}
            className="h-10 w-10 rounded-full object-cover border border-gray-200 bg-white"
            loading="lazy"
          />
        );
      },
    },
    {
      accessorKey: "fullName",
      header: "Company Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("fullName")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="text-gray-600">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }) => <div className="text-gray-600">{row.getValue("phoneNumber")}</div>,
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const address = row.original.address;
    
        if (typeof address === "object" && address !== null) {
          const parts = [address.city, address.country].filter(Boolean);
          return <div className="text-gray-600">{parts.join(', ')}</div>;
        }
    
        return <div className="text-gray-600">{String(address)}</div>;
      },
    },
    {
      accessorKey: "documents",
      header: "Documents",
      cell: ({ row }) => {
        // Handle case where documents might not exist on User type
        const documents = (row.original as any)?.documents;
        
        if (!documents || documents.length === 0) {
          return <div className="text-gray-400 text-sm">No documents</div>;
        }
        
        return (
          <div className="flex flex-col gap-1 max-w-[200px]">
            {documents.slice(0, 2).map((doc: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <File className="w-3 h-3 text-gray-500 flex-shrink-0" />
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <span className="text-xs text-gray-700 truncate max-w-[120px]" title={doc.name}>
                    {doc.name}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => downloadDocument(doc.url, doc.name)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Download document"
                    >
                      <Download className="w-3 h-3 text-green-600 hover:text-green-700" />
                    </button>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="View document"
                    >
                      <ExternalLink className="w-3 h-3 text-blue-600 hover:text-blue-700" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
            {documents.length > 2 && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline">
                    +{documents.length - 2} more
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3" align="start">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      All Documents ({documents.length})
                    </div>
                    {documents.map((doc: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate max-w-[200px]" title={doc.name}>
                            {doc.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => downloadDocument(doc.url, doc.name)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Download document"
                          >
                            <Download className="w-4 h-4 text-green-600 hover:text-green-700" />
                          </button>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="View document"
                          >
                            <ExternalLink className="w-4 h-4 text-blue-600 hover:text-blue-700" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
    },
    { accessorKey: "status", header: "Status", cell: ({ row }: any) => {
      const status = row.original.status;
      const statusColors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        active: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        Locked: "bg-red-100 text-red-800",
        Suspended: "bg-orange-100 text-orange-800",
      };
      return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    } }, 
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const company = row.original
    
        return (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(company)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDelete(company)}
              disabled={company.status === "Locked"}
              title={company.status === "Locked" ? "Company is already locked" : "Lock company"}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
            {/* <Button variant="link" size="sm" asChild>
              <Link href={`/companies/${company.id}`} className="text-blue-600">
                View Details
              </Link>
            </Button> */}
          </div>
        )
      },
    },
  ]



  return (
    <DashboardLayout title="Companies" isFetching={loading || fetching}>
      <div className="p-0">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#A4D65E]" />
            <h2 className="text-2xl font-bold">Companies</h2>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className={`ml-2 border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm bg-white hover:bg-gray-50 ${fetching || loading ? 'cursor-wait' : ''}`}
              aria-label="Refresh companies"
              disabled={fetching || loading}
            >
              <RotateCcw
                className={`w-6 h-6 stroke-[2.5] transition-transform duration-300 ${
                  (fetching || loading) ? 'animate-spin text-green-500' : 'text-gray-700 hover:text-gray-900'
                }`}
              />
            </Button>
          </div>
          <Button className="bg-[#A4D65E] hover:bg-[#95C653]" onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        </div>

        {/* 🚀 OPTIMIZED: Header Statistics */}
        {hasLockedCompanies && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-red-800">
                  {lockedCompaniesCount} company{lockedCompaniesCount !== 1 ? 'ies' : 'y'} locked
                </span>
              </div>
              <span className="text-xs text-red-600">
                Locked companies cannot access the system
              </span>
            </div>
          </div>
        )}
        {error ? (
          <div className="text-red-500">{(error as any)?.message || "An error occurred while loading companies"}</div>
        ) : (
          <div className="relative">
            {(loading || fetching) && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
              </div>
            )}
            <DataTable columns={columns} data={companies} searchKey="fullName" searchPlaceholder="Search companies..." />
          </div>
        )}

        <DeleteModal
          open={deleteModal.open}
          onOpenChange={(open) => {
            if (!deleteLoading) setDeleteModal({ open, company: null })
          }}
          onConfirm={confirmDelete}
          title="Lock Company"
          description={`Are you sure you want to lock "${deleteModal.company?.fullName}"? This will prevent them from accessing the system. You can unlock them later if needed.`}
          isLoading={deleteLoading}
        />
        <CreateCompanyModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSuccess={handleCreateSuccess}
        />
        <CreateCompanyModal
          open={editModal.open}
          onOpenChange={(open) => setEditModal({ open, company: null })}
          onSuccess={() => {}} // Edit modal uses onSave instead
          initialValues={{
            // ✅ FIXED: Proper field mapping for edit modal
            // Company data structure -> Form field names
            fullName: editModal.company?.fullName,
            description: editModal.company?.description,
            phoneNumber: editModal.company?.phoneNumber,
            email: editModal.company?.email,
            profileImage: editModal.company?.profileImage,
            address: editModal.company?.address,
            // Map to the fields the form expects
            name: editModal.company?.fullName,
            country: editModal.company?.address?.country,
            city: editModal.company?.address?.city,
            // Include documents for edit mode
            documents: (editModal.company as any)?.documents || [],
          }}
          editMode={true}
          isLoading={editLoading}
          onSave={handleEditSave}
        />
      </div>
    </DashboardLayout>
  )
}
