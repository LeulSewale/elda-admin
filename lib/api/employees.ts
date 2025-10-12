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
    limit: number
    nextCursor: string | null
    prevCursor: string | null
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export const employeesApi = {
  getEmployees: (params?: { before?: string; after?: string; limit?: number; q?: string; sort?: string }) => {
    const { before, after, limit = 20, q = "", sort = "" } = params || {}
    const queryParams: any = { limit }
    if (q) queryParams.q = q
    if (sort) queryParams.sort = sort
    if (before) queryParams.before = before
    if (after) queryParams.after = after
    console.debug("[Employees API] getEmployees called with params:", queryParams);
    console.debug("[Employees API] Base URL:", api.defaults.baseURL);
    console.debug("[Employees API] Full URL will be:", `${api.defaults.baseURL}/employees`);
    return api.get(`/employees`, { params: queryParams })
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
  updateEmployee: (id: string, data: any) => {
    console.debug("[Employees API] Updating employee with ID:", id);
    console.debug("[Employees API] Update data:", data);
    console.debug("[Employees API] Full URL will be:", `${api.defaults.baseURL}/employees/${id}`);
    
    return api.patch(`/employees/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true
    });
  },
  deleteEmployee: (id: string) => {
    console.debug("[Employees API] Deleting employee with ID:", id);
    console.debug("[Employees API] Full URL will be:", `${api.defaults.baseURL}/employees/${id}`);
    
    return api.delete(`/employees/${id}`, {
      withCredentials: true
    });
  },
}

