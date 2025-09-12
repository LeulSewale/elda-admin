// 📁 lib/api/companies.ts
import { api } from "../axios"

export const companiesApi = {
  getCompanies: (params?: Record<string, any>) => api.get("/companies", { params }),
  getCompany: (id: string) => api.get(`/companies/${id}`),
  createCompany: (data: any) => api.post("/companies", data),
  createCompanyWithFormData: (formData: FormData) => api.post("/auth/register", formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCompany: (id: string, data: any) => api.patch(`/user/status/${id}`, data),
  updateCompanyWithFormData: (id: string, formData: FormData) => api.put(`/companies/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteCompany: (id: string) => api.delete(`/companies/${id}`),
}