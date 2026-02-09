import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Trash2, FileText, AlertTriangle, X, Check, Clock } from 'lucide-react';
import GdprService, { GdprRequest } from '@/services/api/GdprService';

const DataRightsSection: React.FC = () => {
  const { t } = useTranslation('gdpr');
  const [requests, setRequests] = useState<GdprRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await GdprService.getRequests();
      if (response.success && response.data) {
        setRequests(response.data);
      }
    } catch (err) {
      console.error('[DataRightsSection] Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleRequestExport = async () => {
    setProcessing(true);
    try {
      const response = await GdprService.requestDataExport();
      if (response.success) {
        showMessage('success', response.message || t('dataRights.export.success'));
        await loadRequests();
      }
    } catch (err: any) {
      console.error('[DataRightsSection] Failed to request export:', err);
      showMessage('error', err?.response?.data?.message || t('dataRights.export.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showMessage('error', t('dataRights.delete.modal.confirmError'));
      return;
    }

    setProcessing(true);
    try {
      const response = await GdprService.requestDataDeletion(deleteReason || undefined);
      if (response.success) {
        showMessage('success', response.message || t('dataRights.delete.success'));
        setShowDeleteModal(false);
        setDeleteConfirmText('');
        setDeleteReason('');
        await loadRequests();
      }
    } catch (err: any) {
      console.error('[DataRightsSection] Failed to request deletion:', err);
      showMessage('error', err?.response?.data?.message || t('dataRights.delete.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadExport = async (requestId: string) => {
    try {
      const blob = await GdprService.downloadExport(requestId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dreamscape-data-export-${requestId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showMessage('success', t('dataRights.export.downloadSuccess'));
    } catch (err: any) {
      console.error('[DataRightsSection] Failed to download export:', err);
      showMessage('error', err?.response?.data?.message || t('dataRights.export.downloadError'));
    }
  };

  const getStatusBadge = (status: GdprRequest['status']) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: t('dataRights.history.status.pending') },
      IN_PROGRESS: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: t('dataRights.history.status.inProgress') },
      COMPLETED: { color: 'bg-green-100 text-green-700 border-green-200', label: t('dataRights.history.status.completed') },
      REJECTED: { color: 'bg-red-100 text-red-700 border-red-200', label: t('dataRights.history.status.rejected') },
      CANCELLED: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: t('dataRights.history.status.cancelled') },
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRequestTypeLabel = (type: GdprRequest['requestType']) => {
    const labels = {
      DATA_EXPORT: t('dataRights.history.types.dataExport'),
      DATA_DELETION: t('dataRights.history.types.dataDeletion'),
      DATA_RECTIFICATION: t('dataRights.history.types.dataRectification'),
      ACCESS_REQUEST: t('dataRights.history.types.accessRequest'),
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Message Toast */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Data Rights Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-orange-500" />
          <h2 className="text-lg font-semibold">{t('dataRights.title')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export Data */}
          <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Download className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{t('dataRights.export.title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('dataRights.export.description')}
                </p>
              </div>
            </div>
            <button
              onClick={handleRequestExport}
              disabled={processing}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t('dataRights.delete.modal.processing')}
                </span>
              ) : (
                t('dataRights.export.button')
              )}
            </button>
          </div>

          {/* Delete Account */}
          <div className="p-4 border border-red-200 rounded-lg hover:border-red-300 transition-colors bg-red-50/30">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{t('dataRights.delete.title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('dataRights.delete.description')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            >
              {t('dataRights.delete.button')}
            </button>
          </div>
        </div>
      </div>

      {/* GDPR Requests History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold">{t('dataRights.history.title')}</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">{t('dataRights.history.loading')}</p>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{t('dataRights.history.noRequests')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-orange-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {getRequestTypeLabel(request.requestType)}
                      </h4>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{t('dataRights.history.requested')}: {formatDate(request.requestedAt)}</div>
                      {request.processedAt && (
                        <div>{t('dataRights.history.processed')}: {formatDate(request.processedAt)}</div>
                      )}
                      {request.completedAt && (
                        <div>{t('dataRights.history.completed')}: {formatDate(request.completedAt)}</div>
                      )}
                      {request.reason && (
                        <div className="text-gray-500 italic">{t('dataRights.history.reason')}: {request.reason}</div>
                      )}
                      {request.notes && (
                        <div className="text-gray-500">{t('dataRights.history.note')}: {request.notes}</div>
                      )}
                    </div>
                  </div>

                  {/* Download button for completed exports */}
                  {request.requestType === 'DATA_EXPORT' && request.status === 'COMPLETED' && (
                    <button
                      onClick={() => handleDownloadExport(request.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      {t('dataRights.export.download')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('dataRights.delete.modal.title')}</h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                  setDeleteReason('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium mb-2">{t('dataRights.delete.modal.warning')}</p>
                <p className="text-sm text-red-700">
                  {t('dataRights.delete.modal.warningDescription')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dataRights.delete.modal.reasonLabel')}
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder={t('dataRights.delete.modal.reasonPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dataRights.delete.modal.confirmLabel')}
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={t('dataRights.delete.modal.confirmPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                    setDeleteReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {t('dataRights.delete.modal.cancel')}
                </button>
                <button
                  onClick={handleRequestDeletion}
                  disabled={deleteConfirmText !== 'DELETE' || processing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t('dataRights.delete.modal.processing')}
                    </span>
                  ) : (
                    t('dataRights.delete.modal.confirm')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataRightsSection;
