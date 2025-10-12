"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, User } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { usersApi } from "@/lib/api/users"

interface AssignTicketModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    assigned_to_user_id: string
    status: "open" | "closed" | "in_progress" | "pending"
    priority: "low" | "medium" | "high" | "urgent"
  }) => void
  isLoading?: boolean
  ticket?: {
    id: string
    subject: string
    status: string
    priority: string
    assigned_to_user_id?: string | null
  } | null
}

const priorityOptions = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
]

const statusOptions = [
  { value: "open", label: "Open", color: "bg-blue-100 text-blue-800" },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-800" },
  { value: "closed", label: "Closed", color: "bg-green-100 text-green-800" },
]

export function AssignTicketModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isLoading = false,
  ticket
}: AssignTicketModalProps) {
  const [assignedUserId, setAssignedUserId] = useState("")
  const [status, setStatus] = useState<"open" | "closed" | "in_progress" | "pending">("in_progress")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("high")

  // Fetch users for assignment
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ["users-for-assignment"],
    queryFn: async () => {
      console.debug("[Assign Ticket] Fetching users for assignment...")
      const res = await usersApi.getUsers({ limit: 20 })
      console.debug("[Assign Ticket] Users response:", res.data)
      return res.data
    },
    enabled: open, // Only fetch when modal is open
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const users = usersResponse?.data || []

  // Initialize form with ticket data
  useEffect(() => {
    if (ticket && open) {
      setAssignedUserId(ticket.assigned_to_user_id || "")
      setStatus(ticket.status as any || "in_progress")
      setPriority(ticket.priority as any || "high")
    }
  }, [ticket, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignedUserId) return
    
    onSubmit({
      assigned_to_user_id: assignedUserId,
      status,
      priority
    })
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset form when closing
    setAssignedUserId("")
    setStatus("in_progress")
    setPriority("high")
  }

  const selectedUser = users.find((user: any) => user.id === assignedUserId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="assign-ticket-description">
        <DialogHeader>
          <DialogTitle>Assign Ticket</DialogTitle>
          <p id="assign-ticket-description" className="sr-only">
            Assign a ticket to a user and update its status and priority
          </p>
          {ticket && (
            <p className="text-sm text-gray-600 mt-1">
              Assigning: <strong>"{ticket.subject}"</strong>
            </p>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="assignedUser">Assign to User *</Label>
            <Select value={assignedUserId} onValueChange={setAssignedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user to assign this ticket to" />
              </SelectTrigger>
              <SelectContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading users...
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No users available
                  </div>
                ) : (
                  users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{user.name || user.fullName || "Unknown User"}</span>
                        <span className="text-gray-500 text-sm">({user.email})</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedUser && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Selected:</strong> {selectedUser.name || selectedUser.fullName} ({selectedUser.email})
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${option.color}`}>
                          {option.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${option.color}`}>
                          {option.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!assignedUserId || isLoading}
              className="bg-[#4082ea] hover:bg-[#4082ea] text-white"
            >
              {isLoading ? "Assigning..." : "Assign Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
