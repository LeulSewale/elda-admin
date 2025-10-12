"use client"

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, Search, AlertCircle, Info, CheckCircle, Loader2, Wifi, WifiOff } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { notificationsApi } from "@/lib/api/notifications"
import { Notification } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/hooks/use-notifications"
import { useRouter } from "next/navigation"

interface NotificationsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'ticket_assigned':
    case 'ticket_created':
    case 'ticket_updated':
      return <Bell className="w-4 h-4 text-blue-600" />
    case 'ticket_completed':
    case 'request_approved':
      return <CheckCircle className="w-4 h-4 text-green-600" />
    case 'ticket_urgent':
    case 'deadline_approaching':
      return <AlertCircle className="w-4 h-4 text-yellow-600" />
    case 'ticket_rejected':
    case 'request_rejected':
      return <AlertCircle className="w-4 h-4 text-red-600" />
    default:
  return <Info className="w-4 h-4 text-blue-600" />
  }
}

const getNotificationBadgeColor = (type: string) => {
  switch (type) {
    case 'ticket_assigned':
    case 'ticket_created':
    case 'ticket_updated':
      return "bg-blue-100 text-blue-800"
    case 'ticket_completed':
    case 'request_approved':
      return "bg-green-100 text-green-800"
    case 'ticket_urgent':
    case 'deadline_approaching':
      return "bg-yellow-100 text-yellow-800"
    case 'ticket_rejected':
    case 'request_rejected':
      return "bg-red-100 text-red-800"
    default:
  return "bg-gray-100 text-gray-800"
  }
}

const formatNotificationType = (type: string): string => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
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
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  
  const { toast } = useToast()
  const router = useRouter()
  const { 
    unreadCount, 
    notifications, 
    refreshNotifications, 
    markAsRead: contextMarkAsRead, 
    markAllAsRead: contextMarkAllAsRead,
    isConnected
  } = useNotifications()

  const filteredNotifications = notifications.filter((notification: Notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.body.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const fetchNotifications = async (appendMode = false) => {
    try {
      if (!appendMode) {
        setLoading(true)
        setOffset(0)
      } else {
        setLoadingMore(true)
      }
      setError(null)
      
      const currentOffset = appendMode ? offset : 0
      const response = await notificationsApi.getNotifications(20, currentOffset)
      
      const newNotifications = response.data?.data || []
      const paging = response.data?.paging || { hasNextPage: false }
      
      // Update state through context instead of local state
      if (!appendMode) {
        await refreshNotifications()
      }
      
      setHasMore(paging.hasNextPage || false)
      setOffset(currentOffset + newNotifications.length)
      
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
    if (loadingMore || !hasMore) return
    await fetchNotifications(true)
  }

  const markAsRead = async (notification: Notification) => {
    if (notification.is_read) return
    
    try {
      await contextMarkAsRead(notification.id)
      
      // Navigate to the link if available
      if (notification.link) {
        router.push(notification.link)
        onOpenChange(false) // Close the dropdown
      }
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
      await contextMarkAllAsRead()
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

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification)
  }

  useEffect(() => {
    if (open) {
      // Refresh notifications when dropdown opens
      refreshNotifications()
    }
  }, [open])

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const { scrollTop, scrollHeight, clientHeight } = target
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50
    
    if (isNearBottom && !loadingMore && hasMore) {
      loadMoreNotifications()
    }
  }

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
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-blue-500 text-white">
                {unreadCount}
              </Badge>
            )}
            {isConnected ? (
              <span title="Connected to real-time updates">
                <Wifi className="w-3 h-3 text-green-500" />
              </span>
            ) : (
              <span title="Disconnected">
                <WifiOff className="w-3 h-3 text-gray-400" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={loading}>
              <Check className="w-4 h-4 mr-1" />
              Mark All Read
            </Button>
            )}
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
              <Button variant="outline" size="sm" onClick={() => fetchNotifications(false)} className="mt-2"> 
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
                  key={notification.id}
                  data-notification-item
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "p-4 border rounded-lg transition-colors hover:bg-gray-50 cursor-pointer",
                    !notification.is_read && "border-l-4 border-l-blue-500 bg-blue-50/30",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.body}</p>
                        <div className="flex items-center gap-2">
                          <span 
                            className={cn("px-2 py-0.5 rounded text-xs font-medium", getNotificationBadgeColor(notification.type))}
                          >
                            {formatNotificationType(notification.type)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(notification.created_at)}
                          </span>
                        </div>
                      </div>
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
        <div className="flex justify-center items-center px-4 py-2 border-t">
          <span className="text-sm text-gray-500">
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  )
}
