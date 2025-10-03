// 📁 lib/api/employees.ts
import { api } from "../axios"

export interface Employee {
  id: string
  user_id: string
  job_title: string
  department: string
  salary: string
  district: string
  employment_type: string
  status: string
  hired_at: string
  terminated_at: string | null
  manager_id: string | null
  created_at: string
  updated_at: string
  user_name: string
  user_email: string
  user_phone: string | null
  user_role: string
  manager_user_name: string | null
  manager_user_email: string | null
}

export interface EmployeesResponse {
  data: Employee[]
  paging: {
    page: {
      limit: number
      nextCursor: string
      prevCursor: string
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
}

export const employeesApi = {
  getEmployees: (params?: { page?: number; limit?: number; q?: string; sort?: string }) => {
    const { page = 1, limit = 50, q = "", sort = "" } = params || {}
    console.debug("[Employees API] getEmployees called with params:", { page, limit, q, sort });
    console.debug("[Employees API] Base URL:", api.defaults.baseURL);
    console.debug("[Employees API] Full URL will be:", `${api.defaults.baseURL}/employees`);
    return api.get(`/employees`, { params: { page, limit, q, sort } })
  },
  getEmployee: (id: string) => api.get(`/employees/${id}`),
  createEmployee: (data: any) => {
    console.debug("[Employees API] Creating employee with data:", data);
    console.debug("[Employees API] Full request config:", {
      url: "/employees",
      method: "POST",
      data: data,
      headers: api.defaults.headers
    });
    console.debug("[Employees API] Base URL:", api.defaults.baseURL);
    console.debug("[Employees API] Full URL will be:", `${api.defaults.baseURL}/employees`);
    
    return api.post("/employees", data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true
    });
  },
  updateEmployee: (id: string, data: any) => api.patch(`/employees/${id}`, data),
  deleteEmployee: (id: string) => api.delete(`/employees/${id}`),
}

