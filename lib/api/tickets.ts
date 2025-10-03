import { api } from "../axios"

// Ticket types based on the API response
export interface Ticket {
  id: string
  created_by: string
  assigned_to_user_id: string | null
  assigned_at: string | null
  subject: string
  description: string
  status: "open" | "closed" | "in_progress" | "pending"
  priority: "low" | "medium" | "high" | "urgent"
  tags: string[]
  due_at: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
  creator_name: string
  creator_email: string
  assignee_name: string | null
  assignee_email: string | null
}

export interface TicketsResponse {
  data: Ticket[]
  paging: {
    limit: number
    nextCursor: string | null
    prevCursor: string | null
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface CreateTicketInput {
  subject: string
  description: string
  priority?: "low" | "medium" | "high" | "urgent"
  tags?: string[]
  due_at?: string
}

export interface UpdateTicketInput {
  subject?: string
  description?: string
  status?: "open" | "closed" | "in_progress" | "pending"
  priority?: "low" | "medium" | "high" | "urgent"
  tags?: string[]
  due_at?: string
  assigned_to_user_id?: string | null
}

export const ticketsApi = {
  // Get all tickets (admin role)
  getAllTickets: (params?: {
    limit?: number
    cursor?: string
    status?: string
    priority?: string
    search?: string
  }) => {
    console.debug("[Tickets API] Getting all tickets with params:", params)
    return api.get<TicketsResponse>("/tickets", { params })
  },

  // Get my tickets (user role)
  getMyTickets: (params?: {
    limit?: number
    cursor?: string
    status?: string
    priority?: string
    search?: string
  }) => {
    console.debug("[Tickets API] Getting my tickets with params:", params)
    return api.get<TicketsResponse>("/tickets/mine", { params })
  },

  // Get assigned tickets (lower role)
  getAssignedTickets: (params?: {
    limit?: number
    cursor?: string
    status?: string
    priority?: string
    search?: string
  }) => {
    console.debug("[Tickets API] Getting assigned tickets with params:", params)
    return api.get<TicketsResponse>("/tickets/assigned", { params })
  },

  // Get a single ticket by ID
  getTicket: (id: string) => {
    console.debug("[Tickets API] Getting ticket by ID:", id)
    return api.get<{ data: Ticket }>(`/tickets/${id}`)
  },

  // Create a new ticket
  createTicket: (data: CreateTicketInput) => {
    console.debug("[Tickets API] Creating ticket with data:", data)
    return api.post<{ data: Ticket }>("/tickets", data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true
    })
  },

  // Update an existing ticket
  updateTicket: (id: string, data: UpdateTicketInput) => {
    console.debug("[Tickets API] Updating ticket:", { id, data })
    return api.patch<{ data: Ticket }>(`/tickets/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true
    })
  },

  // Delete a ticket
  deleteTicket: (id: string) => {
    console.debug("[Tickets API] Deleting ticket:", id)
    return api.delete<{ data: { id: string } }>(`/tickets/${id}`, {
      withCredentials: true
    })
  },

  // Assign ticket to a user (admin only)
  assignTicket: (id: string, userId: string, status?: string, priority?: string) => {
    console.debug("[Tickets API] Assigning ticket:", { id, userId, status, priority })
    const payload: any = { assigned_to_user_id: userId }
    if (status) payload.status = status
    if (priority) payload.priority = priority
    
    return api.patch<{ data: Ticket }>(`/tickets/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true
    })
  },

  // Change ticket status
  changeStatus: (id: string, status: "open" | "closed" | "in_progress" | "pending") => {
    console.debug("[Tickets API] Changing ticket status:", { id, status })
    return api.patch<{ data: Ticket }>(`/tickets/${id}/status`, { status }, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true
    })
  }
}
