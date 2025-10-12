"use client"

import { useQuery } from "@tanstack/react-query"
import { requestsApi } from "@/lib/api/requests"
import { useAuth } from "@/hooks/use-auth"

interface RequestParams {
  limit?: number
  before?: string
  after?: string
  status?: string[]
  priority?: string[]
  disability_type?: string[]
  service_type?: string[]
  assigned_to_user_id?: string[]
  created_by?: string[]
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function useRequests(params?: RequestParams) {
  const { role, isLoading: authLoading } = useAuth()

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery<any[]>({
    queryKey: ["requests", role, params],
    queryFn: async () => {
      if (!role) {
        throw new Error("User role not available")
      }

      console.debug("[Requests] Fetching requests for role:", role)
      
      let response
      if (role === "admin") {
        console.debug("[Requests] Calling getAllRequests for admin")
        response = await requestsApi.getAllRequests(params)
        } else if (role === "user" ) {
          console.debug("[Requests] Calling getMyRequests for", role)
          response = await requestsApi.getMyRequests(params)
        }
       else if (role === "lawyer") {
        response = await requestsApi.getMyAssignedRequests(params)
      } else {
        throw new Error(`Unsupported role: ${role}`)
      }

      console.debug("[Requests] API response:", response?.data)
      
      // Handle the API response structure
      if (response?.data) {
        // If the response has a data property that's an array, return it
        if (Array.isArray(response.data)) {
          return response.data;
        }
        // If the response has a data property that's an object with a data array
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // If the response itself is an array
        if (Array.isArray(response)) {
          return response;
        }
      }
      
      console.warn("[Requests] Unexpected API response structure:", response);
      return [];
    },
    enabled: !authLoading && !!role,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on timeout or auth errors
      const isTimeout = error?.code === "ECONNABORTED" || error?.message?.toLowerCase().includes("timeout")
      const isAuthError = error?.response?.status === 401 || error?.response?.status === 403
      
      if (isTimeout || isAuthError) {
        console.debug("[Requests] Not retrying due to timeout or auth error")
        return false
      }
      
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff, max 5s
  })

  return {
    requests: (data || []) as any[],
    isLoading: isLoading || authLoading,
    isFetching,
    error,
    refetch,
    userRole: role
  }
}
