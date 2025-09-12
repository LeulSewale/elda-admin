"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Trash2, AlertCircle, Info, CheckCircle, RotateCcw } from "lucide-react"
import { useState, useMemo } from "react"
import { dummyNotifications, simulateApiDelay } from "@/lib/dummy-data"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  read: boolean
  createdAt: string
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "warning":
      return <AlertCircle className="w-5 h-5 text-yellow-600" />
    case "success":
      return <CheckCircle className="w-5 h-5 text-green-600" />
    case "error":
      return <AlertCircle className="w-5 h-5 text-red-600" />
    default:
      return <Info className="w-5 h-5 text-blue-600" />
  }
}

const getNotificationBadge = (type: string) => {
  switch (type) {
    case "warning":
      return "bg-yellow-100 text-yellow-800"
    case "success":
      return "bg-green-100 text-green-800"
    case "error":
      return "bg-red-100 text-red-800"
    default:
      return "bg-blue-100 text-blue-800"
  }
}

export default function NotificationsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // DUMMY DATA: React Query for fetching notifications
  const {
    data: notifications = [],
    isLoading: loading,
    isFetching: fetching,
    refetch
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      await simulateApiDelay()
      return dummyNotifications
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,    // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Statistics
  const stats = useMemo(() => {
    const unreadCount = notifications.filter(n => !n.read).length
    const totalCount = notifications.length
    return { unreadCount, totalCount }
  }, [notifications])

  // Mutations for notification actions
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await simulateApiDelay()
      return { success: true }
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData(['notifications'], (oldData: Notification[] | undefined) => {
        if (!oldData) return []
        return oldData.map(notification => 
          notification.id === id 
            ? { ...notification, read: true }
            : notification
        )
      })
      toast({
        title: "Notification marked as read",
        variant: "default",
      })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await simulateApiDelay()
      return { success: true }
    },
    onSuccess: () => {
      queryClient.setQueryData(['notifications'], (oldData: Notification[] | undefined) => {
        if (!oldData) return []
        return oldData.map(notification => ({ ...notification, read: true }))
      })
      toast({
        title: "All notifications marked as read",
        variant: "default",
      })
    },
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      await simulateApiDelay()
      return { success: true }
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData(['notifications'], (oldData: Notification[] | undefined) => {
        if (!oldData) return []
        return oldData.filter(notification => notification.id !== id)
      })
      toast({
        title: "Notification deleted",
        variant: "default",
      })
    },
  })

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id)
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const handleDelete = (id: string) => {
    deleteNotificationMutation.mutate(id)
  }

  const handleRefresh = async () => {
    try {
      await refetch()
      toast({
        title: "Refreshed",
        description: "Notifications refreshed successfully.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh notifications.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout title="Notifications" isFetching={loading || fetching}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-[#A4D65E]" />
            <h2 className="text-2xl font-bold">Notifications</h2>
            <Badge variant="secondary" className="ml-2">
              {stats.unreadCount} unread
            </Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className={`ml-2 ${fetching || loading ? 'cursor-wait' : ''}`}
              disabled={fetching || loading}
            >
              <RotateCcw
                className={`w-4 h-4 ${(fetching || loading) ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead}
            disabled={stats.unreadCount === 0 || markAllAsReadMutation.isPending}
          >
            <Check className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A4D65E] mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notifications found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id} className={`${!notification.read ? "border-l-4 border-l-[#A4D65E]" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div>
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                        <p className="text-sm text-gray-500">{notification.createdAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getNotificationBadge(notification.type)}>{notification.type}</Badge>
                      {!notification.read && <Badge className="bg-[#A4D65E] text-white">New</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-700 mb-4">{notification.message}</p>
                  <div className="flex justify-end space-x-2">
                    {!notification.read && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark as Read
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      disabled={deleteNotificationMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
