import instance from "@/lib/axios";
import { ApiResponse, User, PaginatedData } from "@/types";

export interface CreateStaffData {
  name: string;
  email?: string;
  phone: string;
  password: string;
}

export interface UpdateStaffData {
  name?: string;
  email?: string;
  phone?: string;
  status?: "pending" | "active";
}

export const adminService = {
  async createStaff(data: CreateStaffData) {
    const response = await instance.post<ApiResponse<User>>("/admin/staff", data);
    return response.data;
  },

  async getAllStaff() {
    const response = await instance.get<ApiResponse<User[]>>("/admin/staff");
    return response.data;
  },

  async updateStaff(id: string, data: UpdateStaffData) {
    const response = await instance.patch<ApiResponse<User>>(`/admin/staff/${id}`, data);
    return response.data;
  },

  async deleteStaff(id: string) {
    const response = await instance.delete<ApiResponse>(`/admin/staff/${id}`);
    return response.data;
  },
};

