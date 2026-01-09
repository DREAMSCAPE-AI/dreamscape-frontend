import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, MapPin, Trash2, Edit, GripVertical, Plane, Hotel as HotelIcon, Activity, DollarSign } from 'lucide-react';
import { useItineraryStore } from '@/store/itineraryStore';
import type { ItineraryItem, ItineraryItemType } from '@/services/api/ItineraryService';

interface ItineraryItemCardProps {
  item: ItineraryItem;
  itineraryId: string;
  isDragging: boolean;
}

const ItineraryItemCard: React.FC<ItineraryItemCardProps> = ({ item, itineraryId, isDragging }) => {
  const { deleteItem } = useItineraryStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isThisItemDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isThisItemDragging ? 0.5 : 1,
  };

  const getTypeConfig = (type: ItineraryItemType) => {
    switch (type) {
      case 'FLIGHT':
        return {
          icon: Plane,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'HOTEL':
        return {
          icon: HotelIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'ACTIVITY':
        return {
          icon: Activity,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
        };
      default:
        return {
          icon: Activity,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const config = getTypeConfig(item.type);
  const Icon = config.icon;

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this item?')) return;

    setIsDeleting(true);
    try {
      await deleteItem(itineraryId, item.id);
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded-lg border ${config.borderColor} shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Type Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Type Badge */}
          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${config.bgColor} ${config.color} mb-2`}>
            {item.type}
          </span>

          {/* Title */}
          <h4 className="font-semibold text-gray-900 mb-2">
            {item.title}
          </h4>

          {/* Details */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {formatTime(item.startDate)} - {formatTime(item.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{item.location}</span>
            </div>
            {/* Price */}
            {item.price && (
              <div className="flex items-center gap-1 font-semibold text-green-600">
                <DollarSign className="w-4 h-4" />
                <span>
                  {item.currency} {Number(item.price).toFixed(2)}
                  {item.quantity > 1 && ` x ${item.quantity}`}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Additional Details */}
          {item.details && Object.keys(item.details).length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(item.details).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-1">
                    <span className="font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-gray-600">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement edit modal
              alert('Edit functionality coming soon!');
            }}
            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            title="Edit item"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryItemCard;
