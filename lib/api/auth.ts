// lib/api/auth.ts
import { api } from "@/lib/axios"

export const authApi = {
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  register:(formData:FormData)=>api.post('/auth/register',formData,{headers:{'Content-Type':'multipart/form-data'}}),
  logout: () => api.post("/auth/logout"),
  me: () => {
    console.debug("[Auth API] me() called");
    console.debug("[Auth API] Base URL:", api.defaults.baseURL);
    console.debug("[Auth API] Full URL will be:", `${api.defaults.baseURL}/users/me`);
    return api.get("/users/me");
  },
  refresh: () => api.post("/auth/refresh"),
  // OTP verification endpoints
  verifyOTP: (userId: string, data: { code: string }) => api.post(`/auth/verify-otp/${userId}`, data),
  resendOTP: (userId: string) => api.get(`/auth/resend-otp/${userId}`),
}
