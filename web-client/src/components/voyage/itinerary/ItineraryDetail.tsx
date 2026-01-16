import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Loader2, ShoppingCart } from 'lucide-react';
import { useItineraryStore } from '@/store/itineraryStore';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/services/auth/AuthService';
import ItineraryTimeline from './ItineraryTimeline';
import ExportMenu from './ExportMenu';

// TODO: Replace with actual user ID from auth store when fully integrated
const TEMP_USER_ID = 'user-123';

const ItineraryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentItinerary, isLoading, fetchItineraryById } = useItineraryStore();
  const { addToCart, openDrawer } = useCartStore();
  const { user } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItineraryById(id);
    }
  }, [id]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  };

  const getTotalPrice = () => {
    if (!currentItinerary?.items) return 0;
    return currentItinerary.items.reduce((total, item) => total + (Number(item.price) * (item.quantity || 1)), 0);
  };

  const handleAddAllToCart = async () => {
    if (!currentItinerary?.items) {
      alert('No itinerary items found');
      return;
    }

    if (currentItinerary.items.length === 0) {
      alert('No items to add to cart');
      return;
    }

    setIsAddingToCart(true);

    try {
      // Add each item to cart using TEMP_USER_ID for consistency with CartDrawer
      for (const item of currentItinerary.items) {
        await addToCart({
          userId: TEMP_USER_ID,
          type: item.type as any,
          itemId: item.itemId || item.id,
          itemData: item.itemData,
          quantity: item.quantity || 1,
          price: Number(item.price), // Convert Decimal to number
          currency: item.currency || 'USD'
        });
      }

      // Open cart drawer to show added items
      openDrawer();
    } catch (error) {
      console.error('Failed to add items to cart:', error);
      alert('Failed to add some items to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading && !currentItinerary) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (!currentItinerary) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Itinerary not found</h2>
            <p className="text-gray-600 mb-6">The itinerary you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/planner')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Back to Itineraries
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/planner')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold">{currentItinerary.title}</h1>
            {currentItinerary.aiGenerated && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                AI Generated
              </span>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {formatDate(currentItinerary.startDate)} - {formatDate(currentItinerary.endDate)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {getDuration(currentItinerary.startDate, currentItinerary.endDate)}
              </div>
              {currentItinerary.destinations.length > 0 && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{currentItinerary.destinations.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Add All to Cart Button - Outline style like hotel/flight pages */}
              {currentItinerary.items && currentItinerary.items.length > 0 && (
                <button
                  onClick={handleAddAllToCart}
                  disabled={isAddingToCart || !user}
                  className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-orange-400 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!user ? 'Please log in to add to cart' : ''}
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                      <span className="text-orange-500 font-medium">Adding...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 text-orange-500" />
                      <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent font-medium">
                        Add All to Cart
                      </span>
                      <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-semibold">
                        {currentItinerary.items.length}
                      </span>
                    </>
                  )}
                </button>
              )}

              <ExportMenu itineraryId={currentItinerary.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline - Main Content */}
          <div className="lg:col-span-2">
            <ItineraryTimeline itineraryId={currentItinerary.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trip Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items</span>
                  <span className="font-medium text-gray-900">
                    {currentItinerary.items?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Flights</span>
                  <span className="font-medium text-gray-900">
                    {currentItinerary.items?.filter(i => i.type === 'FLIGHT').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hotels</span>
                  <span className="font-medium text-gray-900">
                    {currentItinerary.items?.filter(i => i.type === 'HOTEL').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Activities</span>
                  <span className="font-medium text-gray-900">
                    {currentItinerary.items?.filter(i => i.type === 'ACTIVITY').length || 0}
                  </span>
                </div>

                {/* Total Price */}
                {currentItinerary.items && currentItinerary.items.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 my-3"></div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-900 font-semibold">Total Price</span>
                      <span className="text-xl font-bold text-green-600">
                        ${getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Tips Card */}
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl p-6 border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Quick Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Drag and drop items to reorder your itinerary</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Export to PDF or add to your calendar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Click on items to edit details</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDetail;
