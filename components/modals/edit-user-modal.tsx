"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm as useReactHookForm, Controller } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import type { User } from "@/lib/types"
import { GlobalModal } from "./global-modal"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { User as UserIcon, Mail, Phone, ShieldCheck } from "lucide-react"

interface EditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSave: (data: Partial<User>) => void
  isLoading?: boolean
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'suspended':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'locked':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function EditUserModal({ open, onOpenChange, user, onSave, isLoading = false }: EditUserModalProps) {
  const [hasChanges, setHasChanges] = useState(false)
  
  const form = useReactHookForm({
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      status: "active",
    },
  })

  useEffect(() => {
    if (user && open) {
      // Normalize status to lowercase
      const normalizedStatus = user.status?.toLowerCase() || "active"
      const formData = {
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || user.phone || "",
        status: normalizedStatus,
      }
      form.reset(formData)
      setHasChanges(false)
      
      console.debug("[EditUserModal] Form initialized", { user, formData })
    }
  }, [user, open, form])

  // Watch form values to detect changes
  const watchedValues = form.watch()
  useEffect(() => {
    if (user && open) {
      const normalizedStatus = (user.status?.toLowerCase() || (user.is_active ? "active" : "inactive"))
      const hasChanged = 
        watchedValues.fullName !== (user.fullName || user.name || "") ||
        watchedValues.email !== (user.email || "") ||
        watchedValues.phoneNumber !== (user.phoneNumber || user.phone || "") ||
        watchedValues.status !== normalizedStatus
      setHasChanges(hasChanged)
    }
  }, [watchedValues, user, open])

  const handleSubmit = (data: any) => {
    console.debug("[EditUserModal] Submit", { data, hasChanges })
    onSave({
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      status: data.status,
    })
  }

  if (!user) return null

  return (
    <GlobalModal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit User Profile"
      actions={
        <>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="edit-user-form" 
            disabled={isLoading || !hasChanges}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Saving..." : hasChanges ? "Save Changes" : "No Changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* User Info Header */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <UserIcon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{user.fullName || user.name}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          <Badge className={`${getStatusColor(user.status || "active")} font-medium`}>
            {(user.status || "active").charAt(0).toUpperCase() + (user.status || "active").slice(1)}
          </Badge>
        </div>

        <Form {...form}>
          <form
            id="edit-user-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            {/* Full Name */}
      <FormField
              control={form.control}
        name="fullName"
        rules={{ required: "Name is required" }}
        render={({ field }) => (
          <FormItem>
                  <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                    <UserIcon className="w-4 h-4" />
                    Full Name
                  </FormLabel>
            <FormControl>
                    <Input 
                      {...field} 
                      disabled={isLoading}
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter full name"
                    />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

            {/* Email */}
      <FormField
              control={form.control}
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
                  <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </FormLabel>
            <FormControl>
                    <Input 
                      type="email" 
                      {...field} 
                      disabled={isLoading}
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="user@example.com"
                    />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

            {/* Phone */}
      <FormField
              control={form.control}
        name="phoneNumber"
        rules={{ required: "Phone is required" }}
        render={({ field }) => (
          <FormItem>
                  <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </FormLabel>
            <FormControl>
                    <Input 
                      {...field} 
                      disabled={isLoading}
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="+251 900 000 000"
                    />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

            {/* Status */}
      <FormField
              control={form.control}
        name="status"
        rules={{ required: "Status is required" }}
        render={({ field }) => (
          <FormItem>
                  <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    Account Status
                  </FormLabel>
            <FormControl>
              <Controller
                      control={form.control}
                name="status"
                render={({ field }) => (
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange} 
                          disabled={isLoading}
                        >
                          <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                            <SelectItem value="active">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                Active
                              </div>
                            </SelectItem>
                            <SelectItem value="suspended">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                Suspended
                              </div>
                            </SelectItem>
                            <SelectItem value="locked">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                Locked
                              </div>
                            </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

            {hasChanges && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  ✓ Changes detected - Click "Save Changes" to update
                </p>
          </div>
            )}
        </form>
      </Form>
      </div>
    </GlobalModal>
  )
}
