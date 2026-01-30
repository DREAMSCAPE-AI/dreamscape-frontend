import React, { useState } from 'react';
import { X, Plane, Hotel, Activity, Plus } from 'lucide-react';
import { useItineraryStore } from '@/store/itineraryStore';
import { ItineraryItemType, type CreateItineraryItemDto } from '@/services/api/ItineraryService';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryId: string;
  onSuccess?: () => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, itineraryId, onSuccess }) => {
  const { addItem, isSaving } = useItineraryStore();
  const [selectedType, setSelectedType] = useState<ItineraryItemType>(ItineraryItemType.ACTIVITY);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
  });

  const itemTypes = [
    {
      type: ItineraryItemType.FLIGHT,
      label: 'Flight',
      icon: Plane,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      type: ItineraryItemType.HOTEL,
      label: 'Hotel',
      icon: Hotel,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      type: ItineraryItemType.ACTIVITY,
      label: 'Activity',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dto: CreateItineraryItemDto = {
      type: selectedType,
      title: formData.title,
      description: formData.description || undefined,
      location: formData.location,
      startDate: `${formData.startDate}T${formData.startTime}:00.000Z`,
      endDate: `${formData.endDate}T${formData.endTime}:00.000Z`,
      order: 0, // Server will handle ordering
    };

    try {
      await addItem(itineraryId, dto);
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '10:00',
    });
    setSelectedType(ItineraryItemType.ACTIVITY);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add to Itinerary</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {itemTypes.map(({ type, label, icon: Icon, color, bgColor }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedType === type
                      ? `${bgColor} border-current ${color}`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${selectedType === type ? color : 'text-gray-400'}`} />
                  <div className={`text-sm font-medium ${selectedType === type ? color : 'text-gray-700'}`}>
                    {label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Visit Tokyo Tower"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Minato, Tokyo, Japan"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="startTime"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="endDate"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="endTime"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Add notes or details about this activity..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Add Item</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
