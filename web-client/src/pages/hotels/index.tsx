import React from 'react';
import { useTranslation } from 'react-i18next';
import HotelBookingFlow from '@/components/hotels/HotelBookingFlow';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function HotelsPage() {
  const { t } = useTranslation('hotels');
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t('page.ariaLabel.goBack')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">{t('page.title')}</h1>
        </div>
        <HotelBookingFlow />
      </div>
    </main>
  );
}