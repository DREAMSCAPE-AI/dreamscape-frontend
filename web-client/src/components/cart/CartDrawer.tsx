/**
 * CartDrawer - Slide-in cart panel
 * Main cart interface with items list, summary, and checkout
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/services/auth/AuthService';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

export const CartDrawer = () => {
  const { t } = useTranslation('checkout');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id || 'guest';

  const {
    cart,
    isLoading,
    isCheckingOut,
    error,
    isDrawerOpen,
    closeDrawer,
    fetchCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    extendExpiry,
    checkout,
    clearError,
    getItemCount,
    getTotalPrice,
  } = useCartStore();

  // Fetch cart on mount
  useEffect(() => {
    if (isDrawerOpen) {
      fetchCart(userId);
    }
  }, [isDrawerOpen]);

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateItemQuantity(userId, itemId, quantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(userId, itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleClearCart = async () => {
    if (!confirm(t('cart.confirmClear', 'Are you sure you want to clear your cart?'))) return;

    try {
      await clearCart(userId);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const handleExtendExpiry = async () => {
    try {
      await extendExpiry(userId);
    } catch (error) {
      console.error('Failed to extend cart expiry:', error);
    }
  };

  const handleCheckout = async () => {
    try {
      const checkoutResponse = await checkout(userId);
      console.log('[CartDrawer] Checkout response:', checkoutResponse);

      // Navigate to checkout page with payment data
      navigate('/checkout', {
        state: {
          checkoutData: checkoutResponse,
        },
      });

      // Close drawer after navigation
      closeDrawer();
    } catch (error) {
      console.error('[CartDrawer] Checkout failed:', error);
      // Error will be displayed by the error banner in the drawer
    }
  };

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md md:max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-pink-50">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-orange-600 flex-shrink-0" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('cart.title', 'Shopping Cart')}</h2>
            <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-semibold rounded-full flex-shrink-0">
              {getItemCount()}
            </span>
          </div>

          <button
            onClick={closeDrawer}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-orange-100 rounded-lg transition-colors"
            aria-label={t('cart.close', 'Close cart')}
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={clearError}
                className="text-red-700 hover:text-red-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
          {isLoading && !cart ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 md:p-8 text-center">
              <ShoppingCart className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                {t('cart.empty.title', 'Your cart is empty')}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
                {t('cart.empty.message', 'Add flights, hotels, or activities to get started')}
              </p>
              <button
                onClick={closeDrawer}
                className="px-6 py-2.5 min-h-[44px] bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-medium rounded-lg transition-colors"
              >
                {t('cart.empty.continue', 'Continue Shopping')}
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                {cart.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                    isLoading={isLoading}
                  />
                ))}
              </div>

              {/* Clear Cart Button */}
              {cart.items.length > 0 && (
                <div className="px-3 md:px-4 pb-3 md:pb-4">
                  <button
                    onClick={handleClearCart}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 min-h-[44px] border border-red-300 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <Trash2 className="w-4 h-4 flex-shrink-0" />
                    {t('cart.clearCart', 'Clear Cart')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Summary Footer */}
        {cart && cart.items.length > 0 && (
          <CartSummary
            totalPrice={getTotalPrice()}
            currency={cart.currency}
            itemCount={getItemCount()}
            expiresAt={cart.expiresAt}
            onCheckout={handleCheckout}
            onExtendExpiry={handleExtendExpiry}
            isCheckingOut={isCheckingOut}
          />
        )}
      </div>
    </>
  );
};

export default CartDrawer;
