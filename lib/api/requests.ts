// 📁 lib/api/requests.ts
import { api } from "../axios"

export const requestsApi = {
  getRequests: (params?: { page?: number; limit?: number; search?: string }) => api.get("/requests", { params }),
  getRequest: (id: string) => api.get(`/requests/${id}`),
  createRequest: (data: any) => api.post("/requests", data),
  updateRequest: (id: string, data: any) => api.put(`/requests/${id}`, data),
  deleteRequest: (id: string) => api.delete(`/requests/${id}`),
}
