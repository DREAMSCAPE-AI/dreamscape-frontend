/**
 * Cart Store - Zustand store for shopping cart state management
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { cartService } from '@/services/voyage/CartService';
import type {
  Cart,
  CartItem,
  AddToCartRequest,
  CheckoutResponse,
} from '@/types/cart';

interface CartState {
  // State
  cart: Cart | null;
  isLoading: boolean;
  isCheckingOut: boolean;
  error: string | null;
  isDrawerOpen: boolean;

  // Computed getters
  getItemCount: () => number;
  getTotalPrice: () => number;
  getExpiryTime: () => Date | null;
  getTimeRemaining: () => number | null; // milliseconds

  // Actions
  fetchCart: (userId: string) => Promise<void>;
  addToCart: (data: AddToCartRequest) => Promise<void>;
  updateItemQuantity: (userId: string, itemId: string, quantity: number) => Promise<void>;
  removeItem: (userId: string, itemId: string) => Promise<void>;
  clearCart: (userId: string) => Promise<void>;
  extendExpiry: (userId: string) => Promise<void>;
  checkout: (userId: string, metadata?: Record<string, unknown>) => Promise<CheckoutResponse>;

  // UI actions
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  clearError: () => void;
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        cart: null,
        isLoading: false,
        isCheckingOut: false,
        error: null,
        isDrawerOpen: false,

        // Computed getters
        getItemCount: () => {
          const cart = get().cart;
          if (!cart) return 0;
          return cart.items.reduce((total, item) => total + item.quantity, 0);
        },

        getTotalPrice: () => {
          const cart = get().cart;
          return cart?.totalPrice ?? 0;
        },

        getExpiryTime: () => {
          const cart = get().cart;
          if (!cart) return null;
          return new Date(cart.expiresAt);
        },

        getTimeRemaining: () => {
          const expiryTime = get().getExpiryTime();
          if (!expiryTime) return null;
          const remaining = expiryTime.getTime() - Date.now();
          return remaining > 0 ? remaining : 0;
        },

        // Actions
        fetchCart: async (userId: string) => {
          set({ isLoading: true, error: null });
          try {
            const cart = await cartService.getCart(userId);
            set({ cart, isLoading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cart';
            set({ error: errorMessage, isLoading: false });
            console.error('[CartStore] Error fetching cart:', error);
          }
        },

        addToCart: async (data: AddToCartRequest) => {
          set({ isLoading: true, error: null });
          try {
            const cart = await cartService.addToCart(data);
            set({ cart, isLoading: false, isDrawerOpen: true }); // Auto-open drawer on add
            console.log('[CartStore] Item added to cart:', cart);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
            set({ error: errorMessage, isLoading: false });
            console.error('[CartStore] Error adding to cart:', error);
            throw error; // Re-throw for UI handling
          }
        },

        updateItemQuantity: async (userId: string, itemId: string, quantity: number) => {
          set({ isLoading: true, error: null });
          try {
            const cart = await cartService.updateCartItem(userId, itemId, { quantity });
            set({ cart, isLoading: false });
            console.log('[CartStore] Item quantity updated:', cart);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update item quantity';
            set({ error: errorMessage, isLoading: false });
            console.error('[CartStore] Error updating item quantity:', error);
            throw error;
          }
        },

        removeItem: async (userId: string, itemId: string) => {
          set({ isLoading: true, error: null });
          try {
            const cart = await cartService.removeCartItem(userId, itemId);
            set({ cart, isLoading: false });
            console.log('[CartStore] Item removed from cart:', cart);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to remove item';
            set({ error: errorMessage, isLoading: false });
            console.error('[CartStore] Error removing item:', error);
            throw error;
          }
        },

        clearCart: async (userId: string) => {
          set({ isLoading: true, error: null });
          try {
            await cartService.clearCart(userId);
            set({ cart: null, isLoading: false, isDrawerOpen: false });
            // Also clear persisted cart from localStorage
            localStorage.removeItem('dreamscape-cart-storage');
            console.log('[CartStore] Cart cleared');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to clear cart';
            set({ error: errorMessage, isLoading: false });
            console.error('[CartStore] Error clearing cart:', error);
            throw error;
          }
        },

        extendExpiry: async (userId: string) => {
          set({ isLoading: true, error: null });
          try {
            const cart = await cartService.extendCartExpiry(userId);
            set({ cart, isLoading: false });
            console.log('[CartStore] Cart expiry extended:', cart);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to extend cart expiry';
            set({ error: errorMessage, isLoading: false });
            console.error('[CartStore] Error extending cart expiry:', error);
            throw error;
          }
        },

        checkout: async (userId: string, metadata?: Record<string, unknown>) => {
          set({ isCheckingOut: true, error: null });
          try {
            const checkoutResponse = await cartService.checkout({ userId, metadata });
            console.log('[CartStore] Checkout successful:', checkoutResponse);

            // Clear cart after successful checkout (cart will be cleared by backend after payment)
            // We keep it for now so user can see booking reference
            set({ isCheckingOut: false });

            return checkoutResponse;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to checkout';
            set({ error: errorMessage, isCheckingOut: false });
            console.error('[CartStore] Error during checkout:', error);
            throw error;
          }
        },

        // UI actions
        openDrawer: () => set({ isDrawerOpen: true }),
        closeDrawer: () => set({ isDrawerOpen: false }),
        toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
        clearError: () => set({ error: null }),
      }),
      {
        name: 'dreamscape-cart-storage',
        partialize: (state) => ({
          // Only persist cart data, not loading states or drawer state
          cart: state.cart,
        }),
      }
    ),
    {
      name: 'CartStore',
    }
  )
);

export default useCartStore;
