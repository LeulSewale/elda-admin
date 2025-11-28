"use client"

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
import { DateRangeFilter } from "@/components/ui/date-range-filter"
import { useTickets } from "@/hooks/use-tickets"
import { ticketsApi } from "@/lib/api/tickets"
import { CreateTicketModal } from "@/components/modals/create-ticket-modal-new"
import { useTranslations } from 'next-intl'

// Style constants
const statCardStyle =
  "relative flex flex-col justify-between gap-4 p-6 rounded-2xl shadow-md bg-gradient-to-br from-[#e7eeff] via-white to-white border-0 transition-transform duration-200 hover:scale-[1.03] group"
const iconStyle =
  "w-14 h-14 p-3 rounded-xl bg-[#4082ea]/10 text-[#4082ea] shadow group-hover:bg-[#4082ea]/20 transition-all duration-200"

// Ticket type
type Ticket = {
  id: string
  subject: string
  description: string
  status: "open" | "closed" | "in_progress" | "pending"
  priority: "low" | "medium" | "high" | "urgent"
  tags: string[]
  created_at: string
  creator_name: string
  creator_email: string
}



// View Details Component
const TicketDetails = ({ ticket, onClose }: { ticket: Ticket | null, onClose: () => void }) => {
  if (!ticket) return null
  
  return (
    <div className="space-y-14">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
        <p className="text-sm text-gray-500">
          Created on {new Date(ticket.created_at).toLocaleDateString()}
        </p>
        <div className="flex gap-2 mt-2">
          <Badge className={`text-xs ${
            ticket.status === "open" ? "bg-blue-100 text-blue-800" :
            ticket.status === "closed" ? "bg-green-100 text-green-800" :
            ticket.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
            "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}>
            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </Badge>
          <Badge className={`text-xs ${
            ticket.priority === "urgent" ? "bg-red-100 text-red-800" :
            ticket.priority === "high" ? "bg-orange-100 text-orange-800" :
            ticket.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
            "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}>
            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 dark:text-gray-300">Description</h4>
        <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          {ticket.description}
        </p>
      </div>
      
      {ticket.tags && ticket.tags.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700 dark:text-gray-300">Tags</h4>
          <div className="flex flex-wrap gap-1">
            {ticket.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-end pt-4">
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    </div>
  )
}

export default function MyTicketsClientPage() {
  const [openModal, setOpenModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"open" | "closed">("open")
  const [dateRange, setDateRange] = useState<{ startDate: string | null; endDate: string | null }>({
    startDate: null,
    endDate: null
  });
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  // Translation hooks
  const t = useTranslations('tickets');
  const tCommon = useTranslations('common');

  // Handle date range changes
  const handleDateRangeChange = (startDate: string | null, endDate: string | null) => {
    setDateRange({ startDate, endDate });
  };

  // 🚀 Fetch tickets with role-based logic and date filtering
  const { tickets, isLoading, isFetching, userRole } = useTickets({
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined
  })

  // 🚀 Create new ticket
  const createTicketMutation = useMutation({
    mutationFn: async (data: { subject: string; description: string; priority: "low" | "medium" | "high" | "urgent"; tags: string[] }) => {
      console.debug("[My Tickets] Creating ticket with data:", data);
      const res = await ticketsApi.createTicket({
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        tags: data.tags
      });
      console.debug("[My Tickets] Create ticket response:", res.data);
      return res.data.data;
    },
    onSuccess: (newTicket) => {
      queryClient.setQueryData(["tickets", userRole], (old: any) => {
        if (!old) return { data: [newTicket], paging: {} };
        return {
          ...old,
          data: [...old.data, newTicket]
        };
      })
      toast({
        title: "Ticket created successfully",
        description: `"${newTicket.subject}" has been added to open tickets.`,
      })
      setOpenModal(false)
    },
    onError: (error: any) => {
      console.error("[My Tickets] Create ticket error:", error);
      toast({
        title: "Failed to create ticket",
        description: error?.response?.data?.message || "An error occurred while creating the ticket.",
        variant: "destructive"
      })
    }
  })

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket)
  }

  const handleCloseDetails = () => {
    setSelectedTicket(null)
  }


  // Derived lists
  const openTickets = tickets.filter((t) => t.status === "open")
  const closedTickets = tickets.filter((t) => t.status === "closed")
  const filtered = (list: any[]) =>
    list.filter((t) =>
      t.subject.toLowerCase().includes(search.toLowerCase()),
    )
  const listByTab = activeTab === "open" ? openTickets : closedTickets
  const visibleTickets = filtered(listByTab)
  const tabTotal = activeTab === "open" ? openTickets.length : closedTickets.length
  return (
    <DashboardLayout title={t('title')} isFetching={isLoading || isFetching}>
      <div className="p-0">  
      <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center px-2 py-2">
          <div>
          <div className="relative inline-block">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {activeTab === "open" ? t('myTickets') : t('allTickets')}
                </h2>
                <span className="absolute -top-2 -right-3 px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#e7eeff] dark:bg-blue-900/30 text-[#4082ea] dark:text-blue-300">
                  {tabTotal}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {activeTab === "open" ? t('ticketsRequireAttention') : t('resolvedCompletedTickets')}
              </p>          
              
         </div>
          {userRole === "user" && (
            <Button
              onClick={() => setOpenModal(true)}
              className="bg-[#4082ea] hover:bg-[#4082ea] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('createTicket')}
            </Button>
          )}
          </div>
          <hr />
          <div className="flex justify-between items-center px-2 py-2">
          <div className="flex items-center gap-4">
            <div className="mt-3 inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("open")}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      activeTab === "open"
                        ? "bg-white dark:bg-gray-600 text-[#4082ea] dark:text-blue-400 shadow"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    {t('open')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("closed")}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      activeTab === "closed"
                        ? "bg-white dark:bg-gray-600 text-[#4082ea] dark:text-blue-400 shadow"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    {t('closed')}
                  </button>
              </div>
              <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
            </div>
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('searchBySubject')}
                  className="pl-9"
                />
              </div>
          </div>
          
          

          {visibleTickets.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p>{t('noTicketsFound')}</p>
              <p className="text-sm mt-1">{t('tryAdjustingFilters')}</p>
            </div>
          ) : (
            <div className="p-2 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

      
      {/* View Ticket Details Modal */}
      <GlobalModal
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
        title={t('ticketDetails')}
      >
        {selectedTicket && <TicketDetails ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
      </GlobalModal>
      {userRole === "user" && (
        <CreateTicketModal 
          open={openModal}
          onOpenChange={setOpenModal}
          onSubmit={(data) => {
            createTicketMutation.mutate(data)
          }}
          isLoading={createTicketMutation.isPending}
        />
      )}
    </DashboardLayout>
  )
}
