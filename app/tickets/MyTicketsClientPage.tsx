"use client"

/**
 * 🎫 Tickets Management Page
 * 
 * FEATURES:
 * - View tickets grouped by Open and Closed
 * - Create new tickets via GlobalModal
 * - Optimized React Query caching
 * - Card-based layout like the design screenshot
 */

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, FileText, Search, CheckCircle2, AlertCircle, Calendar, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { GlobalModal } from "@/components/modals/global-modal"
import { TicketCardOutline } from "@/components/cards/TicketCard"
import { dummyTickets } from "@/lib/dummy-data"

// Style constants
const statCardStyle =
  "relative flex flex-col justify-between gap-4 p-6 rounded-2xl shadow-md bg-gradient-to-br from-[#e7eeff] via-white to-white border-0 transition-transform duration-200 hover:scale-[1.03] group"
const iconStyle =
  "w-14 h-14 p-3 rounded-xl bg-[#4082ea]/10 text-[#4082ea] shadow group-hover:bg-[#4082ea]/20 transition-all duration-200"

// Ticket type
type Ticket = {
  id: string
  title: string
  description: string
  status: "open" | "closed"
  createdAt: string
}



// View Details Component
const TicketDetails = ({ ticket, onClose }: { ticket: Ticket | null, onClose: () => void }) => {
  if (!ticket) return null
  
  return (
    <div className="space-y-14">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
        <p className="text-sm text-gray-500">
          Created on {new Date(ticket.createdAt).toLocaleDateString()}
        </p>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Description</h4>
        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
          {ticket.description}
        </p>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    </div>
  )
}

export default function MyTicketsClientPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"open" | "closed">("open")
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // 🚀 Fetch tickets
  const {
    data: tickets = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return dummyTickets
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  // 🚀 Create new ticket
  const createTicketMutation = useMutation({
    mutationFn: async (data: Omit<Ticket, "id">) => {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return { id: `new-${Date.now()}`, ...data } as Ticket
    },
    onSuccess: (newTicket) => {
      queryClient.setQueryData(["tickets"], (old: Ticket[] | undefined) =>
        old ? [...old, newTicket] : [newTicket]
      )
      toast({
        title: "Ticket created successfully",
        description: `"${newTicket.title}" has been added to open tickets.`,
      })
      setCreateModalOpen(false)
      setFormTitle("")
      setFormDescription("")
    },
  })

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket)
  }

  const handleCloseDetails = () => {
    setSelectedTicket(null)
  }

  const handleSubmit = () => {
    if (!formTitle.trim()) return
    createTicketMutation.mutate({
      title: formTitle,
      description: formDescription,
      status: "open",
      createdAt: new Date().toISOString().split("T")[0],
    })
  }

  // Derived lists
  const openTickets = tickets.filter((t) => t.status === "open")
  const closedTickets = tickets.filter((t) => t.status === "closed")
  const filtered = (list: any[]) =>
    list.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase()),
    )
  const listByTab = activeTab === "open" ? openTickets : closedTickets
  const visibleTickets = filtered(listByTab)
  const tabTotal = activeTab === "open" ? openTickets.length : closedTickets.length
  return (
    <DashboardLayout title="Tickets" isFetching={isLoading || isFetching}>
      <div className="p-0">  
      <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center px-2 py-2">
          <div>
          <div className="relative inline-block">
                <h2 className="text-lg font-semibold text-gray-800">
                  {activeTab === "open" ? "Open Tickets" : "Closed Tickets"}
                </h2>
                <span className="absolute -top-2 -right-3 px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#e7eeff] text-[#4082ea]">
                  {tabTotal}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab === "open" ? "Tickets that require attention" : "Resolved and completed tickets"}
              </p>          
              
         </div>
          <Button
            className="bg-[#4082ea] hover:bg-[#4082ea] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
          </div>
          <hr />
          <div className="flex justify-between items-center px-2 py-2">
          <div className="mt-3 inline-flex items-center rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("open")}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    activeTab === "open"
                      ? "bg-white text-[#4082ea] shadow"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("closed")}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    activeTab === "closed"
                      ? "bg-white text-[#4082ea] shadow"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Closed
                </button>
            </div>
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title..."
                  className="pl-9"
                />
              </div>
          </div>
          
          

          {visibleTickets.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg p-6">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No tickets found.</p>
              <p className="text-sm mt-1">Try adjusting filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleTickets.map((t) => (
                <TicketCardOutline
                  key={t.id}
                  ticket={t}
                  onClick={() => handleViewDetails(t)}
                  onReadMore={() => handleViewDetails(t)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Global Create Ticket Modal */}
      <GlobalModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title="Create New Ticket"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formTitle.trim() || createTicketMutation.isPending}
              className="bg-[#A4D65E] hover:bg-[#8fc350]"
            >
              {createTicketMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Ticket'
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter ticket title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              placeholder="Enter ticket description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full min-h-[120px]"
            />
          </div>
        </div>
      </GlobalModal>
      
      {/* View Ticket Details Modal */}
      <GlobalModal
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
        title="Ticket Details"
      >
        {selectedTicket && <TicketDetails ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
      </GlobalModal>
    </DashboardLayout>
  )
}
