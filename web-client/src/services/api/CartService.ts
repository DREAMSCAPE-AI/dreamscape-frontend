/**
 * Cart Service - API communication for shopping cart
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  Cart,
  CartResponse,
  CartItemResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
  CheckoutRequest,
  CheckoutResponse,
} from '@/types/cart';

const VOYAGE_API_BASE_URL = import.meta.env.VITE_VOYAGE_SERVICE_URL || 'http://localhost:3003/api/v1';

class CartService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: VOYAGE_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor for logging and auth
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Cart API Request: ${config.method?.toUpperCase()} ${config.url}`);

        // TODO: Add auth token from auth store when available
        // const token = useAuthStore.getState().token;
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error('Cart API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get user's cart
   */
  async getCart(userId: string): Promise<Cart | null> {
    try {
      const response = await this.api.get<CartResponse>('/cart', {
        params: { userId },
      });
      return response.data.data;
    } catch (error) {
      console.error('[CartService] Error fetching cart:', error);
      throw error;
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(data: AddToCartRequest): Promise<Cart> {
    try {
      const response = await this.api.post<CartItemResponse>('/cart/items', data);
      return response.data.data;
    } catch (error) {
      console.error('[CartService] Error adding to cart:', error);
      throw error;
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(userId: string, itemId: string, data: UpdateCartItemRequest): Promise<Cart> {
    try {
      const response = await this.api.put<CartItemResponse>(`/cart/items/${itemId}`, {
        ...data,
        userId,
      });
      return response.data.data;
    } catch (error) {
      console.error('[CartService] Error updating cart item:', error);
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  async removeCartItem(userId: string, itemId: string): Promise<Cart> {
    try {
      const response = await this.api.delete<CartItemResponse>(`/cart/items/${itemId}`, {
        params: { userId },
      });
      return response.data.data;
    } catch (error) {
      console.error('[CartService] Error removing cart item:', error);
      throw error;
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId: string): Promise<void> {
    try {
      await this.api.delete('/cart', {
        params: { userId },
      });
    } catch (error) {
      console.error('[CartService] Error clearing cart:', error);
      throw error;
    }
  }

  /**
   * Extend cart expiry
   */
  async extendCartExpiry(userId: string): Promise<Cart> {
    try {
      const response = await this.api.put<CartItemResponse>('/cart/extend', { userId });
      return response.data.data;
    } catch (error) {
      console.error('[CartService] Error extending cart expiry:', error);
      throw error;
    }
  }

  /**
   * Checkout - Create booking from cart
   */
  async checkout(data: CheckoutRequest): Promise<CheckoutResponse> {
    try {
      const response = await this.api.post<{ data: CheckoutResponse }>('/cart/checkout', data);
      return response.data.data;
    } catch (error) {
      console.error('[CartService] Error during checkout:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const cartService = new CartService();
export default cartService;
