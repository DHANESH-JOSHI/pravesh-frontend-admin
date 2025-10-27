import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { AddToCart, UpdateCartItem, Cart, CartSummary } from "@/types/cart";

class CartService {
  async getAll() {
    const response = await instance.get("/cart");
    return response.data;
  }

  async getAllCarts() {
    const response = await instance.get<ApiResponse<Cart[]>>("/cart");
    return response.data;
  }

  async getMyCart() {
    const response = await instance.get<ApiResponse<Cart>>("/cart/me");
    return response.data;
  }

  async getCartSummary() {
    const response = await instance.get<ApiResponse<CartSummary>>("/cart/summary");
    return response.data;
  }

  async addToCart(data: AddToCart) {
    const response = await instance.post<ApiResponse<Cart>>("/cart/add", data);
    return response.data;
  }

  async updateCartItem(productId: string, data: UpdateCartItem) {
    const response = await instance.patch<ApiResponse<Cart>>(`/cart/item/${productId}`, data);
    return response.data;
  }

  async removeFromCart(productId: string) {
    const response = await instance.delete<ApiResponse<Cart>>(`/cart/item/${productId}`);
    return response.data;
  }

  async clearCart() {
    const response = await instance.delete<ApiResponse<void>>("/cart/clear");
    return response.data;
  }

  async checkout() {
    const response = await instance.post<ApiResponse<{ orderId: string }>>("/cart/checkout");
    return response.data;
  }
}

export const cartService = new CartService();