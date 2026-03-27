import React, { useEffect, useState, useRef } from 'react';
import {
  X, ShoppingCart, Map, Plus, ChevronRight, CheckCircle, XCircle, Loader2,
} from 'lucide-react';
import type { Proposal, ProposalType } from './AIRecommendationModal';
import { useItineraryStore } from '@/store/itineraryStore';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '../../services/auth/AuthService';
import { buildItineraryItem, buildCartItem } from '@/utils/cartItemMapper';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActionResult {
  action: 'cart' | 'itinerary';
  itineraryTitle?: string;
}

interface RecommendationActionModalProps {
  isOpen: boolean;
  proposals: Proposal[];
  onClose: () => void;
  onSuccess: (result: ActionResult) => void;
}

type Step =
  | { id: 'choice' }
  | { id: 'itinerary-list' }
  | { id: 'new-itinerary' }
  | { id: 'submitting'; message: string }
  | { id: 'success'; message: string }
  | { id: 'error'; message: string; prevStep: Step };

interface NewItineraryForm {
  title: string;
  startDate: string;
  endDate: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveDefaultDates(): { startDate: string; endDate: string } {
  const now = Date.now();
  const toDateInput = (ms: number) => new Date(ms).toISOString().split('T')[0];
  return {
    startDate: toDateInput(now + 30 * 24 * 60 * 60 * 1000),
    endDate:   toDateInput(now + 37 * 24 * 60 * 60 * 1000),
  };
}

function deriveDefaultTitle(proposals: Proposal[]): string {
  if (proposals.length === 0) return 'Mon voyage';
  const location = proposals[0].location || proposals[0].title;
  if (proposals.length > 1) return `Voyage — ${location}`;
  const typeLabel: Record<ProposalType, string> = {
    flight: 'Vol',
    hotel: 'Séjour',
    activity: 'Activité',
  };
  return `${typeLabel[proposals[0].type] ?? 'Voyage'} — ${location}`;
}

function formatDateRange(startDate: string, endDate: string): string {
  try {
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${fmt(startDate)} – ${fmt(endDate)}`;
  } catch {
    return '';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const RecommendationActionModal: React.FC<RecommendationActionModalProps> = ({
  isOpen,
  proposals,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { itineraries, fetchItineraries, createItinerary, addItem, isSaving } = useItineraryStore();
  const { addToCart } = useCartStore();

  const [step, setStep] = useState<Step>({ id: 'choice' });
  const [form, setForm] = useState<NewItineraryForm>({ title: '', startDate: '', endDate: '' });
  const prevStepRef = useRef<Step>({ id: 'choice' });

  const isBundle = proposals.length > 1;

  // Reset & fetch itineraries when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setStep({ id: 'choice' });
    const { startDate, endDate } = deriveDefaultDates();
    setForm({
      title: deriveDefaultTitle(proposals),
      startDate,
      endDate,
    });
    fetchItineraries();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen || proposals.length === 0) return null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const goToItineraryList = () => {
    if (itineraries.length === 0) {
      setStep({ id: 'new-itinerary' });
    } else {
      setStep({ id: 'itinerary-list' });
    }
  };

  const handleAddToCart = async () => {
    if (!user?.id) return;
    prevStepRef.current = { id: 'choice' };
    setStep({ id: 'submitting', message: 'Ajout au panier...' });
    try {
      const proposal = proposals[0];
      const dto = buildCartItem(proposal, user.id);
      if (!dto) throw new Error('Impossible de mapper cet élément.');
      await addToCart(dto);
      setStep({ id: 'success', message: 'Ajouté au panier !' });
      setTimeout(() => {
        onSuccess({ action: 'cart' });
        onClose();
      }, 1500);
    } catch (err) {
      setStep({
        id: 'error',
        message: err instanceof Error ? err.message : "Impossible d'ajouter au panier.",
        prevStep: prevStepRef.current,
      });
    }
  };

  const handleAddToItinerary = async (itineraryId: string, itineraryTitle: string) => {
    prevStepRef.current = { id: 'itinerary-list' };
    setStep({ id: 'submitting', message: "Ajout à l'itinéraire..." });
    let addedCount = 0;
    for (const proposal of proposals) {
      const dto = buildItineraryItem(proposal);
      if (!dto) continue;
      try {
        await addItem(itineraryId, dto);
        addedCount++;
      } catch {
        // continue with others
      }
    }
    if (addedCount > 0) {
      setStep({ id: 'success', message: `${addedCount} élément(s) ajouté(s) !` });
      setTimeout(() => {
        onSuccess({ action: 'itinerary', itineraryTitle });
        onClose();
      }, 1500);
    } else {
      setStep({
        id: 'error',
        message: "Impossible d'ajouter les éléments à l'itinéraire.",
        prevStep: prevStepRef.current,
      });
    }
  };

  const handleCreateAndAdd = async () => {
    if (!form.title.trim() || !form.startDate || !form.endDate) return;
    prevStepRef.current = { id: 'new-itinerary' };
    setStep({ id: 'submitting', message: "Création de l'itinéraire..." });
    try {
      const destinations = [...new Set(proposals.map(p => p.location).filter(Boolean))];
      const newItinerary = await createItinerary({
        title: form.title.trim(),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        destinations,
      });
      await handleAddToItinerary(newItinerary.id, newItinerary.title);
    } catch (err) {
      setStep({
        id: 'error',
        message: err instanceof Error ? err.message : "La création de l'itinéraire a échoué.",
        prevStep: prevStepRef.current,
      });
    }
  };

  const isFormValid =
    form.title.trim().length > 0 &&
    form.startDate !== '' &&
    form.endDate !== '' &&
    form.startDate <= form.endDate;

  // ── Render ────────────────────────────────────────────────────────────────

  const sortedItineraries = [...itineraries].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {step.id === 'choice' && 'Que souhaitez-vous faire ?'}
            {step.id === 'itinerary-list' && 'Choisir un itinéraire'}
            {step.id === 'new-itinerary' && 'Créer un nouvel itinéraire'}
            {step.id === 'submitting' && 'En cours...'}
            {step.id === 'success' && 'Succès !'}
            {step.id === 'error' && 'Erreur'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">

          {/* ── Step: choice ── */}
          {step.id === 'choice' && (
            <div className="space-y-3">
              {/* Summary of selected proposals */}
              <p className="text-sm text-gray-500 mb-4">
                {isBundle
                  ? `${proposals.length} éléments sélectionnés (vol + hôtel + activité)`
                  : `1 élément sélectionné : ${proposals[0].title}`}
              </p>

              {!isBundle && (
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">
                    <ShoppingCart className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">Ajouter au panier</p>
                    <p className="text-xs text-gray-400">Procéder à l'achat directement</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-orange-400" />
                </button>
              )}

              <button
                onClick={goToItineraryList}
                className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100">
                  <Map className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    {isBundle ? 'Ajouter à un itinéraire' : 'Ajouter à un itinéraire'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isBundle
                      ? 'Organiser tous les éléments dans un voyage'
                      : 'Planifier dans un de vos voyages'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-orange-400" />
              </button>

              {isBundle && (
                <button
                  onClick={() => setStep({ id: 'new-itinerary' })}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100">
                    <Plus className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">Créer un nouvel itinéraire</p>
                    <p className="text-xs text-gray-400">Démarrer un nouveau voyage avec ces éléments</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-orange-400" />
                </button>
              )}
            </div>
          )}

          {/* ── Step: itinerary-list ── */}
          {step.id === 'itinerary-list' && (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Sélectionnez l'itinéraire dans lequel ajouter vos éléments.
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {sortedItineraries.map(itin => (
                  <button
                    key={itin.id}
                    onClick={() => handleAddToItinerary(itin.id, itin.title)}
                    className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{itin.title}</p>
                      <p className="text-xs text-gray-400">{formatDateRange(itin.startDate, itin.endDate)}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-orange-400" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep({ id: 'new-itinerary' })}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Créer un nouvel itinéraire
              </button>
            </div>
          )}

          {/* ── Step: new-itinerary ── */}
          {step.id === 'new-itinerary' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Titre *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Mon voyage à Paris"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date de départ *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date de retour *</label>
                  <input
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
              </div>
              {proposals.some(p => p.location) && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Destinations</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[...new Set(proposals.map(p => p.location).filter(Boolean))].map(loc => (
                      <span key={loc} className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-full">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(itineraries.length > 0 ? { id: 'itinerary-list' } : { id: 'choice' })}
                  className="flex-1 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleCreateAndAdd}
                  disabled={!isFormValid || isSaving}
                  className="flex-1 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Créer et ajouter
                </button>
              </div>
            </div>
          )}

          {/* ── Step: submitting ── */}
          {step.id === 'submitting' && (
            <div className="flex flex-col items-center py-8 gap-4">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
              <p className="text-sm text-gray-600 font-medium">{step.message}</p>
            </div>
          )}

          {/* ── Step: success ── */}
          {step.id === 'success' && (
            <div className="flex flex-col items-center py-8 gap-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="text-sm font-semibold text-gray-800">{step.message}</p>
            </div>
          )}

          {/* ── Step: error ── */}
          {step.id === 'error' && (
            <div className="flex flex-col items-center py-8 gap-4">
              <XCircle className="w-12 h-12 text-red-400" />
              <p className="text-sm text-gray-600 text-center">{step.message}</p>
              <button
                onClick={() => setStep(step.prevStep)}
                className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
              >
                Réessayer
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RecommendationActionModal;
