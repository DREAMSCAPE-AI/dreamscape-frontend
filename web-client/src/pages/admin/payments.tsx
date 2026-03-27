import { useState } from 'react';
import { useAdminPayments, useAdminPayment, useUpdatePaymentStatus } from '@/hooks/useAdminPayments';
import type { PaymentStatus, BookingType, BookingStatus } from '@/types/admin';

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  SUCCEEDED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-purple-100 text-purple-700',
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'En attente',
  SUCCEEDED: 'Réussi',
  FAILED: 'Echoué',
  REFUNDED: 'Remboursé',
};

const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  DRAFT: 'Brouillon', PENDING_PAYMENT: 'Attente paiement', PENDING: 'En attente',
  CONFIRMED: 'Confirmé', COMPLETED: 'Terminé', CANCELLED: 'Annulé', FAILED: 'Echoué',
};

const BOOKING_TYPE_LABELS: Record<BookingType, string> = {
  FLIGHT: '✈️ Vol', HOTEL: '🏨 Hôtel', ACTIVITY: '🎯 Activité',
  PACKAGE: '📦 Package', TRANSFER: '🚗 Transfert',
};

const ALL_PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED'];

const formatDate = (date: string | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatCurrency = (amount: number, currency = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);

// ---- Detail Modal ----
const PaymentDetailModal = ({ paymentId, onClose }: { paymentId: string; onClose: () => void }) => {
  const { data: payment, isLoading } = useAdminPayment(paymentId);
  const updateStatus = useUpdatePaymentStatus();
  const [pendingStatus, setPendingStatus] = useState('');
  const [confirming, setConfirming] = useState(false);

  const handleStatusChange = async () => {
    if (!pendingStatus || !payment) return;
    await updateStatus.mutateAsync({ id: payment.id, status: pendingStatus });
    setConfirming(false);
    setPendingStatus('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Détail du paiement</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
        </div>

        {isLoading && <div className="p-8 text-center text-gray-400">Chargement...</div>}

        {payment && (
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Statut</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_STYLES[payment.status]}`}>
                  {PAYMENT_STATUS_LABELS[payment.status]}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Montant</p>
                <p className="font-bold text-gray-900 text-lg">{formatCurrency(payment.amount, payment.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Méthode</p>
                <p className="text-sm font-medium text-gray-900">{payment.paymentMethod || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Réf. booking</p>
                <p className="font-mono text-sm text-gray-900">{payment.bookingReference}</p>
              </div>
            </div>

            {/* Client */}
            {payment.user && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Client</p>
                <p className="font-medium text-gray-900">
                  {[payment.user.firstName, payment.user.lastName].filter(Boolean).join(' ') || payment.user.email}
                </p>
                <p className="text-sm text-gray-500">{payment.user.email}</p>
              </div>
            )}

            {/* Timeline */}
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Historique</p>
              <div className="space-y-2">
                {[
                  { label: 'Créé', date: payment.createdAt, color: 'bg-blue-400' },
                  { label: 'Confirmé', date: payment.confirmedAt, color: 'bg-green-400' },
                  { label: 'Echoué', date: payment.failedAt, color: 'bg-red-400' },
                  { label: 'Remboursé', date: payment.refundedAt, color: 'bg-purple-400' },
                ].filter((e) => e.date).map((event) => (
                  <div key={event.label} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${event.color}`} />
                    <span className="text-xs text-gray-500 w-20">{event.label}</span>
                    <span className="text-xs font-medium text-gray-700">{formatDate(event.date)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Failure reason */}
            {payment.failureReason && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <p className="text-xs text-red-400 font-medium uppercase tracking-wide mb-1">Raison d'échec</p>
                <p className="text-sm text-red-700">{payment.failureReason}</p>
              </div>
            )}

            {/* Booking */}
            {payment.booking && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Réservation liée</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Type</p>
                    <p className="text-sm font-medium">{BOOKING_TYPE_LABELS[payment.booking.type]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Statut réservation</p>
                    <p className="text-sm font-medium">{BOOKING_STATUS_LABELS[payment.booking.status]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Montant réservation</p>
                    <p className="text-sm font-medium">{formatCurrency(payment.booking.totalAmount, payment.booking.currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Créée le</p>
                    <p className="text-sm font-medium">{formatDate(payment.booking.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            {payment.metadata && Object.keys(payment.metadata).length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Metadata Stripe</p>
                <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 overflow-x-auto">
                  {JSON.stringify(payment.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Payment intent ID */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Payment Intent ID</p>
              <p className="font-mono text-xs text-gray-500 break-all">{payment.paymentIntentId}</p>
            </div>

            {/* Forcer statut */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Forcer le statut manuellement</p>
              {!confirming ? (
                <div className="flex gap-2 flex-wrap">
                  {ALL_PAYMENT_STATUSES.filter((s) => s !== payment.status).map((s) => (
                    <button
                      key={s}
                      onClick={() => { setPendingStatus(s); setConfirming(true); }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${PAYMENT_STATUS_STYLES[s]} hover:opacity-80`}
                    >
                      → {PAYMENT_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800 mb-1 font-medium">
                    Passer le paiement en <strong>{PAYMENT_STATUS_LABELS[pendingStatus as PaymentStatus]}</strong> ?
                  </p>
                  <p className="text-xs text-amber-600 mb-3">
                    Cette action modifie le statut en base de données. A utiliser uniquement pour corriger une erreur technique.
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

// ---- Main Page ----
export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useAdminPayments({
    page, limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const payments = data?.payments ?? [];
  const pagination = data?.pagination;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
        <p className="text-sm text-gray-500 mt-1">Historique de toutes les transactions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Référence booking ou payment intent..."
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
          {ALL_PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Client</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Réf. booking</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Montant</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Méthode</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))}

              {!isLoading && payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">Aucune transaction trouvée</td>
                </tr>
              )}

              {!isLoading && payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {payment.user ? (
                      <>
                        <p className="font-medium text-gray-900">
                          {[payment.user.firstName, payment.user.lastName].filter(Boolean).join(' ') || payment.user.email}
                        </p>
                        <p className="text-xs text-gray-400">{payment.user.email}</p>
                      </>
                    ) : (
                      <p className="text-gray-400">—</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{payment.bookingReference}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(payment.amount, payment.currency)}</td>
                  <td className="px-4 py-3 text-gray-500">{payment.paymentMethod || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_STYLES[payment.status]}`}>
                      {PAYMENT_STATUS_LABELS[payment.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(payment.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedId(payment.id)}
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
            {pagination.total} transactions · Page {pagination.page}/{pagination.totalPages}
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

      {selectedId && <PaymentDetailModal paymentId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
