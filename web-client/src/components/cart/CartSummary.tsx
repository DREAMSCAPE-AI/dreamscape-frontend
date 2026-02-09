/**
 * CartSummary - Cart summary with total price and checkout button
 */

import { useTranslation } from 'react-i18next';
import { ShoppingBag, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CartSummaryProps {
  totalPrice: number;
  currency: string;
  itemCount: number;
  expiresAt: string | null;
  onCheckout: () => void;
  onExtendExpiry: () => void;
  isCheckingOut?: boolean;
}

export const CartSummary = ({
  totalPrice,
  currency,
  itemCount,
  expiresAt,
  onCheckout,
  onExtendExpiry,
  isCheckingOut,
}: CartSummaryProps) => {
  const { t } = useTranslation('checkout');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining(t('cart.summary.expired', 'Expired'));
        setIsExpiringSoon(true);
        return;
      }

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      setIsExpiringSoon(minutes < 5);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
      {/* Expiry Timer */}
      {expiresAt && (
        <div className={`flex items-center justify-between p-3 rounded-lg ${
          isExpiringSoon ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
        }`}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t('cart.summary.expiresIn', 'Cart expires in')}: {timeRemaining}
            </span>
          </div>
          {isExpiringSoon && (
            <button
              onClick={onExtendExpiry}
              className="text-xs font-semibold underline hover:no-underline"
            >
              {t('cart.summary.extend', 'Extend')}
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{t('cart.summary.items', 'Items')} ({itemCount})</span>
          <span>{currency} {Number(totalPrice).toFixed(2)}</span>
        </div>

        {/* TODO: Add taxes and fees calculation */}
        {/* <div className="flex justify-between text-sm text-gray-600">
          <span>Taxes & Fees</span>
          <span>{currency} 0.00</span>
        </div> */}

        <div className="pt-2 border-t border-gray-300">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">{t('cart.summary.total', 'Total')}</span>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              {currency} {Number(totalPrice).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={isCheckingOut || itemCount === 0}
        className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isCheckingOut ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t('cart.summary.processing', 'Processing...')}
          </>
        ) : (
          <>
            <ShoppingBag className="w-5 h-5" />
            {t('cart.summary.checkout', 'Proceed to Checkout')}
          </>
        )}
      </button>

      {/* Security Message */}
      <p className="text-xs text-center text-gray-500">
        {t('cart.summary.secure', '🔒 Secure checkout with encryption')}
      </p>
    </div>
  );
};

export default CartSummary;
