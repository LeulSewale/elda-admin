import { api } from '../axios';

export interface Package {
  _id: string;
  title: string;
  price: number;
  description: string;
  duration: number;
  createdBy: {
    _id: string;
    fullName: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

export interface CreatePackageRequest {
  title: string;
  description: string;
  price: number;
  duration: number;
}

export interface UpdatePackageRequest {
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
}

export const packagesApi = {
  // Get all packages
  getPackages: async () => {
    return api.get<{ data: Package[] }>('/packages');
  },

  // Create new package
  createPackage: async (data: CreatePackageRequest) => {
    return api.post<{ data: Package }>('/package', data);
  },

  // Update package by ID
  updatePackage: async (id: string, data: UpdatePackageRequest) => {
    return api.patch<{ data: Package }>(`/package/${id}`, data);
  },

  // Delete package by ID
  deletePackage: async (id: string) => {
    return api.delete<{ message: string }>(`/package/${id}`);
  },
};
