"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { requestsApi } from "@/lib/api/requests"

type ChangeStatusModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  currentStatus: string
  onSuccess?: () => void
}

export function ChangeStatusModal({ 
  open, 
  onOpenChange, 
  requestId, 
  currentStatus,
  onSuccess 
}: ChangeStatusModalProps) {
  const [newStatus, setNewStatus] = useState(currentStatus)
  const [remarks, setRemarks] = useState("")

  const handleStatusChange = async () => {
    if (!newStatus) {
      alert("Please select a status.")
      return
    }

    try {
      await requestsApi.patchRequest(requestId, {
        status: newStatus,
        remarks: remarks || `Status changed to ${newStatus}`
      })
      
      onSuccess?.()
      onOpenChange(false)
      
      // Reset form
      setNewStatus(currentStatus)
      setRemarks("")
    } catch (error) {
      console.error("[Change Status] Error:", error)
      alert("Failed to change status. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#4082ea] font-semibold">Change Request Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Current Status</Label>
            <div className="p-2 bg-gray-100 rounded text-sm">
              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </div>
          </div>

          <div>
            <Label>New Status *</Label>
            <Select
              value={newStatus}
              onValueChange={setNewStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="pending" value="pending">Pending</SelectItem>
                <SelectItem key="approved" value="approved">Approved</SelectItem>
                <SelectItem key="rejected" value="rejected">Rejected</SelectItem>
                <SelectItem key="closed" value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Remarks</Label>
            <Textarea
              placeholder="Add any remarks about this status change..."
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
            onClick={handleStatusChange}
            disabled={!newStatus || newStatus === currentStatus}
          >
            Change Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
