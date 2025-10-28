import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { AddressQueryOptions, PaginatedAddresses } from "@/types/address";

class AddressService {
  async getAllAddresses(options: AddressQueryOptions) {
    const response = await instance.get<ApiResponse<PaginatedAddresses>>("/addresses", { params: options });
    return response.data;
  }
}

export const addressService = new AddressService();