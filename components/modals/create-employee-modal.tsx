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

interface CreateEmployeeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateEmployee: (data: any) => void
  isLoading?: boolean
}

function EmployeeFormFields({ control, isLoading }: { control: any; isLoading?: boolean }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="user.name"
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
          name="user.phone"
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

export function CreateEmployeeModal({ open, onOpenChange, onCreateEmployee, isLoading = false }: CreateEmployeeModalProps) {
  
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
      title="Create New Employee"
      actions={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" form="create-employee-form" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Employee"}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form
          id="create-employee-form"
          onSubmit={form.handleSubmit((data) => {
            console.debug("[Create Employee] Form data:", data);
            // Clean up the data before sending
            const payload = {
              ...data,
              manager_id: "", // Send empty string instead of null
              salary: parseInt(data.salary.toString()), // Convert back to number
            }
            console.debug("[Create Employee] Final payload:", payload);
            onCreateEmployee(payload)
          })}
          className="space-y-4"
        >
          <div className="space-y-4">
            <EmployeeFormFields control={form.control} isLoading={isLoading} />
          </div>
        </form>
      </Form>
    </GlobalModal>
  )
}
