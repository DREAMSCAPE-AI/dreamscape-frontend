/**
 * Sort options for flight results
 */
export type SortOption =
  | 'departure-asc'    // Earliest departure first (DEFAULT)
  | 'departure-desc'   // Latest departure first
  | 'price-asc'        // Lowest price first
  | 'price-desc'       // Highest price first
  | 'duration-asc'     // Shortest duration first
  | 'duration-desc';   // Longest duration first

/**
 * Filter state for flight results
 */
export interface FilterState {
  priceMin?: number;              // Minimum price filter (undefined = no minimum)
  priceMax?: number;              // Maximum price filter (undefined = no maximum)
  stops: number[];                // Selected stop counts: [0] = non-stop, [1] = 1 stop, [2] = 2+ stops
  departureTimeRanges: string[];  // Selected time ranges: ['early', 'morning', 'afternoon', 'evening']
}

/**
 * Pagination state for flight results
 */
export interface PaginationState {
  currentPage: number;  // 0-indexed page number
  pageSize: number;     // Number of results per page (default: 10)
  hasMore: boolean;     // Whether there are more results to load
}
