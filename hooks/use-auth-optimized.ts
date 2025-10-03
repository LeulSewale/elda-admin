// 📁 hooks/use-auth-optimized.ts
// Optimized authentication hook with enhanced token management and environment variables

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authApi } from "@/lib/api/auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useEffect, useMemo, useState, useCallback } from "react"
import type { AxiosError } from "axios"
import { tokenManager, isAuthenticated, cookieManager } from "@/lib/token-optimized"
import { config } from "@/lib/config"

interface UseAuthOptions {
  redirectOnFail?: boolean
}

export function useAuthOptimized(options: UseAuthOptions = { redirectOnFail: true }) {
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

  // Enhanced profile query with better error handling
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
        if (config.features.debugLogging) {
          console.debug("[Auth] Fetching user profile...")
        }
        
        // Check authentication status first
        if (!isAuthenticated()) {
          if (config.features.debugLogging) {
            console.debug("[Auth] No authentication tokens found")
          }
          return null
        }

        const res = await authApi.me()
        const apiUser = (res as any)?.data?.data ?? (res as any)?.data
        const normalizedUser = normalizeUser(apiUser)
        
        if (config.features.debugLogging) {
          console.debug("[Auth] Profile fetched successfully:", normalizedUser?.email)
        }
        return normalizedUser
      } catch (err: any) {
        console.error("[Auth] Profile fetch error:", {
          status: err?.response?.status,
          message: err?.message,
          url: err?.config?.url
        })
        
        const status = err?.response?.status
        const isTimeout = err?.code === "ECONNABORTED" || err?.message?.toLowerCase().includes("timeout")
        
        if (isTimeout) {
          if (config.features.debugLogging) {
            console.warn("[Auth] Request timeout - returning null")
          }
          return null
        }
        
        if (status === 401 || status === 404) {
          if (config.features.debugLogging) {
            console.debug("[Auth] Auth error - returning null")
          }
          return null
        }
        
        throw err
      }
    },
    enabled: true,
    retry: (failureCount, error: any) => {
      const isTimeout = error?.code === "ECONNABORTED" || error?.message?.toLowerCase().includes("timeout")
      const isAuthError = error?.response?.status === 401 || error?.response?.status === 404
      
      if (isTimeout || isAuthError) {
        if (config.features.debugLogging) {
          console.debug("[Auth] Not retrying due to timeout or auth error")
        }
        return false
      }
      
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: config.cache.staleTime,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })

  // Handle authentication state changes
  useEffect(() => {
    if (!isLoading) {
      setBootstrapping(false)
    }
  }, [isLoading])

  // Handle logout events from axios interceptor
  useEffect(() => {
    const handleLogout = (event: CustomEvent) => {
      if (config.features.debugLogging) {
        console.warn("[Auth] Logout event received:", event.detail)
      }
      queryClient.clear()
      if (redirectOnFail) {
        router.replace("/login")
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:logout', handleLogout as EventListener)
      return () => {
        window.removeEventListener('auth:logout', handleLogout as EventListener)
      }
    }
  }, [queryClient, router, redirectOnFail])

  // Handle 401 errors
  useEffect(() => {
    if (isError && (error as any)?.response?.status === 401 && redirectOnFail) {
      if (config.features.debugLogging) {
        console.warn("[Auth] 401 error detected - redirecting to login")
      }
      queryClient.clear()
      router.replace("/login")
    }
  }, [isError, error, redirectOnFail, router, queryClient])

  // Enhanced login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onMutate: () => {
      setIsAuthenticating(true)
    },
    onSuccess: async (response) => {
      try {
        if (config.features.debugLogging) {
          console.debug("[Auth] Login successful, processing response...")
        }
        
        const loginUser = (response as any)?.data?.user
        const normalizedLoginUser = normalizeUser(loginUser)

        // Set tokens using optimized token manager
        if (loginUser?.accessToken) {
          tokenManager.setTokens({
            accessToken: loginUser.accessToken,
            refreshToken: loginUser.refreshToken
          })
        }

        // Wait a bit for tokens to be set, then refetch profile
        await new Promise((res) => setTimeout(res, 100))
        const { data } = await refetchProfile()
        const effectiveUser = data || normalizedLoginUser

        // Validate user role
        if (effectiveUser?.role && !['admin', 'lawyer', 'user'].includes(effectiveUser.role)) {
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

        // Update query cache
        if (effectiveUser) {
          queryClient.setQueryData(["auth", "me"], effectiveUser)
        }

        // Navigate to dashboard
        router.replace("/dashboard")
      } catch (err) {
        console.error("[Auth] Login processing error:", err)
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
      console.error("[Auth] Login failed:", error)
      
      let message = "Login failed"
      if (error?.response && typeof error.response.data === "object" && error.response.data !== null && "message" in error.response.data) {
        message = (error.response.data as { message?: string }).message || error?.message || message
      } else if (error?.message) {
        message = error.message
      }
      
      toast({
        title: "Login Error",
        description: message,
        variant: "destructive",
      })
      
      setIsAuthenticating(false)
    },
  })

  // Enhanced logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      if (config.features.debugLogging) {
        console.debug("[Auth] Logout successful")
      }
      tokenManager.clearTokens()
      queryClient.clear()
      router.replace("/login")
    },
    onError: (error) => {
      if (config.features.debugLogging) {
        console.warn("[Auth] Logout API failed, but clearing local data:", error)
      }
      tokenManager.clearTokens()
      queryClient.clear()
      router.replace("/login")
    },
  })

  // Manual logout function
  const forceLogout = useCallback(() => {
    if (config.features.debugLogging) {
      console.warn("[Auth] Force logout called")
    }
    tokenManager.clearTokens()
    queryClient.clear()
    router.replace("/login")
  }, [queryClient, router])

  // Debug function
  const debugAuthStatus = useCallback(() => {
    if (!config.features.debugLogging) {
      console.log("Debug logging is disabled. Set NEXT_PUBLIC_ENABLE_DEBUG_LOGGING=true to enable.")
      return
    }
    
    const cookies = cookieManager.getAllCookies()
    
    console.log("=== AUTH DEBUG INFO ===")
    console.log("User:", user)
    console.log("Is Loading:", isLoading)
    console.log("Is Authenticated:", isAuthenticated())
    console.log("Role:", user?.role)
    console.log("Cookies:", cookies)
    console.log("Has Access Token:", !!cookies.access_token)
    console.log("Has Refresh Token:", !!cookies.refresh_token)
    console.log("Error:", error)
    console.log("Environment:", config.env.nodeEnv)
    console.log("Debug Logging:", config.features.debugLogging)
    console.log("======================")
  }, [user, isLoading, error])

  // Make debug function available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugAuth = debugAuthStatus
    }
  }, [debugAuthStatus])

  const isUserAuthenticated = useMemo(() => {
    if (user) return true
    if (isLoading) return false
    if (isError && (error as any)?.response?.status === 401) return false
    if (isError && (error as any)?.response?.status === 404) {
      return isAuthenticated()
    }
    return false
  }, [user, isLoading, isError, error])

  return {
    user,
    isLoading,
    isAuthenticated: isUserAuthenticated,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    forceLogout,
    debugAuthStatus,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isAuthenticating,
    role: user?.role,
    hasRole: (role: string) => user?.role === role,
    bootstrapping
  }
}
