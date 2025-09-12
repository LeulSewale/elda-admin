"use client"

import React, { useState, useEffect, createContext, useContext } from 'react'

interface NotificationsContextType {
  unreadCount: number
  refreshUnreadCount: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnreadCount = async () => {
    try {
      // DUMMY DATA: Simulate unread notifications count for UI-only development
      const dummyUnreadCount = Math.floor(Math.random() * 10) + 1 // Random number between 1-10
      setUnreadCount(dummyUnreadCount)
    } catch (err: any) {
      console.error("Failed to fetch unread count:", err)
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    refreshUnreadCount()
  }, [])

  return React.createElement(
    NotificationsContext.Provider,
    { value: { unreadCount, refreshUnreadCount } },
    children
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
} 