import React, { useEffect, useState } from 'react';
import { X, Plane, Home, Compass, Sparkles } from 'lucide-react';
import {
  getAllRecommendations,
  type RecommendationCategory,
} from '../../services/aiRecommendationsService';
import { useAuth } from '../../services/auth/AuthService';

export type ModalRecommendationType = RecommendationCategory | 'itinerary';

// ─── Raw recommendation shapes from the AI service ───────────────────────────

export interface RawFlightRecommendation {
  flightOfferId: string;
  origin: string;
  destination: string;
  airline: string;
  duration: string;
  price: number;
  currency: string;
  cabinClass: string;
  bookingClass: string;
  score?: number;
  segments: unknown[];
  validUntil?: string;
}

export interface RawActivityRecommendation {
  id: string;
  name: string;
  shortDescription: string;
  location?: { address?: string };
  geoCode?: { label?: string };
  price?: { amount?: number; currencyCode?: string };
  rating?: number;
  pictures?: string[];
  bookingLink?: string;
  score?: number;
}

export interface RawAccommodationRecommendation {
  id: string;
  name: string;
  description?: string;
  location?: string;
  price?: number;
  currency?: string;
  rating?: number;
  imageUrl?: string;
  score?: number;
}

export type ProposalType = 'flight' | 'hotel' | 'activity';

export interface Proposal {
  id: string;
  type: ProposalType;
  title: string;
  subtitle: string;
  location: string;
  price: number;
  currency: string;
  rating: number;
  image: string;
  raw: RawFlightRecommendation | RawActivityRecommendation | RawAccommodationRecommendation;
}

// Itinerary bundle: one slot = flight + hotel + activity
export interface ItineraryBundle {
  index: number;
  flight?: Proposal;
  hotel?: Proposal;
  activity?: Proposal;
  totalPrice: number;
  currency: string;
}

// Search params forwarded from user's existing search history + enriched user profile
export interface AISearchParams {
  // From search history
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  travelClass?: string;
  // From user profile (onboarding + settings)
  preferredCabinClass?: string;
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  travelTypes?: string[];
  accommodationTypes?: string[];
  activityTypes?: string[];
  preferredDestinations?: string[];
  comfortLevel?: string;
  travelStyle?: string;
  travelGroupType?: string;
  activityLevel?: string;
}

// ─── Loading animation (cold-start aware) ────────────────────────────────────

const COLD_START_PHASES = [
  { delay: 0,     msg: "Connexion au moteur IA..." },
  { delay: 4000,  msg: "Chargement des modèles vectoriels..." },
  { delay: 12000, msg: "Analyse de vos préférences..." },
  { delay: 20000, msg: "Génération de 3 propositions..." },
  { delay: 35000, msg: "Encore quelques instants (démarrage à froid)..." },
];

const LoadingStep: React.FC = () => {
  const [phaseIdx, setPhaseIdx] = useState(0);

  useEffect(() => {
    const timers = COLD_START_PHASES.slice(1).map((phase, i) =>
      setTimeout(() => setPhaseIdx(i + 1), phase.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-orange-500" />
      </div>
      <p className="text-gray-700 font-medium">{COLD_START_PHASES[phaseIdx].msg}</p>
      {phaseIdx >= 4 && (
        <p className="text-xs text-gray-400 mt-1 text-center max-w-xs">
          Le service IA redémarre — cela peut prendre jusqu'à 60s au premier appel.
        </p>
      )}
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-orange-300 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    </div>
  );
};

// ─── Proposal normalizers ─────────────────────────────────────────────────────

function normalizeFlights(raws: RawFlightRecommendation[]): Proposal[] {
  return raws.slice(0, 3).map(f => ({
    id: f.flightOfferId,
    type: 'flight' as ProposalType,
    title: `${f.origin} → ${f.destination}`,
    subtitle: `${f.airline} · ${f.duration}`,
    location: f.destination,
    price: f.price,
    currency: f.currency,
    rating: Math.min(5, (f.score ?? 0.9) * 5),
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
    raw: f,
  }));
}

function normalizeHotels(raws: RawAccommodationRecommendation[]): Proposal[] {
  return raws.slice(0, 3).map(h => ({
    id: h.id,
    type: 'hotel' as ProposalType,
    title: h.name,
    subtitle: h.description ?? '',
    location: h.location ?? '',
    price: h.price ?? 0,
    currency: h.currency ?? 'EUR',
    rating: h.rating ?? 4.5,
    image: h.imageUrl ?? 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80',
    raw: h,
  }));
}

function normalizeActivities(raws: RawActivityRecommendation[]): Proposal[] {
  return raws.slice(0, 3).map(a => ({
    id: a.id,
    type: 'activity' as ProposalType,
    title: a.name,
    subtitle: a.shortDescription,
    location: a.location?.address ?? a.geoCode?.label ?? '',
    price: a.price?.amount ?? 0,
    currency: a.price?.currencyCode ?? 'EUR',
    rating: a.rating ?? 4.5,
    image: a.pictures?.[0] ?? 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
    raw: a,
  }));
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AIRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ModalRecommendationType;
  /** User's existing search history params — AI uses these to generate */
  searchParams: AISearchParams;
  onProposalSelected: (proposals: Proposal[]) => void;
}

// ─── Main modal ───────────────────────────────────────────────────────────────

const AIRecommendationModal: React.FC<AIRecommendationModalProps> = ({
  isOpen,
  onClose,
  type,
  searchParams,
  onProposalSelected,
}) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  type ModalStep = 'loading' | 'results' | 'error';
  const [step, setStep] = useState<ModalStep>('loading');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [bundles, setBundles] = useState<ItineraryBundle[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-generate as soon as the modal opens — no form needed
  useEffect(() => {
    if (!isOpen || !userId) return;
    setStep('loading');
    setProposals([]);
    setBundles([]);

    const params = {
      // Search context
      origin:        searchParams.origin,
      destination:   searchParams.destination,
      departureDate: searchParams.departureDate,
      checkInDate:   searchParams.departureDate,
      checkOutDate:  searchParams.returnDate,
      startDate:     searchParams.departureDate,
      endDate:       searchParams.returnDate ?? searchParams.departureDate,
      adults:        searchParams.adults ?? 1,
      children:      searchParams.children ?? 0,
      infants:       searchParams.infants ?? 0,
      rooms:         1,
      travelClass:   searchParams.preferredCabinClass ?? searchParams.travelClass,
      // User profile enrichment
      budgetMin:           searchParams.budgetMin,
      budgetMax:           searchParams.budgetMax,
      currency:            searchParams.currency,
      travelTypes:         searchParams.travelTypes,
      accommodationTypes:  searchParams.accommodationTypes,
      activityTypes:       searchParams.activityTypes,
      preferredDestinations: searchParams.preferredDestinations,
      comfortLevel:        searchParams.comfortLevel,
      travelStyle:         searchParams.travelStyle,
      travelGroupType:     searchParams.travelGroupType,
      activityLevel:       searchParams.activityLevel,
    };

    const categories: RecommendationCategory[] =
      type === 'itinerary' ? ['flights', 'accommodations', 'activities'] : [type as RecommendationCategory];

    getAllRecommendations(userId, categories, params)
      .then(results => {
        if (type === 'itinerary') {
          const flights    = results.flights?.success
            ? normalizeFlights(results.flights.data.recommendations as RawFlightRecommendation[]) : [];
          const hotels     = results.accommodations?.success
            ? normalizeHotels(results.accommodations.data.recommendations as RawAccommodationRecommendation[]) : [];
          const activities = results.activities?.success
            ? normalizeActivities(results.activities.data.recommendations as RawActivityRecommendation[]) : [];

          setBundles([0, 1, 2].map(i => ({
            index: i,
            flight:   flights[i],
            hotel:    hotels[i],
            activity: activities[i],
            totalPrice: (flights[i]?.price ?? 0) + (hotels[i]?.price ?? 0) + (activities[i]?.price ?? 0),
            currency: flights[i]?.currency ?? hotels[i]?.currency ?? activities[i]?.currency ?? 'EUR',
          })));
        } else {
          let raw: Proposal[] = [];
          if (type === 'flights'        && results.flights?.success)
            raw = normalizeFlights(results.flights.data.recommendations as RawFlightRecommendation[]);
          else if (type === 'accommodations' && results.accommodations?.success)
            raw = normalizeHotels(results.accommodations.data.recommendations as RawAccommodationRecommendation[]);
          else if (type === 'activities' && results.activities?.success)
            raw = normalizeActivities(results.activities.data.recommendations as RawActivityRecommendation[]);
          setProposals(raw.slice(0, 3));
        }
        setStep('results');
      })
      .catch(() => {
        setErrorMsg('La génération a échoué. Réessayez.');
        setStep('error');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId, type]);

  const handleClose = () => { setStep('loading'); onClose(); };

  if (!isOpen) return null;

  const titles: Record<ModalRecommendationType, string> = {
    flights:        'Recommandations de vols',
    accommodations: "Recommandations d'hébergements",
    activities:     "Recommandations d'activités",
    itinerary:      'Itinéraire complet',
  };
  const typeIcons: Record<ModalRecommendationType, React.ReactNode> = {
    flights:        <Plane    className="w-5 h-5 text-blue-500" />,
    accommodations: <Home     className="w-5 h-5 text-green-500" />,
    activities:     <Compass  className="w-5 h-5 text-purple-500" />,
    itinerary:      <Sparkles className="w-5 h-5 text-orange-500" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {typeIcons[type]}
            <h2 className="text-base font-semibold text-gray-800">{titles[type]}</h2>
          </div>
          <button onClick={handleClose} aria-label="Fermer"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto">
          {step === 'loading' && <LoadingStep />}

          {step === 'error' && (
            <div className="p-6 text-center">
              <p className="text-red-500 mb-4">{errorMsg}</p>
              <button onClick={handleClose} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">
                Fermer
              </button>
            </div>
          )}

          {step === 'results' && type !== 'itinerary' && (
            <div className="p-6 space-y-3">
              <p className="text-sm text-gray-500 mb-2">
                Sélectionnez une proposition pour l'ajouter à votre itinéraire.
              </p>
              {proposals.length === 0
                ? <p className="text-center text-gray-400 py-8">Aucune proposition disponible.</p>
                : proposals.map((p, i) => (
                    <ProposalCard key={p.id} proposal={p} index={i + 1}
                      onSelect={() => onProposalSelected([p])} />
                  ))}
            </div>
          )}

          {step === 'results' && type === 'itinerary' && (
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500 mb-2">
                Sélectionnez un itinéraire complet pour l'ajouter à votre planning.
              </p>
              {bundles.map((b, i) => (
                <BundleCard key={i} bundle={b} index={i + 1}
                  onSelect={() => onProposalSelected([b.flight, b.hotel, b.activity].filter(Boolean) as Proposal[])} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Proposal card ────────────────────────────────────────────────────────────

const ProposalCard: React.FC<{ proposal: Proposal; index: number; onSelect: () => void }> = ({ proposal, index, onSelect }) => (
  <div className="flex gap-3 p-3 border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-sm transition-all">
    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
      <img src={proposal.image} alt={proposal.title} className="w-full h-full object-cover" />
      <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
        {index}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 truncate">{proposal.title}</p>
      <p className="text-xs text-gray-500 truncate">{proposal.subtitle}</p>
      <p className="text-xs text-gray-400 mt-0.5">{proposal.location}</p>
      <p className="text-sm font-bold text-orange-500 mt-1">
        {proposal.price > 0 ? `${proposal.price} ${proposal.currency}` : 'Prix sur demande'}
      </p>
    </div>
    <button onClick={onSelect}
      className="self-center flex-shrink-0 px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors">
      Choisir
    </button>
  </div>
);

// ─── Bundle card ──────────────────────────────────────────────────────────────

const BundleCard: React.FC<{ bundle: ItineraryBundle; index: number; onSelect: () => void }> = ({ bundle, index, onSelect }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden hover:border-orange-300 hover:shadow-sm transition-all">
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
      <span className="text-sm font-semibold text-gray-700">Itinéraire {index}</span>
      <span className="text-sm font-bold text-orange-500">
        {bundle.totalPrice > 0 ? `${bundle.totalPrice.toFixed(0)} ${bundle.currency}` : 'Prix sur demande'}
      </span>
    </div>
    <div className="p-3 space-y-2">
      {bundle.flight && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Plane   className="w-3.5 h-3.5 text-blue-500   flex-shrink-0" />
          <span className="truncate">{bundle.flight.title}</span>
          <span className="ml-auto flex-shrink-0 font-medium">{bundle.flight.price} {bundle.flight.currency}</span>
        </div>
      )}
      {bundle.hotel && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Home    className="w-3.5 h-3.5 text-green-500  flex-shrink-0" />
          <span className="truncate">{bundle.hotel.title}</span>
          <span className="ml-auto flex-shrink-0 font-medium">{bundle.hotel.price} {bundle.hotel.currency}</span>
        </div>
      )}
      {bundle.activity && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Compass className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
          <span className="truncate">{bundle.activity.title}</span>
          <span className="ml-auto flex-shrink-0 font-medium">{bundle.activity.price} {bundle.activity.currency}</span>
        </div>
      )}
    </div>
    <div className="px-4 pb-3">
      <button onClick={onSelect}
        className="w-full py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors">
        Choisir cet itinéraire
      </button>
    </div>
  </div>
);

export default AIRecommendationModal;
