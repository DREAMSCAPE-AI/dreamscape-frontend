import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, MapPin, Plus, Loader2 } from 'lucide-react';
import { useItineraryStore } from '@/store/itineraryStore';
import type { CreateItineraryDto } from '@/services/api/ItineraryService';

interface CreateItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateItineraryModal: React.FC<CreateItineraryModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { createItinerary, isSaving } = useItineraryStore();
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    destinations: ['']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty destinations
    const destinations = formData.destinations.filter(d => d.trim() !== '');

    const dto: CreateItineraryDto = {
      title: formData.title,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      destinations
    };

    try {
      const newItinerary = await createItinerary(dto);
      handleClose();
      // Navigate to the new itinerary
      navigate(`/planner/${newItinerary.id}`);
    } catch (error) {
      console.error('Failed to create itinerary:', error);
      alert('Failed to create itinerary. Please try again.');
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      startDate: '',
      endDate: '',
      destinations: ['']
    });
    onClose();
  };

  const addDestination = () => {
    setFormData({
      ...formData,
      destinations: [...formData.destinations, '']
    });
  };

  const removeDestination = (index: number) => {
    const newDestinations = formData.destinations.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      destinations: newDestinations.length > 0 ? newDestinations : ['']
    });
  };

  const updateDestination = (index: number, value: string) => {
    const newDestinations = [...formData.destinations];
    newDestinations[index] = value;
    setFormData({
      ...formData,
      destinations: newDestinations
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Itinerary</h2>
            <p className="text-sm text-gray-600 mt-1">Plan your next adventure</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Trip Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Summer in Japan"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="endDate"
                required
                value={formData.endDate}
                min={formData.startDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Destinations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Destinations
            </label>
            <div className="space-y-3">
              {formData.destinations.map((destination, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => updateDestination(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Tokyo, Japan"
                  />
                  {formData.destinations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDestination(index)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addDestination}
              className="mt-3 flex items-center gap-2 px-4 py-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Destination
            </button>
          </div>

          {/* Helper Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> After creating your itinerary, you'll be able to add flights, hotels, and activities to your trip timeline.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Create Itinerary</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateItineraryModal;
