"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm as useReactHookForm, Controller } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { GlobalModal } from "./global-modal"
import { useEffect } from "react"
import { User, Mail, Phone, Briefcase, Building2, MapPin, DollarSign, UserPlus, Loader2 } from "lucide-react"
import { useTranslations } from 'next-intl'

interface CreateEmployeeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateEmployee: (data: any) => void
  isLoading?: boolean
}

function PersonalInfoFields({ control, isLoading }: { control: any; isLoading?: boolean }) {
  return (
    <>
        <FormField
          control={control}
          name="user.name"
          rules={{ required: "Name is required" }}
          render={({ field }) => (
            <FormItem>
            <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              Full Name
            </FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} placeholder="Enter full name" className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="user.email"
          rules={{ 
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address"
            }
          }}
          render={({ field }) => (
            <FormItem>
            <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              Email
            </FormLabel>
              <FormControl>
                <Input type="email" {...field} disabled={isLoading} placeholder="Enter email" className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="user.phone"
          rules={{ required: "Phone is required" }}
          render={({ field }) => (
            <FormItem>
            <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              Phone
            </FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} placeholder="+251900000000" className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" />
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
            <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              District
            </FormLabel>
              <FormControl>
                <Controller
                  control={control}
                  name="district"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Addis Ababa">Addis Ababa</SelectItem>
                        <SelectItem value="Dire Dawa">Dire Dawa</SelectItem>
                        <SelectItem value="Harar">Harar</SelectItem>
                        <SelectItem value="Bahir Dar">Bahir Dar</SelectItem>
                        <SelectItem value="Mekelle">Mekelle</SelectItem>
                        <SelectItem value="Hawassa">Hawassa</SelectItem>
                        <SelectItem value="Gondar">Gondar</SelectItem>
                        <SelectItem value="Dessie">Dessie</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
    </>
  )
}

function EmploymentInfoFields({ control, isLoading }: { control: any; isLoading?: boolean }) {
  return (
    <>
      <FormField
        control={control}
        name="job_title"
        rules={{ required: "Job title is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Briefcase className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              Job Title
            </FormLabel>
            <FormControl>
              <Input {...field} disabled={isLoading} placeholder="Software Engineer" className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" />
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
            <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              Department
            </FormLabel>
            <FormControl>
              <Input {...field} disabled={isLoading} placeholder="Enter department" className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" />
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
            <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              Employment Type
            </FormLabel>
            <FormControl>
              <Input {...field} disabled={isLoading} placeholder="full_time, part_time, etc." className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" />
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
            <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              Salary (ETB)
            </FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                disabled={isLoading} 
                placeholder="372928"
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}

export function CreateEmployeeModal({ open, onOpenChange, onCreateEmployee, isLoading = false }: CreateEmployeeModalProps) {
  const t = useTranslations('employees')
  const tCommon = useTranslations('common')
  
  const form = useReactHookForm<{
    user: {
      name: string
      email: string
      phone: string
      is_active: boolean
    }
    job_title: string
    department: string
    employment_type: string
    salary: number
    district: string
  }>({
    defaultValues: {
      user: {
        name: "",
        email: "",
        phone: "",
        is_active: true,
      },
      job_title: "",
      department: "",
      employment_type: "",
      salary: 0,
      district: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        user: {
          name: "",
          email: "",
          phone: "",
          is_active: true,
        },
        job_title: "",
        department: "",
        employment_type: "",
        salary: 0,
        district: ""
      });
    }
  }, [open, form]);

  return (
    <GlobalModal
      open={open}
      onOpenChange={onOpenChange}
      title={t('createEmployee') || "Create New Employee"}
      maxWidth="4xl"
      actions={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {tCommon('cancel') || "Cancel"}
          </Button>
          <Button type="submit" form="create-employee-form" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {tCommon('creating') || "Creating..."}
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                {t('createEmployee') || "Create Employee"}
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 dark:bg-green-700 rounded-lg">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Creating New Employee</p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Fill in the details below to create a new employee record</p>
            </div>
          </div>
        </div>

      <Form {...form}>
        <form
          id="create-employee-form"
          onSubmit={form.handleSubmit((data) => {
            console.debug("[Create Employee] Form data:", data);
              
              // Validate required fields
              if (!data.user.name?.trim() || !data.user.email?.trim() || !data.user.phone?.trim()) {
                console.error("[Create Employee] Missing required user fields");
                return;
              }
              if (!data.job_title?.trim() || !data.department?.trim() || !data.employment_type?.trim() || !data.district?.trim()) {
                console.error("[Create Employee] Missing required employee fields");
                return;
              }
              if (!data.salary || data.salary <= 0) {
                console.error("[Create Employee] Invalid salary");
                return;
              }
              
              // Clean up the data before sending - match API structure exactly
            const payload: any = {
                user: {
                  email: data.user.email.trim(),
                  name: data.user.name.trim(),
                  phone: data.user.phone.trim(),
                  is_active: data.user.is_active ?? true, // Default to true if not set
                },
                job_title: data.job_title.trim(),
                salary: parseInt(data.salary.toString()), // Convert to number (already validated > 0)
                district: data.district.trim(),
                department: data.department.trim(),
                employment_type: data.employment_type.trim(),
                status: "active", // Default status as per API requirement
              }
              
              console.debug("[Create Employee] Final payload:", JSON.stringify(payload, null, 2));
            onCreateEmployee(payload)
          })}
            className="space-y-6"
          >
            {/* Personal Information Card */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <User className="w-5 h-5 text-[#4082ea] dark:text-blue-400" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PersonalInfoFields control={form.control} isLoading={isLoading} />
                </div>
              </CardContent>
            </Card>

            {/* Employment Information Card */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Briefcase className="w-5 h-5 text-[#4082ea] dark:text-blue-400" />
                  Employment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EmploymentInfoFields control={form.control} isLoading={isLoading} />
          </div>
              </CardContent>
            </Card>
        </form>
      </Form>
      </div>
    </GlobalModal>
  )
}
