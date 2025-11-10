import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { AddFunds, PaginatedWallets, WalletQueryOptions } from "@/types/wallet";

class WalletService {
  async getAll(options:WalletQueryOptions) {
    const response = await instance.get<ApiResponse<PaginatedWallets>>("/wallet",{
      params:options
    });
    return response.data;
  }

  async addFunds(data: AddFunds) {
    const response = await instance.post<ApiResponse<{ userId: string, newBalance: number }>>("/wallet/add", data);
    return response.data;
  }
}

export const walletService = new WalletService();