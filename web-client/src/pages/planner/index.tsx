import React from 'react';
import { useTranslation } from 'react-i18next';
import ItineraryList from '@/components/voyage/itinerary/ItineraryList';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PlannerPage() {
  const { t } = useTranslation('planner');
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gray-50 pt-20 md:pt-24">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
            aria-label={t('goBack')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold">{t('title')}</h1>
        </div>
        <ItineraryList />
      </div>
    </main>
  );
}