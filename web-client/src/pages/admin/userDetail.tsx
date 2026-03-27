import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, Pencil, Trash2, UserX, UserCheck,
  BookOpen, CreditCard, Clock, Search, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAdminUser, useUpdateUser, useDeleteUser, useSuspendUser, useReactivateUser, useUserActivity } from '@/hooks/useAdminUsers';
import type { AdminUserDetail, UpdateUserData, UserActivityItem } from '@/types/admin';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const formatDateTime = (date: string | null) =>
  date
    ? new Date(date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  MODERATOR: 'bg-purple-100 text-purple-700',
  USER: 'bg-gray-100 text-gray-600',
};

const ACTIVITY_ICONS: Record<UserActivityItem['type'], React.ReactNode> = {
  history: <Search className="w-4 h-4 text-blue-500" />,
  booking: <BookOpen className="w-4 h-4 text-orange-500" />,
  payment: <CreditCard className="w-4 h-4 text-green-500" />,
};

const ACTIVITY_BG: Record<UserActivityItem['type'], string> = {
  history: 'bg-blue-50',
  booking: 'bg-orange-50',
  payment: 'bg-green-50',
};

// ─── Edit Modal ──────────────────────────────────────────────────────────────

const EditUserModal = ({
  user,
  onClose,
  onSave,
  saving,
}: {
  user: AdminUserDetail;
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
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Nom</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Rôle</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AdminUserDetail['role'] })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="USER">User</option>
                <option value="MODERATOR">Moderator</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Catégorie</label>
              <select value={form.userCategory} onChange={(e) => setForm({ ...form, userCategory: e.target.value as AdminUserDetail['userCategory'] })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="LEISURE">Leisure</option>
                <option value="BUSINESS">Business</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.isVerified} onChange={(e) => setForm({ ...form, isVerified: e.target.checked })} className="rounded border-gray-300" />
            Email vérifié
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Annuler</button>
          <button onClick={() => onSave(form)} disabled={saving} className="px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Suspend Modal ───────────────────────────────────────────────────────────

const SuspendModal = ({
  onClose, onConfirm, loading,
}: { onClose: () => void; onConfirm: (reason: string) => void; loading: boolean }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Suspendre l'utilisateur</h2>
        <p className="text-sm text-gray-600 mb-4">L'utilisateur ne pourra plus se connecter.</p>
        <div>
          <label className="text-xs font-medium text-gray-500">Raison (optionnelle)</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Ex: violation des CGU..." className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Annuler</button>
          <button onClick={() => onConfirm(reason)} disabled={loading} className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50">
            {loading ? 'Suspension...' : 'Suspendre'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const AdminUserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activityPage, setActivityPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: user, isLoading, error } = useAdminUser(id ?? null);
  const { data: activity, isLoading: activityLoading } = useUserActivity(id ?? null, activityPage);

  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const suspendMutation = useSuspendUser();
  const reactivateMutation = useReactivateUser();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-medium">Utilisateur introuvable</p>
          <button onClick={() => navigate('/admin/users')} className="mt-3 text-sm text-red-600 hover:underline">
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const displayName = user.firstName || user.lastName
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : user.username || user.email;

  const handleSave = (formData: UpdateUserData) => {
    updateMutation.mutate(
      { id: user.id, data: formData },
      {
        onSuccess: () => { setShowEditModal(false); toast.success('Utilisateur mis à jour'); },
        onError: () => toast.error('Erreur lors de la mise à jour'),
      }
    );
  };

  const handleSuspend = (reason: string) => {
    suspendMutation.mutate(
      { id: user.id, data: { reason: reason || undefined } },
      {
        onSuccess: () => { setShowSuspendModal(false); toast.success('Utilisateur suspendu'); },
        onError: () => toast.error('Erreur lors de la suspension'),
      }
    );
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(user.id, {
      onSuccess: () => toast.success('Utilisateur réactivé'),
      onError: () => toast.error('Erreur lors de la réactivation'),
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(user.id, {
      onSuccess: () => { toast.success('Utilisateur supprimé'); navigate('/admin/users'); },
      onError: () => toast.error('Erreur lors de la suppression'),
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/users')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux utilisateurs
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-700">
              {(user.firstName?.[0] || user.email[0]).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_STYLES[user.role] || ''}`}>
                  {user.role}
                </span>
                {user.isSuspended ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Suspendu
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Actif
                  </span>
                )}
                {user.isVerified && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Vérifié
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Modifier
            </button>
            {user.isSuspended ? (
              <button
                onClick={handleReactivate}
                disabled={reactivateMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                {reactivateMutation.isPending ? 'Réactivation...' : 'Réactiver'}
              </button>
            ) : (
              <button
                onClick={() => setShowSuspendModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
              >
                <UserX className="w-4 h-4" />
                Suspendre
              </button>
            )}
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? '...' : 'Confirmer'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            )}
          </div>
        </div>

        {/* Suspension info */}
        {user.isSuspended && user.suspendedReason && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-xs font-medium text-red-700">Raison de la suspension :</p>
            <p className="text-sm text-red-600 mt-0.5">{user.suspendedReason}</p>
            {user.suspendedAt && (
              <p className="text-xs text-red-400 mt-1">Suspendu le {formatDateTime(user.suspendedAt)}</p>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenus générés</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {user.revenueGenerated.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Réservations</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{user.bookingsCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recherches</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{user._count.searches}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Favoris</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{user._count.favorites}</p>
        </div>
      </div>

      {/* Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Personal info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Informations personnelles</h2>
          <dl className="space-y-3">
            <ProfileRow label="Prénom" value={user.firstName} />
            <ProfileRow label="Nom" value={user.lastName} />
            <ProfileRow label="Email" value={user.email} />
            <ProfileRow label="Téléphone" value={user.phoneNumber} />
            <ProfileRow label="Date de naissance" value={formatDate(user.dateOfBirth)} />
            <ProfileRow label="Nationalité" value={user.nationality} />
          </dl>
        </div>

        {/* Account info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Informations du compte</h2>
          <dl className="space-y-3">
            <ProfileRow label="Rôle" value={user.role} />
            <ProfileRow label="Catégorie" value={user.userCategory} />
            <ProfileRow label="Email vérifié" value={user.isVerified ? 'Oui' : 'Non'} />
            <ProfileRow label="Onboarding complété" value={user.onboardingCompleted ? 'Oui' : 'Non'} />
            <ProfileRow label="Dernière connexion" value={formatDateTime(user.lastLoginAt)} />
            <ProfileRow label="Inscrit le" value={formatDateTime(user.createdAt)} />
          </dl>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Activité récente</h2>

        {activityLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-48" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!activityLoading && activity?.items.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucune activité enregistrée</p>
          </div>
        )}

        {!activityLoading && activity && activity.items.length > 0 && (
          <>
            <div className="space-y-3">
              {activity.items.map((item, idx) => (
                <div key={item.id} className="flex items-start gap-3">
                  {/* Line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${ACTIVITY_BG[item.type]}`}>
                      {ACTIVITY_ICONS[item.type]}
                    </div>
                    {idx < activity.items.length - 1 && (
                      <div className="w-px h-4 bg-gray-100 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                        {item.status && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                            {item.status}
                          </span>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400 whitespace-nowrap">{formatDateTime(item.createdAt)}</p>
                        {item.amount != null && (
                          <p className="text-sm font-semibold text-gray-700 mt-0.5">
                            {item.amount.toLocaleString('fr-FR', { style: 'currency', currency: item.currency || 'EUR' })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Pagination */}
            {activity.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Page {activity.pagination.page} / {activity.pagination.totalPages}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                    disabled={activityPage === 1}
                    className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActivityPage((p) => Math.min(activity.pagination.totalPages, p + 1))}
                    disabled={activityPage === activity.pagination.totalPages}
                    className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditUserModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
          saving={updateMutation.isPending}
        />
      )}
      {showSuspendModal && (
        <SuspendModal
          onClose={() => setShowSuspendModal(false)}
          onConfirm={handleSuspend}
          loading={suspendMutation.isPending}
        />
      )}
    </div>
  );
};

// ─── ProfileRow ──────────────────────────────────────────────────────────────

const ProfileRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="flex justify-between items-start gap-2">
    <dt className="text-xs font-medium text-gray-500 flex-shrink-0">{label}</dt>
    <dd className="text-sm text-gray-900 text-right">{value || '—'}</dd>
  </div>
);

export default AdminUserDetailPage;
