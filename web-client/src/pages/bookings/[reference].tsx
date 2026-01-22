import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Plane,
  Hotel,
  Calendar,
  MapPin,
  Clock,
  Check,
  X,
  AlertTriangle,
  CreditCard,
  Package,
  Ban,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/services/auth/AuthService';
import VoyageService from '@/services/api/VoyageService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

type BookingStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'FAILED';
type BookingType = 'FLIGHT' | 'HOTEL' | 'ACTIVITY' | 'PACKAGE' | 'TRANSFER';

interface BookingItem {
  type: string;
  itemId: string;
  itemData: any;
  quantity: number;
  price: number;
  currency: string;
}

interface BookingDetail {
  id: string;
  reference: string;
  type: BookingType;
  status: BookingStatus;
  totalAmount: number;
  currency: string;
  items: BookingItem[];
  metadata: Record<string, any>;
  paymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
}

export default function BookingDetailPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { reference } = useParams<{ reference: string }>();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Fetch booking details
  const fetchBooking = useCallback(async () => {
    if (!reference) return;

    try {
      setLoading(true);
      setError(null);

      const response = await VoyageService.getBookingDetails(reference, user?.id);
      setBooking(response.data);
    } catch (err) {
      console.error('[BookingDetailPage] Error fetching booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  }, [reference, user?.id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  // Handle cancel booking
  const handleCancelBooking = async () => {
    if (!booking) return;

    try {
      await VoyageService.cancelBooking(booking.reference, 'User requested cancellation', user?.id);
      setCancelConfirm(false);
      fetchBooking();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    }
  };

  // Copy reference to clipboard
  const copyReference = () => {
    if (booking) {
      navigator.clipboard.writeText(booking.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return { label: 'Confirmee', color: 'text-green-600 bg-green-100', icon: Check };
      case 'COMPLETED':
        return { label: 'Terminee', color: 'text-blue-600 bg-blue-100', icon: Check };
      case 'PENDING':
        return { label: 'En attente', color: 'text-yellow-600 bg-yellow-100', icon: Clock };
      case 'PENDING_PAYMENT':
        return { label: 'Paiement en attente', color: 'text-orange-600 bg-orange-100', icon: CreditCard };
      case 'DRAFT':
        return { label: 'Brouillon', color: 'text-gray-600 bg-gray-100', icon: Clock };
      case 'CANCELLED':
        return { label: 'Annulee', color: 'text-red-600 bg-red-100', icon: X };
      case 'FAILED':
        return { label: 'Echouee', color: 'text-red-600 bg-red-100', icon: AlertTriangle };
      default:
        return { label: status, color: 'text-gray-600 bg-gray-100', icon: Clock };
    }
  };

  const getTypeConfig = (type: BookingType) => {
    switch (type) {
      case 'FLIGHT':
        return { label: 'Vol', icon: Plane, color: 'text-blue-500' };
      case 'HOTEL':
        return { label: 'Hotel', icon: Hotel, color: 'text-purple-500' };
      case 'ACTIVITY':
        return { label: 'Activite', icon: Calendar, color: 'text-orange-500' };
      case 'PACKAGE':
        return { label: 'Package', icon: Package, color: 'text-green-500' };
      case 'TRANSFER':
        return { label: 'Transfert', icon: MapPin, color: 'text-cyan-500' };
      default:
        return { label: type, icon: Package, color: 'text-gray-500' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const renderItemDetails = (item: BookingItem) => {
    const data = item.itemData || {};

    if (item.type === 'FLIGHT') {
      const itinerary = data.itineraries?.[0];
      const segment = itinerary?.segments?.[0];
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-blue-500" />
            <span className="font-medium">
              {segment?.departure?.iataCode || 'N/A'} → {segment?.arrival?.iataCode || 'N/A'}
            </span>
          </div>
          {segment?.departure?.at && (
            <p className="text-sm text-gray-600">
              Depart: {new Date(segment.departure.at).toLocaleString('fr-FR')}
            </p>
          )}
          {data.validatingAirlineCodes && (
            <p className="text-sm text-gray-600">
              Compagnie: {data.validatingAirlineCodes.join(', ')}
            </p>
          )}
        </div>
      );
    }

    if (item.type === 'HOTEL') {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Hotel className="w-4 h-4 text-purple-500" />
            <span className="font-medium">{data.hotelName || data.name || 'Hotel'}</span>
          </div>
          {data.address?.cityName && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {data.address.cityName}
            </p>
          )}
          {data.checkInDate && (
            <p className="text-sm text-gray-600">
              Check-in: {new Date(data.checkInDate).toLocaleDateString('fr-FR')}
            </p>
          )}
          {data.checkOutDate && (
            <p className="text-sm text-gray-600">
              Check-out: {new Date(data.checkOutDate).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      );
    }

    if (item.type === 'ACTIVITY') {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="font-medium">{data.name || 'Activite'}</span>
          </div>
          {data.location?.name && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {data.location.name}
            </p>
          )}
          {data.duration && (
            <p className="text-sm text-gray-600">Duree: {data.duration}</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <span className="font-medium">{data.name || 'Element'}</span>
        {data.description && (
          <p className="text-sm text-gray-600">{data.description}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm p-12">
            <LoadingSpinner text="Chargement des details..." />
          </div>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <ErrorMessage
              message={error || 'Reservation non trouvee'}
              onRetry={fetchBooking}
            />
            <button
              onClick={() => navigate('/bookings')}
              className="mt-4 px-4 py-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            >
              Retour aux reservations
            </button>
          </div>
        </div>
      </main>
    );
  }

  const statusConfig = getStatusConfig(booking.status);
  const typeConfig = getTypeConfig(booking.type);
  const StatusIcon = statusConfig.icon;
  const TypeIcon = typeConfig.icon;
  const canCancel = ['DRAFT', 'PENDING_PAYMENT', 'PENDING', 'CONFIRMED'].includes(booking.status);

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/bookings')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Retour"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Reservation</h1>
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                <StatusIcon className="w-4 h-4" />
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-500">Ref:</span>
              <span className="font-mono font-medium">{booking.reference}</span>
              <button
                onClick={copyReference}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copier la reference"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-gray-50 ${typeConfig.color}`}>
                  <TypeIcon className="w-8 h-8" />
                </div>
                <div>
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                    {typeConfig.label}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">
                    Creee le {formatDate(booking.createdAt)}
                  </p>
                  {booking.confirmedAt && (
                    <p className="text-sm text-green-600">
                      Confirmee le {formatDate(booking.confirmedAt)}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">Total</span>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(booking.totalAmount, booking.currency)}
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Elements de la reservation ({booking.items.length})
            </h2>
            <div className="space-y-4">
              {booking.items.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">{renderItemDetails(item)}</div>
                    <div className="text-right ml-4">
                      <span className="text-sm text-gray-500">x{item.quantity}</span>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(item.price, item.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              {canCancel && (
                <button
                  onClick={() => setCancelConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Ban className="w-4 h-4" />
                  Annuler la reservation
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Imprimer
              </button>
            </div>
          </div>
        </div>

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
                <p className="font-medium text-gray-900">Ref: {booking.reference}</p>
                <p className="text-sm text-gray-600">
                  Montant: {formatCurrency(booking.totalAmount, booking.currency)}
                </p>
              </div>
              <p className="text-sm text-red-600 mb-6">
                Cette action peut etre irreversible selon les conditions d'annulation.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelConfirm(false)}
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
