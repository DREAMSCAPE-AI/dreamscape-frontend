import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Package,
} from 'lucide-react';
import { useAuth } from '@/services/auth/AuthService';
import VoyageService from '@/services/voyage/VoyageService';
import { BookingCard, type Booking, type BookingStatus, type BookingType } from '@/components/bookings';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

interface BookingStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  totalSpent: number;
  currency: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function BookingsPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<Booking | null>(null);

  // Filters and pagination
  const [filters, setFilters] = useState({
    status: '' as string,
    type: '' as string,
    search: '',
    sortBy: 'createdAt' as 'createdAt' | 'updatedAt' | 'totalAmount' | 'status',
    sortOrder: 'desc' as 'asc' | 'desc',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[BookingsPage] Fetching bookings for user:', user);
      console.log('[BookingsPage] User ID:', user?.id);

      const response = await VoyageService.getUserBookings({
        ...filters,
        status: filters.status || undefined,
        type: filters.type || undefined,
        search: filters.search || undefined,
        userId: user?.id,
      });

      console.log('[BookingsPage] API Response:', response);

      setBookings(response.data);
      setPagination(response.meta.pagination);
    } catch (err) {
      console.error('[BookingsPage] Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [filters, user?.id]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await VoyageService.getBookingStats(user?.id);
      setStats(response.data);
    } catch (err) {
      console.error('[BookingsPage] Error fetching stats:', err);
    }
  }, [user?.id]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle filter change
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Reset to first page when filters change
    }));
  };

  // Clear specific filter
  const clearFilter = (key: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: '',
      page: 1,
    }));
  };

  // Handle view details
  const handleViewDetails = (booking: Booking) => {
    navigate(`/bookings/${booking.reference}`);
  };

  // Handle cancel booking
  const handleCancelBooking = async () => {
    if (!cancelConfirm) return;

    try {
      await VoyageService.cancelBooking(cancelConfirm.reference, 'User requested cancellation', user?.id);
      setCancelConfirm(null);
      fetchBookings();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const statusOptions: { value: BookingStatus | ''; label: string }[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'CONFIRMED', label: 'Confirmees' },
    { value: 'COMPLETED', label: 'Terminees' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'PENDING_PAYMENT', label: 'Paiement en attente' },
    { value: 'CANCELLED', label: 'Annulees' },
    { value: 'FAILED', label: 'Echouees' },
    { value: 'DRAFT', label: 'Brouillons' },
  ];

  const typeOptions: { value: BookingType | ''; label: string }[] = [
    { value: '', label: 'Tous les types' },
    { value: 'FLIGHT', label: 'Vols' },
    { value: 'HOTEL', label: 'Hotels' },
    { value: 'ACTIVITY', label: 'Activites' },
    { value: 'PACKAGE', label: 'Packages' },
    { value: 'TRANSFER', label: 'Transferts' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date de creation' },
    { value: 'updatedAt', label: 'Derniere modification' },
    { value: 'totalAmount', label: 'Montant' },
    { value: 'status', label: 'Statut' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 pt-20 md:pt-24">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Mes Reservations</h1>
              <p className="text-xs md:text-sm lg:text-base text-gray-600 mt-0.5 md:mt-1">Gerez et suivez vos reservations</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-gray-500">Total</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <Package className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-gray-500">Confirmees</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {(stats.byStatus['CONFIRMED'] || 0) + (stats.byStatus['COMPLETED'] || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-orange-100 rounded-lg flex-shrink-0">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-gray-500">En cours</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {(stats.byStatus['PENDING'] || 0) + (stats.byStatus['PENDING_PAYMENT'] || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-gray-500 truncate">Total depense</p>
                  <p className="text-base md:text-lg lg:text-xl font-bold text-gray-900 truncate">
                    {formatCurrency(stats.totalSpent, stats.currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Filter className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            <h2 className="font-semibold text-sm md:text-base text-gray-900">Filtres</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par reference..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 md:px-4 py-2.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 md:px-4 py-2.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="flex-1 px-3 md:px-4 py-2.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2.5 md:py-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                title={filters.sortOrder === 'asc' ? 'Croissant' : 'Decroissant'}
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.status || filters.type || filters.search) && (
            <div className="flex flex-wrap gap-2 mt-3 md:mt-4">
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2.5 md:px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs md:text-sm">
                  Recherche: {filters.search}
                  <button
                    onClick={() => clearFilter('search')}
                    className="hover:bg-orange-200 rounded-full p-0.5 min-h-[24px] min-w-[24px] flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center gap-1 px-2.5 md:px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs md:text-sm">
                  Statut: {statusOptions.find(o => o.value === filters.status)?.label}
                  <button
                    onClick={() => clearFilter('status')}
                    className="hover:bg-orange-200 rounded-full p-0.5 min-h-[24px] min-w-[24px] flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.type && (
                <span className="inline-flex items-center gap-1 px-2.5 md:px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs md:text-sm">
                  Type: {typeOptions.find(o => o.value === filters.type)?.label}
                  <button
                    onClick={() => clearFilter('type')}
                    className="hover:bg-orange-200 rounded-full p-0.5 min-h-[24px] min-w-[24px] flex items-center justify-center"
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
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
            <LoadingSpinner text="Chargement de vos reservations..." />
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <ErrorMessage message={error} onRetry={fetchBookings} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 text-center">
            <div className="flex justify-center mb-3 md:mb-4">
              <Calendar className="w-12 h-12 md:w-16 md:h-16 text-gray-300" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Aucune reservation</h3>
            <p className="text-sm md:text-base text-gray-600 mb-4">
              {filters.status || filters.type || filters.search
                ? 'Aucune reservation ne correspond a vos filtres. Essayez de les ajuster.'
                : 'Vous n\'avez pas encore de reservations. Commencez a explorer!'}
            </p>
            <button
              onClick={() => navigate('/flights')}
              className="px-6 py-2.5 md:py-3 min-h-[44px] text-sm md:text-base bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Explorer les vols
            </button>
          </div>
        ) : (
          <>
            {/* Bookings List */}
            <div className="space-y-3 md:space-y-4">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  onCancel={(b) => setCancelConfirm(b)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 md:mt-6">
                <p className="text-xs md:text-sm text-gray-600 text-center sm:text-left">
                  Affichage {(pagination.page - 1) * pagination.limit + 1} a{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.totalCount)} sur{' '}
                  {pagination.totalCount} reservations
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFilterChange('page', pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="p-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    aria-label="Page precedente"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                    Page {pagination.page} sur {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handleFilterChange('page', pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="p-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    aria-label="Page suivante"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Cancel Confirmation Modal */}
        {cancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Annuler la reservation</h3>
              </div>
              <p className="text-gray-600 mb-2">
                Etes-vous sur de vouloir annuler cette reservation ?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="font-medium text-gray-900">Ref: {cancelConfirm.reference}</p>
                <p className="text-sm text-gray-600">
                  Montant: {formatCurrency(cancelConfirm.totalAmount, cancelConfirm.currency)}
                </p>
              </div>
              <p className="text-sm text-red-600 mb-6">
                Cette action peut etre irreversible selon les conditions d'annulation.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirmer l'annulation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
