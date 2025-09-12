// 📁 lib/axios.ts
import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios"

const API_BASE_URL = "https://tender-mgt-system.onrender.com/api/v1"

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Send cookies with each request
  headers: {
    "Content-Type": "application/json",
  },
})

// 🔁 Response Interceptor: Token Refresh Logic (Cookie-based)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // ⏱ Timeout check
    if (error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout")) {
      error.message = "The request timed out. Please try again."
    }

    // 🔁 Prevent infinite retry loop
    if (originalRequest._retry || originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error)
    }

    // 🔐 Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401) {
      try {
        originalRequest._retry = true

        // Request new access token via cookie
        await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
          withCredentials: true,
        })

      
        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, force logout
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login"
        }
      }
    }

    return Promise.reject(error)
  }
)
