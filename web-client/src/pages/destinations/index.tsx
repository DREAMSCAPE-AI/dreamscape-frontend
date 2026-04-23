import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import DestinationCard from '@/components/DestinationCard';
import voyageService from '@/services/voyage/VoyageService';
import imageService from '@/services/utility/imageService';

interface Destination {
  id: string;
  title: string;
  image: string;
  description: string;
}

export default function DestinationsPage() {
  const { t } = useTranslation('destinations');
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularDestinations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache (30-min expiry)
        const cachedDestinations = localStorage.getItem('cachedDestinations');
        const cacheTimestamp = localStorage.getItem('destinationsCacheTime');
        const cacheExpiry = 30 * 60 * 1000;

        if (cachedDestinations && cacheTimestamp) {
          const isExpired = Date.now() - parseInt(cacheTimestamp) > cacheExpiry;
          if (!isExpired) {
            setDestinations(JSON.parse(cachedDestinations));
            setLoading(false);
            return;
          }
        }

        const popularCities = ['PAR', 'NRT', 'DXB', 'JFK', 'LHR', 'BKK'];
        const destinations: Destination[] = [];
        let rateLimitHit = false;

        for (let i = 0; i < popularCities.length && !rateLimitHit; i++) {
          const cityCode = popularCities[i];
          try {
            if (i > 0) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }

            const response = await voyageService.searchLocations({
              keyword: cityCode,
              subType: 'CITY'
            });

            if (response.data && response.data.length > 0) {
              const location = response.data[0];
              const locationName = location.name || getDefaultCityName(cityCode);

              let imageUrl: string;
              try {
                imageUrl = await imageService.getDestinationImage(locationName);
              } catch {
                imageUrl = getDefaultImage(cityCode);
              }

              destinations.push({
                id: location.iataCode || cityCode,
                title: locationName,
                image: imageUrl,
                description: t(`descriptions.${getDescKey(cityCode)}`, { defaultValue: t('descriptions.default') })
              });
            } else {
              destinations.push(createFallbackDestination(cityCode));
            }
          } catch (err: any) {
            if (err.response?.status === 429 || err.message?.includes('Rate limit')) {
              rateLimitHit = true;
              break;
            }
            destinations.push(createFallbackDestination(cityCode));
          }
        }

        if (destinations.length > 0) {
          if (rateLimitHit && destinations.length < popularCities.length) {
            const remainingCities = popularCities.slice(destinations.length);
            for (const cityCode of remainingCities) {
              destinations.push(createFallbackDestination(cityCode));
            }
          }
          localStorage.setItem('cachedDestinations', JSON.stringify(destinations));
          localStorage.setItem('destinationsCacheTime', Date.now().toString());
          setDestinations(destinations);
        } else {
          const fallbackDestinations = getDefaultDestinations();
          setDestinations(fallbackDestinations);
        }
      } catch {
        setError(t('errors.loadFailed'));
        const defaultDestinations = getDefaultDestinations();
        setDestinations(defaultDestinations);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularDestinations();
  }, []);

  const getDescKey = (cityCode: string): string => {
    const map: Record<string, string> = {
      PAR: 'paris', NRT: 'tokyo', DXB: 'dubai',
      JFK: 'newYork', LHR: 'london', BKK: 'bangkok',
    };
    return map[cityCode] || 'default';
  };

  const createFallbackDestination = (cityCode: string): Destination => {
    const data = getCityData(cityCode);
    return { id: cityCode, title: data.name, image: data.image, description: data.description };
  };

  const getCityData = (cityCode: string) => {
    const cityMap: Record<string, { name: string; image: string; description: string }> = {
      PAR: { name: 'Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800', description: t('descriptions.paris') },
      NRT: { name: 'Tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800', description: t('descriptions.tokyo') },
      DXB: { name: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800', description: t('descriptions.dubai') },
      JFK: { name: 'New York', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800', description: t('descriptions.newYork') },
      LHR: { name: 'London', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800', description: t('descriptions.london') },
      BKK: { name: 'Bangkok', image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&q=80&w=800', description: t('descriptions.bangkok') },
    };
    return cityMap[cityCode] || {
      name: getDefaultCityName(cityCode),
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
      description: t('descriptions.default'),
    };
  };

  const getDefaultCityName = (cityCode: string): string => {
    const names: Record<string, string> = { PAR: 'Paris', NRT: 'Tokyo', DXB: 'Dubai', JFK: 'New York', LHR: 'London', BKK: 'Bangkok' };
    return names[cityCode] || cityCode;
  };

  const getDefaultImage = (cityCode: string): string => {
    const images: Record<string, string> = {
      PAR: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
      NRT: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800',
      DXB: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800',
      JFK: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800',
      LHR: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800',
      BKK: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&q=80&w=800',
    };
    return images[cityCode] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800';
  };

  const getDefaultDestinations = (): Destination[] => {
    return ['PAR', 'NRT', 'DXB', 'JFK', 'LHR', 'BKK'].map(c => createFallbackDestination(c));
  };

  const handleDestinationClick = (destination: Destination) => {
    navigate(`/destination/${destination.id}`);
  };

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50">
        {/* Hero skeleton */}
        <div className="relative pt-32 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="h-5 w-32 mx-auto mb-4 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-12 w-80 mx-auto mb-3 rounded-xl bg-gray-200 animate-pulse" />
            <div className="h-5 w-64 mx-auto rounded-lg bg-gray-100 animate-pulse" />
          </div>
        </div>
        {/* Cards skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* ─── Hero banner ─── */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white">
        {/* Ambient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
              top: '-10%',
              left: '10%',
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)',
              bottom: '-5%',
              right: '15%',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-[11px] font-semibold tracking-[0.2em] uppercase rounded-full bg-orange-50 text-orange-500 border border-orange-100">
              <Compass className="w-3 h-3" />
              {t('categories.popular')}
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-gradient">{t('page.title')}</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
              {t('page.subtitle')}
            </p>
          </motion.div>

          {error && (
            <motion.div
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── Destinations grid ─── */}
      <section className="pb-24 md:pb-32 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {destinations.map((destination, i) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <DestinationCard
                  id={destination.id}
                  title={destination.title}
                  image={destination.image}
                  description={destination.description}
                  onClick={() => handleDestinationClick(destination)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
