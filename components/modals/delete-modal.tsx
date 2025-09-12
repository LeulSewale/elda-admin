"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlobalModal } from "./global-modal"

interface DeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (e?: React.MouseEvent) => void
  title: string
  description: string
  isLoading?: boolean
}

export function DeleteModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  isLoading = false,
}: DeleteModalProps) {
  return (
    <GlobalModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      actions={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </>
      }
    >
      <div className="text-left mb-4">{description}</div>
    </GlobalModal>
  )
}
