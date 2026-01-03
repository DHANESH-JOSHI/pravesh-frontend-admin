import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { PaginatedUsers, Register, User, UserQueryOptions } from "@/types/user";

class UserService {
  async getMe(): Promise<ApiResponse<User>> {
    const response = await instance.get<ApiResponse<User>>("/users/me");
    return response.data;
  }

  async getAll(options?: UserQueryOptions): Promise<ApiResponse<PaginatedUsers>> {
    const response = await instance.get<ApiResponse<PaginatedUsers>>("/users", {
      params: {
        ...options
      }
    });
    return response.data;
  }

  async getById(id: string): Promise<ApiResponse<User>> {
    if (!id) {
      throw new Error("User ID is required");
    }
    const response = await instance.get<ApiResponse<User>>(`/users/${id}`, { params: { populate: true } });
    return response.data;
  }

  async deleteById(id: string): Promise<ApiResponse> {
    if (!id) {
      throw new Error("User ID is required");
    }
    const response = await instance.delete<ApiResponse>(`/users/${id}`);
    return response.data;
  }

  async recoverById(id: string): Promise<ApiResponse<User>> {
    if (!id) {
      throw new Error("User ID is required");
    }
    const response = await instance.post<ApiResponse<User>>(`/users/${id}/recover`);
    return response.data;
  }

  async update(data: Partial<User> & { image?: File }): Promise<ApiResponse<User>> {
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Update data is required");
    }
    
    // If there's an image file, use FormData
    if (data.image instanceof File) {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.email !== undefined) formData.append('email', data.email || '');
      formData.append('image', data.image);
      
      const response = await instance.patch<ApiResponse<User>>(`/users`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
    
    // Otherwise, send as JSON
    const response = await instance.patch<ApiResponse<User>>(`/users`, data);
    return response.data;
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    if (!currentPassword || !newPassword) {
      throw new Error("Both current and new passwords are required");
    }
    if (currentPassword === newPassword) {
      throw new Error("New password must be different from current password");
    }
    const response = await instance.patch<ApiResponse>(`/users/password`, {
      currentPassword,
      newPassword
    });
    return response.data;
  }

  async createVerifiedUser(data: Register) {
    const response = await instance.post<ApiResponse<User>>("/users", data);
    return response.data;
  }

  async resetPassword(otp: string, newPassword: string): Promise<ApiResponse> {
    if (!otp || !newPassword) {
      throw new Error("OTP and new password are required");
    }
    const response = await instance.post<ApiResponse>(`/users/password/reset`, {
      otp,
      newPassword
    });
    return response.data;
  }

  async deleteMe(): Promise<ApiResponse> {
    const response = await instance.delete<ApiResponse>(`/users/me`);
    return response.data;
  }
}

export const userService = new UserService();