// 📁 lib/api/users.ts
import { api } from "../axios"

export const usersApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string }) => api.get("/users", { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
  createUser: (data: any) => api.post("/users", data),
  updateUser: (id: string, data: any) => api.patch(`/users/${id}`, data),
  lockUser: (_id: string, data: any) => api.patch(`/user/status/${_id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  updateProfile: (data: FormData) => api.patch("/user/update-profile", data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
}