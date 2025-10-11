"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm as useReactHookForm, Controller } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { GlobalModal } from "./global-modal"
import { useEffect } from "react"
import { Employee } from "@/lib/api/employees"

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
                <Controller
                  control={control}
                  name="department"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="R&D">R&D</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
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
                <Controller
                  control={control}
                  name="employment_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contractual">Contractual</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
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
      </div>
    </>
  )
}

export function EditEmployeeModal({ open, onOpenChange, onUpdateEmployee, employee, isLoading = false }: EditEmployeeModalProps) {
  
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
    if (open && employee) {
      form.reset({
        name: employee.user_name || "",
        email: employee.user_email || "",
        phone: employee.user_phone || "",
        job_title: employee.job_title || "",
        department: employee.department || "",
        employment_type: employee.employment_type || "",
        salary: parseFloat(employee.salary) || 0,
        district: employee.district || "",
      });
    }
  }, [open, employee, form]);

  return (
    <GlobalModal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Employee"
      actions={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" form="edit-employee-form" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Employee"}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form
          id="edit-employee-form"
          onSubmit={form.handleSubmit((data) => {
            console.debug("[Edit Employee] Form data:", data);
            if (employee) {
              // Transform form data to match API expectations
              const apiData = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                job_title: data.job_title,
                department: data.department,
                employment_type: data.employment_type,
                salary: data.salary.toString(),
                district: data.district,
              };
              console.debug("[Edit Employee] Transformed API data:", apiData);
              onUpdateEmployee(employee.id, apiData);
            }
          })}
          className="space-y-4"
        >
          <div className="space-y-4">
            <EditEmployeeFormFields control={form.control} isLoading={isLoading} />
          </div>
        </form>
      </Form>
    </GlobalModal>
  )
}
