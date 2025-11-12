"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { FileText } from "lucide-react"
import { getPreferredLanguage, getCurrentLocaleFromPath } from "@/lib/language-utils"

export function HomePageClient() {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading, role } = useAuth({ redirectOnFail: false })

  useEffect(() => {
    if (!isLoading) {
      // Get current locale from pathname or preferred language
      const currentLocale = getCurrentLocaleFromPath(pathname) || getPreferredLanguage()
      
      if (isAuthenticated) {
        // Redirect based on role
        if (role === "HR-manager") {
          router.push(`/${currentLocale}/employees`)
        } else {
          router.push(`/${currentLocale}/dashboard`)
        }
      } else {
        router.push(`/${currentLocale}/login`)
      }
    }
  }, [isAuthenticated, isLoading, role, router, pathname])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <FileText className="animate-spin w-12 h-12 text-blue-500 mx-auto" />
      </div>
    </div>
  )
}