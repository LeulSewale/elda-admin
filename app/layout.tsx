import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers, AuthGate } from "@/components/providers"
import { SidebarProvider } from "@/components/layout/sidebar"
import { LogoutSpinnerOverlay } from "@/components/LogoutSpinnerOverlay"
import { NotificationsProvider } from "@/hooks/use-notifications"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "TeleTender - Admin Panel",
  description: "Professional tender management system",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>ELDA Admin</title>
        <link rel="icon" href="/favicon.ico" type="image/png" />
      </head>
      <body className={`${inter.className} antialiased`}>
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
      </body>
    </html>
  )
}
