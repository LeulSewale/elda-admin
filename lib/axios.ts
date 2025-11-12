// 📁 lib/axios.ts
import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios"
import { getAccessToken } from "./token"
import { config } from "./config"
import { getErrorMessage } from "./error-utils"

const DEBUG = config.features.debugLogging

export const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  withCredentials: true, // Send cookies with each request
  headers: {
    "Content-Type": "application/json",
  },
})

// 🔧 Request Interceptor: Ensure cookies are sent and add Authorization header if token available
api.interceptors.request.use(
  (config) => {
    // Debug: Log request details for authentication debugging
    if (DEBUG && (config.url?.includes('/users') || config.url?.includes('/employees') || config.url?.includes('/auth/refresh'))) {
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
    
    // Add Authorization header if access token is available in cookies
    // This supports backends that expect Bearer token in Authorization header
    const accessToken = getAccessToken()
    if (accessToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }
    
    // Note: We use both cookies (withCredentials: true) and Authorization header
    // for maximum compatibility with different backend configurations
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
      if (DEBUG) {
        console.warn("[Axios] Request timeout:", {
          url: originalRequest.url,
          method: originalRequest.method,
          timeout: originalRequest.timeout,
          message: error.message
        });
      }
      
      // Use user-friendly error message
      error.message = getErrorMessage(error);
    }
    
    // Handle network errors
    if (error.code === "ERR_NETWORK" || error.message?.toLowerCase().includes("network")) {
      if (DEBUG) {
        console.warn("[Axios] Network error:", {
          url: originalRequest.url,
          method: originalRequest.method,
          message: error.message
        });
      }
      error.message = getErrorMessage(error);
    }

    // 🔁 Prevent infinite retry loop
    if (originalRequest._retry || originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error)
    }

    // 🔐 Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401) {
      // Debug: Check token availability
      if (DEBUG) {
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
      }
      
      const hasRefreshCookie = typeof document !== 'undefined' && document.cookie.includes('refresh_token')
      
      // Only attempt refresh if we have a refresh token cookie available
      if (!hasRefreshCookie) {
        if (DEBUG) console.warn("[Axios] No refresh token cookie found, rejecting 401")
        // No refresh token present; let the caller handle 401
        return Promise.reject(error)
      }
      try {
        originalRequest._retry = true

        // Debug: Log refresh attempt
        if (DEBUG) console.debug("[Axios] Attempting token refresh...")

        // Request new access token via cookie using direct axios call to avoid circular dependency
        const refreshResponse = await axios.post(`${config.api.baseUrl}/auth/refresh`, null, {
          withCredentials: true,
        })

        if (DEBUG) console.debug("[Axios] Token refresh successful", { status: refreshResponse.status })

        // Update stored tokens if the refresh response contains new tokens
        if (refreshResponse.data?.accessToken) {
          if (DEBUG) console.debug("[Axios] Updating stored access token after refresh")
          if (typeof document !== 'undefined') {
            const isProduction = process.env.NODE_ENV === 'production'
            const secureFlag = isProduction ? 'secure;' : ''
            const expires = new Date()
            expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000)) // 1 day
            document.cookie = `access_token=${refreshResponse.data.accessToken};expires=${expires.toUTCString()};path=/;${secureFlag}samesite=strict`
          }
        }

        // Update Authorization header for retry
        if (originalRequest.headers && refreshResponse.data?.accessToken) {
          originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`
        }

        // Retry original request
        return api(originalRequest)
      } catch (refreshError: any) {
        // Debug: Log refresh failure (downgraded to warn to reduce noise)
        if (DEBUG) {
          console.warn("[Axios] Token refresh failed", {
            status: refreshError?.response?.status,
            data: refreshError?.response?.data,
            message: refreshError?.message || refreshError?.toString?.() || 'unknown error'
          })
        }

        // Clear cookies when refresh fails to prevent stale token issues
        if (typeof document !== 'undefined') {
          if (DEBUG) console.debug("[Axios] Clearing cookies due to refresh failure")
          document.cookie.split(";").forEach((c) => {
            const eqPos = c.indexOf("=");
            const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
            if (name === 'access_token' || name === 'refresh_token') {
              document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            }
          });
        }

        // Use user-friendly error message
        error.message = getErrorMessage(refreshError || error);

        // Refresh failed - log but don't redirect automatically
        if (DEBUG) console.warn("[Axios] Token refresh failed - letting component handle the error")
        
        // Important: reject the ORIGINAL error so callers can handle 401s consistently
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)
