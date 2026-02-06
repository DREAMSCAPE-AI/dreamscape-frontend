/**
 * Favorites Store - Zustand store for favorites state management
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  favoritesService,
  Favorite,
  FavoriteType,
  FavoriteCreateInput,
  FavoriteUpdateInput,
} from '@/services/favoritesService';

interface FavoritesState {
  // State
  favorites: Favorite[];
  favoriteIds: Set<string>; // Fast lookup: "entityType:entityId"
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;

  // Computed getters
  getFavoritesByType: (entityType: FavoriteType) => Favorite[];
  isFavorited: (entityType: FavoriteType, entityId: string) => boolean;
  getFavoriteId: (entityType: FavoriteType, entityId: string) => string | null;
  getTotalCount: () => number;
  getCountByType: (entityType: FavoriteType) => number;

  // Actions
  fetchFavorites: (params?: { entityType?: FavoriteType; limit?: number; offset?: number }) => Promise<void>;
  addFavorite: (data: FavoriteCreateInput) => Promise<Favorite | null>;
  removeFavorite: (id: string) => Promise<boolean>;
  removeFavoriteByEntity: (entityType: FavoriteType, entityId: string) => Promise<boolean>;
  updateFavorite: (id: string, updates: FavoriteUpdateInput) => Promise<Favorite | null>;
  toggleFavorite: (entityType: FavoriteType, entityId: string, entityData?: any) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const createFavoriteKey = (entityType: FavoriteType, entityId: string): string => {
  return `${entityType}:${entityId}`;
};

export const useFavoritesStore = create<FavoritesState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        favorites: [],
        favoriteIds: new Set(),
        totalCount: 0,
        isLoading: false,
        error: null,
        lastFetched: null,

        // Computed getters
        getFavoritesByType: (entityType: FavoriteType) => {
          return get().favorites.filter((fav) => fav.entityType === entityType);
        },

        isFavorited: (entityType: FavoriteType, entityId: string) => {
          const key = createFavoriteKey(entityType, entityId);
          return get().favoriteIds.has(key);
        },

        getFavoriteId: (entityType: FavoriteType, entityId: string) => {
          const favorite = get().favorites.find(
            (fav) => fav.entityType === entityType && fav.entityId === entityId
          );
          return favorite?.id ?? null;
        },

        getTotalCount: () => {
          return get().totalCount;
        },

        getCountByType: (entityType: FavoriteType) => {
          return get().favorites.filter((fav) => fav.entityType === entityType).length;
        },

        // Actions
        fetchFavorites: async (params = {}) => {
          set({ isLoading: true, error: null });
          try {
            const response = await favoritesService.getFavorites(params) as any;

            // Handle different response structures
            let favoritesList = [];
            if (response?.data?.favorites) {
              favoritesList = response.data.favorites;
            } else if (response?.favorites) {
              favoritesList = response.favorites;
            } else if (Array.isArray(response)) {
              favoritesList = response;
            } else if (response?.data && Array.isArray(response.data)) {
              favoritesList = response.data;
            }

            // Build favoriteIds Set for fast lookup
            const favoriteIds = new Set<string>(
              favoritesList.map((fav: Favorite) =>
                createFavoriteKey(fav.entityType, fav.entityId)
              )
            );

            set({
              favorites: favoritesList,
              favoriteIds,
              totalCount: response?.total || response?.data?.total || favoritesList.length,
              isLoading: false,
              lastFetched: new Date(),
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch favorites';
            set({ error: errorMessage, isLoading: false });
            console.error('[FavoritesStore] Error fetching favorites:', error);
          }
        },

        addFavorite: async (data: FavoriteCreateInput) => {
          set({ isLoading: true, error: null });
          try {
            const favorite = await favoritesService.addFavorite(data);

            // Optimistic update
            const key = createFavoriteKey(favorite.entityType, favorite.entityId);
            const newFavoriteIds = new Set(get().favoriteIds);
            newFavoriteIds.add(key);

            set({
              favorites: [...get().favorites, favorite],
              favoriteIds: newFavoriteIds,
              totalCount: get().totalCount + 1,
              isLoading: false,
            });

            console.log('[FavoritesStore] Favorite added:', favorite);
            return favorite;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add favorite';
            set({ error: errorMessage, isLoading: false });
            console.error('[FavoritesStore] Error adding favorite:', error);
            return null;
          }
        },

        removeFavorite: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            await favoritesService.removeFavorite(id);

            // Find and remove the favorite
            const favorite = get().favorites.find((fav) => fav.id === id);
            if (favorite) {
              const key = createFavoriteKey(favorite.entityType, favorite.entityId);
              const newFavoriteIds = new Set(get().favoriteIds);
              newFavoriteIds.delete(key);

              set({
                favorites: get().favorites.filter((fav) => fav.id !== id),
                favoriteIds: newFavoriteIds,
                totalCount: Math.max(0, get().totalCount - 1),
                isLoading: false,
              });
            } else {
              set({ isLoading: false });
            }

            console.log('[FavoritesStore] Favorite removed:', id);
            return true;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to remove favorite';
            set({ error: errorMessage, isLoading: false });
            console.error('[FavoritesStore] Error removing favorite:', error);
            return false;
          }
        },

        removeFavoriteByEntity: async (entityType: FavoriteType, entityId: string) => {
          const favoriteId = get().getFavoriteId(entityType, entityId);
          if (!favoriteId) {
            console.warn('[FavoritesStore] No favorite found for entity:', entityType, entityId);
            return false;
          }
          return get().removeFavorite(favoriteId);
        },

        updateFavorite: async (id: string, updates: FavoriteUpdateInput) => {
          set({ isLoading: true, error: null });
          try {
            const updatedFavorite = await favoritesService.updateFavorite(id, updates);

            set({
              favorites: get().favorites.map((fav) =>
                fav.id === id ? updatedFavorite : fav
              ),
              isLoading: false,
            });

            console.log('[FavoritesStore] Favorite updated:', updatedFavorite);
            return updatedFavorite;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update favorite';
            set({ error: errorMessage, isLoading: false });
            console.error('[FavoritesStore] Error updating favorite:', error);
            return null;
          }
        },

        toggleFavorite: async (entityType: FavoriteType, entityId: string, entityData?: any) => {
          const isFavorited = get().isFavorited(entityType, entityId);

          if (isFavorited) {
            // Remove favorite
            const success = await get().removeFavoriteByEntity(entityType, entityId);
            return !success; // Return false if removed
          } else {
            // Add favorite
            const favorite = await get().addFavorite({
              entityType,
              entityId,
              entityData,
            });
            return !!favorite; // Return true if added
          }
        },

        refreshFavorites: async () => {
          await get().fetchFavorites({ limit: 100 }); // Fetch all favorites
        },

        clearError: () => {
          set({ error: null });
        },

        reset: () => {
          set({
            favorites: [],
            favoriteIds: new Set(),
            totalCount: 0,
            isLoading: false,
            error: null,
            lastFetched: null,
          });
        },
      }),
      {
        name: 'favorites-storage',
        partialize: (state) => ({
          favorites: state.favorites,
          favoriteIds: Array.from(state.favoriteIds), // Convert Set to Array for serialization
          totalCount: state.totalCount,
          lastFetched: state.lastFetched,
        }),
        // Rehydrate Set from Array
        merge: (persistedState: any, currentState) => ({
          ...currentState,
          ...persistedState,
          favoriteIds: new Set(persistedState.favoriteIds || []),
        }),
      }
    ),
    { name: 'FavoritesStore' }
  )
);

export default useFavoritesStore;
