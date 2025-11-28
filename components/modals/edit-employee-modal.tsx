"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useForm as useReactHookForm } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { GlobalModal } from "./global-modal"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Employee, employeesApi } from "@/lib/api/employees"
import { FileText, Download, Loader2, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from 'next-intl'
import { getErrorMessage, getErrorTitle } from "@/lib/error-utils"

interface EditEmployeeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateEmployee: (id: string, data: any) => void
  employee: Employee | null
  isLoading?: boolean
}

function EditEmployeeFormFields({ control, isLoading }: { control: any; isLoading?: boolean }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="name"
          rules={{ required: "Name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} placeholder="Enter full name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="email"
          rules={{ 
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address"
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} disabled={isLoading} placeholder="Enter email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="phone"
          rules={{ required: "Phone is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} placeholder="+251900000000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="job_title"
          rules={{ required: "Job title is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} placeholder="Software Engineer" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="department"
          rules={{ required: "Department is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} placeholder="Enter department" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="employment_type"
          rules={{ required: "Employment type is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Type</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} placeholder="Enter employment type" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="salary"
          rules={{ 
            required: "Salary is required",
            min: { value: 1, message: "Salary must be greater than 0" }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary (Birr)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  disabled={isLoading} 
                  placeholder="372928"
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="district"
          rules={{ required: "District is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} placeholder="Enter district" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  )
}

export function EditEmployeeModal({ open, onOpenChange, onUpdateEmployee, employee, isLoading = false }: EditEmployeeModalProps) {
  const { toast } = useToast()
  const t = useTranslations('employees')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
  const [downloadingDocs, setDownloadingDocs] = useState<Set<string>>(new Set())

  // Fetch full employee details by ID when modal opens
  const { data: employeeData, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ['employee', employee?.id],
    queryFn: async () => {
      if (!employee?.id) return null
      const response = await employeesApi.getEmployee(employee.id)
      return response.data?.data || null
    },
    enabled: open && !!employee?.id,
    staleTime: 5 * 60 * 1000,
  })

  // Use fetched employee data or fallback to passed employee prop
  const currentEmployee = employeeData || employee

  // Fetch employee attachments
  const { data: attachmentsData, isLoading: isLoadingAttachments } = useQuery({
    queryKey: ['employee-attachments', currentEmployee?.id],
    queryFn: async () => {
      if (!currentEmployee?.id) return []
      const response = await employeesApi.getEmployeeAttachments(currentEmployee.id)
      return response.data?.data || []
    },
    enabled: open && !!currentEmployee?.id,
    staleTime: 5 * 60 * 1000,
  })

  const attachments = attachmentsData || []
  
  const form = useReactHookForm<{
    name: string
    email: string
    phone: string
    job_title: string
    department: string
    employment_type: string
    salary: number
    district: string
  }>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      job_title: "",
      department: "",
      employment_type: "",
      salary: 0,
      district: "",
    },
  })

  useEffect(() => {
    if (open && currentEmployee) {
      form.reset({
        name: currentEmployee.user_name || "",
        email: currentEmployee.user_email || "",
        phone: currentEmployee.user_phone || "",
        job_title: currentEmployee.job_title || "",
        department: currentEmployee.department || "",
        employment_type: currentEmployee.employment_type || "",
        salary: parseFloat(String(currentEmployee.salary)) || 0,
        district: currentEmployee.district || "",
      });
    }
  }, [open, currentEmployee, form]);

  const handleDownloadAttachment = async (attachmentId: string, downloadPath: string, originalName: string) => {
    const docId = `attachment-${attachmentId}`
    setDownloadingDocs(prev => new Set(prev).add(docId))
    
    try {
      const response = await employeesApi.downloadEmployeeAttachmentByPath(downloadPath)
      const blob = response.data
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = originalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: tCommon('success') || "Success",
        description: "File downloaded successfully",
      })
    } catch (error: any) {
      console.error("[Edit Employee] Download error:", error)
      const errorTitle = getErrorTitle(error, tErrors)
      const errorMessage = getErrorMessage(error, tErrors)
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setDownloadingDocs(prev => {
        const newSet = new Set(prev)
        newSet.delete(docId)
        return newSet
      })
    }
  }

  const formatFileSize = (bytes: string | number) => {
    const size = typeof bytes === 'string' ? parseInt(bytes) : bytes
    if (size === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(size) / Math.log(k))
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.includes('pdf')) return '📄'
    if (mimeType?.includes('image')) return '🖼️'
    if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝'
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return '📊'
    return '📎'
  }

  if (!currentEmployee) {
    if (isLoadingEmployee) {
      return (
        <GlobalModal
          open={open}
          onOpenChange={onOpenChange}
          title="Edit Employee"
          maxWidth="4xl"
          actions={
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tCommon('cancel') || "Cancel"}
            </Button>
          }
        >
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#4082ea]" />
          </div>
        </GlobalModal>
      )
    }
    return null
  }

  return (
    <GlobalModal
      open={open}
      onOpenChange={onOpenChange}
      title={`${t('editEmployee') || "Edit Employee"} - ${currentEmployee.user_name || currentEmployee.user_email}`}
      maxWidth="4xl"
      actions={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading || isLoadingEmployee}>
            {tCommon('cancel') || "Cancel"}
          </Button>
          <Button type="submit" form="edit-employee-form" disabled={isLoading || isLoadingEmployee}>
            {isLoading || isLoadingEmployee ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {tCommon('updating') || "Updating..."}
              </>
            ) : (
              tCommon('update') || "Update Employee"
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#4082ea] rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Editing Employee</p>
              <p className="text-base font-semibold text-gray-900">{currentEmployee.user_name || "N/A"}</p>
            </div>
          </div>
        </div>

      <Form {...form}>
        <form
          id="edit-employee-form"
          onSubmit={form.handleSubmit((data) => {
            console.debug("[Edit Employee] Form data:", data);
              if (currentEmployee) {
                // Transform form data to match API expectations - same structure as create
              const apiData = {
                  user: {
                    name: data.name.trim(),
                    email: data.email.trim(),
                    phone: data.phone.trim(),
                    is_active: true, // Default to active
                  },
                  job_title: data.job_title.trim(),
                  department: data.department.trim(),
                  employment_type: data.employment_type.trim(),
                  salary: parseInt(data.salary.toString()) || 0,
                  district: data.district.trim(),
                  status: "active", // Default status
                };
                console.debug("[Edit Employee] Transformed API data:", JSON.stringify(apiData, null, 2));
                onUpdateEmployee(currentEmployee.id, apiData);
              }
            })}
            className="space-y-6"
          >
            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-[#4082ea]" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditEmployeeFormFields control={form.control} isLoading={isLoading || isLoadingEmployee} />
          </div>
              </CardContent>
            </Card>
        </form>
      </Form>

      {/* Attachments Section */}
      {currentEmployee && (
        <>
          <Separator className="my-6" />
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4082ea]" />
                {t('attachments') || "Attachments"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingAttachments ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-[#4082ea]" />
                </div>
              ) : attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((attachment) => {
                    const isDownloading = downloadingDocs.has(`attachment-${attachment.id}`)
                    const fileIcon = getFileIcon(attachment.mime_type)
                    const fileSize = formatFileSize(attachment.size)
                    
                    return (
                      <div 
                        key={attachment.id} 
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-[#4082ea] transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-[#4082ea]/10 rounded-lg text-xl">
                            {fileIcon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {attachment.original_name}
                              </p>
                              {attachment.title && (
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {attachment.title}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{fileSize}</span>
                              <span>•</span>
                              <span className="capitalize">{attachment.mime_type?.split('/')[1] || 'file'}</span>
                              <span>•</span>
                              <span>{new Date(attachment.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2 shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadAttachment(
                              attachment.id,
                              attachment.download_path,
                              attachment.original_name
                            )}
                            disabled={isDownloading}
                            className="border-[#4082ea] text-[#4082ea] hover:bg-[#4082ea] hover:text-white"
                          >
                            {isDownloading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                {tCommon('downloading') || "Downloading..."}
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                {tCommon('download') || "Download"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-4 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No attachments found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
      </div>
    </GlobalModal>
  )
}
