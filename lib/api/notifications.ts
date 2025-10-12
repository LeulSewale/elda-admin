import { api } from "../axios"
import { config } from "../config"

export const notificationsApi = {
  // Get all notifications with pagination
  getNotifications: (limit = 20, offset = 0) => {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    if (offset > 0) {
      params.append('offset', offset.toString())
    }
    return api.get(`/notifications?${params.toString()}`)
  },
  
  // Get a single notification by ID
  getNotification: (id: string) => api.get(`/notifications/${id}`),
  
  // Mark a notification as read
  markAsRead: (id: string) => api.post(`/notifications/${id}/read`),
  
  // Mark all notifications as read
  markAllAsRead: () => api.post("/notifications/read-all"),
  
  // Delete a notification
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
  
  // Get unread count
  getUnreadCount: () => api.get("/notifications/unread-count"),
  
  // Create SSE connection for real-time notifications
  createEventSource: (onMessage: (notification: any) => void, onError?: (error: any) => void): EventSource | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const streamUrl = `${config.api.baseUrl}/notifications/stream`
      const eventSource = new EventSource(streamUrl, {
        withCredentials: true
      })
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage(data)
        } catch (error) {
          console.error('[SSE] Failed to parse notification:', error)
        }
      }
      
      eventSource.onerror = (error) => {
        console.error('[SSE] Connection error:', error)
        if (onError) onError(error)
      }
      
      eventSource.addEventListener('connected', (event: any) => {
        console.log('[SSE] Connected:', event.data)
      })
      
      eventSource.addEventListener('notification', (event: any) => {
        try {
          const data = JSON.parse(event.data)
          onMessage(data)
        } catch (error) {
          console.error('[SSE] Failed to parse notification event:', error)
        }
      })
      
      return eventSource
    } catch (error) {
      console.error('[SSE] Failed to create EventSource:', error)
      if (onError) onError(error)
      return null
    }
  }
}