"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
// import { authApi } from "@/lib/api/auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useEffect, useMemo, useState } from "react"
import type { AxiosError } from "axios"
// import { getAccessToken } from "@/lib/token"
import { dummyUsers } from "@/lib/dummy-data"

interface UseAuthOptions {
  redirectOnFail?: boolean
}

export function useAuth(options: UseAuthOptions = { redirectOnFail: true }) {
  const { redirectOnFail } = options
  const router = useRouter()
  const queryClient = useQueryClient()
  const [bootstrapping, setBootstrapping] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      // DUMMY DATA: Return first admin user for UI development
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
      return dummyUsers[0] // Return first user as logged in user
    },
    enabled: true, // Always fetch profile on load (cookie-based session)
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!isLoading) {
      setBootstrapping(false)
    }
  }, [isLoading])

  useEffect(() => {
    if (isError && (error as any)?.response?.status === 401 && redirectOnFail) {
      router.replace("/login");
    }
  }, [isError, error, redirectOnFail, router]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { phoneNumber: string; password: string }) => {
      // DUMMY DATA: Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      return { data: { data: dummyUsers[0] } } // Return dummy user
    },
    onMutate: () => {
      setIsAuthenticating(true)
    },
    onSuccess: async () => {
      try {
        await new Promise((res) => setTimeout(res, 50)) // Wait for cookie
        const { data } = await refetchProfile()
        console.log("data", data)
        // Allow all roles to access
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        })
        queryClient.setQueryData(["auth", "me"], data)
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
    mutationFn: async () => {
      // DUMMY DATA: Simulate logout API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return { success: true }
    },
    onSuccess: () => {
      queryClient.clear()
      router.replace("/login")
    },
    onError: () => {
      queryClient.clear()
      router.replace("/login")
    },
  })

  const isAuthenticated = useMemo(
    () => !!user && !isLoading && !isError,
    [user, isLoading, isError]
  )

  return {
    user,
    isLoading,
    isAuthenticated,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isAuthenticating, // ✅ Final state
    role: user?.role,
    hasRole: (role: string) => user?.role === role,
    bootstrapping
  }
}
