"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { docThreadsApi, type DocThread } from "@/lib/api/docThreads"

type DocThreadDetailModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  threadId?: string
}

export function DocThreadDetailModal({ open, onOpenChange, threadId }: DocThreadDetailModalProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["doc-thread", threadId],
    queryFn: async () => {
      if (!threadId) return null
      const res = await docThreadsApi.getById(threadId)
      return (res as any)?.data?.data as DocThread
    },
    enabled: Boolean(open && threadId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (open && threadId) {
      refetch()
    }
  }, [open, threadId, refetch])

  const t = data
  const statusColors: Record<string, string> = {
    open: "bg-emerald-100 text-emerald-800",
    closed: "bg-gray-100 text-gray-800",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-base">Thread Details</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">Failed to load thread.</div>
        ) : t ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold truncate">{t.subject}</div>
              <Badge className={statusColors[t.status] || "bg-gray-100 text-gray-800"}>{t.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div><span className="font-medium text-gray-700">ID:</span> {t.id}</div>
              <div><span className="font-medium text-gray-700">User:</span> {t.user_name} ({t.user_email})</div>
              <div><span className="font-medium text-gray-700">Created By:</span> {t.created_by_name} ({t.created_by_email})</div>
              <div><span className="font-medium text-gray-700">Status:</span> {t.status}</div>
              <div><span className="font-medium text-gray-700">Last Doc:</span> {new Date(t.last_document_at).toLocaleString()}</div>
              <div><span className="font-medium text-gray-700">Created:</span> {new Date(t.created_at).toLocaleString()}</div>
              <div><span className="font-medium text-gray-700">Updated:</span> {new Date(t.updated_at).toLocaleString()}</div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">No thread selected.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}


