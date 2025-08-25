import React, { useState } from 'react';
import FlightBookingFlow from '@/components/flights/FlightBookingFlow';
import FlightPriceAnalysis from '@/components/flights/FlightPriceAnalysis';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';

export default function FlightsPage() {
  const navigate = useNavigate();
  const [showPriceAnalysis, setShowPriceAnalysis] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Find Your Flight</h1>
          </div>
          <button
            onClick={() => setShowPriceAnalysis(!showPriceAnalysis)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Price Analysis</span>
          </button>
        </div>
        {showPriceAnalysis ? (
          <FlightPriceAnalysis />
        ) : (
          <FlightBookingFlow />
        )}
      </div>
    </main>
  );
}