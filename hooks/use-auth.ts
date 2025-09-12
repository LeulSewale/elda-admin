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

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await authApi.me()
      return res.data.data
    },
    enabled: true,
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
    mutationFn: authApi.login,
    onMutate: () => {
      setIsAuthenticating(true)
    },
    onSuccess: async () => {
      try {
        await new Promise((res) => setTimeout(res, 50))
        const { data } = await refetchProfile()
        // Check role
        if (data?.role !== 'admin' && data?.role !== 'company') {
          toast({
            title: "Login Error",
            description: "Your account does not have access. Only admin or company roles are allowed.",
            variant: "destructive",
          })
          setIsAuthenticating(false)
          return
        }
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
    mutationFn: authApi.logout,
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
    isAuthenticating,
    role: user?.role,
    hasRole: (role: string) => user?.role === role,
    bootstrapping
  }
}
