/**
 * Destination catalog
 *
 * Single source of truth for destination detail pages:
 * - Clean city names (avoids airport-name titles from Amadeus)
 * - City-matched gallery images (avoids generic stock fallbacks)
 * - VR availability flag (matches panorama/src/data/environments.js)
 *
 * Keys are IATA codes; aliases cover airport codes and city slugs.
 */

export interface DestinationCatalogEntry {
  code: string;
  cityName: string;
  country: string;
  i18nKey: string;
  heroImage: string;
  galleryImages: string[];
  hasVR: boolean;
  vrEnvironment?: string;
  aliases: string[];
}

const unsplash = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}`;

export const DESTINATION_CATALOG: DestinationCatalogEntry[] = [
  {
    code: 'PAR',
    cityName: 'Paris',
    country: 'France',
    i18nKey: 'paris',
    heroImage: unsplash('photo-1502602898657-3e91760cbb34'),
    galleryImages: [
      unsplash('photo-1502602898657-3e91760cbb34'),
      unsplash('photo-1431274172761-fca41d930114'),
      unsplash('photo-1499856871958-5b9627545d1a'),
      unsplash('photo-1550340499-a6c60fc8287c'),
    ],
    hasVR: true,
    vrEnvironment: 'paris',
    aliases: ['PAR', 'CDG', 'ORY', 'paris'],
  },
  {
    code: 'BCN',
    cityName: 'Barcelona',
    country: 'Spain',
    i18nKey: 'barcelona',
    heroImage: unsplash('photo-1539037116277-4db20889f2d4'),
    galleryImages: [
      unsplash('photo-1539037116277-4db20889f2d4'),
      unsplash('photo-1583422409516-2895a77efded'),
      unsplash('photo-1509840841025-9088ba78a826'),
      unsplash('photo-1591375462098-b5e96e5cf1b5'),
    ],
    hasVR: true,
    vrEnvironment: 'barcelona',
    aliases: ['BCN', 'barcelona'],
  },
  {
    code: 'NRT',
    cityName: 'Tokyo',
    country: 'Japan',
    i18nKey: 'tokyo',
    heroImage: unsplash('photo-1540959733332-eab4deabeeaf'),
    galleryImages: [
      unsplash('photo-1540959733332-eab4deabeeaf'),
      unsplash('photo-1513407030348-c983a97b98d8'),
      unsplash('photo-1536098561742-ca998e48cbcc'),
      unsplash('photo-1554797589-7241bb691973'),
    ],
    hasVR: false,
    aliases: ['NRT', 'HND', 'TYO', 'tokyo'],
  },
  {
    code: 'DXB',
    cityName: 'Dubai',
    country: 'United Arab Emirates',
    i18nKey: 'dubai',
    heroImage: unsplash('photo-1512453979798-5ea266f8880c'),
    galleryImages: [
      unsplash('photo-1512453979798-5ea266f8880c'),
      unsplash('photo-1518684079-3c830dcef090'),
      unsplash('photo-1518544801976-3e159e50e5bb'),
      unsplash('photo-1509020526640-41a0d3d5a2e4'),
    ],
    hasVR: false,
    aliases: ['DXB', 'dubai'],
  },
  {
    code: 'JFK',
    cityName: 'New York',
    country: 'United States',
    i18nKey: 'newYork',
    heroImage: unsplash('photo-1496442226666-8d4d0e62e6e9'),
    galleryImages: [
      unsplash('photo-1496442226666-8d4d0e62e6e9'),
      unsplash('photo-1522083165195-3424ed129620'),
      unsplash('photo-1485871981521-5b1fd3805eee'),
      unsplash('photo-1534430480872-3498386e7856'),
    ],
    hasVR: false,
    aliases: ['JFK', 'LGA', 'EWR', 'NYC', 'new-york', 'newyork'],
  },
  {
    code: 'LHR',
    cityName: 'London',
    country: 'United Kingdom',
    i18nKey: 'london',
    heroImage: unsplash('photo-1513635269975-59663e0ac1ad'),
    galleryImages: [
      unsplash('photo-1513635269975-59663e0ac1ad'),
      unsplash('photo-1529655683826-aba9b3e77383'),
      unsplash('photo-1520986606214-8b456906c813'),
      unsplash('photo-1486299267070-83823f5448dd'),
    ],
    hasVR: false,
    aliases: ['LHR', 'LGW', 'STN', 'LON', 'london'],
  },
  {
    code: 'BKK',
    cityName: 'Bangkok',
    country: 'Thailand',
    i18nKey: 'bangkok',
    heroImage: unsplash('photo-1563492065-1a4e2d0b4b5a'),
    galleryImages: [
      unsplash('photo-1563492065-1a4e2d0b4b5a'),
      unsplash('photo-1508009603885-50cf7c579365'),
      unsplash('photo-1528181304800-259b08848526'),
      unsplash('photo-1552465011-b4e21bf6e79a'),
    ],
    hasVR: false,
    aliases: ['BKK', 'DMK', 'bangkok'],
  },
];

export function findDestination(id: string | undefined): DestinationCatalogEntry | undefined {
  if (!id) return undefined;
  const normalized = id.trim().toLowerCase();
  return DESTINATION_CATALOG.find((entry) =>
    entry.aliases.some((alias) => alias.toLowerCase() === normalized),
  );
}
