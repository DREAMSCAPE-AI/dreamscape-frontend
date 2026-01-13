/**
 * User History Types
 * Based on User History API (DR-83)
 */

/**
 * Valid action types for history entries
 */
export type HistoryActionType =
  | 'CREATED'
  | 'VIEWED'
  | 'UPDATED'
  | 'DELETED'
  | 'SEARCHED'
  | 'FAVORITED'
  | 'UNFAVORITED';

/**
 * Valid entity types for history entries
 */
export type HistoryEntityType =
  | 'booking'
  | 'search'
  | 'favorite'
  | 'destination'
  | 'hotel'
  | 'activity'
  | 'flight';

/**
 * Flexible metadata structure for additional context
 */
export interface HistoryMetadata {
  [key: string]: any;
}

/**
 * Individual history entry
 */
export interface HistoryEntry {
  id: string;
  userId: string;
  actionType: HistoryActionType;
  entityType: HistoryEntityType;
  entityId: string;
  metadata?: HistoryMetadata;
  createdAt: string;
}

/**
 * Pagination metadata
 */
export interface HistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Paginated history response
 */
export interface HistoryResponse {
  success: boolean;
  data: {
    items: HistoryEntry[];
    pagination: HistoryPagination;
  };
}

/**
 * History statistics response
 */
export interface HistoryStats {
  totalCount: number;
  byActionType: Partial<Record<HistoryActionType, number>>;
  byEntityType: Partial<Record<HistoryEntityType, number>>;
  mostRecentActivity: string | null;
}

/**
 * History statistics API response
 */
export interface HistoryStatsResponse {
  success: boolean;
  data: HistoryStats;
}

/**
 * History filter parameters
 */
export interface HistoryFilterParams {
  page?: number;
  limit?: number;
  actionType?: HistoryActionType;
  entityType?: HistoryEntityType;
  entityId?: string;
}

/**
 * Request body for creating a history entry
 */
export interface CreateHistoryEntry {
  actionType: HistoryActionType;
  entityType: HistoryEntityType;
  entityId: string;
  metadata?: HistoryMetadata;
}

/**
 * Delete history entry response
 */
export interface DeleteHistoryResponse {
  success: boolean;
  message: string;
  data: null;
}

/**
 * Clear history response
 */
export interface ClearHistoryResponse {
  success: boolean;
  message: string;
  data: {
    deletedCount: number;
  };
}
