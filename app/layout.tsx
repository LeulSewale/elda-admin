import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

// Use system fonts as fallback to avoid Google Fonts timeout issues
const fontFamily = [
  "system-ui",
  "-apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Roboto",
  "Helvetica Neue",
  "Arial",
  "sans-serif"
].join(", ")

export const metadata: Metadata = {
  title: "ELDA - Admin Panel",
  description: "Professional document and ticket management system",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ 
  children
}: { 
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>ELDA Admin</title>
        <link rel="icon" href="/favicon.ico" type="image/png" />
      </head>
      <body className="antialiased" style={{ fontFamily }}>
        {children}
      </body>
    </html>
  )
}
