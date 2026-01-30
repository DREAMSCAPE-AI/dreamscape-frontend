/**
 * Itinerary Store - Zustand store for itinerary state management
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import itineraryService, {
  type Itinerary,
  type ItineraryItem,
  type CreateItineraryDto,
  type UpdateItineraryDto,
  type CreateItineraryItemDto,
  type UpdateItineraryItemDto,
  type ExportFormat
} from '@/services/api/ItineraryService';

interface ItineraryState {
  // State
  itineraries: Itinerary[];
  currentItinerary: Itinerary | null;
  isLoading: boolean;
  isSaving: boolean;
  isExporting: boolean;
  error: string | null;

  // Actions - Itineraries
  fetchItineraries: () => Promise<void>;
  fetchItineraryById: (id: string) => Promise<void>;
  createItinerary: (dto: CreateItineraryDto) => Promise<Itinerary>;
  updateItinerary: (id: string, dto: UpdateItineraryDto) => Promise<void>;
  deleteItinerary: (id: string) => Promise<void>;
  setCurrentItinerary: (itinerary: Itinerary | null) => void;

  // Actions - Items
  addItem: (itineraryId: string, dto: CreateItineraryItemDto) => Promise<void>;
  updateItem: (itineraryId: string, itemId: string, dto: UpdateItineraryItemDto) => Promise<void>;
  deleteItem: (itineraryId: string, itemId: string) => Promise<void>;
  reorderItems: (itineraryId: string, items: Array<{ id: string; order: number }>) => Promise<void>;

  // Actions - Export
  exportItinerary: (id: string, format: ExportFormat) => Promise<void>;

  // Utility
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  itineraries: [],
  currentItinerary: null,
  isLoading: false,
  isSaving: false,
  isExporting: false,
  error: null,
};

export const useItineraryStore = create<ItineraryState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ========== ITINERARY ACTIONS ==========

        fetchItineraries: async () => {
          set({ isLoading: true, error: null });
          try {
            const itineraries = await itineraryService.getItineraries();
            set({ itineraries, isLoading: false });
            console.log('[ItineraryStore] Fetched itineraries:', itineraries.length);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch itineraries';
            set({ error: errorMessage, isLoading: false });
            console.error('[ItineraryStore] Error fetching itineraries:', error);
          }
        },

        fetchItineraryById: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            const itinerary = await itineraryService.getItineraryById(id);
            set({ currentItinerary: itinerary, isLoading: false });
            console.log('[ItineraryStore] Fetched itinerary:', itinerary.id);

            // Also update in the list if it exists
            const itineraries = get().itineraries;
            const index = itineraries.findIndex(i => i.id === id);
            if (index !== -1) {
              const updatedItineraries = [...itineraries];
              updatedItineraries[index] = itinerary;
              set({ itineraries: updatedItineraries });
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch itinerary';
            set({ error: errorMessage, isLoading: false });
            console.error('[ItineraryStore] Error fetching itinerary:', error);
          }
        },

        createItinerary: async (dto: CreateItineraryDto) => {
          set({ isSaving: true, error: null });
          try {
            const newItinerary = await itineraryService.createItinerary(dto);
            set((state) => ({
              itineraries: [newItinerary, ...state.itineraries],
              currentItinerary: newItinerary,
              isSaving: false
            }));
            console.log('[ItineraryStore] Created itinerary:', newItinerary.id);
            return newItinerary;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create itinerary';
            set({ error: errorMessage, isSaving: false });
            console.error('[ItineraryStore] Error creating itinerary:', error);
            throw error;
          }
        },

        updateItinerary: async (id: string, dto: UpdateItineraryDto) => {
          set({ isSaving: true, error: null });
          try {
            const updatedItinerary = await itineraryService.updateItinerary(id, dto);

            // Update in list
            const itineraries = get().itineraries;
            const updatedItineraries = itineraries.map(i =>
              i.id === id ? updatedItinerary : i
            );

            // Update current if it's the same one
            const currentItinerary = get().currentItinerary;
            const newCurrent = currentItinerary?.id === id ? updatedItinerary : currentItinerary;

            set({
              itineraries: updatedItineraries,
              currentItinerary: newCurrent,
              isSaving: false
            });
            console.log('[ItineraryStore] Updated itinerary:', id);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update itinerary';
            set({ error: errorMessage, isSaving: false });
            console.error('[ItineraryStore] Error updating itinerary:', error);
            throw error;
          }
        },

        deleteItinerary: async (id: string) => {
          set({ isSaving: true, error: null });
          try {
            await itineraryService.deleteItinerary(id);

            // Remove from list
            const itineraries = get().itineraries.filter(i => i.id !== id);

            // Clear current if it was deleted
            const currentItinerary = get().currentItinerary;
            const newCurrent = currentItinerary?.id === id ? null : currentItinerary;

            set({
              itineraries,
              currentItinerary: newCurrent,
              isSaving: false
            });
            console.log('[ItineraryStore] Deleted itinerary:', id);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete itinerary';
            set({ error: errorMessage, isSaving: false });
            console.error('[ItineraryStore] Error deleting itinerary:', error);
            throw error;
          }
        },

        setCurrentItinerary: (itinerary: Itinerary | null) => {
          set({ currentItinerary: itinerary });
        },

        // ========== ITEM ACTIONS ==========

        addItem: async (itineraryId: string, dto: CreateItineraryItemDto) => {
          set({ isSaving: true, error: null });
          console.log('[ItineraryStore] Adding item with DTO:', dto);
          try {
            const newItem = await itineraryService.addItem(itineraryId, dto);

            // Update current itinerary if it matches
            const currentItinerary = get().currentItinerary;
            if (currentItinerary?.id === itineraryId) {
              set({
                currentItinerary: {
                  ...currentItinerary,
                  items: [...(currentItinerary.items || []), newItem]
                },
                isSaving: false
              });
            } else {
              set({ isSaving: false });
            }

            // Refresh itinerary to get full data
            await get().fetchItineraryById(itineraryId);

            console.log('[ItineraryStore] Added item to itinerary:', itineraryId);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add item';
            set({ error: errorMessage, isSaving: false });
            console.error('[ItineraryStore] Error adding item:', error);
            throw error;
          }
        },

        updateItem: async (itineraryId: string, itemId: string, dto: UpdateItineraryItemDto) => {
          set({ isSaving: true, error: null });
          try {
            await itineraryService.updateItem(itineraryId, itemId, dto);

            // Refresh itinerary to get updated data
            await get().fetchItineraryById(itineraryId);

            set({ isSaving: false });
            console.log('[ItineraryStore] Updated item:', itemId);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
            set({ error: errorMessage, isSaving: false });
            console.error('[ItineraryStore] Error updating item:', error);
            throw error;
          }
        },

        deleteItem: async (itineraryId: string, itemId: string) => {
          set({ isSaving: true, error: null });
          try {
            await itineraryService.deleteItem(itineraryId, itemId);

            // Update current itinerary if it matches
            const currentItinerary = get().currentItinerary;
            if (currentItinerary?.id === itineraryId && currentItinerary.items) {
              set({
                currentItinerary: {
                  ...currentItinerary,
                  items: currentItinerary.items.filter(item => item.id !== itemId)
                },
                isSaving: false
              });
            } else {
              set({ isSaving: false });
            }

            console.log('[ItineraryStore] Deleted item:', itemId);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
            set({ error: errorMessage, isSaving: false });
            console.error('[ItineraryStore] Error deleting item:', error);
            throw error;
          }
        },

        reorderItems: async (itineraryId: string, items: Array<{ id: string; order: number }>) => {
          set({ isSaving: true, error: null });
          try {
            await itineraryService.reorderItems(itineraryId, { items });

            // Refresh itinerary to get updated order
            await get().fetchItineraryById(itineraryId);

            set({ isSaving: false });
            console.log('[ItineraryStore] Reordered items');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to reorder items';
            set({ error: errorMessage, isSaving: false });
            console.error('[ItineraryStore] Error reordering items:', error);
            throw error;
          }
        },

        // ========== EXPORT ACTIONS ==========

        exportItinerary: async (id: string, format: ExportFormat) => {
          set({ isExporting: true, error: null });
          try {
            const result = await itineraryService.exportItinerary(id, format);

            if (result.data) {
              // Download file (PDF or iCal)
              const extension = format === 'pdf' ? 'pdf' : 'ics';
              const mimeType = format === 'pdf' ? 'application/pdf' : 'text/calendar';
              itineraryService.downloadFile(result.data, `itinerary-${id}.${extension}`);
            }

            set({ isExporting: false });
            console.log(`[ItineraryStore] Exported itinerary as ${format}:`, id);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to export as ${format}`;
            set({ error: errorMessage, isExporting: false });
            console.error('[ItineraryStore] Error exporting itinerary:', error);
            throw error;
          }
        },

        // ========== UTILITY ==========

        clearError: () => set({ error: null }),

        reset: () => set(initialState),
      }),
      {
        name: 'dreamscape-itinerary-storage',
        partialize: (state) => ({
          // Persist itineraries list and current itinerary
          itineraries: state.itineraries,
          currentItinerary: state.currentItinerary,
        }),
      }
    ),
    {
      name: 'ItineraryStore',
    }
  )
);

export default useItineraryStore;
