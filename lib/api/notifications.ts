import { api } from "../axios"

export const notificationsApi = {
  getNotifications: () => api.get("/notifications"),
  getUserNotifications: (page = 1, limit = 20, read?: boolean) => {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    if (read !== undefined) {
      params.append('read', read.toString())
    }
    return api.get(`/notifications/user?${params.toString()}`)
  },
  getNotification: (id: string) => api.get(`/notifications/${id}`),
  createNotification: (data: any) => api.post("/notifications", data),
  updateNotification: (id: string, data: any) => api.patch(`/notifications/${id}`, data),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/user/read-all"),
  getUnreadCount: () => api.get("/notifications/user?read=false"),
}