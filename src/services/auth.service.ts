import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { Login } from "@/types/auth";

class AuthService {
  async login(data: Login) {
    const response = await instance.post<ApiResponse>("/auth/admin-login", data);
    return response.data;
  }

  async logout() {
    const response = await instance.post<ApiResponse>("/auth/logout");
    return response.data;
  }

  async requestForOtp(phoneOrEmail: string) {
    const response = await instance.post<ApiResponse>("/auth/otp/request", { phoneOrEmail });
    return response.data;
  }

  async loginViaOtp(phoneOrEmail: string, otp: string) {
    const response = await instance.post<ApiResponse>("/auth/admin-otp-login", { phoneOrEmail, otp });
    return response.data;
  }

  async refreshTokens() {
    const response = await instance.post<ApiResponse>("/auth/refresh-tokens");
    return response.data;
  }
}

export const authService = new AuthService();
