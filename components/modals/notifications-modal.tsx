"use client"

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, Trash2, Search, AlertCircle, Info, CheckCircle, X, Settings, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { notificationsApi } from "@/lib/api/notifications"
import { Notification } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/hooks/use-notifications"

interface NotificationsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getNotificationIcon = (title: string) => {
  if (title.includes("🔔")) return <Bell className="w-4 h-4 text-blue-600" />
  if (title.includes("✅")) return <CheckCircle className="w-4 h-4 text-green-600" />
  if (title.includes("⚠️")) return <AlertCircle className="w-4 h-4 text-yellow-600" />
  if (title.includes("❌")) return <AlertCircle className="w-4 h-4 text-red-600" />
  return <Info className="w-4 h-4 text-blue-600" />
}

const getNotificationBadge = (title: string) => {
  if (title.includes("🔔")) return "bg-blue-100 text-blue-800"
  if (title.includes("✅")) return "bg-green-100 text-green-800"
  if (title.includes("⚠️")) return "bg-yellow-100 text-yellow-800"
  if (title.includes("❌")) return "bg-red-100 text-red-800"
  return "bg-gray-100 text-gray-800"
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}

export function NotificationsDropdown({
  open,
  onOpenChange,
  children,
}: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    hasMore: true,
    total: 0
  })
  const { toast } = useToast()
  const { unreadCount, refreshUnreadCount } = useNotifications()

  const filteredNotifications = notifications.filter((notification: Notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.body.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const fetchNotifications = async (page = 1, append = false, readFilter?: boolean) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)
      
      const response = await notificationsApi.getUserNotifications(page, pagination.limit, readFilter)
      console.log("Notifications", response)
      
      const newNotifications = response.data.data?.notifications || []
      const paginationData = response.data.data?.pagination || {}
      
      if (append) {
        setNotifications(prev => [...prev, ...newNotifications])
      } else {
        setNotifications(newNotifications)
      }
      
      setPagination(prev => ({
        ...prev,
        page: page,
        hasMore: paginationData.hasNextPage || false,
        total: paginationData.total || 0
      }))
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch notifications")
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreNotifications = async () => {
    if (loadingMore || !pagination.hasMore) return
    await fetchNotifications(pagination.page + 1, true)
  }

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications((prev: Notification[]) => 
        prev.map((n: Notification) => (n._id === id ? { ...n, read: true } : n))
      )
      // Update unread count
      await refreshUnreadCount()
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications((prev: Notification[]) => 
        prev.map((n: Notification) => ({ ...n, read: true }))
      )
      // Update unread count
      await refreshUnreadCount()
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await notificationsApi.deleteNotification(id)
      const deletedNotification = notifications.find(n => n._id === id)
      setNotifications((prev: Notification[]) => 
        prev.filter((n: Notification) => n._id !== id)
      )
      // Update unread count if the deleted notification was unread
      if (deletedNotification && !deletedNotification.read) {
        await refreshUnreadCount()
      }
      toast({
        title: "Success",
        description: "Notification deleted",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

  const clearAll = async () => {
    try {
      // Delete all notifications one by one
      const deletePromises = notifications.map((notification) => 
        notificationsApi.deleteNotification(notification._id!)
      )
      await Promise.all(deletePromises)
      setNotifications([])
      toast({
        title: "Success",
        description: "All notifications cleared",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to clear all notifications",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (open) {
      fetchNotifications()
      refreshUnreadCount()
    }
  }, [open])

  // Refresh unread count on component mount
  useEffect(() => {
    refreshUnreadCount()
  }, [])

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const { scrollTop, scrollHeight, clientHeight } = target
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50
    
    if (isNearBottom && !loadingMore && pagination.hasMore) {
      loadMoreNotifications()
    }
  }

  // Use Intersection Observer for better scroll detection
  useEffect(() => {
    if (!open || !pagination.hasMore || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loadingMore && pagination.hasMore) {
            loadMoreNotifications()
          }
        })
      },
      { threshold: 0.1 }
    )

    // Find the last notification element to observe
    const lastNotification = document.querySelector('[data-notification-item]:last-child')
    if (lastNotification) {
      observer.observe(lastNotification)
    }

    return () => observer.disconnect()
  }, [open, pagination.hasMore, loadingMore, notifications.length])

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        className="w-[440px] max-h-[70vh] p-0 shadow-xl border rounded-xl bg-white flex flex-col overflow-hidden"
        style={{ marginTop: 8 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <span className="font-semibold">Notifications</span>
            {/* {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )} */}
          </div>
          <div className="flex items-center gap-2">
            {/* <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={loading}>
              <Check className="w-4 h-4 mr-1" />
              Mark All Read
            </Button> */}
            <Button variant="outline" size="sm" onClick={clearAll} disabled={loading}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
        {/* Search */}
        <div className="px-4 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {/* Scrollable Notifications */}
        <div 
          className="flex-1 px-4 py-2 overflow-y-auto max-h-[400px]"
          onScroll={handleScroll}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading notifications...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchNotifications()} className="mt-2">
                Retry
              </Button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification: Notification) => (
                <div
                  key={notification._id}
                  data-notification-item
                  className={cn(
                    "p-4 border rounded-lg transition-colors hover:bg-gray-50",
                    !notification.read && "border-l-4 border-l-[#A4D65E] bg-blue-50/30",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(notification.title)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.read && <div className="w-2 h-2 bg-[#A4D65E] rounded-full"></div>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.body}</p>
                        <div className="flex items-center gap-2">
                          <span className={getNotificationBadge(notification.title)} style={{ padding: '0.15rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 500 }}>
                            {notification.title.includes("🔔") ? "info" : 
                             notification.title.includes("✅") ? "success" :
                             notification.title.includes("⚠️") ? "warning" :
                             notification.title.includes("❌") ? "error" : "info"}
                          </span>
                          <span className="text-xs text-gray-500">{getTimeAgo(notification.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification._id!)}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification._id!)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {loadingMore && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading more...</span>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="flex justify-between items-center px-4 py-2 border-t">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Notification Settings
          </Button>
          <p className="text-sm text-gray-500">
            {pagination.total > 0 ? `${pagination.total} total` : `${filteredNotifications.length} notification${filteredNotifications.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
