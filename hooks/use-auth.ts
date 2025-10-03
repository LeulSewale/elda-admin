"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authApi } from "@/lib/api/auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useEffect, useMemo, useState } from "react"
import type { AxiosError } from "axios"
import { getAccessToken } from "@/lib/token"

interface UseAuthOptions {
  redirectOnFail?: boolean
}

export function useAuth(options: UseAuthOptions = { redirectOnFail: true }) {
  const { redirectOnFail } = options
  const router = useRouter()
  const queryClient = useQueryClient()
  const [bootstrapping, setBootstrapping] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const normalizeUser = (apiUser: any) => {
    if (!apiUser) return null
    const isActive = apiUser?.is_active ?? apiUser?.isActive ?? true
    return {
      id: apiUser?.id ?? apiUser?._id ?? "",
      fullName: apiUser?.name ?? apiUser?.fullName ?? "",
      email: apiUser?.email ?? "",
      phoneNumber: apiUser?.phone ?? apiUser?.phoneNumber ?? "",
      role: apiUser?.role,
      is_active: isActive,
      status: isActive ? "Active" : "Locked",
      profileImage: {
        url: apiUser?.profile_image_url ?? apiUser?.profileImage?.url ?? "",
        publicId: apiUser?.profileImage?.publicId ?? "",
      },
      createdAt: apiUser?.created_at ?? apiUser?.createdAt ?? "",
      updatedAt: apiUser?.updated_at ?? apiUser?.updatedAt ?? "",
      address: apiUser?.address ?? { country: "", city: "" },
      description: apiUser?.description ?? "",
      createdBy: apiUser?.createdBy ?? "",
      entitlement: apiUser?.entitlement,
    }
  }

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        console.debug("[Auth] Query function started")
        
        // Debug: Check authentication state before API call
        const cookies = typeof document !== 'undefined' ? document.cookie : 'no-document'
        const cookieList = cookies.split(';').map(c => c.trim())
        
        console.debug("[Auth] Profile fetch attempt:", {
          cookies,
          cookieList,
          hasAccessToken: cookieList.some(c => c.includes('access_token')),
          hasRefreshToken: cookieList.some(c => c.includes('refresh_token')),
          timestamp: new Date().toISOString()
        })
        
        // Additional debugging: Check if we're in a browser environment
        if (typeof document === 'undefined') {
          console.warn("[Auth] Not in browser environment - this might cause auth issues")
        }
        
        console.debug("[Auth] About to call authApi.me()")
        const res = await authApi.me()
        console.debug("[Auth] authApi.me() response:", {
          status: res?.status,
          data: res?.data,
          headers: res?.headers
        })
        const apiUser = (res as any)?.data?.data ?? (res as any)?.data
        console.debug("[Auth] Normalizing user:", apiUser)
        const normalizedUser = normalizeUser(apiUser)
        console.debug("[Auth] Normalized user:", normalizedUser)
        return normalizedUser
      } catch (err: any) {
        // Enhanced error logging with more details
        console.error("[Auth] Profile fetch error:", {
          error: err,
          message: err?.message,
          code: err?.code,
          status: err?.response?.status,
          data: err?.response?.data,
          url: err?.config?.url,
          method: err?.config?.method,
          withCredentials: err?.config?.withCredentials,
          baseURL: err?.config?.baseURL,
          request: err?.request ? { 
            withCredentials: err?.request?.withCredentials, 
            responseURL: err?.request?.responseURL 
          } : undefined,
          stack: err?.stack,
          name: err?.name,
          timestamp: new Date().toISOString()
        })
        
        const status = err?.response?.status
        const isTimeout = err?.code === "ECONNABORTED" || err?.message?.toLowerCase().includes("timeout")
        
        // Handle timeout errors gracefully
        if (isTimeout) {
          console.warn("[Auth] Request timeout - returning null to prevent infinite retries")
          return null
        }
        
        if (status === 401 || status === 404) {
          console.debug("[Auth] Returning null due to status:", status)
          return null
        }
        console.error("[Auth] Re-throwing error")
        throw err
      }
    },
    enabled: true,
    retry: (failureCount, error: any) => {
      // Don't retry on timeout or auth errors
      const isTimeout = error?.code === "ECONNABORTED" || error?.message?.toLowerCase().includes("timeout")
      const isAuthError = error?.response?.status === 401 || error?.response?.status === 404
      
      if (isTimeout || isAuthError) {
        console.debug("[Auth] Not retrying due to timeout or auth error")
        return false
      }
      
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff, max 5s
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!isLoading) {
      setBootstrapping(false)
    }
  }, [isLoading])

  // Monitor error state for debugging
  useEffect(() => {
    if (isError && error) {
      console.error("[Auth] useQuery error detected:", {
        error,
        message: error?.message,
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data,
        stack: error?.stack,
        timestamp: new Date().toISOString()
      });
    }
  }, [isError, error]);

  useEffect(() => {
    // Only redirect on 401, not 404 (which means profile endpoint doesn't exist)
    if (isError && (error as any)?.response?.status === 401 && redirectOnFail) {
      console.warn("[Auth] 401 error detected - redirecting to login");
      // Clear any stale query data
      queryClient.clear();
      router.replace("/login");
    }
  }, [isError, error, redirectOnFail, router, queryClient]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onMutate: () => {
      setIsAuthenticating(true)
    },
    onSuccess: async (response) => {
      try {
        // Debug: Log raw login response
        // eslint-disable-next-line no-console
        console.debug("Login response:", response?.data)

        // Debug: Check cookies after login
        if (typeof document !== 'undefined') {
          const cookies = document.cookie
          const cookieList = cookies.split(';').map(c => c.trim())
          console.debug("[Auth] Cookies after login:", {
            cookies,
            cookieList,
            hasAccessToken: cookieList.some(c => c.includes('access_token')),
            hasRefreshToken: cookieList.some(c => c.includes('refresh_token'))
          })
        }

        const loginUser = (response as any)?.data?.user
        const normalizedLoginUser = normalizeUser(loginUser)

        await new Promise((res) => setTimeout(res, 50))
        const { data } = await refetchProfile()
        const effectiveUser = data || normalizedLoginUser

        // Check role
        if (effectiveUser?.role !== 'admin' && effectiveUser?.role !== 'lawyer' && effectiveUser?.role !== 'user') {
          toast({
            title: "Login Error",
            description: "Your account does not have access. Only admin, lawyer or user roles are allowed.",
            variant: "destructive",
          })
          setIsAuthenticating(false)
          return
        }
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        })
        if (effectiveUser) {
          queryClient.setQueryData(["auth", "me"], effectiveUser)
        }

        // Navigate to dashboard after login (uniform for all roles)
        router.replace("/dashboard")
      } catch (err) {
        toast({
          title: "Login Error",
          description: "Login succeeded, but failed to load profile.",
          variant: "destructive",
        })
      } finally {
        setIsAuthenticating(false)
      }
    },
    onError: (error: AxiosError) => {
      let message = "Login failed"
      if (error?.response && typeof error.response.data === "object" && error.response.data !== null && "message" in error.response.data) {
        message = (error.response.data as { message?: string }).message || error?.message || message
      } else if (error?.message) {
        message = error.message
      }
      setIsAuthenticating(false)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      console.debug("[Auth] Logout successful - clearing data");
      queryClient.clear()
      router.replace("/login")
    },
    onError: (error) => {
      console.warn("[Auth] Logout failed, but clearing data anyway:", error);
      queryClient.clear()
      router.replace("/login")
    },
  })

  // Manual logout function for debugging
  const forceLogout = () => {
    console.warn("[Auth] Force logout called - clearing all data");
    queryClient.clear();
    // Clear cookies manually if possible
    if (typeof document !== 'undefined') {
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
    }
    router.replace("/login");
  }

  // Debug function to check authentication status
  const debugAuthStatus = () => {
    const cookies = typeof document !== 'undefined' ? document.cookie : 'no-document';
    const cookieList = cookies.split(';').map(c => c.trim());
    
    console.log("=== AUTH DEBUG INFO ===");
    console.log("User:", user);
    console.log("Is Loading:", isLoading);
    console.log("Is Authenticated:", isAuthenticated);
    console.log("Role:", user?.role);
    console.log("Cookies:", cookies);
    console.log("Cookie List:", cookieList);
    console.log("Has Access Token:", cookieList.some(c => c.includes('access_token')));
    console.log("Has Refresh Token:", cookieList.some(c => c.includes('refresh_token')));
    console.log("Error:", error);
    console.log("Error Code:", (error as any)?.code);
    console.log("Error Message:", error?.message);
    console.log("Is Timeout:", (error as any)?.code === "ECONNABORTED" || error?.message?.toLowerCase().includes("timeout"));
    console.log("======================");
  }

  // Make debug function available globally for console access
  if (typeof window !== 'undefined') {
    (window as any).debugAuth = debugAuthStatus;
  }

  const isAuthenticated = useMemo(
    () => {
      // If we have a user, we're authenticated
      if (user) return true
      
      // If still loading, not authenticated yet
      if (isLoading) return false
      
      // If error is 404 (profile endpoint doesn't exist), consider authenticated if we have cookies
      if (isError && (error as any)?.response?.status === 404) {
        // Check if we have cookies (basic auth check)
        const hasCookies = typeof document !== 'undefined' && document.cookie.includes('access_token')
        return hasCookies
      }
      
      // If error is 401, not authenticated
      if (isError && (error as any)?.response?.status === 401) {
        return false
      }
      
      // Default to not authenticated
      return false
    },
    [user, isLoading, isError, error]
  )

  return {
    user,
    isLoading,
    isAuthenticated,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    forceLogout, // For debugging/manual logout
    debugAuthStatus, // For debugging authentication
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isAuthenticating,
    role: user?.role,
    hasRole: (role: string) => user?.role === role,
    bootstrapping
  }
}
