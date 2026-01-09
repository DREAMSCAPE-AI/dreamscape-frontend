import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Trash2, Edit, Loader2 } from 'lucide-react';
import { useItineraryStore } from '@/store/itineraryStore';
import CreateItineraryModal from './CreateItineraryModal';
import type { Itinerary } from '@/services/api/ItineraryService';

const ItineraryList: React.FC = () => {
  const navigate = useNavigate();
  const { itineraries, isLoading, fetchItineraries, deleteItinerary } = useItineraryStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchItineraries();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this itinerary?')) return;

    setDeletingId(id);
    try {
      await deleteItinerary(id);
    } catch (error) {
      console.error('Failed to delete itinerary:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewItinerary = (id: string) => {
    navigate(`/planner/${id}`);
  };

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Itineraries</h2>
          <p className="text-gray-600 mt-1">
            {itineraries.length} {itineraries.length === 1 ? 'trip' : 'trips'} planned
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          <span>New Itinerary</span>
        </button>
      </div>

      {/* Empty State */}
      {itineraries.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No itineraries yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start planning your next adventure by creating your first itinerary
          </p>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            <span>Create Itinerary</span>
          </button>
        </div>
      )}

      {/* Itinerary Grid */}
      {itineraries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map((itinerary) => (
            <div
              key={itinerary.id}
              onClick={() => handleViewItinerary(itinerary.id)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 group-hover:text-orange-600 transition-colors">
                    {itinerary.title}
                  </h3>
                  {itinerary.aiGenerated && (
                    <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      AI
                    </span>
                  )}
                </div>

                {/* Dates */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
                  </span>
                </div>

                {/* Duration */}
                <div className="text-sm text-gray-500 mb-3">
                  {getDuration(itinerary.startDate, itinerary.endDate)}
                </div>

                {/* Destinations */}
                {itinerary.destinations.length > 0 && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {itinerary.destinations.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {itinerary.items?.length || 0} items
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/planner/${itinerary.id}/edit`);
                    }}
                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Edit itinerary"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(itinerary.id, e)}
                    disabled={deletingId === itinerary.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete itinerary"
                  >
                    {deletingId === itinerary.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Itinerary Modal */}
      <CreateItineraryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default ItineraryList;
