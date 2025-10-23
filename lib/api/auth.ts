// lib/api/auth.ts
import { api } from "@/lib/axios"
import { config } from "@/lib/config"

const DEBUG = config.features.debugLogging

export const authApi = {
  login: (data: { phone: string; password: string }) => {
    return api.post("/auth/login", { phone: data.phone, password: data.password })
  },
  register: (data: { name: string; email: string; phone: string; password: string; role: string }) => 
    api.post("/users", data, { headers: { 'Content-Type': 'application/json' } }),
  logout: () => api.post("/auth/logout"),
  me: () => {
    if (DEBUG) {
      console.debug("[Auth API] me() called");
      console.debug("[Auth API] Base URL:", api.defaults.baseURL);
      console.debug("[Auth API] Full URL will be:", `${api.defaults.baseURL}/users/me`);
      
      // Debug: Check cookies before making request
      if (typeof document !== 'undefined') {
        const cookies = document.cookie;
        const cookieList = cookies.split(';').map(c => c.trim());
        console.debug("[Auth API] Cookies check:", {
          cookies,
          cookieList,
          hasAccessToken: cookieList.some(c => c.includes('access_token')),
          hasRefreshToken: cookieList.some(c => c.includes('refresh_token'))
        });
      }
    }
    
    return api.get("/users/me");
  },
  refresh: () => api.post("/auth/refresh"),
}
