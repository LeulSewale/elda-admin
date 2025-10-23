"use client"

import type React from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState, useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { bootstrapping } = useAuth({ redirectOnFail: false });
  const [isClient, setIsClient] = useState(false);
  const [isPublicPage, setIsPublicPage] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    const pathname = window.location.pathname;
    setIsPublicPage(pathname.includes('/login') || pathname.includes('/signup'));
  }, []);
  
  // Show loading spinner only on client side for protected pages
  if (bootstrapping && isClient && !isPublicPage) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
      </div>
    );
  }
  
  return <>{children}</>;
}
