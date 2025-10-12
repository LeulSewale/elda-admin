"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMutation, useQuery } from "@tanstack/react-query"
import { docThreadsApi, type DocThread } from "@/lib/api/docThreads"
import { usersApi } from "@/lib/api/users"
import { useAuth } from "@/hooks/use-auth"

type CreateDocThreadModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (thread: DocThread) => void
}

export function CreateDocThreadModal({ open, onOpenChange, onCreated }: CreateDocThreadModalProps) {
  const [subject, setSubject] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const { role } = useAuth({ redirectOnFail: false })

  const { data: usersList } = useQuery({
    queryKey: ["users", "for-thread"],
    queryFn: async () => {
      const res = await usersApi.getUsers({ limit: 20 })
      const payload = (res as any)?.data?.data ?? (res as any)?.data ?? []
      return payload as Array<{ id: string; _id?: string; name?: string; fullName?: string; email?: string }>
    },
    enabled: role === "admin" && open,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const createMutation = useMutation({
    mutationFn: (payload: { subject: string; user_id?: string }) => docThreadsApi.create(payload),
    onSuccess: (res) => {
      const created = (res as any)?.data?.data ?? (res as any)?.data
      if (onCreated && created) onCreated(created as DocThread)
      setSubject("")
      setSelectedUserId("")
      onOpenChange(false)
    },
  })

  const canSubmit = subject.trim().length > 0 && !(role === "admin" && !selectedUserId) && !createMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!v) setSubject("")
      onOpenChange(v)
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-base">Create Document Thread</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="thread-subject" className="text-sm font-medium text-gray-700">Subject</label>
            <Input
              id="thread-subject"
              placeholder="Contract exchange"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          {role === "admin" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">User</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {(usersList || []).map((u) => {
                    const id = (u as any).id || (u as any)._id
                    const name = (u as any).name || (u as any).fullName || "Unknown"
                    const email = (u as any).email || ""
                    return (
                      <SelectItem key={id} value={id}>
                        {name}{email ? ` (${email})` : ""}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!canSubmit}
            onClick={() => createMutation.mutate({ subject: subject.trim(), user_id: role === "admin" ? selectedUserId : undefined })}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


