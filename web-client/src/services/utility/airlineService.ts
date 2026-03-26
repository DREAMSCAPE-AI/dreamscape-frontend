interface AirlineInfo {
  code: string;
  name: string;
  logo: string;
  color: string;
  website: string;
}

// Comprehensive airline database with logos and information
const AIRLINES: Record<string, AirlineInfo> = {
  // Major US Airlines
  'AA': {
    code: 'AA',
    name: 'American Airlines',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/American-Airlines-Logo.png',
    color: '#C8102E',
    website: 'https://www.aa.com'
  },
  'UA': {
    code: 'UA',
    name: 'United Airlines',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/United-Airlines-Logo.png',
    color: '#0039A6',
    website: 'https://www.united.com'
  },
  'DL': {
    code: 'DL',
    name: 'Delta Air Lines',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Delta-Air-Lines-Logo.png',
    color: '#003366',
    website: 'https://www.delta.com'
  },
  'WN': {
    code: 'WN',
    name: 'Southwest Airlines',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Southwest-Airlines-Logo.png',
    color: '#304CB2',
    website: 'https://www.southwest.com'
  },
  'B6': {
    code: 'B6',
    name: 'JetBlue Airways',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/JetBlue-Airways-Logo.png',
    color: '#0066CC',
    website: 'https://www.jetblue.com'
  },
  'AS': {
    code: 'AS',
    name: 'Alaska Airlines',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Alaska-Airlines-Logo.png',
    color: '#01426A',
    website: 'https://www.alaskaair.com'
  },
  
  // European Airlines
  'LH': {
    code: 'LH',
    name: 'Lufthansa',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Lufthansa-Logo.png',
    color: '#05164D',
    website: 'https://www.lufthansa.com'
  },
  'AF': {
    code: 'AF',
    name: 'Air France',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Air-France-Logo.png',
    color: '#002157',
    website: 'https://www.airfrance.com'
  },
  'BA': {
    code: 'BA',
    name: 'British Airways',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/British-Airways-Logo.png',
    color: '#075AAA',
    website: 'https://www.britishairways.com'
  },
  'KL': {
    code: 'KL',
    name: 'KLM Royal Dutch Airlines',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/KLM-Logo.png',
    color: '#006DB7',
    website: 'https://www.klm.com'
  },
  'IB': {
    code: 'IB',
    name: 'Iberia',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Iberia-Logo.png',
    color: '#EC1C24',
    website: 'https://www.iberia.com'
  },
  'AZ': {
    code: 'AZ',
    name: 'Alitalia',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Alitalia-Logo.png',
    color: '#009639',
    website: 'https://www.alitalia.com'
  },
  
  // Asian Airlines
  'JL': {
    code: 'JL',
    name: 'Japan Airlines',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Japan-Airlines-JAL-Logo.png',
    color: '#DC143C',
    website: 'https://www.jal.com'
  },
  'NH': {
    code: 'NH',
    name: 'All Nippon Airways',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/All-Nippon-Airways-ANA-Logo.png',
    color: '#1E3A8A',
    website: 'https://www.ana.co.jp'
  },
  'SQ': {
    code: 'SQ',
    name: 'Singapore Airlines',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Singapore-Airlines-Logo.png',
    color: '#003f7f',
    website: 'https://www.singaporeair.com'
  },
  'CX': {
    code: 'CX',
    name: 'Cathay Pacific',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Cathay-Pacific-Logo.png',
    color: '#006564',
    website: 'https://www.cathaypacific.com'
  },
  'TG': {
    code: 'TG',
    name: 'Thai Airways',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Thai-Airways-Logo.png',
    color: '#7B2D8E',
    website: 'https://www.thaiairways.com'
  },
  
  // Middle Eastern Airlines
  'EK': {
    code: 'EK',
    name: 'Emirates',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Emirates-Logo.png',
    color: '#FF0000',
    website: 'https://www.emirates.com'
  },
  'QR': {
    code: 'QR',
    name: 'Qatar Airways',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Qatar-Airways-Logo.png',
    color: '#5D1A3A',
    website: 'https://www.qatarairways.com'
  },
  'EY': {
    code: 'EY',
    name: 'Etihad Airways',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Etihad-Airways-Logo.png',
    color: '#D4AF37',
    website: 'https://www.etihad.com'
  },
  
  // Other Major Airlines
  'AC': {
    code: 'AC',
    name: 'Air Canada',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Air-Canada-Logo.png',
    color: '#FF0000',
    website: 'https://www.aircanada.com'
  },
  'QF': {
    code: 'QF',
    name: 'Qantas',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Qantas-Logo.png',
    color: '#E10600',
    website: 'https://www.qantas.com'
  },
  'LA': {
    code: 'LA',
    name: 'LATAM Airlines',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/LATAM-Airlines-Logo.png',
    color: '#E10600',
    website: 'https://www.latam.com'
  }
};

// Aircraft type information
const AIRCRAFT_TYPES: Record<string, string> = {
  '320': 'Airbus A320',
  '321': 'Airbus A321',
  '330': 'Airbus A330',
  '340': 'Airbus A340',
  '350': 'Airbus A350',
  '380': 'Airbus A380',
  '737': 'Boeing 737',
  '747': 'Boeing 747',
  '757': 'Boeing 757',
  '767': 'Boeing 767',
  '777': 'Boeing 777',
  '787': 'Boeing 787',
  'E90': 'Embraer E190',
  'CR9': 'Bombardier CRJ-900',
  'DH4': 'De Havilland Dash 8'
};

class AirlineService {
  /**
   * Get airline information by IATA code
   */
  getAirlineInfo(code: string): AirlineInfo | null {
    return AIRLINES[code.toUpperCase()] || null;
  }

  /**
   * Get airline name by IATA code
   */
  getAirlineName(code: string): string {
    const airline = this.getAirlineInfo(code);
    return airline ? airline.name : code;
  }

  /**
   * Get airline logo URL by IATA code
   */
  getAirlineLogo(code: string): string {
    const airline = this.getAirlineInfo(code);
    return airline ? airline.logo : '';
  }

  /**
   * Get airline brand color by IATA code
   */
  getAirlineColor(code: string): string {
    const airline = this.getAirlineInfo(code);
    return airline ? airline.color : '#6B7280';
  }

  /**
   * Get aircraft type name by code
   */
  getAircraftType(code: string): string {
    return AIRCRAFT_TYPES[code] || code;
  }

  /**
   * Get all supported airlines
   */
  getAllAirlines(): AirlineInfo[] {
    return Object.values(AIRLINES);
  }

  /**
   * Check if airline is supported
   */
  isAirlineSupported(code: string): boolean {
    return code.toUpperCase() in AIRLINES;
  }

  /**
   * Get fallback logo for unsupported airlines
   */
  getFallbackLogo(): string {
    return 'https://via.placeholder.com/64x64/6B7280/FFFFFF?text=✈';
  }
}

export default new AirlineService();
export type { AirlineInfo };
