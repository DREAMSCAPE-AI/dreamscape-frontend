import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { toast } from 'sonner';
import { Eye, XCircle, Mail, Settings, ChevronUp, ChevronDown, ChevronsUpDown, Download } from 'lucide-react';
import {
  useAdminBookings,
  useCancelBooking,
  useModifyBooking,
  useResendEmail,
} from '@/hooks/useAdminBookings';
import { adminBookingService } from '@/services/admin/AdminBookingService';
import type { AdminBooking, BookingStatus, BookingType } from '@/types/admin';

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

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const formatAmount = (amount: number, currency = 'EUR') =>
  amount.toLocaleString('fr-FR', { style: 'currency', currency });

// ─── Sort Icon ───────────────────────────────────────────────────────────────

const SortIcon = ({ direction }: { direction: 'asc' | 'desc' | false }) => {
  if (direction === 'asc') return <ChevronUp className="w-3 h-3 inline ml-1" />;
  if (direction === 'desc') return <ChevronDown className="w-3 h-3 inline ml-1" />;
  return <ChevronsUpDown className="w-3 h-3 inline ml-1 opacity-30" />;
};

// ─── Cancel Modal ────────────────────────────────────────────────────────────

const CancelModal = ({
  booking,
  onClose,
  onConfirm,
  loading,
}: {
  booking: AdminBooking;
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
        <p className="text-sm text-gray-600 mb-4">
          Réservation <strong>{booking.reference}</strong>
        </p>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={refund}
              onChange={(e) => setRefund(e.target.checked)}
              className="rounded border-gray-300 text-green-500"
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
              placeholder="Ex: demande client, erreur de réservation..."
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
            {loading ? 'Annulation...' : 'Confirmer l\'annulation'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modify Modal ────────────────────────────────────────────────────────────

const ModifyModal = ({
  booking,
  onClose,
  onConfirm,
  loading,
}: {
  booking: AdminBooking;
  onClose: () => void;
  onConfirm: (totalAmount?: number, notes?: string) => void;
  loading: boolean;
}) => {
  const [amount, setAmount] = useState(String(booking.totalAmount));
  const [notes, setNotes] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Modifier la réservation</h2>
        <p className="text-sm text-gray-500 mb-4">{booking.reference}</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Montant ({booking.currency})</label>
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
              placeholder="Notes internes sur cette modification..."
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

// ─── Column Helper ───────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<AdminBooking>();

// ─── Main Page ───────────────────────────────────────────────────────────────

const AdminBookingsPage = () => {
  const navigate = useNavigate();

  // Filters
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  // Modals
  const [cancellingBooking, setCancellingBooking] = useState<AdminBooking | null>(null);
  const [modifyingBooking, setModifyingBooking] = useState<AdminBooking | null>(null);

  // Row selection
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [exporting, setExporting] = useState(false);

  // Debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined;

  const { data, isLoading, error } = useAdminBookings({
    page,
    limit: 50,
    search: search || undefined,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    minAmount: minAmount ? parseFloat(minAmount) : undefined,
    maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
    sortBy,
    sortOrder,
  });

  const cancelMutation = useCancelBooking();
  const modifyMutation = useModifyBooking();
  const resendMutation = useResendEmail();

  const handleCancel = (refund: boolean, reason: string) => {
    if (!cancellingBooking) return;
    cancelMutation.mutate(
      { id: cancellingBooking.id, data: { refund, reason } },
      {
        onSuccess: () => { setCancellingBooking(null); toast.success('Réservation annulée' + (refund ? ' + remboursement initié' : '')); },
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Erreur lors de l\'annulation'),
      }
    );
  };

  const handleModify = (totalAmount?: number, notes?: string) => {
    if (!modifyingBooking) return;
    modifyMutation.mutate(
      { id: modifyingBooking.id, data: { totalAmount, notes } },
      {
        onSuccess: () => { setModifyingBooking(null); toast.success('Réservation modifiée'); },
        onError: () => toast.error('Erreur lors de la modification'),
      }
    );
  };

  const handleResendEmail = (booking: AdminBooking) => {
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

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await adminBookingService.exportBookings({
        search: search || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export téléchargé');
    } catch {
      toast.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  const selectedIds = Object.entries(rowSelection).filter(([, v]) => v).map(([id]) => id);

  // Columns
  const columns = [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-gray-300 cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-gray-300 cursor-pointer"
        />
      ),
    }),
    columnHelper.accessor('reference', {
      header: 'Référence',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-medium text-gray-800">{getValue()}</span>
      ),
    }),
    columnHelper.accessor('user', {
      id: 'user',
      header: 'Utilisateur',
      enableSorting: false,
      cell: ({ getValue }) => {
        const u = getValue();
        if (!u) return <span className="text-gray-400 text-xs">—</span>;
        const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
        return (
          <div>
            <p className="text-sm text-gray-900 truncate max-w-[140px]">{name}</p>
            <p className="text-xs text-gray-400 truncate max-w-[140px]">{u.email}</p>
          </div>
        );
      },
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-600">{TYPE_LABELS[getValue()] ?? getValue()}</span>
      ),
    }),
    columnHelper.accessor('destination', {
      header: 'Destination',
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-700">{getValue() || '—'}</span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Statut',
      enableSorting: false,
      cell: ({ getValue }) => {
        const s = getValue();
        return (
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[s]}`}>
            {STATUS_LABELS[s]}
          </span>
        );
      },
    }),
    columnHelper.accessor('totalAmount', {
      header: 'Montant',
      cell: ({ getValue, row }) => (
        <span className="text-sm font-medium text-gray-900">
          {formatAmount(getValue(), row.original.currency)}
        </span>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Date',
      cell: ({ getValue }) => <span className="text-xs text-gray-500">{formatDate(getValue())}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => navigate(`/admin/bookings/${b.id}`)}
              className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors rounded"
              title="Voir le détail"
            >
              <Eye className="w-4 h-4" />
            </button>
            {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
              <button
                onClick={() => setCancellingBooking(b)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded"
                title="Annuler"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setModifyingBooking(b)}
              className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded"
              title="Modifier"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleResendEmail(b)}
              className="p-1.5 text-gray-400 hover:text-green-500 transition-colors rounded"
              title="Renvoyer email"
            >
              <Mail className="w-4 h-4" />
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: data?.bookings ?? [],
    columns,
    state: { sorting, rowSelection },
    getRowId: (row) => row.id,
    onSortingChange: (updater) => { setSorting(updater); setPage(1); },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: data?.pagination.totalPages ?? -1,
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Réservations</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.pagination.total ?? 0} réservation{(data?.pagination.total ?? 0) > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Export...' : 'Exporter tout'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Référence, email, destination..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Tous les statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="PENDING_PAYMENT">En attente paiement</option>
          <option value="PENDING">En attente</option>
          <option value="CONFIRMED">Confirmé</option>
          <option value="COMPLETED">Terminé</option>
          <option value="CANCELLED">Annulé</option>
          <option value="FAILED">Échoué</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Tous les types</option>
          <option value="FLIGHT">Vol</option>
          <option value="HOTEL">Hôtel</option>
          <option value="ACTIVITY">Activité</option>
          <option value="PACKAGE">Package</option>
          <option value="TRANSFER">Transfer</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          title="Date de création depuis"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          title="Date de création jusqu'à"
        />
        <input
          type="number"
          value={minAmount}
          onChange={(e) => { setMinAmount(e.target.value); setPage(1); }}
          placeholder="Montant min"
          className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
        <input
          type="number"
          value={maxAmount}
          onChange={(e) => { setMaxAmount(e.target.value); setPage(1); }}
          placeholder="Montant max"
          className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>

      {/* Bulk bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg">
          <span className="text-sm font-medium text-orange-800">
            {selectedIds.length} réservation{selectedIds.length > 1 ? 's' : ''} sélectionnée{selectedIds.length > 1 ? 's' : ''}
          </span>
          <button
            onClick={setRowSelection.bind(null, {})}
            className="ml-auto text-xs text-orange-600 hover:text-orange-800"
          >
            Désélectionner tout
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">Erreur lors du chargement des réservations.</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`py-3 px-4 text-left text-gray-500 font-medium whitespace-nowrap ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-800' : ''}`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && <SortIcon direction={header.column.getIsSorted()} />}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50 animate-pulse">
                {Array.from({ length: 9 }).map((_, j) => (
                  <td key={j} className="py-3 px-4"><div className="h-4 bg-gray-100 rounded" /></td>
                ))}
              </tr>
            ))}

            {!isLoading && table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${row.getIsSelected() ? 'bg-orange-50' : ''}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-3 px-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}

            {!isLoading && data?.bookings.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-400">
                  Aucune réservation trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Page {data.pagination.page} sur {data.pagination.totalPages} — {data.pagination.total} réservations
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page === data.pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {cancellingBooking && (
        <CancelModal
          booking={cancellingBooking}
          onClose={() => setCancellingBooking(null)}
          onConfirm={handleCancel}
          loading={cancelMutation.isPending}
        />
      )}
      {modifyingBooking && (
        <ModifyModal
          booking={modifyingBooking}
          onClose={() => setModifyingBooking(null)}
          onConfirm={handleModify}
          loading={modifyMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminBookingsPage;
