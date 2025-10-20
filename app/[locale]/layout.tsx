import type React from "react"
import { Providers, AuthGate } from "@/components/providers"
import { SidebarProvider } from "@/components/layout/sidebar"
import { LogoutSpinnerOverlay } from "@/components/LogoutSpinnerOverlay"
import { NotificationsProvider } from "@/hooks/use-notifications"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales } from '@/lib/i18n'
import { LanguageInitializer } from '@/components/LanguageInitializer'

export default async function LocaleLayout({ 
  children,
  params
}: { 
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    // Return a 404 page instead of calling notFound() in layout
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
          <p className="text-gray-600">The requested locale is not supported.</p>
        </div>
      </div>
    )
  }

  // Providing all messages to the client
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider messages={messages}>
      <LanguageInitializer />
      <Providers>
        <AuthGate>
          <SidebarProvider>
            <NotificationsProvider>
              <LogoutSpinnerOverlay />
              {children}
            </NotificationsProvider>
          </SidebarProvider>
        </AuthGate>
      </Providers>
    </NextIntlClientProvider>
  )
}
