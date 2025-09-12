import { api } from "../axios"

export const categoriesApi = {
  getCategories: () => api.get("/categories"),
  createCategory: (data: any) => api.post("/categories", data),
  updateCategory: (id: string, data: any) => api.put(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
}