import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { Wishlist } from "@/types/wishlist";

class WishlistService {
  async getWishlist() {
    const response = await instance.get<ApiResponse<Wishlist>>("/wishlist");
    return response.data;
  }

  async addProduct(productId: string) {
    const response = await instance.post<ApiResponse<Wishlist>>("/wishlist/add", { productId });
    return response.data;
  }

  async removeProduct(productId: string) {
    const response = await instance.post<ApiResponse<Wishlist>>("/wishlist/remove", { productId });
    return response.data;
  }
}

export const wishlistService = new WishlistService();