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
        className={`${maxWidthClasses[maxWidth]} w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 rounded-xl shadow-xl bg-white dark:bg-gray-800`}
        aria-describedby={description ? "modal-description" : undefined}
      >
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-xl">
          <DialogTitle className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 break-words pr-2">{title}</DialogTitle>
          {description ? (
            <DialogDescription id="modal-description" className="sr-only">{description}</DialogDescription>
          ) : (
            <DialogDescription id="modal-description" className="sr-only">{title}</DialogDescription>
          )}
        </div>

        <div className="px-2 sm:px-4 py-4 w-full flex-1 text-sm text-gray-700 dark:text-gray-300 min-w-0 overflow-x-hidden">{children}</div>

        {actions && (
          <DialogFooter className="px-2 sm:px-4 py-2 border-t border-gray-100 dark:border-gray-700">
            {actions}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
} 