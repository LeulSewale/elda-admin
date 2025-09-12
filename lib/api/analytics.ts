// 📁 lib/api/analytics.ts
import { api } from "../axios"

export const analyticsApi = {
  getOverview: () => api.get("/analytics/overview"),
  getRevenue: (period: "daily" | "monthly" | "yearly") => api.get(`/analytics/revenue?period=${period}`),
}