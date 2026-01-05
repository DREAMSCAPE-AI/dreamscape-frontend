/**
 * CartButton - Shopping cart button with item count badge
 * Displayed in navbar to open cart drawer
 */

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export const CartButton = () => {
  const { toggleDrawer, getItemCount } = useCartStore();
  const itemCount = getItemCount();

  return (
    <button
      onClick={toggleDrawer}
      className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors duration-200 rounded-lg hover:bg-orange-50"
      aria-label="Shopping cart"
    >
      <ShoppingCart className="w-6 h-6" />

      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartButton;
