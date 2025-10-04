"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { requestsApi } from "@/lib/api/requests"
import { usersApi } from "@/lib/api/users"
import { useQuery } from "@tanstack/react-query"

type AssignRequestModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  currentAssignee?: string
  onSuccess?: () => void
}

export function AssignRequestModal({ 
  open, 
  onOpenChange, 
  requestId, 
  currentAssignee,
  onSuccess 
}: AssignRequestModalProps) {
  const [selectedLawyer, setSelectedLawyer] = useState("")
  const [priority, setPriority] = useState("medium")
  const [remarks, setRemarks] = useState("")

  // Fetch lawyers
  const { data: lawyersData, isLoading: lawyersLoading, error: lawyersError } = useQuery({
    queryKey: ["lawyers"],
    queryFn: () => usersApi.getUsers({ q: "lawyer", limit: 100 }),
    enabled: open,
    retry: 1,
  })

  // Handle users API response structure
  let lawyers: any[] = []
  if (lawyersData?.data) {
    if (Array.isArray(lawyersData.data)) {
      lawyers = lawyersData.data
    } else if (Array.isArray(lawyersData.data.data)) {
      lawyers = lawyersData.data.data
    } else if (Array.isArray(lawyersData.data.users)) {
      lawyers = lawyersData.data.users
    }
  }
  
  // Filter for users with lawyer role
  lawyers = lawyers.filter(user => user.role === 'lawyer')
  
  console.debug("[Assign Request] Users data:", lawyersData)
  console.debug("[Assign Request] Processed lawyers:", lawyers)
  console.debug("[Assign Request] Selected lawyer:", selectedLawyer)
  console.debug("[Assign Request] Button disabled:", !selectedLawyer || selectedLawyer === "no-lawyers")

  const handleAssign = async () => {
    if (!selectedLawyer || selectedLawyer === "no-lawyers") {
      alert("Please select a lawyer to assign this request to.")
      return
    }

    try {
      await requestsApi.patchRequest(requestId, {
        assigned_to_user_id: selectedLawyer,
        priority: priority,
        remarks: remarks || "Assigning to lawyer"
      })
      
      onSuccess?.()
      onOpenChange(false)
      
      // Reset form
      setSelectedLawyer("")
      setPriority("medium")
      setRemarks("")
    } catch (error) {
      console.error("[Assign Request] Error:", error)
      alert("Failed to assign request. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#4082ea] font-semibold">Assign Request to Lawyer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Select Lawyer *</Label>
            <Select
              value={selectedLawyer}
              onValueChange={(value) => {
                console.debug("[Assign Request] Lawyer selected:", value)
                setSelectedLawyer(value)
              }}
              disabled={lawyersLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={lawyersLoading ? "Loading lawyers..." : "Choose a lawyer"} />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(lawyers) && lawyers.length > 0 ? (
                  lawyers.map((lawyer) => {
                    console.debug("[Assign Request] Lawyer item:", lawyer)
                    return (
                      <SelectItem key={lawyer._id || lawyer.id} value={lawyer._id || lawyer.id}>
                        {lawyer.name} ({lawyer.email})
                      </SelectItem>
                    )
                  })
                ) : (
                  <SelectItem key="no-lawyers" value="no-lawyers" disabled>
                    {lawyersError ? "Error loading lawyers" : lawyersLoading ? "Loading lawyers..." : "No lawyers available"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Priority</Label>
            <Select
              value={priority}
              onValueChange={setPriority}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="low" value="low">Low</SelectItem>
                <SelectItem key="medium" value="medium">Medium</SelectItem>
                <SelectItem key="high" value="high">High</SelectItem>
                <SelectItem key="urgent" value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Remarks</Label>
            <Textarea
              placeholder="Add any remarks about this assignment..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#4082ea] hover:bg-[#306ad1]"
            onClick={handleAssign}
            disabled={!selectedLawyer || selectedLawyer === "no-lawyers"}
            title={`Selected: ${selectedLawyer || 'none'}`}
          >
            Assign Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
