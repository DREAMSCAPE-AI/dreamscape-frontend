import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import ExperienceCard from '../features/ExperienceCard';
import AIRecommendationSelector from './AIRecommendationSelector';
import AIRecommendationModal, {
  type ModalRecommendationType,
  type Proposal,
  type AISearchParams,
} from './AIRecommendationModal';
import { TravelRecommendation } from '@/services/dashboard';
import { useAuth } from '../../services/auth/AuthService';
import { useItineraryStore } from '@/store/itineraryStore';
import { buildItineraryItem } from '@/utils/cartItemMapper';
import axios from 'axios';
import onboardingService from '@/services/user/OnboardingService';
import profileService from '@/services/user/ProfileService';

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

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  recentSearches,
  recommendations,
  onRefresh
}) => {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const { addItem, createItinerary, itineraries, fetchItineraries } = useItineraryStore();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalRecommendationType>('flights');

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

  // Animation ref
  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { once: true, margin: '-50px' });

  // Fetch user's recent search + full profile to build enriched AI context
  useEffect(() => {
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

      // Extract onboarding step data
      const stepData = onboardingRes.status === 'fulfilled' && onboardingRes.value.success
        ? (onboardingRes.value.data?.stepData ?? {})
        : {};
      const budgetStep = stepData.budget ?? {};
      const travelTypesStep = stepData.travel_types ?? {};

      // Extract profile/settings data
      const profileData = profileRes.status === 'fulfilled' ? profileRes.value : null;

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

        // User profile enrichment
        preferredCabinClass:   recentSearch?.cabinClass ?? 'ECONOMY',
        budgetMin:             budgetStep.range?.[0],
        budgetMax:             budgetStep.range?.[1],
        currency:              budgetStep.currency ?? profileData?.preferences?.currency,
        travelTypes:           travelTypesStep.travelStyle,
        accommodationTypes:    profileData?.travel?.accommodationType,
        activityTypes:         profileData?.travel?.activities,
        preferredDestinations: profileData?.travel?.preferredDestinations,
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

  // ── Proposal selected → add to itinerary ───────────────────────────────────

  const handleProposalSelected = async (proposals: Proposal[]) => {
    setModalOpen(false);

    // Show selected proposals in the dashboard section
    const displayItems: TravelRecommendation[] = proposals.map(p => ({
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
    }));
    setAiRecommendations(displayItems);

    // Get or create itinerary to add to
    let itineraryId: string;
    try {
      if (itineraries.length > 0) {
        itineraryId = itineraries[0].id;
      } else {
        const newItinerary = await createItinerary({
          title: 'Recommandations IA',
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
          destinations: proposals.map(p => p.location).filter(Boolean),
        });
        itineraryId = newItinerary.id;
      }
    } catch {
      showToast(false, "Impossible de créer l'itinéraire. Réessayez.");
      return;
    }

    // Add each proposal to the itinerary
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
      const label = addedCount === 1
        ? '✓ Ajouté à votre itinéraire !'
        : `✓ ${addedCount} éléments ajoutés à votre itinéraire !`;
      showToast(true, label);
    } else {
      showToast(false, "Impossible d'ajouter à l'itinéraire. Réessayez.");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setAiRecommendations([]);
    await onRefresh();
    setIsRefreshing(false);
  };

  const displayRecommendations = aiRecommendations.length > 0 ? aiRecommendations : recommendations;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-glass border border-surface-200/50 p-5 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-surface-900">{t('recommendations.forYou')}</h2>
            </div>
            <p className="text-sm text-gray-400 ml-7">Personalized suggestions powered by AI</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors disabled:opacity-50"
            title={t('recommendations.refreshRecommendations')}
            aria-label={t('recommendations.refreshRecommendations')}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold tracking-[0.08em] uppercase text-gray-400">{t('recommendations.recentSearches')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  className="px-3 py-1.5 text-sm bg-surface-100 text-surface-900 rounded-full border border-surface-200/50 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 transition-all"
                  aria-label={`${t('recommendations.searchAgain')} ${search}`}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div ref={gridRef}>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 text-orange-500" />
            <h3 className="text-base md:text-lg font-medium text-gray-700">{t('recommendations.aiRecommendations')}</h3>
          </div>

          {displayRecommendations.length > 0 ? (
            <>
              {/* Mobile: Horizontal scroll */}
              <div className="md:hidden overflow-x-auto -mx-5 px-5 pb-2">
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
              {/* Desktop: Grid with stagger */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="hidden md:grid grid-cols-3 gap-4"
              >
                {displayRecommendations.slice(0, 3).map((rec) => (
                  <ExperienceCard key={rec.id}
                    image={rec.image} title={rec.title} location={rec.location}
                    type={rec.type} duration={rec.description}
                    priceRange={`${rec.price} ${rec.currency ?? ''}`} rating={rec.rating}
                  />
                ))}
              </motion.div>
              <div className="mt-4 text-center">
                <button onClick={() => setAiRecommendations([])}
                  className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
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

      <Toast visible={toast.visible} success={toast.success} message={toast.message} />
    </>
  );
};

export default RecommendationsSection;
