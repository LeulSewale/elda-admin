"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

interface ProductionTicketFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    category: string
    description: string
  }) => void
}

const ticketCategories = [
  "Production Issue",
  "Quality Control",
  "Maintenance Request",
  "Supply Chain",
  "Other"
]

export function CreateTicketModal({ open, onOpenChange, onSubmit }: ProductionTicketFormProps) {
  const [ticketTitle, setTicketTitle] = useState<string>("")
  const [ticketCategory, setTicketCategory] = useState<string>("")
  const [ticketDescription, setTicketDescription] = useState<string>("")
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title: ticketTitle,
      category: ticketCategory,
      description: ticketDescription,
    })
    setIsSubmitted(true)
    // Reset form fields after submission
    setTicketTitle("")
    setTicketCategory("")
    setTicketDescription("")
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset form when closing
    setTicketTitle("")
    setTicketCategory("")
    setTicketDescription("")
    setIsSubmitted(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Request</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto p-2">
      {!isSubmitted ? (
        <>
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-xl font-bold text-gray-800">Basic Production Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="ticketTitle" className="text-sm font-medium text-gray-700">Ticket Title</label>
                  <Input
                    id="ticketTitle"
                    placeholder="Enter Batch Name"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="ticketCategory" className="text-sm font-medium text-gray-700">Ticket Category</label>
                  <Select
                    value={ticketCategory}
                    onValueChange={setTicketCategory}
                  >
                    <SelectTrigger id="ticketCategory">
                      <SelectValue placeholder="Select available category" />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="ticketDescription" className="text-sm font-medium text-gray-700">Ticket Description</label>
                <Textarea
                  id="ticketDescription"
                  placeholder="200 Units"
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full md:w-auto px-8 py-2 text-base font-semibold"
                disabled={!ticketTitle || !ticketCategory || !ticketDescription}
              >
                Submit Ticket
              </Button>
            </form>
          </CardContent>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Success!</h2>
          <p className="text-gray-500">Your production ticket has been submitted.</p>
          <Button
            className="mt-6 px-6 bg-blue-600 hover:bg-blue-700"
            onClick={handleClose}
          >
            Close
          </Button>
        </div>
      )}
        </div>
      </DialogContent>
    </Dialog>
  )
}