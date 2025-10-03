// 📁 lib/axios.ts
import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios"
import { getAccessToken } from "./token"
import { config } from "./config"

export const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  withCredentials: true, // Send cookies with each request
  headers: {
    "Content-Type": "application/json",
  },
})

// 🔧 Request Interceptor: Ensure cookies are sent
api.interceptors.request.use(
  (config) => {
    // Debug: Log request details for authentication debugging
    if (config.url?.includes('/users') || config.url?.includes('/employees') || config.url?.includes('/auth/refresh')) {
      const cookies = typeof document !== 'undefined' ? document.cookie : 'no-document'
      const cookieList = cookies.split(';').map(c => c.trim())
      
      console.debug("[Axios] Request", {
        url: config.url,
        method: config.method,
        withCredentials: config.withCredentials,
        baseURL: config.baseURL,
        cookies: cookies,
        cookieList: cookieList,
        hasAccessToken: cookieList.some(c => c.includes('access_token')),
        hasRefreshToken: cookieList.some(c => c.includes('refresh_token'))
      })
    }
    
    // Note: We rely on cookies for authentication, not Authorization headers
    // The backend should set cookies on login and we send them with withCredentials: true
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 🔁 Response Interceptor: Token Refresh Logic (Cookie-based)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // ⏱ Enhanced timeout and network error handling
    if (error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout")) {
      console.warn("[Axios] Request timeout:", {
        url: originalRequest.url,
        method: originalRequest.method,
        timeout: originalRequest.timeout,
        message: error.message
      });
      
      // Provide more specific error messages based on the request type
      if (originalRequest.url?.includes('/users/me')) {
        error.message = "Authentication request timed out. Please check your connection and try again.";
      } else if (originalRequest.url?.includes('/auth/refresh')) {
        error.message = "Token refresh timed out. Please log in again.";
      } else {
        error.message = "Request timed out. Please check your connection and try again.";
      }
    }
    
    // Handle network errors
    if (error.code === "ERR_NETWORK" || error.message?.toLowerCase().includes("network")) {
      console.warn("[Axios] Network error:", {
        url: originalRequest.url,
        method: originalRequest.method,
        message: error.message
      });
      error.message = "Network error. Please check your internet connection.";
    }

    // 🔁 Prevent infinite retry loop
    if (originalRequest._retry || originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error)
    }

    // 🔐 Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401) {
      // Debug: Check token availability
      const cookies = typeof document !== 'undefined' ? document.cookie : 'no-document'
      const hasRefreshCookie = typeof document !== 'undefined' && document.cookie.includes('refresh_token')
      const hasAccessCookie = typeof document !== 'undefined' && document.cookie.includes('access_token')
      
      console.debug("[Axios] 401 Error - Token Debug:", {
        cookies,
        hasRefreshCookie,
        hasAccessCookie,
        originalUrl: originalRequest.url,
        method: originalRequest.method
      })
      
      // Only attempt refresh if we have a refresh token cookie available
      if (!hasRefreshCookie) {
        console.warn("[Axios] No refresh token cookie found, rejecting 401")
        // No refresh token present; let the caller handle 401
        return Promise.reject(error)
      }
      try {
        originalRequest._retry = true

        // Debug: Log refresh attempt
        console.debug("[Axios] Attempting token refresh...")

        // Request new access token via cookie using direct axios call to avoid circular dependency
        const refreshResponse = await axios.post(`${config.api.baseUrl}/auth/refresh`, null, {
          withCredentials: true,
        })

        console.debug("[Axios] Token refresh successful", { status: refreshResponse.status })

        // Retry original request
        return api(originalRequest)
      } catch (refreshError: any) {
        // Debug: Log refresh failure (downgraded to warn to reduce noise)
        console.warn("[Axios] Token refresh failed", {
          status: refreshError?.response?.status,
          data: refreshError?.response?.data,
          message: refreshError?.message || refreshError?.toString?.() || 'unknown error'
        })

        // Refresh failed - log but don't redirect automatically
        console.warn("[Axios] Token refresh failed - letting component handle the error")
        
        // Important: reject the ORIGINAL error so callers can handle 401s consistently
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)
