import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { Address, AddressQueryOptions, PaginatedAddresses } from "@/types/address";

class AddressService {
  async getAllAddresses(options: AddressQueryOptions) {
    const response = await instance.get<ApiResponse<PaginatedAddresses>>("/addresses", { params: options });
    return response.data;
  }

  async getById(id: string) {
    const response = await instance.get<ApiResponse<Address>>(`/addresses/${id}`, { params: { populate: true } });
    return response.data;
  }
}

export const addressService = new AddressService();