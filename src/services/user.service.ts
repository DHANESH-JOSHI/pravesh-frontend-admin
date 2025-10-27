import instance from "@/lib/axios";
import { ApiResponse, PaginatedData } from "@/types";
import { User } from "@/types/user";

interface PaginatedUsers extends PaginatedData {
  users: User[]
}

class UserService {
  async getMe() {
    const response = await instance.get<ApiResponse<User>>("/users/me");
    return response.data;
  }

  async getAll() {
    const response = await instance.get<ApiResponse<PaginatedUsers>>("/users");
    return response.data
  }

  async getById(id: string) {
    const response = await instance.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  }

  async existsByEmail(email: string) {
    const response = await instance.post<ApiResponse<boolean>>(`/users/email/${email}`);
    return response.data;
  }

  async existsByPhone(phone: string) {
    const response = await instance.post<ApiResponse<boolean>>(`/users/phone/${phone}`);
    return response.data;
  }

  async deleteById(id: string) {
    const response = await instance.delete<ApiResponse>(`/users/${id}`);
    return response.data;
  }

  async recoverById(id: string) {
    const response = await instance.post<ApiResponse<User>>(`/users/${id}/recover`);
    return response.data;
  }

  async update(data: Partial<User>) {
    const response = await instance.patch<ApiResponse<User>>(`/users`, data);
    return response.data;
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    const response = await instance.patch<ApiResponse>(`/users/password`, { currentPassword, newPassword });
    return response.data;
  }

}



export const userService = new UserService();