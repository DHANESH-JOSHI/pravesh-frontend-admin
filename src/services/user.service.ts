import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { PaginatedUsers, User, UserQueryOptions } from "@/types/user";

class UserService {
  async getMe(): Promise<ApiResponse<User>> {
    const response = await instance.get<ApiResponse<User>>("/users/me");
    return response.data;
  }

  async getAll(options?: UserQueryOptions): Promise<ApiResponse<PaginatedUsers>> {
    const response = await instance.get<ApiResponse<PaginatedUsers>>("/users", {
      params: options || {}
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

  async update(data: Partial<User>): Promise<ApiResponse<User>> {
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Update data is required");
    }
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
}

export const userService = new UserService();