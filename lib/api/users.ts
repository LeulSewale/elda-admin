// 📁 lib/api/users.ts
import { api } from "../axios"

export const usersApi = {
  getUsers: (params?: { page?: number; limit?: number; q?: string; sort?: string }) => {
    const { page = 1, limit = 20, q = "", sort = "" } = params || {}
    return api.get(`/users`, { params: { page, limit, q, sort } })
  },
  getUser: (id: string) => api.get(`/users/${id}`),
  createUser: (data: any) => {
    console.debug("[Users API] Creating user with data:", data);
    console.debug("[Users API] Full request config:", {
      url: "/users",
      method: "POST",
      data: data,
      headers: api.defaults.headers
    });
    console.debug("[Users API] Base URL:", api.defaults.baseURL);
    console.debug("[Users API] Full URL will be:", `${api.defaults.baseURL}/users`);
    
    // Try with explicit headers to match Postman
    return api.post("/users", data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true
    });
  },
  updateUser: (id: string, data: any) => {
    console.debug("[Users API] Updating user", {
      id,
      payload: data,
      url: `/users/${id}`,
      fullURL: `${api.defaults.baseURL}/users/${id}`,
      method: "PATCH",
      baseURL: api.defaults.baseURL,
      headers: api.defaults.headers,
      withCredentials: api.defaults.withCredentials,
    })
    return api.patch(`/users/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    })
  },
  lockUser: (_id: string, data: any) => api.patch(`/user/status/${_id}`, data),
  deleteUser: (id: string) => {
    console.debug("[Users API] Deleting user", {
      id,
      url: `/users/${id}`,
      fullURL: `${api.defaults.baseURL}/users/${id}`,
      method: "DELETE",
    })
    return api.delete(`/users/${id}`)
  },
  updateProfile: (data: FormData) => api.patch("/user/update-profile", data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
}