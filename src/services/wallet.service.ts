import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { AddFunds, WalletTransaction } from "@/types/wallet";

class WalletService {
  async getBalance() {
    const response = await instance.get<ApiResponse<{ balance: number }>>("/wallet/balance");
    return response.data;
  }

  async getTransactions() {
    const response = await instance.get<ApiResponse<WalletTransaction[]>>("/wallet/transactions");
    return response.data;
  }

  async addFunds(data: AddFunds) {
    const response = await instance.post<ApiResponse<{ userId: string, newBalance: number }>>("/wallet/add", data);
    return response.data;
  }
}

export const walletService = new WalletService();