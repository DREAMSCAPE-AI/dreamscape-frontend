import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  Filter,
  Trash2,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Heart,
  Plus,
  Edit,
  HeartOff,
  Hotel,
  Plane,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';
import { useAuth } from '@/services/auth/AuthService';
import { historyService } from '@/services/historyService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import type {
  HistoryEntry,
  HistoryActionType,
  HistoryEntityType,
  HistoryFilterParams,
} from '@/types/history';

// Icon mapping for action types
const actionIcons: Record<HistoryActionType, React.ElementType> = {
  VIEWED: Eye,
  SEARCHED: Search,
  FAVORITED: Heart,
  UNFAVORITED: HeartOff,
  CREATED: Plus,
  UPDATED: Edit,
  DELETED: Trash2,
};

// Icon mapping for entity types
const entityIcons: Record<HistoryEntityType, React.ElementType> = {
  hotel: Hotel,
  flight: Plane,
  destination: MapPin,
  booking: Calendar,
  activity: Activity,
  search: Search,
  favorite: Heart,
};

// Color mapping for action types
const actionColors: Record<HistoryActionType, string> = {
  VIEWED: 'bg-blue-100 text-blue-700',
  SEARCHED: 'bg-purple-100 text-purple-700',
  FAVORITED: 'bg-pink-100 text-pink-700',
  UNFAVORITED: 'bg-gray-100 text-gray-700',
  CREATED: 'bg-green-100 text-green-700',
  UPDATED: 'bg-yellow-100 text-yellow-700',
  DELETED: 'bg-red-100 text-red-700',
};

export default function HistoryPage() {
  const { t } = useTranslation('history');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  // Filters and pagination
  const [filters, setFilters] = useState<HistoryFilterParams>({
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Fetch history data
  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await historyService.getHistory(filters);
      setEntries(response.data.items);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  // Fetch history on mount and when filters change
  useEffect(() => {
    fetchHistory();
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (key: keyof HistoryFilterParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Clear specific filter
  const clearFilter = (key: keyof HistoryFilterParams) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return { ...newFilters, page: 1 };
    });
  };

  // Handle delete entry
  const handleDelete = async (id: string) => {
    try {
      await historyService.deleteEntry(id);
      setDeleteConfirm(null);
      fetchHistory(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    }
  };

  // Handle clear all history
  const handleClearAll = async () => {
    try {
      await historyService.clearHistory(filters.entityType);
      setClearConfirm(false);
      fetchHistory(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear history');
    }
  };

  // Handle pagination
  const goToPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Format timestamp
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('time.justNow');
    if (diffMins < 60) return t('time.minuteAgo', { count: diffMins });
    if (diffHours < 24) return t('time.hourAgo', { count: diffHours });
    if (diffDays < 7) return t('time.dayAgo', { count: diffDays });
    return date.toLocaleDateString();
  };

  // Get entity display name
  const getEntityName = (entry: HistoryEntry): string => {
    if (entry.metadata?.name) return entry.metadata.name;
    if (entry.metadata?.hotelName) return entry.metadata.hotelName;
    if (entry.metadata?.destinationName) return entry.metadata.destinationName;
    if (entry.metadata?.query) return `"${entry.metadata.query}"`;
    return entry.entityId;
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t('page.goBack')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('page.title')}</h1>
              <p className="text-gray-600 mt-1">{t('page.subtitle')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              disabled={entries.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              {t('page.clearAll')}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">{t('filters.title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Action Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('filters.actionType')}
              </label>
              <select
                value={filters.actionType || ''}
                onChange={(e) =>
                  e.target.value
                    ? handleFilterChange('actionType', e.target.value as HistoryActionType)
                    : clearFilter('actionType')
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">{t('filters.allActions')}</option>
                <option value="VIEWED">{t('actions.viewed')}</option>
                <option value="SEARCHED">{t('actions.searched')}</option>
                <option value="FAVORITED">{t('actions.favorited')}</option>
                <option value="UNFAVORITED">{t('actions.unfavorited')}</option>
                <option value="CREATED">{t('actions.created')}</option>
                <option value="UPDATED">{t('actions.updated')}</option>
                <option value="DELETED">{t('actions.deleted')}</option>
              </select>
            </div>

            {/* Entity Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('filters.category')}
              </label>
              <select
                value={filters.entityType || ''}
                onChange={(e) =>
                  e.target.value
                    ? handleFilterChange('entityType', e.target.value as HistoryEntityType)
                    : clearFilter('entityType')
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">{t('filters.allCategories')}</option>
                <option value="hotel">{t('categories.hotels')}</option>
                <option value="flight">{t('categories.flights')}</option>
                <option value="destination">{t('categories.destinations')}</option>
                <option value="booking">{t('categories.bookings')}</option>
                <option value="activity">{t('categories.activities')}</option>
                <option value="search">{t('categories.searches')}</option>
                <option value="favorite">{t('categories.favorites')}</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.actionType || filters.entityType) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.actionType && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  Action: {filters.actionType}
                  <button
                    onClick={() => clearFilter('actionType')}
                    className="hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.entityType && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  Category: {filters.entityType}
                  <button
                    onClick={() => clearFilter('entityType')}
                    className="hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <LoadingSpinner text={t('loading')} />
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <ErrorMessage message={error} onRetry={fetchHistory} />
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4">
              <Clock className="w-16 h-16 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('emptyState.title')}</h3>
            <p className="text-gray-600">
              {filters.actionType || filters.entityType
                ? t('emptyState.noMatch')
                : t('emptyState.description')}
            </p>
          </div>
        ) : (
          <>
            {/* History List */}
            <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
              {entries.map((entry) => {
                const ActionIcon = actionIcons[entry.actionType];
                const EntityIcon = entityIcons[entry.entityType];
                const actionColor = actionColors[entry.actionType];

                return (
                  <div
                    key={entry.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg ${actionColor} flex-shrink-0`}>
                        <ActionIcon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {entry.actionType.charAt(0) + entry.actionType.slice(1).toLowerCase()}{' '}
                              <span className="text-gray-600">
                                {entry.entityType}
                              </span>
                            </p>
                            <p className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                              <EntityIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{getEntityName(entry)}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(entry.createdAt)}
                            </p>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteConfirm(entry.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            aria-label={t('deleteEntry')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  {t('pagination.showing', {
                    from: (pagination.page - 1) * pagination.limit + 1,
                    to: Math.min(pagination.page * pagination.limit, pagination.total),
                    total: pagination.total
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={!pagination.hasPrevious}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t('pagination.previous')}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">
                    {t('pagination.page', { current: pagination.page, total: pagination.totalPages })}
                  </span>
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t('pagination.next')}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('deleteConfirm.title')}</h3>
              </div>
              <p className="text-gray-600 mb-6">
                {t('deleteConfirm.message')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('deleteConfirm.cancel')}
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('deleteConfirm.delete')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear All Confirmation Modal */}
        {clearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('clearConfirm.title')}</h3>
              </div>
              <p className="text-gray-600 mb-6">
                {filters.entityType
                  ? t('clearConfirm.messageFiltered', { type: filters.entityType })
                  : t('clearConfirm.message')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setClearConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('clearConfirm.cancel')}
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('clearConfirm.clearAll')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
