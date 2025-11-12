// 📁 lib/api/employees.ts
import { api } from "../axios"

export interface Employee {
  id: string
  user_id: string
  job_title: string
  department: string
  salary: number | string
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
  manager_employee_id: string | null
  manager_name: string | null
  manager_email: string | null
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
  createEmployee: (data: {
    user: {
      email: string
      name: string
      phone: string
      is_active: boolean
    }
    job_title: string
    salary: number
    district: string
    department: string
    employment_type: string
    status?: string // Optional, defaults to "active"
  }) => {
    // Ensure status is set (default to "active" if not provided)
    const payload = {
      ...data,
      status: data.status || "active"
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.debug("[Employees API] Creating employee with data:", payload);
      console.debug("[Employees API] Full URL will be:", `${api.defaults.baseURL}/employees`);
    }
    
    return api.post("/employees", payload, {
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
  
  // Upload attachments to an employee
  uploadEmployeeAttachments: (employeeId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.debug("[Employees API] Uploading attachments for employee:", employeeId);
      console.debug("[Employees API] Files:", files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    }
    
    return api.post<{
      data: Array<{
        id: string
        original_name: string
        title: string
        mime_type: string
        size: string
        created_at: string
        download_path: string
        preview_path: string | null
        thumbnail_path: string | null
      }>
    }>(`/employees/${employeeId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true
    });
  },
  
  // Get employee attachments
  getEmployeeAttachments: (employeeId: string) => {
    return api.get<{
      data: Array<{
        id: string
        original_name: string
        title: string
        mime_type: string
        size: string
        created_at: string
        download_path: string
        preview_path: string | null
        thumbnail_path: string | null
      }>
    }>(`/employees/${employeeId}/attachments`);
  },
  
  // Download employee attachment by path
  downloadEmployeeAttachmentByPath: (downloadPath: string) => {
    let path = downloadPath
    
    if (downloadPath.startsWith('/api/v1/')) {
      path = downloadPath.replace('/api/v1', '')
    } else if (downloadPath.startsWith('/')) {
      path = downloadPath
    } else {
      path = `/${downloadPath}`
    }
    
    return api.get(path, {
      responseType: 'blob',
    })
  },
}

