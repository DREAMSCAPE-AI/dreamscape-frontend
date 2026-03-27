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
import { Eye, Pencil, Trash2, UserX, UserCheck, ChevronUp, ChevronDown, ChevronsUpDown, Download } from 'lucide-react';
import { useAdminUsers, useUpdateUser, useDeleteUser, useSuspendUser, useReactivateUser } from '@/hooks/useAdminUsers';
import { adminUserService } from '@/services/admin/AdminUserService';
import type { AdminUser, UpdateUserData } from '@/types/admin';

// ─── Helpers ───────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  MODERATOR: 'bg-purple-100 text-purple-700',
  USER: 'bg-gray-100 text-gray-600',
};

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const getInitial = (user: AdminUser) =>
  (user.firstName?.[0] || user.email[0]).toUpperCase();

const getDisplayName = (user: AdminUser) =>
  user.firstName || user.lastName
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : user.username || user.email;

// ─── Sort Icon ──────────────────────────────────────────────────────────────

const SortIcon = ({ direction }: { direction: 'asc' | 'desc' | false }) => {
  if (direction === 'asc') return <ChevronUp className="w-3 h-3 inline ml-1" />;
  if (direction === 'desc') return <ChevronDown className="w-3 h-3 inline ml-1" />;
  return <ChevronsUpDown className="w-3 h-3 inline ml-1 opacity-30" />;
};

// ─── Edit Modal ─────────────────────────────────────────────────────────────

const EditUserModal = ({
  user,
  onClose,
  onSave,
  saving,
}: {
  user: AdminUser;
  onClose: () => void;
  onSave: (data: UpdateUserData) => void;
  saving: boolean;
}) => {
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    userCategory: user.userCategory,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Modifier l'utilisateur</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Prénom</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Nom</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Rôle</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as AdminUser['role'] })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="USER">User</option>
                <option value="MODERATOR">Moderator</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Catégorie</label>
              <select
                value={form.userCategory}
                onChange={(e) => setForm({ ...form, userCategory: e.target.value as AdminUser['userCategory'] })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="LEISURE">Leisure</option>
                <option value="BUSINESS">Business</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isVerified}
              onChange={(e) => setForm({ ...form, isVerified: e.target.checked })}
              className="rounded border-gray-300"
            />
            Email vérifié
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            Annuler
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Suspend Modal ──────────────────────────────────────────────────────────

const SuspendModal = ({
  user,
  onClose,
  onConfirm,
  loading,
}: {
  user: AdminUser;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Suspendre l'utilisateur</h2>
        <p className="text-sm text-gray-600 mb-4">
          Suspendre <strong>{getDisplayName(user)}</strong> empêchera toute connexion.
        </p>
        <div>
          <label className="text-xs font-medium text-gray-500">Raison (optionnelle)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Ex: violation des CGU..."
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            Annuler
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? 'Suspension...' : 'Suspendre'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Reactivate Modal ───────────────────────────────────────────────────────

const ReactivateModal = ({
  user,
  onClose,
  onConfirm,
  loading,
}: {
  user: AdminUser;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
    <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Réactiver l'utilisateur</h2>
      <p className="text-sm text-gray-600 mb-4">
        Réactiver <strong>{getDisplayName(user)}</strong> lui permettra de se connecter à nouveau.
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Réactivation...' : 'Réactiver'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Delete Modal ───────────────────────────────────────────────────────────

const DeleteModal = ({
  user,
  onClose,
  onConfirm,
  loading,
}: {
  user: AdminUser;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
    <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Supprimer l'utilisateur</h2>
      <p className="text-sm text-gray-600 mb-4">
        Supprimer <strong>{user.email}</strong> ? Cette action est irréversible.
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? 'Suppression...' : 'Supprimer'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Column Helper ──────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<AdminUser>();

// ─── Main Page ──────────────────────────────────────────────────────────────

const AdminUsersPage = () => {
  const navigate = useNavigate();

  // Filters
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'suspended' | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  // Modals
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [suspendingUser, setSuspendingUser] = useState<AdminUser | null>(null);
  const [reactivatingUser, setReactivatingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

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

  // Derive sort params
  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined;

  const { data, isLoading, error } = useAdminUsers({
    page,
    limit: 50,
    search: search || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortBy,
    sortOrder,
  });

  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const suspendMutation = useSuspendUser();
  const reactivateMutation = useReactivateUser();

  // Handlers
  const handleSave = (formData: UpdateUserData) => {
    if (!editingUser) return;
    updateMutation.mutate(
      { id: editingUser.id, data: formData },
      {
        onSuccess: () => { setEditingUser(null); toast.success('Utilisateur mis à jour'); },
        onError: () => toast.error('Erreur lors de la mise à jour'),
      }
    );
  };

  const handleSuspend = (reason: string) => {
    if (!suspendingUser) return;
    suspendMutation.mutate(
      { id: suspendingUser.id, data: { reason: reason || undefined } },
      {
        onSuccess: () => { setSuspendingUser(null); toast.success('Utilisateur suspendu'); },
        onError: () => toast.error('Erreur lors de la suspension'),
      }
    );
  };

  const handleReactivate = () => {
    if (!reactivatingUser) return;
    reactivateMutation.mutate(reactivatingUser.id, {
      onSuccess: () => { setReactivatingUser(null); toast.success('Utilisateur réactivé'); },
      onError: () => toast.error('Erreur lors de la réactivation'),
    });
  };

  const handleDelete = () => {
    if (!deletingUser) return;
    deleteMutation.mutate(deletingUser.id, {
      onSuccess: () => { setDeletingUser(null); toast.success('Utilisateur supprimé'); },
      onError: () => toast.error('Erreur lors de la suppression'),
    });
  };

  const handleExport = async (ids?: string[]) => {
    setExporting(true);
    try {
      const blob = await adminUserService.exportUsers(
        { search: search || undefined, role: roleFilter || undefined, status: statusFilter || undefined, startDate: startDate || undefined, endDate: endDate || undefined },
        ids
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export téléchargé');
    } catch {
      toast.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  const selectedIds = Object.entries(rowSelection)
    .filter(([, v]) => v)
    .map(([id]) => id);

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
    columnHelper.accessor((row) => row, {
      id: 'user',
      header: 'Utilisateur',
      enableSorting: false,
      cell: ({ getValue }) => {
        const u = getValue();
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-medium text-orange-700 flex-shrink-0">
              {getInitial(u)}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{getDisplayName(u)}</p>
              <p className="text-gray-400 text-xs truncate">{u.email}</p>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('role', {
      header: 'Rôle',
      cell: ({ getValue }) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_STYLES[getValue()] || ''}`}>
          {getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('isSuspended', {
      id: 'status',
      header: 'Statut',
      enableSorting: false,
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Suspendu
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Actif
          </span>
        ),
    }),
    columnHelper.accessor('isVerified', {
      header: 'Vérifié',
      enableSorting: false,
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="text-green-500 font-bold">✓</span>
        ) : (
          <span className="text-gray-300 font-bold">✗</span>
        ),
    }),
    columnHelper.accessor('lastLoginAt', {
      id: 'lastLoginAt',
      header: 'Dernière connexion',
      cell: ({ getValue }) => <span className="text-gray-500 text-xs">{formatDate(getValue())}</span>,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Inscription',
      cell: ({ getValue }) => <span className="text-gray-500 text-xs">{formatDate(getValue())}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => navigate(`/admin/users/${u.id}`)}
              className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors rounded"
              title="Voir le détail"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingUser(u)}
              className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded"
              title="Modifier"
            >
              <Pencil className="w-4 h-4" />
            </button>
            {u.isSuspended ? (
              <button
                onClick={() => setReactivatingUser(u)}
                className="p-1.5 text-gray-400 hover:text-green-500 transition-colors rounded"
                title="Réactiver"
              >
                <UserCheck className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setSuspendingUser(u)}
                className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors rounded"
                title="Suspendre"
              >
                <UserX className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setDeletingUser(u)}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: data?.users ?? [],
    columns,
    state: { sorting, rowSelection },
    getRowId: (row) => row.id,
    onSortingChange: (updater) => {
      setSorting(updater);
      setPage(1);
    },
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
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.pagination.total ?? 0} utilisateur{(data?.pagination.total ?? 0) > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={() => handleExport()}
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
            placeholder="Rechercher par nom, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Tous les rôles</option>
          <option value="ADMIN">Admin</option>
          <option value="MODERATOR">Moderator</option>
          <option value="USER">User</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="suspended">Suspendus</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          title="Date d'inscription depuis"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          title="Date d'inscription jusqu'à"
        />
      </div>

      {/* Bulk export bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg">
          <span className="text-sm font-medium text-orange-800">
            {selectedIds.length} utilisateur{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
          </span>
          <button
            onClick={() => handleExport(selectedIds)}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            <Download className="w-3 h-3" />
            Exporter la sélection
          </button>
          <button
            onClick={() => setRowSelection({})}
            className="ml-auto text-xs text-orange-600 hover:text-orange-800"
          >
            Désélectionner tout
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">Erreur lors du chargement des utilisateurs.</p>
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
                    className={`py-3 px-4 text-left text-gray-500 font-medium whitespace-nowrap ${
                      header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-800' : ''
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <SortIcon direction={header.column.getIsSorted()} />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50 animate-pulse">
                {Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} className="py-3 px-4">
                    <div className="h-4 bg-gray-100 rounded" />
                  </td>
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

            {!isLoading && data?.users.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  Aucun utilisateur trouvé
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
            Page {data.pagination.page} sur {data.pagination.totalPages} — {data.pagination.total} utilisateurs
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
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSave}
          saving={updateMutation.isPending}
        />
      )}
      {suspendingUser && (
        <SuspendModal
          user={suspendingUser}
          onClose={() => setSuspendingUser(null)}
          onConfirm={handleSuspend}
          loading={suspendMutation.isPending}
        />
      )}
      {reactivatingUser && (
        <ReactivateModal
          user={reactivatingUser}
          onClose={() => setReactivatingUser(null)}
          onConfirm={handleReactivate}
          loading={reactivateMutation.isPending}
        />
      )}
      {deletingUser && (
        <DeleteModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDelete}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;
