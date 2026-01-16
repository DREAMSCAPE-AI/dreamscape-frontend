import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Loader2 } from 'lucide-react';
import { useItineraryStore } from '@/store/itineraryStore';
import ItineraryItemCard from './ItineraryItemCard';
import AddItemModalV2 from './AddItemModalV2';
import type { ItineraryItem } from '@/services/api/ItineraryService';

interface ItineraryTimelineProps {
  itineraryId: string;
}

const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ itineraryId }) => {
  const { currentItinerary, isSaving, reorderItems, fetchItineraryById } = useItineraryStore();
  const [localItems, setLocalItems] = useState<ItineraryItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync with store when currentItinerary changes
  React.useEffect(() => {
    if (currentItinerary?.items) {
      setLocalItems([...currentItinerary.items].sort((a, b) => {
        // Sort by date first, then by order
        const dateCompare = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        return dateCompare !== 0 ? dateCompare : a.order - b.order;
      }));
    }
  }, [currentItinerary]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex((item) => item.id === active.id);
      const newIndex = localItems.findIndex((item) => item.id === over.id);

      const reorderedItems = arrayMove(localItems, oldIndex, newIndex);
      setLocalItems(reorderedItems);

      // Update order values and send to server
      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        order: index
      }));

      try {
        await reorderItems(itineraryId, updates);
      } catch (error) {
        // Revert on error
        console.error('Failed to reorder items:', error);
        if (currentItinerary?.items) {
          setLocalItems([...currentItinerary.items]);
        }
      }
    }
  };

  const groupItemsByDate = (items: ItineraryItem[]) => {
    const groups: Record<string, ItineraryItem[]> = {};

    items.forEach((item) => {
      const dateKey = new Date(item.startDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    return groups;
  };

  const handleItemAdded = async () => {
    // Refresh itinerary to get updated items
    await fetchItineraryById(itineraryId);
    setIsAddModalOpen(false);
  };

  if (!currentItinerary) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const groupedItems = groupItemsByDate(localItems);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Timeline</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Empty State */}
      {localItems.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mb-3">
            <Plus className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No activities yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start building your itinerary by adding flights, hotels, or activities
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            <span>Add First Activity</span>
          </button>
        </div>
      )}

      {/* Timeline */}
      {localItems.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([date, items]) => (
              <div key={date} className="space-y-4">
                {/* Date Header */}
                <div className="sticky top-16 z-10 bg-white/95 backdrop-blur-sm py-2 -mx-2 px-2 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    {date}
                  </h3>
                </div>

                {/* Items for this date */}
                <SortableContext
                  items={items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 pl-6 border-l-2 border-gray-200">
                    {items.map((item) => (
                      <ItineraryItemCard
                        key={item.id}
                        item={item}
                        itineraryId={itineraryId}
                        isDragging={isDragging}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>
        </DndContext>
      )}

      {/* Saving Indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          <span className="text-sm font-medium text-gray-700">Saving changes...</span>
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModalV2
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        itineraryId={itineraryId}
        onSuccess={handleItemAdded}
      />
    </div>
  );
};

export default ItineraryTimeline;
