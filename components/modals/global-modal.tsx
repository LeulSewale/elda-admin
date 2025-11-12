"use client"
import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog"

interface GlobalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "full"
}

export function GlobalModal({ open, onOpenChange, title, description, children, actions, maxWidth = "lg" }: GlobalModalProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    full: "max-w-full"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent 
        className={`${maxWidthClasses[maxWidth]} w-full max-h-[90vh] overflow-y-auto p-0 rounded-xl shadow-xl bg-white`}
        aria-describedby={description ? "modal-description" : undefined}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
          <DialogTitle className="text-lg font-semibold text-gray-800">{title}</DialogTitle>
          {description ? (
            <DialogDescription id="modal-description" className="sr-only">{description}</DialogDescription>
          ) : (
            <DialogDescription id="modal-description" className="sr-only">{title}</DialogDescription>
          )}
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