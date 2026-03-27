import { useState } from 'react';
import { useAdminBookings, useAdminBooking, useUpdateBookingStatus, useBulkUpdateBookingStatus } from '@/hooks/useAdminBookings';
import type { AdminBooking, BookingStatus, BookingType } from '@/types/admin';

const STATUS_STYLES: Record<BookingStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  PENDING: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  FAILED: 'bg-rose-100 text-rose-700',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  DRAFT: 'Brouillon',
  PENDING_PAYMENT: 'Attente paiement',
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  FAILED: 'Echoué',
};

const TYPE_STYLES: Record<BookingType, string> = {
  FLIGHT: 'bg-sky-100 text-sky-700',
  HOTEL: 'bg-indigo-100 text-indigo-700',
  ACTIVITY: 'bg-orange-100 text-orange-700',
  PACKAGE: 'bg-purple-100 text-purple-700',
  TRANSFER: 'bg-teal-100 text-teal-700',
};

const TYPE_LABELS: Record<BookingType, string> = {
  FLIGHT: '✈️ Vol',
  HOTEL: '🏨 Hôtel',
  ACTIVITY: '🎯 Activité',
  PACKAGE: '📦 Package',
  TRANSFER: '🚗 Transfert',
};

const ALL_STATUSES: BookingStatus[] = ['DRAFT', 'PENDING_PAYMENT', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'FAILED'];
const ALL_TYPES: BookingType[] = ['FLIGHT', 'HOTEL', 'ACTIVITY', 'PACKAGE', 'TRANSFER'];

const formatDate = (date: string | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (amount: number, currency = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);

const getUserName = (user: AdminBooking['user']) => {
  if (!user) return '—';
  if (user.firstName || user.lastName) return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return user.email;
};

// ---- Detail Modal ----
const BookingDetailModal = ({ bookingId, onClose }: { bookingId: string; onClose: () => void }) => {
  const { data: booking, isLoading } = useAdminBooking(bookingId);
  const updateStatus = useUpdateBookingStatus();
  const [pendingStatus, setPendingStatus] = useState('');
  const [confirming, setConfirming] = useState(false);

  const handleStatusChange = async () => {
    if (!pendingStatus || !booking) return;
    await updateStatus.mutateAsync({ id: booking.id, status: pendingStatus });
    setConfirming(false);
    setPendingStatus('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Détail de la commande</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
        </div>

        {isLoading && <div className="p-8 text-center text-gray-400">Chargement...</div>}

        {booking && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Référence</p>
                <p className="font-mono font-bold text-gray-900">{booking.reference}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Type</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[booking.type]}`}>
                  {TYPE_LABELS[booking.type]}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Statut</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[booking.status]}`}>
                  {STATUS_LABELS[booking.status]}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Montant</p>
                <p className="font-bold text-gray-900">{formatCurrency(booking.totalAmount, booking.currency)}</p>
              </div>
            </div>

            {booking.user && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Client</p>
                <p className="font-medium text-gray-900">{getUserName(booking.user)}</p>
                <p className="text-sm text-gray-500">{booking.user.email}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Créé le</p>
                <p className="text-sm text-gray-700">{formatDate(booking.createdAt)}</p>
              </div>
              {booking.confirmedAt && (
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Confirmé le</p>
                  <p className="text-sm text-gray-700">{formatDate(booking.confirmedAt)}</p>
                </div>
              )}
            </div>

            {booking.payment && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Paiement associé</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Statut</p>
                    <p className="text-sm font-medium">{booking.payment.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Méthode</p>
                    <p className="text-sm font-medium">{booking.payment.paymentMethod || '—'}</p>
                  </div>
                  {booking.payment.failureReason && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400">Raison d'échec</p>
                      <p className="text-sm text-red-600">{booking.payment.failureReason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {booking.data && Object.keys(booking.data).length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Données réservation</p>
                <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 overflow-x-auto">
                  {JSON.stringify(booking.data, null, 2)}
                </pre>
              </div>
            )}

            {/* Changer statut */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Forcer le statut</p>
              {!confirming ? (
                <div className="flex gap-2 flex-wrap">
                  {ALL_STATUSES.filter((s) => s !== booking.status).map((s) => (
                    <button
                      key={s}
                      onClick={() => { setPendingStatus(s); setConfirming(true); }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[s]} hover:opacity-80`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800 mb-3">
                    Confirmer le passage au statut <strong>{STATUS_LABELS[pendingStatus as BookingStatus]}</strong> ?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleStatusChange}
                      disabled={updateStatus.isPending}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
                    >
                      {updateStatus.isPending ? 'Enregistrement...' : 'Confirmer'}
                    </button>
                    <button
                      onClick={() => { setConfirming(false); setPendingStatus(''); }}
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ---- Bulk Action Bar ----
const BulkActionBar = ({
  selectedCount,
  onStatusChange,
  onClear,
  isPending,
}: {
  selectedCount: number;
  onStatusChange: (status: string) => void;
  onClear: () => void;
  isPending: boolean;
}) => {
  const [targetStatus, setTargetStatus] = useState('');

  return (
    <div className="flex items-center gap-3 bg-blue-600 text-white rounded-xl px-4 py-3 shadow-lg">
      <span className="font-medium text-sm">{selectedCount} commande{selectedCount > 1 ? 's' : ''} sélectionnée{selectedCount > 1 ? 's' : ''}</span>
      <div className="flex-1" />
      <select
        value={targetStatus}
        onChange={(e) => setTargetStatus(e.target.value)}
        className="px-3 py-1.5 rounded-lg text-sm text-gray-900 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-white"
      >
        <option value="">Changer le statut vers...</option>
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
      <button
        disabled={!targetStatus || isPending}
        onClick={() => { if (targetStatus) { onStatusChange(targetStatus); setTargetStatus(''); } }}
        className="px-4 py-1.5 bg-white text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 disabled:opacity-40"
      >
        {isPending ? 'Application...' : 'Appliquer'}
      </button>
      <button onClick={onClear} className="px-3 py-1.5 bg-blue-500 rounded-lg text-sm hover:bg-blue-400">
        Annuler
      </button>
    </div>
  );
};

// ---- Main Page ----
export default function AdminBookingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useAdminBookings({
    page, limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });
  const bulkUpdate = useBulkUpdateBookingStatus();

  const bookings = data?.bookings ?? [];
  const pagination = data?.pagination;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === bookings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(bookings.map((b) => b.id)));
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    await bulkUpdate.mutateAsync({ ids: [...selectedIds], status });
    setSelectedIds(new Set());
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
        <p className="text-sm text-gray-500 mt-1">Gestion de toutes les réservations</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Référence, email, nom..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les types</option>
          {ALL_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          onStatusChange={handleBulkStatusChange}
          onClear={() => setSelectedIds(new Set())}
          isPending={bulkUpdate.isPending}
        />
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={bookings.length > 0 && selectedIds.size === bookings.length}
                    onChange={toggleAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Référence</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Client</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Montant</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))}

              {!isLoading && bookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">Aucune commande trouvée</td>
                </tr>
              )}

              {!isLoading && bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className={`hover:bg-gray-50 transition-colors ${selectedIds.has(booking.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(booking.id)}
                      onChange={() => toggleSelect(booking.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">{booking.reference}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{getUserName(booking.user)}</p>
                    <p className="text-xs text-gray-400">{booking.user?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[booking.type]}`}>
                      {TYPE_LABELS[booking.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatCurrency(booking.totalAmount, booking.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[booking.status]}`}>
                      {STATUS_LABELS[booking.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(booking.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedId(booking.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Détail →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {pagination.total} commandes · Page {pagination.page}/{pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">
              ← Précédent
            </button>
            <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">
              Suivant →
            </button>
          </div>
        </div>
      )}

      {selectedId && <BookingDetailModal bookingId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
