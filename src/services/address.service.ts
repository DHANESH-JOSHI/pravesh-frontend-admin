import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { CreateAddress, UpdateAddress, Address } from "@/types/address";

class AddressService {
  async getAllAddresses() {
    const response = await instance.get<ApiResponse<Address[]>>("/addresses");
    return response.data;
  }

  async getMyAddresses() {
    const response = await instance.get<ApiResponse<Address[]>>("/addresses/me");
    return response.data;
  }

  async create(data: CreateAddress) {
    const response = await instance.post<ApiResponse<Address>>("/addresses", data);
    return response.data;
  }

  async update(id: string, data: UpdateAddress) {
    const response = await instance.patch<ApiResponse<Address>>(`/addresses/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await instance.delete<ApiResponse<void>>(`/addresses/${id}`);
    return response.data;
  }
}

export const addressService = new AddressService();