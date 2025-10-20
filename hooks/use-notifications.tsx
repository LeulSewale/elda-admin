"use client"

import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react'
import { notificationsApi } from '@/lib/api/notifications'
import { Notification } from '@/lib/types'
import { useToast } from './use-toast'
import { useAuth } from './use-auth'

interface NotificationsContextType {
  unreadCount: number
  notifications: Notification[]
  refreshUnreadCount: () => Promise<void>
  refreshNotifications: () => Promise<void>
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  isConnected: boolean
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const { toast } = useToast()
  const { isAuthenticated } = useAuth({ redirectOnFail: false })

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await notificationsApi.getUnreadCount()
      const count = response.data?.data?.unread || 0
      setUnreadCount(count)
    } catch (err: any) {
      // Only log as error if it's not a 401 (unauthorized) error
      if (err?.response?.status !== 401) {
        console.error("[Notifications] Failed to fetch unread count:", err)
      }
    }
  }, [])

  const refreshNotifications = useCallback(async () => {
    try {
      const response = await notificationsApi.getNotifications(20, 0)
      const fetchedNotifications = response.data?.data || []
      setNotifications(fetchedNotifications)
      
      // Update unread count based on fetched notifications
      const unreadNotifs = fetchedNotifications.filter((n: Notification) => !n.is_read)
      setUnreadCount(unreadNotifs.length)
    } catch (err: any) {
      // Only log as error if it's not a 401 (unauthorized) error
      if (err?.response?.status !== 401) {
        console.error("[Notifications] Failed to fetch notifications:", err)
      }
    }
  }, [])

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1)
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.body,
        duration: 5000,
      })
    }
  }, [toast])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err: any) {
      console.error("[Notifications] Failed to mark as read:", err)
      throw err
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (err: any) {
      console.error("[Notifications] Failed to mark all as read:", err)
      throw err
    }
  }, [])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const notification = notifications.find(n => n.id === id)
      await notificationsApi.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      
      // Update unread count if deleted notification was unread
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err: any) {
      console.error("[Notifications] Failed to delete notification:", err)
      throw err
    }
  }, [notifications])

  const connectToSSE = useCallback(() => {
    // Don't connect if already connected or in SSR
    if (eventSourceRef.current || typeof window === 'undefined') return

    console.log('[SSE] Connecting to notification stream...')

    const eventSource = notificationsApi.createEventSource(
      (notification: Notification) => {
        console.log('[SSE] Received notification:', notification)
        addNotification(notification)
      },
      (error) => {
        console.error('[SSE] Connection error:', error)
        setIsConnected(false)
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1
            if (eventSourceRef.current) {
              eventSourceRef.current.close()
              eventSourceRef.current = null
            }
            connectToSSE()
          }, delay)
        } else {
          console.error('[SSE] Max reconnection attempts reached')
        }
      }
    )

    if (eventSource) {
      eventSourceRef.current = eventSource
      
      // Listen for the open event
      eventSource.addEventListener('open', () => {
        console.log('[SSE] Connection opened')
        setIsConnected(true)
        reconnectAttemptsRef.current = 0 // Reset reconnection counter on successful connection
      })
      
      eventSource.addEventListener('error', () => {
        setIsConnected(false)
      })
    }
  }, [addNotification])

  const disconnectFromSSE = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (eventSourceRef.current) {
      console.log('[SSE] Disconnecting from notification stream')
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setIsConnected(false)
    }
  }, [])

  // Initialize: Fetch initial data and connect to SSE (only when authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      refreshNotifications()
      connectToSSE()
    }

    // Cleanup on unmount
    return () => {
      disconnectFromSSE()
    }
  }, [isAuthenticated]) // Run when authentication status changes

  // Handle tab visibility to reconnect when user comes back (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh data when tab becomes visible
        refreshNotifications()
        refreshUnreadCount()
        
        // Reconnect SSE if disconnected
        if (!eventSourceRef.current) {
          connectToSSE()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, refreshNotifications, refreshUnreadCount, connectToSSE])

  const value = {
    unreadCount,
    notifications,
    refreshUnreadCount,
    refreshNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isConnected,
  }

  return React.createElement(
    NotificationsContext.Provider,
    { value },
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