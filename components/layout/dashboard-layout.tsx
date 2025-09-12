"use client";
import type React from "react"
import { Header } from "./header"
import { useSidebar } from "./sidebar"
import { useEffect, useState } from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  isFetching?: boolean
}

function ProgressBar({ isFetching }: { isFetching?: boolean }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (isFetching) {
      setProgress(0)
      interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + Math.random() * 10 : prev))
      }, 100)
    } else if (!isFetching && progress > 0) {
      setProgress(100)
      setTimeout(() => setProgress(0), 400)
    }
    return () => interval && clearInterval(interval)
  }, [isFetching])
  return (
    <div className="w-full h-1 bg-gray-200 rounded overflow-hidden">
      <div
        className="h-full bg-[#A4D65E] transition-all duration-300"
        style={{ width: `${progress}%`, opacity: progress > 0 && progress < 100 ? 1 : 0 }}
      />
    </div>
  )
}

export function DashboardLayout({ children, title, isFetching }: DashboardLayoutProps) {
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content area with proper left margin for desktop sidebar */}
      <div className={`transition-all duration-300 ${collapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <Header title={title} />
        {typeof isFetching !== 'undefined' && <ProgressBar isFetching={isFetching} />}
        <main className="py-3">
          <div className="w-full px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
