import { useQuery } from "@tanstack/react-query"
import { ticketsApi } from "@/lib/api/tickets"
import { useAuth } from "@/hooks/use-auth"

/**
 * Custom hook for role-based ticket fetching
 * 
 * Role-based endpoints:
 * - admin: GET /tickets (all tickets)
 * - user: GET /tickets/mine (user's own tickets)
 * - lower roles: GET /tickets/assigned (assigned tickets)
 */
export function useTickets(params?: {
  startDate?: string
  endDate?: string
  status?: string
  priority?: string
  search?: string
}) {
  const { user } = useAuth({ redirectOnFail: false })
  
  const {
    data: ticketsResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["tickets", user?.role, params],
    queryFn: async () => {
      console.debug("[useTickets] Fetching tickets for role:", user?.role)
      
      if (!user?.role) {
        throw new Error("User role not available")
      }
      
      let response
      switch (user.role) {
        case "admin":
          console.debug("[useTickets] Using admin endpoint: /tickets")
          response = await ticketsApi.getAllTickets(params)
          break
        case "user":
          console.debug("[useTickets] Using user endpoint: /tickets/mine")
          response = await ticketsApi.getMyTickets(params)
          break
        default:
          // For lower roles (support, agent, etc.)
          console.debug("[useTickets] Using assigned endpoint: /tickets/assigned")
          response = await ticketsApi.getAssignedTickets(params)
          break
      }
      
      console.debug("[useTickets] API Response:", response.data)
      return response.data
    },
    enabled: !!user?.role, // Only fetch when user role is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  return {
    tickets: ticketsResponse?.data || [],
    paging: ticketsResponse?.paging,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    userRole: user?.role
  }
}
