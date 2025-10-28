import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { Cart,CartQueryOptions,PaginatedCarts } from "@/types/cart";


class CartService {
  async getAllCarts(options: CartQueryOptions) {
    const response = await instance.get<ApiResponse<PaginatedCarts>>("/cart", { params: options });
    return response.data;
  }

  async getCartById(cartId: string) {
    const response = await instance.get<ApiResponse<Cart>>(`/cart/${cartId}`);
    return response.data;
  }
}

export const cartService = new CartService();