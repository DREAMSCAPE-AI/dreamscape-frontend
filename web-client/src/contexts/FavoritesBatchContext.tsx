/**
 * Favorites Batch Context
 *
 * Provides batching functionality for favorite status checks.
 * Instead of making individual API calls for each favorite check,
 * this context collects multiple checks and makes a single batch request.
 */

import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import FavoritesService, { FavoriteType } from '@/services/api/FavoritesService';

interface BatchItem {
  entityType: FavoriteType;
  entityId: string;
}

interface BatchResult {
  isFavorited: boolean;
  favorite: { id: string; createdAt: string } | null;
}

type BatchCallback = (result: BatchResult) => void;

interface FavoritesBatchContextType {
  checkFavorite: (entityType: FavoriteType, entityId: string, callback: BatchCallback) => void;
}

const FavoritesBatchContext = createContext<FavoritesBatchContextType | undefined>(undefined);

interface FavoritesBatchProviderProps {
  children: React.ReactNode;
  batchDelay?: number; // Milliseconds to wait before batching
}

export const FavoritesBatchProvider: React.FC<FavoritesBatchProviderProps> = ({
  children,
  batchDelay = 100 // Increased to 100ms to reduce frequency
}) => {
  const batchQueue = useRef<Map<string, BatchCallback[]>>(new Map());
  const batchTimer = useRef<NodeJS.Timeout | null>(null);
  const isProcessing = useRef(false);
  const processedKeys = useRef<Set<string>>(new Set()); // Track already processed items
  const MAX_BATCH_SIZE = 50; // Limit batch size to prevent performance issues

  const processBatch = useCallback(async () => {
    if (isProcessing.current || batchQueue.current.size === 0) return;

    isProcessing.current = true;
    const currentBatch = new Map(batchQueue.current);
    batchQueue.current.clear();

    try {
      // Convert batch queue to items array
      const items: BatchItem[] = Array.from(currentBatch.keys()).map(key => {
        const [entityType, entityId] = key.split(':');
        return { entityType: entityType as FavoriteType, entityId };
      });

      // Limit batch size to prevent performance issues
      const limitedItems = items.slice(0, MAX_BATCH_SIZE);
      
      if (limitedItems.length < items.length) {
        console.warn(`[FavoritesBatch] Batch size limited to ${MAX_BATCH_SIZE} items (was ${items.length})`);
      }

      console.log('[FavoritesBatch] Processing batch of', limitedItems.length, 'items');

      // Make single batch API call
      const response = await FavoritesService.checkFavoritesBatch(limitedItems);

      // Distribute results to callbacks and mark as processed
      response.results.forEach(result => {
        const key = `${result.entityType}:${result.entityId}`;
        const callbacks = currentBatch.get(key);
        if (callbacks) {
          callbacks.forEach(callback => {
            callback({
              isFavorited: result.isFavorited,
              favorite: result.favorite
            });
          });
          // Mark this item as processed
          processedKeys.current.add(key);
        }
      });

      console.log('[FavoritesBatch] Batch processed successfully');
    } catch (error) {
      console.error('[FavoritesBatch] Error processing batch:', error);

      // Call callbacks with error state
      currentBatch.forEach(callbacks => {
        callbacks.forEach(callback => {
          callback({ isFavorited: false, favorite: null });
        });
      });
    } finally {
      isProcessing.current = false;
    }
  }, []);

  const checkFavorite = useCallback((
    entityType: FavoriteType,
    entityId: string,
    callback: BatchCallback
  ) => {
    const key = `${entityType}:${entityId}`;

    // If already processed, call callback immediately with cached result
    if (processedKeys.current.has(key)) {
      // Don't re-check, just skip (component will keep its last known state)
      return;
    }

    // Check if already in queue to avoid duplicates
    const existing = batchQueue.current.get(key);
    if (existing) {
      // Already queued, just add the callback
      existing.push(callback);
      return;
    }

    // Add to batch queue
    batchQueue.current.set(key, [callback]);

    // Clear existing timer
    if (batchTimer.current) {
      clearTimeout(batchTimer.current);
    }

    // Set new timer to process batch
    batchTimer.current = setTimeout(() => {
      processBatch();
    }, batchDelay);
  }, [batchDelay, processBatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
      }
    };
  }, []);

  return (
    <FavoritesBatchContext.Provider value={{ checkFavorite }}>
      {children}
    </FavoritesBatchContext.Provider>
  );
};

export const useFavoritesBatch = () => {
  const context = useContext(FavoritesBatchContext);
  if (!context) {
    throw new Error('useFavoritesBatch must be used within a FavoritesBatchProvider');
  }
  return context;
};
