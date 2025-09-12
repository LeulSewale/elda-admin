// 📁 lib/api/bids.ts
import { api } from "../axios"

export const bidsApi = {
  getBids: (params?: { page?: number; limit?: number; search?: string }) => api.get("/bids", { params }),
  getBid: (id: string) => api.get(`/bids/${id}`),
  createBid: (data: any) => api.post("/bids", data),
  updateBid: (id: string, data: any) => api.put(`/bids/${id}`, data),
  deleteBid: (id: string) => api.delete(`/bids/${id}`),
  getBidsByCompany: ({ companyId, ...params }: { companyId: string; [key: string]: any }) => api.get(`/${companyId}/bids`, { params }),
  updateBidStatus: (bidId: string, data: { status: "accepted" | "rejected" | "awarded"; rejectionReason?: string }) =>
    api.patch(`/update/bid/${bidId}`, data),
}