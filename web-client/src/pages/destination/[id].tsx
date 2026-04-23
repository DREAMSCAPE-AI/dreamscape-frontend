import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  MapPin,
  Calendar,
  Heart,
  Share2,
  Clock,
  Image,
  ChevronLeft,
  ChevronRight,
  Plane,
  Users,
  ArrowRight,
} from 'lucide-react';
import voyageService from '@/services/voyage/VoyageService';
import imageService from '@/services/utility/imageService';
import VRPinAccess from '../../components/vr/VRPinAccess';
import { findDestination, type DestinationCatalogEntry } from '@/config/destinations';

const PANORAMA_BASE_URL = import.meta.env.VITE_PANORAMA_URL || '/panorama';

interface Destination {
  id: string;
  name: string;
  location: string;
  description: string;
  rating: number;
  reviewCount: number;
  price: { from: number; currency: string };
  images: string[];
  highlights: string[];
  bestTimeToVisit: string;
  duration: string;
  activities: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
    rating: number;
    image: string;
  }>;
  catalogEntry?: DestinationCatalogEntry;
}

export default function DestinationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('destinations');
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);

  useEffect(() => {
    const catalogEntry = findDestination(id);

    const buildHighlights = () => [
      t('detail.highlights.landmarks'),
      t('detail.highlights.museums'),
      t('detail.highlights.culture'),
      t('detail.highlights.parks'),
    ];

    const fetchDestination = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const searchKeyword = catalogEntry?.cityName ?? id;
        let locationResult = null;

        try {
          locationResult = await voyageService.searchLocations({ keyword: searchKeyword, subType: 'CITY' });
        } catch {
          /* first attempt failed */
        }

        if (!locationResult?.data || locationResult.data.length === 0) {
          try {
            const formattedName = id.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            locationResult = await voyageService.searchLocations({ keyword: formattedName, subType: 'CITY' });
          } catch {
            /* second attempt failed */
          }
        }

        const displayName = catalogEntry?.cityName
          ?? locationResult?.data?.[0]?.name
          ?? id.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

        const country = catalogEntry
          ? t(`detail.countries.${catalogEntry.i18nKey}`, { defaultValue: catalogEntry.country })
          : locationResult?.data?.[0]?.address?.countryName ?? '';

        const displayLocation = country ? `${displayName}, ${country}` : displayName;

        const description = catalogEntry
          ? t(`descriptions.${catalogEntry.i18nKey}`, {
              defaultValue: t('detail.description.fallback', { name: displayName }),
            })
          : t('detail.description.fallback', { name: displayName });

        let destinationImages: string[];
        if (catalogEntry) {
          destinationImages = catalogEntry.galleryImages;
        } else {
          const mainImage = await imageService.getDestinationImage(displayName);
          destinationImages = [mainImage, mainImage, mainImage, mainImage];
        }

        const activityFallbackImages = [
          'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&q=80&w=800',
        ];

        let activities: Destination['activities'] = [];
        const geoCode = locationResult?.data?.[0]?.geoCode;
        if (geoCode) {
          try {
            const res = await voyageService.searchActivities({
              latitude: geoCode.latitude,
              longitude: geoCode.longitude,
              radius: 20,
            });
            activities =
              res.data?.slice(0, 6).map((a: any, i: number) => ({
                id: a.id || `activity-${i}`,
                name: a.name || t('detail.activity.defaultName'),
                description: a.shortDescription || a.description || t('detail.activity.defaultDescription'),
                price: a.price?.amount ? parseFloat(a.price.amount) : Math.floor(Math.random() * 100) + 50,
                duration: a.duration || t('detail.activity.defaultDuration'),
                rating: a.rating || 4.0 + Math.random(),
                image: a.pictures?.[0]?.url || activityFallbackImages[i % activityFallbackImages.length],
              })) || [];
          } catch {
            /* activities fetch failed */
          }
        }

        setDestination({
          id,
          name: displayName,
          location: displayLocation,
          description,
          rating: 4.0 + Math.random() * 0.8,
          reviewCount: Math.floor(Math.random() * 2000) + 500,
          price: { from: Math.floor(Math.random() * 300) + 200, currency: '€' },
          images: destinationImages,
          highlights: buildHighlights(),
          bestTimeToVisit: t('detail.info.defaultBestTime'),
          duration: t('detail.info.defaultDuration'),
          activities,
          catalogEntry,
        });
      } catch {
        await loadFallback();
        setError(t('detail.partialDetails'));
      } finally {
        setLoading(false);
      }
    };

    const loadFallback = async () => {
      const fallbackName = catalogEntry?.cityName
        ?? id?.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        ?? 'Unknown';
      const fallbackImages = catalogEntry?.galleryImages
        ?? Array(4).fill(await imageService.getDestinationImage(fallbackName));

      const country = catalogEntry
        ? t(`detail.countries.${catalogEntry.i18nKey}`, { defaultValue: catalogEntry.country })
        : '';
      const displayLocation = country ? `${fallbackName}, ${country}` : fallbackName;

      const description = catalogEntry
        ? t(`descriptions.${catalogEntry.i18nKey}`, {
            defaultValue: t('detail.description.fallback', { name: fallbackName }),
          })
        : t('detail.description.fallback', { name: fallbackName });

      setDestination({
        id: id || 'unknown',
        name: fallbackName,
        location: displayLocation,
        description,
        rating: 4.2,
        reviewCount: 1250,
        price: { from: 299, currency: '€' },
        images: fallbackImages,
        highlights: buildHighlights(),
        bestTimeToVisit: t('detail.info.defaultBestTime'),
        duration: t('detail.info.defaultDuration'),
        activities: [],
        catalogEntry,
      });
    };

    fetchDestination();
  }, [id, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">{t('detail.loading')}</p>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-surface-900 mb-3">{t('detail.notFoundTitle')}</h1>
          <p className="text-gray-500 mb-6">{t('detail.notFoundMessage')}</p>
          <button
            onClick={() => navigate('/destinations')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl text-sm font-semibold"
          >
            {t('detail.browseDestinations')}
          </button>
        </div>
      </div>
    );
  }

  const vrEnvironment = destination.catalogEntry?.hasVR ? destination.catalogEntry.vrEnvironment : undefined;

  return (
    <div className="min-h-screen bg-surface-50">
      <section className="relative h-[75vh] min-h-[500px] max-h-[800px] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ scale: heroScale }}>
          <img
            src={destination.images[heroIdx]}
            alt={destination.name}
            className="w-full h-full object-cover transition-all duration-700"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/30 to-surface-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-950/50 via-transparent to-transparent" />

        <motion.div
          className="absolute top-24 left-4 sm:left-8 z-20"
          style={{ opacity: heroOpacity }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.14] transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('detail.back')}
          </button>
        </motion.div>

        {destination.images.length > 1 && (
          <motion.div className="absolute bottom-28 right-4 sm:right-8 z-20 flex gap-2" style={{ opacity: heroOpacity }}>
            <button
              onClick={() => setHeroIdx((p) => (p === 0 ? destination.images.length - 1 : p - 1))}
              className="w-10 h-10 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.14] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setHeroIdx((p) => (p === destination.images.length - 1 ? 0 : p + 1))}
              className="w-10 h-10 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.14] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        <motion.div
          className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-10 z-10"
          style={{ opacity: heroOpacity }}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.08] text-white/70 text-xs font-medium">
                  <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                  {destination.rating.toFixed(1)}
                  <span className="text-white/30">({destination.reviewCount})</span>
                </span>
                <span className="flex items-center gap-1.5 text-white/40 text-xs">
                  <MapPin className="w-3 h-3" />
                  {destination.location}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                {destination.name}
              </h1>

              <p className="mt-3 text-white/40 text-sm md:text-base max-w-xl leading-relaxed">
                {destination.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button className="w-10 h-10 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-pink-400 hover:bg-white/[0.14] transition-all">
                <Heart className="w-[18px] h-[18px]" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.14] transition-all">
                <Share2 className="w-[18px] h-[18px]" />
              </button>
              {vrEnvironment && (
                <VRPinAccess destinationId={vrEnvironment} expirationMinutes={10} />
              )}
              {vrEnvironment && (
                <a
                  href={`${PANORAMA_BASE_URL}?destination=${vrEnvironment}&mode=gallery`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.14] transition-all text-xs font-medium"
                >
                  <Image className="w-4 h-4" />
                  {t('detail.actions.gallery2d')}
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Star, label: t('detail.stats.rating'), value: destination.rating.toFixed(1) },
                { icon: Calendar, label: t('detail.stats.bestTime'), value: destination.bestTimeToVisit.split(' ')[0] },
                { icon: Clock, label: t('detail.stats.duration'), value: t('detail.info.shortDuration') },
                { icon: MapPin, label: t('detail.stats.startingAt'), value: `${destination.price.currency}${destination.price.from}` },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <item.icon className="w-4 h-4 text-orange-500 mb-2" />
                  <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                  <p className="text-lg font-bold text-surface-900 mt-0.5">{item.value}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="p-6 md:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h2 className="text-lg font-bold text-surface-900 mb-4">{t('detail.sections.highlights')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {destination.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 shrink-0 rounded-lg bg-orange-50 flex items-center justify-center mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{h}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {destination.images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <h2 className="text-lg font-bold text-surface-900 mb-4">{t('detail.sections.gallery')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {destination.images.map((img, i) => (
                    <motion.div
                      key={i}
                      className={`relative overflow-hidden rounded-2xl cursor-pointer group ${
                        i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-[4/3]'
                      }`}
                      onClick={() => setHeroIdx(i)}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={img}
                        alt={`${destination.name} ${i + 1}`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      {heroIdx === i && (
                        <div className="absolute inset-0 ring-2 ring-orange-500 ring-inset rounded-2xl" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {destination.activities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <h2 className="text-lg font-bold text-surface-900 mb-4">{t('detail.sections.popularActivities')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {destination.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="group rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={activity.image}
                          alt={activity.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-bold text-surface-900">
                            €{activity.price}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-surface-900 text-sm mb-1">{activity.name}</h3>
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                            <span className="text-xs font-medium text-surface-900">{activity.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-1">
            <motion.div
              className="sticky top-24 space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-baseline justify-between mb-5">
                  <div>
                    <span className="text-2xl font-bold text-surface-900">
                      {destination.price.currency}{destination.price.from}
                    </span>
                    <span className="text-sm text-gray-400 ml-1">{t('detail.booking.perPerson')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                    <span className="text-sm font-medium text-surface-900">{destination.rating.toFixed(1)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/planner', { state: { destination: destination.name } })}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/20 transition-shadow mb-3"
                >
                  <Plane className="w-4 h-4" />
                  {t('detail.booking.bookTrip')}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/flights', { state: { destination: destination.location } })}
                  className="w-full flex items-center justify-center gap-2 py-3.5 border border-gray-200 text-surface-900 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  {t('detail.booking.searchFlights')}
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-surface-900">{t('detail.sections.travelInfo')}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
                  <div>
                    <p className="font-medium text-surface-900 text-xs">{t('detail.info.bestTimeToVisit')}</p>
                    <p className="text-xs">{destination.bestTimeToVisit}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                  <div>
                    <p className="font-medium text-surface-900 text-xs">{t('detail.info.recommendedDuration')}</p>
                    <p className="text-xs">{destination.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Users className="w-4 h-4 text-orange-500 shrink-0" />
                  <div>
                    <p className="font-medium text-surface-900 text-xs">{t('detail.info.reviews')}</p>
                    <p className="text-xs">
                      {t('detail.info.verifiedTravelers', { count: destination.reviewCount })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
