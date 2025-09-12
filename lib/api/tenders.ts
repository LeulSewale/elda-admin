import { api } from "../axios"

export const tendersApi = {
  getTenders: (params: Record<string, any>) => api.get("/tenders", { params }),
  getTender: (id: string) => api.get(`/tenders/${id}`),
  createTender: (formData: FormData) => api.post("/tenders", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  updateTender: (id: string, data: any) =>
    data instanceof FormData
      ? api.patch(`/tenders/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } })
      : api.patch(`/tenders/${id}`, data),
  deleteTender: (id: string) => api.delete(`/tenders/${id}`),
  getTendersByCompany: ({ companyId, ...params }: { companyId: string; [key: string]: any }) => api.get(`/tenders/company/${companyId}`, { params }),
  updateTopTender: (id: string, isTop: boolean) => api.patch(`/tenders/top/${id}`, { isTop }),
} 
