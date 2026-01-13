import React, { useState } from 'react';
import { X, Heart, Loader2 } from 'lucide-react';
import { favoritesService } from '@/services/favoritesService';
import type { FavoriteType, CreateFavoriteRequest } from '@/types/favorites';

interface AddFavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (favoriteId: string) => void;
  initialData?: Partial<CreateFavoriteRequest>;
}

export default function AddFavoriteModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AddFavoriteModalProps) {
  const [formData, setFormData] = useState<CreateFavoriteRequest>({
    entityType: initialData?.entityType || 'DESTINATION',
    entityId: initialData?.entityId || '',
    entityData: initialData?.entityData || {},
    category: initialData?.category || '',
    notes: initialData?.notes || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.entityId.trim()) {
      setError('Entity ID is required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await favoritesService.addFavorite({
        ...formData,
        category: formData.category?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      });
      onSuccess?.(response.data.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add favorite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Add to Favorites</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Entity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.entityType}
              onChange={(e) => setFormData({ ...formData, entityType: e.target.value as FavoriteType })}
              disabled={isLoading || !!initialData?.entityType}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            >
              <option value="FLIGHT">Flight</option>
              <option value="HOTEL">Hotel</option>
              <option value="ACTIVITY">Activity</option>
              <option value="DESTINATION">Destination</option>
              <option value="BOOKING">Booking</option>
            </select>
          </div>

          {/* Entity ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.entityId}
              onChange={(e) => setFormData({ ...formData, entityId: e.target.value })}
              disabled={isLoading || !!initialData?.entityId}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter entity ID"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category (Optional)
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50"
              placeholder="e.g., Dream Vacation, Business Trip"
              maxLength={50}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50 resize-none"
              placeholder="Add any notes about this favorite..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.notes?.length || 0}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  Add Favorite
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
