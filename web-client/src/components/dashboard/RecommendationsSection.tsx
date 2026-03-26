import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Sparkles, RefreshCw, CheckCircle, XCircle, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import ExperienceCard from '../features/ExperienceCard';
import AIRecommendationSelector from './AIRecommendationSelector';
import AIRecommendationModal, {
  type ModalRecommendationType,
  type Proposal,
  type ProposalType,
  type AISearchParams,
} from './AIRecommendationModal';
import RecommendationActionModal, { type ActionResult } from './RecommendationActionModal';
import { TravelRecommendation } from '@/services/dashboard';
import { useAuth } from '../../services/auth/AuthService';
import { useItineraryStore } from '@/store/itineraryStore';
import axios from 'axios';
import { onboardingService } from '@/services/onboarding/onboardingService';
import { profileService } from '@/services/profile';

// ─── localStorage recommendation history ──────────────────────────────────────

const HISTORY_KEY = 'dreamscape-recommendation-history';

interface RecommendationHistoryEntry {
  timestamp: string;
  proposals: Proposal[];
  type: ProposalType;
}

function proposalToTravelRecommendation(p: Proposal): TravelRecommendation {
  return {
    id: p.id,
    type: p.type,
    title: p.title,
    description: p.subtitle,
    location: p.location,
    price: p.price,
    currency: p.currency,
    rating: p.rating,
    image: p.image,
    tags: [],
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    confidence: 0.9,
  };
}

interface RecommendationsSectionProps {
  recentSearches: string[];
  recommendations: TravelRecommendation[];
  onRefresh: () => Promise<void>;
}

// ─── Simple inline toast ──────────────────────────────────────────────────────

interface ToastState { visible: boolean; success: boolean; message: string }

const Toast: React.FC<ToastState> = ({ visible, success, message }) => (
  <div className={`
    fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]
    flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg
    text-sm font-medium text-white transition-all duration-300
    ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
    ${success ? 'bg-green-600' : 'bg-red-500'}
  `} role="alert" aria-live="polite">
    {success ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
    {message}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
// ─── Simple inline toast ──────────────────────────────────────────────────────

interface ToastState { visible: boolean; success: boolean; message: string }

const Toast: React.FC<ToastState> = ({ visible, success, message }) => (
  <div className={`
    fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]
    flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg
    text-sm font-medium text-white transition-all duration-300
    ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
    ${success ? 'bg-green-600' : 'bg-red-500'}
  `} role="alert" aria-live="polite">
    {success ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
    {message}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  recentSearches,
  recommendations,
  onRefresh
}) => {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const { fetchItineraries } = useItineraryStore();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalRecommendationType>('flights');

  // Action modal state
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [pendingProposals, setPendingProposals] = useState<Proposal[]>([]);

  // Recommendation history — lazy-loaded from localStorage
  const [savedRecommendations, setSavedRecommendations] = useState<RecommendationHistoryEntry | null>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // AI results displayed after user picks a proposal
  const [aiRecommendations, setAiRecommendations] = useState<TravelRecommendation[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search params from user's history — fed to AI without any form
  const [searchParams, setSearchParams] = useState<AISearchParams>({
    origin: 'PAR',
    destination: 'NYC',
    departureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    adults: 1,
    travelClass: 'ECONOMY',
  });

  // Toast
  const [toast, setToast] = useState<ToastState>({ visible: false, success: true, message: '' });
  const showToast = (success: boolean, message: string) => {
    setToast({ visible: true, success, message });
    setTimeout(() => setToast(s => ({ ...s, visible: false })), 3500);
  };

  // Fetch user's recent search + full profile to build enriched AI context
  useEffect(() => {
    if (!user?.id) return;
    if (!user?.id) return;

    const fetchContext = async () => {
      // Run all fetches in parallel — failures are non-blocking
      const [searchRes, onboardingRes, profileRes] = await Promise.allSettled([
        (async () => {
          const token = localStorage.getItem('auth-token');
          const r = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || '/api'}/search-history/recent?limit=1`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return r.data?.[0] ?? null;
        })(),
        onboardingService.getProfile(),
        profileService.getProfile(),
      ]);

      // Extract recent search context
      const recentSearch = searchRes.status === 'fulfilled' ? searchRes.value : null;

      // Extract onboarding profile data (directly from TravelOnboardingProfile)
      const onboardingProfile = onboardingRes.status === 'fulfilled' && onboardingRes.value.success
        ? onboardingRes.value.data
        : null;

      // Extract profile/settings data
      const profileData = profileRes.status === 'fulfilled' ? profileRes.value : null;

      const travelStyle = onboardingProfile?.travelStyle;
      const comfortLevel = onboardingProfile?.comfortLevel;
      const activityLevel = onboardingProfile?.activityLevel;
      const activityTypes = onboardingProfile?.activityTypes ?? [];
      const travelGroupType = onboardingProfile?.travelGroupTypes?.[0];
      const travelTypes = onboardingProfile?.travelTypes ?? [];
      const accommodationTypes = onboardingProfile?.accommodationTypes ?? [];
      const preferredDestinations = onboardingProfile?.preferredDestinations?.destinations ?? [];

      setSearchParams({
        // Search history (highest priority)
        origin:      recentSearch?.origin       ?? 'PAR',
        destination: recentSearch?.destination  ?? 'NYC',
        departureDate: recentSearch?.departureDate
          ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        returnDate:  recentSearch?.returnDate,
        adults:      recentSearch?.passengers?.adults  ?? 1,
        children:    recentSearch?.passengers?.children ?? 0,
        infants:     recentSearch?.passengers?.infants  ?? 0,
        travelClass: recentSearch?.cabinClass ?? 'ECONOMY',

        // User profile enrichment (mapped from onboarding + profile)
        preferredCabinClass:   onboardingProfile?.cabinClassPreference ?? recentSearch?.cabinClass ?? 'ECONOMY',
        budgetMin:             onboardingProfile?.globalBudgetRange?.min,
        budgetMax:             onboardingProfile?.globalBudgetRange?.max,
        currency:              onboardingProfile?.globalBudgetRange?.currency ?? profileData?.preferences?.currency,
        travelTypes,
        accommodationTypes,
        activityTypes,
        preferredDestinations,
        comfortLevel,
        travelStyle,
        travelGroupType,
        activityLevel,
      });
    };

    fetchContext();
    fetchItineraries();
  }, [user?.id, fetchItineraries]);

  // ── Open modal when selector fires ─────────────────────────────────────────

  const handleOpenModal = (type: ModalRecommendationType) => {
    setModalType(type);
    setModalOpen(true);
  };

  // Restore last recommendation from localStorage on mount
  useEffect(() => {
    if (savedRecommendations && aiRecommendations.length === 0) {
      setAiRecommendations(savedRecommendations.proposals.map(proposalToTravelRecommendation));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Proposal selected → show action modal ──────────────────────────────────

  const handleProposalSelected = (proposals: Proposal[]) => {
    setModalOpen(false);
    // Display selected proposals immediately (optimistic)
    setAiRecommendations(proposals.map(proposalToTravelRecommendation));
    // Save to localStorage so they survive a refresh
    const entry: RecommendationHistoryEntry = {
      timestamp: new Date().toISOString(),
      proposals,
      type: proposals[0]?.type ?? 'activity',
    };
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(entry));
      setSavedRecommendations(entry);
    } catch {
      // private browsing or quota exceeded — fail silently
    }
    // Open action modal so user picks cart vs itinerary
    setPendingProposals(proposals);
    setActionModalOpen(true);
  };

  const handleActionSuccess = (result: ActionResult) => {
    setActionModalOpen(false);
    setPendingProposals([]);
    showToast(
      true,
      result.action === 'cart'
        ? '✓ Ajouté au panier !'
        : `✓ Ajouté à l'itinéraire "${result.itineraryTitle}" !`
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsRefreshing(true);
    setAiRecommendations([]);
    setError(null);
    await onRefresh();
    setIsRefreshing(false);
    setIsRefreshing(false);
  };

  // Only use AI recommendations from aiRecommendationsService (US-IA-010)
  // Old 'recommendations' prop from DashboardService is deprecated
  const displayRecommendations = aiRecommendations;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-semibold text-gray-800">{t('recommendations.forYou')}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('recommendations.refreshRecommendations')}
              aria-label={t('recommendations.refreshRecommendations')}
            >
              <RefreshCw className={`w-4 h-4 flex-shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              className="hidden sm:block min-h-[44px] px-3 text-sm md:text-base text-orange-500 hover:text-orange-600 transition-colors"
              aria-label={t('recommendations.viewAll')}
            >
              {t('recommendations.viewAll')}
            </button>
          </div>
        </div>

        {recentSearches.length > 0 && (
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <History className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 text-gray-500" />
              <h3 className="text-base md:text-lg font-medium text-gray-700">{t('recommendations.recentSearches')}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button key={index}
                  className="px-3 md:px-4 py-2 min-h-[44px] text-sm md:text-base bg-gray-50 text-gray-700 rounded-full hover:bg-orange-50 hover:text-orange-500 transition-colors"
                  aria-label={`${t('recommendations.searchAgain')} ${search}`}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 text-orange-500" />
            <h3 className="text-base md:text-lg font-medium text-gray-700">{t('recommendations.aiRecommendations')}</h3>
          </div>

          {displayRecommendations.length > 0 ? (
            <>
              {/* Mobile: Horizontal scroll — always exactly 3 */}
              <div className="md:hidden overflow-x-auto -mx-3 px-3 pb-2">
                <div className="flex gap-3" style={{ width: 'max-content' }}>
                  {displayRecommendations.slice(0, 3).map((rec) => (
                    <div key={rec.id} className="w-[280px] flex-shrink-0">
                      <ExperienceCard
                        image={rec.image} title={rec.title} location={rec.location}
                        type={rec.type} duration={rec.description}
                        priceRange={`${rec.price} ${rec.currency ?? ''}`} rating={rec.rating}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* Desktop: 3-column grid */}
              <div className="hidden md:grid grid-cols-3 gap-4">
                {displayRecommendations.slice(0, 3).map((rec) => (
                  <ExperienceCard key={rec.id}
                    image={rec.image} title={rec.title} location={rec.location}
                    type={rec.type} duration={rec.description}
                    priceRange={`${rec.price} ${rec.currency ?? ''}`} rating={rec.rating}
                  />
                ))}
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setAiRecommendations([])}
                  className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                >
                  ← Générer d'autres recommandations
                </button>
              </div>
            </>
          ) : (
            <AIRecommendationSelector onGenerate={handleOpenModal} isLoading={false} />
          )}
        </div>
      </div>

      {/* Modal — opens directly in loading, AI generates from user data */}
      <AIRecommendationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        searchParams={searchParams}
        onProposalSelected={handleProposalSelected}
      />

      {/* Action modal — cart vs itinerary choice after selecting a proposal */}
      <RecommendationActionModal
        isOpen={actionModalOpen}
        proposals={pendingProposals}
        onClose={() => { setActionModalOpen(false); setPendingProposals([]); }}
        onSuccess={handleActionSuccess}
      />

      <Toast visible={toast.visible} success={toast.success} message={toast.message} />
    </>
  );
};

export default RecommendationsSection;

