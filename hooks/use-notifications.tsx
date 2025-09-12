"use client"

import React, { useState, useEffect, createContext, useContext } from 'react'
import { notificationsApi } from '@/lib/api/notifications'
import { dummyNotifications } from '@/lib/dummy-data'

interface NotificationsContextType {
  unreadCount: number
  refreshUnreadCount: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnreadCount = async () => {
    try {
      const response = await notificationsApi.getUnreadCount()
      // const unreadNotifications = response.data.data?.notifications || []
      const unreadNotifications = dummyNotifications.filter((n) => !n.read)
      setUnreadCount(unreadNotifications.length)
    } catch (err: any) {
      console.error("Failed to fetch unread count:", err)
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