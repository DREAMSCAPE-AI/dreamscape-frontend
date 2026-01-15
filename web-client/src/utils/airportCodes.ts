/**
 * Airport codes utility - Maps IATA codes to city/country names
 * Common airports for display purposes
 */

interface AirportInfo {
  city: string;
  country: string;
  name: string;
}

// Common airports mapping
const AIRPORTS: Record<string, AirportInfo> = {
  // France
  CDG: { city: 'Paris', country: 'France', name: 'Charles de Gaulle' },
  ORY: { city: 'Paris', country: 'France', name: 'Orly' },
  NCE: { city: 'Nice', country: 'France', name: 'Côte d\'Azur' },
  LYS: { city: 'Lyon', country: 'France', name: 'Saint-Exupéry' },
  MRS: { city: 'Marseille', country: 'France', name: 'Provence' },
  TLS: { city: 'Toulouse', country: 'France', name: 'Blagnac' },
  BOD: { city: 'Bordeaux', country: 'France', name: 'Mérignac' },
  NTE: { city: 'Nantes', country: 'France', name: 'Atlantique' },

  // United Kingdom
  LHR: { city: 'London', country: 'UK', name: 'Heathrow' },
  LGW: { city: 'London', country: 'UK', name: 'Gatwick' },
  STN: { city: 'London', country: 'UK', name: 'Stansted' },
  LTN: { city: 'London', country: 'UK', name: 'Luton' },
  MAN: { city: 'Manchester', country: 'UK', name: 'Manchester' },
  EDI: { city: 'Edinburgh', country: 'UK', name: 'Edinburgh' },
  BHX: { city: 'Birmingham', country: 'UK', name: 'Birmingham' },

  // Germany
  FRA: { city: 'Frankfurt', country: 'Germany', name: 'Frankfurt' },
  MUC: { city: 'Munich', country: 'Germany', name: 'Franz Josef Strauss' },
  BER: { city: 'Berlin', country: 'Germany', name: 'Brandenburg' },
  DUS: { city: 'Düsseldorf', country: 'Germany', name: 'Düsseldorf' },
  HAM: { city: 'Hamburg', country: 'Germany', name: 'Hamburg' },

  // Spain
  MAD: { city: 'Madrid', country: 'Spain', name: 'Barajas' },
  BCN: { city: 'Barcelona', country: 'Spain', name: 'El Prat' },
  PMI: { city: 'Palma de Mallorca', country: 'Spain', name: 'Son Sant Joan' },
  AGP: { city: 'Malaga', country: 'Spain', name: 'Costa del Sol' },
  IBZ: { city: 'Ibiza', country: 'Spain', name: 'Ibiza' },

  // Italy
  FCO: { city: 'Rome', country: 'Italy', name: 'Fiumicino' },
  MXP: { city: 'Milan', country: 'Italy', name: 'Malpensa' },
  LIN: { city: 'Milan', country: 'Italy', name: 'Linate' },
  VCE: { city: 'Venice', country: 'Italy', name: 'Marco Polo' },
  NAP: { city: 'Naples', country: 'Italy', name: 'Capodichino' },
  FLR: { city: 'Florence', country: 'Italy', name: 'Peretola' },

  // Netherlands
  AMS: { city: 'Amsterdam', country: 'Netherlands', name: 'Schiphol' },

  // Belgium
  BRU: { city: 'Brussels', country: 'Belgium', name: 'Brussels' },

  // Switzerland
  ZRH: { city: 'Zurich', country: 'Switzerland', name: 'Zurich' },
  GVA: { city: 'Geneva', country: 'Switzerland', name: 'Geneva' },

  // Portugal
  LIS: { city: 'Lisbon', country: 'Portugal', name: 'Humberto Delgado' },
  OPO: { city: 'Porto', country: 'Portugal', name: 'Francisco Sá Carneiro' },

  // Austria
  VIE: { city: 'Vienna', country: 'Austria', name: 'Vienna' },

  // Greece
  ATH: { city: 'Athens', country: 'Greece', name: 'Eleftherios Venizelos' },

  // Turkey
  IST: { city: 'Istanbul', country: 'Turkey', name: 'Istanbul' },
  SAW: { city: 'Istanbul', country: 'Turkey', name: 'Sabiha Gökçen' },

  // USA
  JFK: { city: 'New York', country: 'USA', name: 'John F. Kennedy' },
  LGA: { city: 'New York', country: 'USA', name: 'LaGuardia' },
  EWR: { city: 'Newark', country: 'USA', name: 'Newark Liberty' },
  LAX: { city: 'Los Angeles', country: 'USA', name: 'Los Angeles' },
  SFO: { city: 'San Francisco', country: 'USA', name: 'San Francisco' },
  ORD: { city: 'Chicago', country: 'USA', name: 'O\'Hare' },
  MIA: { city: 'Miami', country: 'USA', name: 'Miami' },
  ATL: { city: 'Atlanta', country: 'USA', name: 'Hartsfield-Jackson' },
  DFW: { city: 'Dallas', country: 'USA', name: 'Dallas/Fort Worth' },
  BOS: { city: 'Boston', country: 'USA', name: 'Logan' },
  SEA: { city: 'Seattle', country: 'USA', name: 'Seattle-Tacoma' },
  LAS: { city: 'Las Vegas', country: 'USA', name: 'Harry Reid' },

  // Canada
  YYZ: { city: 'Toronto', country: 'Canada', name: 'Pearson' },
  YVR: { city: 'Vancouver', country: 'Canada', name: 'Vancouver' },
  YUL: { city: 'Montreal', country: 'Canada', name: 'Trudeau' },

  // Asia
  NRT: { city: 'Tokyo', country: 'Japan', name: 'Narita' },
  HND: { city: 'Tokyo', country: 'Japan', name: 'Haneda' },
  KIX: { city: 'Osaka', country: 'Japan', name: 'Kansai' },
  ICN: { city: 'Seoul', country: 'South Korea', name: 'Incheon' },
  PEK: { city: 'Beijing', country: 'China', name: 'Capital' },
  PVG: { city: 'Shanghai', country: 'China', name: 'Pudong' },
  HKG: { city: 'Hong Kong', country: 'Hong Kong', name: 'Hong Kong' },
  SIN: { city: 'Singapore', country: 'Singapore', name: 'Changi' },
  BKK: { city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi' },
  DEL: { city: 'Delhi', country: 'India', name: 'Indira Gandhi' },
  BOM: { city: 'Mumbai', country: 'India', name: 'Chhatrapati Shivaji' },

  // Middle East
  DXB: { city: 'Dubai', country: 'UAE', name: 'Dubai' },
  AUH: { city: 'Abu Dhabi', country: 'UAE', name: 'Abu Dhabi' },
  DOH: { city: 'Doha', country: 'Qatar', name: 'Hamad' },

  // Australia
  SYD: { city: 'Sydney', country: 'Australia', name: 'Kingsford Smith' },
  MEL: { city: 'Melbourne', country: 'Australia', name: 'Tullamarine' },

  // Africa
  JNB: { city: 'Johannesburg', country: 'South Africa', name: 'O.R. Tambo' },
  CPT: { city: 'Cape Town', country: 'South Africa', name: 'Cape Town' },
  CAI: { city: 'Cairo', country: 'Egypt', name: 'Cairo' },
  CMN: { city: 'Casablanca', country: 'Morocco', name: 'Mohammed V' },

  // South America
  GRU: { city: 'São Paulo', country: 'Brazil', name: 'Guarulhos' },
  GIG: { city: 'Rio de Janeiro', country: 'Brazil', name: 'Galeão' },
  EZE: { city: 'Buenos Aires', country: 'Argentina', name: 'Ezeiza' },
  SCL: { city: 'Santiago', country: 'Chile', name: 'Arturo Merino Benítez' },
  BOG: { city: 'Bogotá', country: 'Colombia', name: 'El Dorado' },
  MEX: { city: 'Mexico City', country: 'Mexico', name: 'Benito Juárez' },
  CUN: { city: 'Cancún', country: 'Mexico', name: 'Cancún' },
};

/**
 * Get airport information by IATA code
 */
export function getAirportInfo(iataCode: string): AirportInfo | null {
  if (!iataCode) return null;
  return AIRPORTS[iataCode.toUpperCase()] || null;
}

/**
 * Get city name from IATA code
 */
export function getCityName(iataCode: string): string {
  const info = getAirportInfo(iataCode);
  return info?.city || '';
}

/**
 * Get formatted location string (City, Country)
 */
export function getFormattedLocation(iataCode: string): string {
  const info = getAirportInfo(iataCode);
  if (!info) return iataCode;
  return `${info.city}, ${info.country}`;
}

/**
 * Get display string with code (City (CODE))
 */
export function getDisplayWithCode(iataCode: string): string {
  const info = getAirportInfo(iataCode);
  if (!info) return iataCode;
  return `${info.city} (${iataCode})`;
}

export default AIRPORTS;
