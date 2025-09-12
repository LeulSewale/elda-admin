"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Trash2, AlertCircle, Info, CheckCircle } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  read: boolean
  createdAt: string
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Tender Submitted",
    message: "A new tender for Road Construction Project has been submitted for review.",
    type: "info",
    read: false,
    createdAt: "2024-01-21 10:30 AM",
  },
  {
    id: "2",
    title: "Company Verification Required",
    message: "Tech Solutions Ltd requires verification. Please review their documents.",
    type: "warning",
    read: false,
    createdAt: "2024-01-21 09:15 AM",
  },
  {
    id: "3",
    title: "Bid Accepted",
    message: "Your bid for IT Infrastructure Upgrade has been accepted.",
    type: "success",
    read: true,
    createdAt: "2024-01-20 04:45 PM",
  },
  {
    id: "4",
    title: "System Maintenance",
    message: "Scheduled maintenance will occur tonight from 11 PM to 2 AM.",
    type: "info",
    read: true,
    createdAt: "2024-01-20 02:30 PM",
  },
]

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
  return (
    <DashboardLayout title="Notifications">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-[#A4D65E]" />
            <h2 className="text-2xl font-bold">Notifications</h2>
          </div>
          <Button variant="outline">
            <Check className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
        </div>

        <div className="space-y-4">
          {mockNotifications.map((notification) => (
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
                    <Button variant="outline" size="sm">
                      <Check className="w-4 h-4 mr-1" />
                      Mark as Read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
