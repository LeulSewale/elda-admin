"use client"
import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"

interface GlobalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export function GlobalModal({ open, onOpenChange, title, children, actions }: GlobalModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-0 rounded-xl shadow-xl bg-white">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
          <DialogTitle className="text-lg font-semibold text-gray-800">{title}</DialogTitle>
        </div>

        <div className="px-2 py-4 w-full flex-1 text-sm text-gray-700">{children}</div>

        {actions && (
          <DialogFooter className="px-2 py-2 border-t border-gray-100">
            {actions}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
} 