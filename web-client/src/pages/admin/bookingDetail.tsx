import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, XCircle, Settings, Mail, CheckCircle, Clock, Ban } from 'lucide-react';
import { useAdminBooking, useCancelBooking, useModifyBooking, useResendEmail } from '@/hooks/useAdminBookings';
import type { BookingStatus, BookingType } from '@/types/admin';

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<BookingStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  PENDING: 'bg-orange-100 text-orange-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
  FAILED: 'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  DRAFT: 'Brouillon',
  PENDING_PAYMENT: 'En attente paiement',
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  FAILED: 'Échoué',
};

const TYPE_LABELS: Record<BookingType, string> = {
  FLIGHT: '✈️ Vol',
  HOTEL: '🏨 Hôtel',
  ACTIVITY: '🎯 Activité',
  PACKAGE: '📦 Package',
  TRANSFER: '🚗 Transfer',
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SUCCEEDED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  CANCELED: 'bg-gray-100 text-gray-500',
  REFUNDED: 'bg-purple-100 text-purple-700',
};

const formatDateTime = (date: string | null) =>
  date ? new Date(date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const formatAmount = (amount: number, currency = 'EUR') =>
  amount.toLocaleString('fr-FR', { style: 'currency', currency });

// ─── InfoRow ─────────────────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="flex justify-between items-start gap-2">
    <dt className="text-xs font-medium text-gray-500 flex-shrink-0">{label}</dt>
    <dd className="text-sm text-gray-900 text-right">{value || '—'}</dd>
  </div>
);

// ─── Flight Details ───────────────────────────────────────────────────────────

const FlightDetails = ({ data }: { data: Record<string, any> }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Départ</p>
      <InfoRow label="Ville" value={data.from || data.origin} />
      <InfoRow label="Aéroport" value={data.fromAirport || data.departureAirport} />
      <InfoRow label="Date/heure" value={data.departureDate || data.departure} />
    </div>
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Arrivée</p>
      <InfoRow label="Ville" value={data.to || data.destination} />
      <InfoRow label="Aéroport" value={data.toAirport || data.arrivalAirport} />
      <InfoRow label="Date/heure" value={data.arrivalDate || data.arrival} />
    </div>
    <div className="space-y-2">
      <InfoRow label="Compagnie" value={data.airline || data.carrier} />
      <InfoRow label="N° vol" value={data.flightNumber || data.flight} />
      <InfoRow label="Classe" value={data.class || data.cabin} />
      <InfoRow label="Passagers" value={data.passengers ? String(data.passengers) : undefined} />
    </div>
  </div>
);

// ─── Hotel Details ────────────────────────────────────────────────────────────

const HotelDetails = ({ data }: { data: Record<string, any> }) => (
  <div className="space-y-2">
    <InfoRow label="Hôtel" value={data.hotel || data.name} />
    <InfoRow label="Adresse" value={data.address || data.city} />
    <InfoRow label="Étoiles" value={data.stars ? '⭐'.repeat(data.stars) : undefined} />
    <InfoRow label="Check-in" value={data.checkIn || data.checkin} />
    <InfoRow label="Check-out" value={data.checkOut || data.checkout} />
    <InfoRow label="Type chambre" value={data.roomType || data.room} />
    <InfoRow label="Nuits" value={data.nights ? String(data.nights) : undefined} />
  </div>
);

// ─── Generic Data ─────────────────────────────────────────────────────────────

const GenericData = ({ data }: { data: Record<string, any> }) => (
  <pre className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 overflow-auto max-h-48">
    {JSON.stringify(data, null, 2)}
  </pre>
);

// ─── Cancel Modal ────────────────────────────────────────────────────────────

const CancelModal = ({
  reference,
  onClose,
  onConfirm,
  loading,
}: {
  reference: string;
  onClose: () => void;
  onConfirm: (refund: boolean, reason: string) => void;
  loading: boolean;
}) => {
  const [refund, setRefund] = useState(false);
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Annuler la réservation</h2>
        <p className="text-sm text-gray-600 mb-4">Réservation <strong>{reference}</strong></p>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={refund}
              onChange={(e) => setRefund(e.target.checked)}
              className="rounded border-gray-300"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Rembourser le client</p>
              <p className="text-xs text-gray-500">Déclenche un remboursement Stripe automatique</p>
            </div>
          </label>
          <div>
            <label className="text-xs font-medium text-gray-500">Raison (optionnelle)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Ex: demande client, erreur..."
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Annuler</button>
          <button
            onClick={() => onConfirm(refund, reason)}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Annulation...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modify Modal ─────────────────────────────────────────────────────────────

const ModifyModal = ({
  totalAmount,
  currency,
  onClose,
  onConfirm,
  loading,
}: {
  totalAmount: number;
  currency: string;
  onClose: () => void;
  onConfirm: (totalAmount?: number, notes?: string) => void;
  loading: boolean;
}) => {
  const [amount, setAmount] = useState(String(totalAmount));
  const [notes, setNotes] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Modifier la réservation</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Montant ({currency})</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Notes admin</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Annuler</button>
          <button
            onClick={() => onConfirm(amount ? parseFloat(amount) : undefined, notes || undefined)}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Modification...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminBookingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);

  const { data: booking, isLoading, error } = useAdminBooking(id ?? null);
  const cancelMutation = useCancelBooking();
  const modifyMutation = useModifyBooking();
  const resendMutation = useResendEmail();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-40 bg-gray-200 rounded" />
            <div className="h-40 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-medium">Réservation introuvable</p>
          <button onClick={() => navigate('/admin/bookings')} className="mt-3 text-sm text-red-600 hover:underline">
            Retour aux réservations
          </button>
        </div>
      </div>
    );
  }

  const handleCancel = (refund: boolean, reason: string) => {
    cancelMutation.mutate(
      { id: booking.id, data: { refund, reason } },
      {
        onSuccess: () => { setShowCancelModal(false); toast.success('Réservation annulée' + (refund ? ' + remboursement initié' : '')); },
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Erreur lors de l\'annulation'),
      }
    );
  };

  const handleModify = (totalAmount?: number, notes?: string) => {
    modifyMutation.mutate(
      { id: booking.id, data: { totalAmount, notes } },
      {
        onSuccess: () => { setShowModifyModal(false); toast.success('Réservation modifiée'); },
        onError: () => toast.error('Erreur lors de la modification'),
      }
    );
  };

  const handleResendEmail = () => {
    resendMutation.mutate(booking.id, {
      onSuccess: () => toast.success('Email de confirmation envoyé'),
      onError: (err: any) => {
        const msg = err?.response?.data?.message;
        if (msg?.includes('SENDGRID_API_KEY')) {
          toast.error('SendGrid non configuré — ajoutez SENDGRID_API_KEY dans les variables d\'environnement du serveur.');
        } else {
          toast.error('Erreur lors de l\'envoi de l\'email');
        }
      },
    });
  };

  const bookingData = booking.data as Record<string, any> ?? {};

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/bookings')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux réservations
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900 font-mono">{booking.reference}</h1>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[booking.status]}`}>
                {STATUS_LABELS[booking.status]}
              </span>
              <span className="text-sm text-gray-500">{TYPE_LABELS[booking.type]}</span>
            </div>
            <p className="text-sm text-gray-500">Créée le {formatDateTime(booking.createdAt)}</p>
            {booking.destination && (
              <p className="text-sm text-gray-700 mt-1">📍 {booking.destination}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResendEmail}
              disabled={resendMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              {resendMutation.isPending ? 'Envoi...' : 'Renvoyer email'}
            </button>
            <button
              onClick={() => setShowModifyModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Modifier
            </button>
            {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Utilisateur</h2>
          {booking.user ? (
            <dl className="space-y-2">
              <InfoRow
                label="Nom"
                value={[booking.user.firstName, booking.user.lastName].filter(Boolean).join(' ') || '—'}
              />
              <InfoRow label="Email" value={booking.user.email} />
              <div className="flex justify-between items-center">
                <dt className="text-xs font-medium text-gray-500">Profil</dt>
                <Link
                  to={`/admin/users/${booking.userId}`}
                  className="text-xs text-orange-500 hover:text-orange-700 font-medium"
                >
                  Voir le profil →
                </Link>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-400">Utilisateur introuvable</p>
          )}
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Paiement</h2>
          <dl className="space-y-2">
            <InfoRow label="Montant" value={formatAmount(booking.totalAmount, booking.currency)} />
            <InfoRow label="Devise" value={booking.currency} />
            {booking.payment ? (
              <>
                <InfoRow label="Transaction ID" value={booking.payment.paymentIntentId} />
                <div className="flex justify-between items-center">
                  <dt className="text-xs font-medium text-gray-500">Statut</dt>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_STYLES[booking.payment.status] || 'bg-gray-100 text-gray-600'}`}>
                    {booking.payment.status}
                  </span>
                </div>
                <InfoRow label="Méthode" value={booking.payment.paymentMethod} />
                {booking.payment.failureReason && (
                  <InfoRow label="Raison échec" value={booking.payment.failureReason} />
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">Aucune transaction trouvée</p>
            )}
          </dl>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
          Détails — {TYPE_LABELS[booking.type]}
        </h2>
        {booking.type === 'FLIGHT' ? (
          <FlightDetails data={bookingData} />
        ) : booking.type === 'HOTEL' ? (
          <HotelDetails data={bookingData} />
        ) : (
          <GenericData data={bookingData} />
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Timeline</h2>
        <div className="space-y-3">
          <TimelineItem
            icon={<Clock className="w-4 h-4 text-gray-500" />}
            bg="bg-gray-50"
            label="Réservation créée"
            date={booking.createdAt}
          />
          {booking.confirmedAt && (
            <TimelineItem
              icon={<CheckCircle className="w-4 h-4 text-green-500" />}
              bg="bg-green-50"
              label="Paiement confirmé"
              date={booking.confirmedAt}
            />
          )}
          {booking.payment?.confirmedAt && (
            <TimelineItem
              icon={<CheckCircle className="w-4 h-4 text-blue-500" />}
              bg="bg-blue-50"
              label="Confirmation envoyée"
              date={booking.payment.confirmedAt}
            />
          )}
          {booking.payment?.refundedAt && (
            <TimelineItem
              icon={<CheckCircle className="w-4 h-4 text-purple-500" />}
              bg="bg-purple-50"
              label="Remboursement effectué"
              date={booking.payment.refundedAt}
            />
          )}
          {booking.status === 'CANCELLED' && (
            <TimelineItem
              icon={<Ban className="w-4 h-4 text-red-500" />}
              bg="bg-red-50"
              label="Réservation annulée"
              date={booking.updatedAt}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showCancelModal && (
        <CancelModal
          reference={booking.reference}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancel}
          loading={cancelMutation.isPending}
        />
      )}
      {showModifyModal && (
        <ModifyModal
          totalAmount={booking.totalAmount}
          currency={booking.currency}
          onClose={() => setShowModifyModal(false)}
          onConfirm={handleModify}
          loading={modifyMutation.isPending}
        />
      )}
    </div>
  );
};

// ─── TimelineItem ─────────────────────────────────────────────────────────────

const TimelineItem = ({
  icon, bg, label, date,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  date: string | null;
}) => (
  <div className="flex items-center gap-3">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
      {icon}
    </div>
    <div className="flex-1 flex items-center justify-between">
      <p className="text-sm text-gray-900">{label}</p>
      <p className="text-xs text-gray-400">{date ? new Date(date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</p>
    </div>
  </div>
);

export default AdminBookingDetailPage;
