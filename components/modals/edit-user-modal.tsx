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
import { useEffect } from "react"

interface EditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSave: (data: Partial<User>) => void
  isLoading?: boolean
}

function UserFormFields({ control, isLoading }: { control: any; isLoading?: boolean }) {
  return (
    <>
      <FormField
        control={control}
        name="fullName"
        rules={{ required: "Name is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="email"
        rules={{ required: "Email is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="phoneNumber"
        rules={{ required: "Phone is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="status"
        rules={{ required: "Status is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <FormControl>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="locked">Locked</SelectItem>
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

export function EditUserModal({ open, onOpenChange, user, onSave, isLoading = false }: EditUserModalProps) {
  const form = useReactHookForm({
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      status: user?.status || "active",
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        status: user.status || "active",
      });
    }
  }, [user, form]);

  return (
    <GlobalModal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit User"
      actions={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" form="edit-user-form" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form
          id="edit-user-form"
          onSubmit={form.handleSubmit((data) => {
            onSave({
              ...data,
              status: data.status as User["status"],
            })
          })}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <UserFormFields control={form.control} isLoading={isLoading} />
          </div>
        </form>
      </Form>
    </GlobalModal>
  )
}
