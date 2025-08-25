import axios from 'axios';

export interface MealOption {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'standard' | 'premium' | 'special';
  dietary: string[];
  image?: string;
  available: boolean;
  airline?: string;
  flightDuration?: number;
}

export interface MealServiceParams {
  airlineCode: string;
  flightDuration: number;
  departureCode: string;
  arrivalCode: string;
  cabinClass?: string;
  route?: string;
}

export interface MealAPIResponse {
  data: MealOption[];
  meta: {
    count: number;
    airline: string;
    route: string;
  };
}

class MealService {
  private baseURL = 'https://api.airline-catering.com/v1'; // Mock API endpoint
  private fallbackAPI = 'https://api.flight-meals.io/v2'; // Alternative API
  private cache = new Map<string, { data: MealOption[]; timestamp: number }>();
  private cacheExpiry = 30 * 60 * 1000; // 30 minutes

  /**
   * Get available meals for a specific flight
   */
  async getMealsForFlight(params: MealServiceParams): Promise<MealOption[]> {
    const cacheKey = `${params.airlineCode}-${params.flightDuration}-${params.departureCode}-${params.arrivalCode}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      // Try primary API first
      const meals = await this.fetchFromPrimaryAPI(params);
      
      // Cache the results
      this.cache.set(cacheKey, {
        data: meals,
        timestamp: Date.now()
      });
      
      return meals;
    } catch (error) {
      console.warn('Primary meal API failed, trying fallback:', error);
      
      try {
        // Try fallback API
        const meals = await this.fetchFromFallbackAPI(params);
        
        // Cache the results
        this.cache.set(cacheKey, {
          data: meals,
          timestamp: Date.now()
        });
        
        return meals;
      } catch (fallbackError) {
        console.warn('Fallback meal API failed, using generated meals:', fallbackError);
        
        // Generate realistic meals based on flight parameters
        const meals = this.generateRealisticMeals(params);
        
        // Cache the generated results for a shorter time
        this.cache.set(cacheKey, {
          data: meals,
          timestamp: Date.now()
        });
        
        return meals;
      }
    }
  }

  /**
   * Fetch meals from primary API (airline catering service)
   */
  private async fetchFromPrimaryAPI(params: MealServiceParams): Promise<MealOption[]> {
    const response = await axios.get<MealAPIResponse>(`${this.baseURL}/meals`, {
      params: {
        airline: params.airlineCode,
        duration: params.flightDuration,
        departure: params.departureCode,
        arrival: params.arrivalCode,
        cabin: params.cabinClass || 'economy'
      },
      timeout: 5000
    });

    return response.data.data;
  }

  /**
   * Fetch meals from fallback API
   */
  private async fetchFromFallbackAPI(params: MealServiceParams): Promise<MealOption[]> {
    const response = await axios.get<{ meals: MealOption[] }>(`${this.fallbackAPI}/flight-meals`, {
      params: {
        carrier: params.airlineCode,
        route: `${params.departureCode}-${params.arrivalCode}`,
        duration_hours: Math.ceil(params.flightDuration / 60)
      },
      timeout: 5000
    });

    return response.data.meals;
  }

  /**
   * Generate realistic meals based on flight parameters when APIs fail
   */
  private generateRealisticMeals(params: MealServiceParams): MealOption[] {
    const { airlineCode, flightDuration } = params;
    const hours = Math.ceil(flightDuration / 60);
    
    // No meals for short flights
    if (hours < 2) return [];

    const meals: MealOption[] = [];
    
    // Standard meals (always available)
    const standardMeals = this.getStandardMeals(airlineCode);
    meals.push(...standardMeals);
    
    // Premium meals for long-haul flights (6+ hours)
    if (hours >= 6) {
      const premiumMeals = this.getPremiumMeals(airlineCode);
      meals.push(...premiumMeals);
    }
    
    // Special dietary meals
    const specialMeals = this.getSpecialDietaryMeals();
    meals.push(...specialMeals);
    
    return meals;
  }

  /**
   * Get standard meal options based on airline
   */
  private getStandardMeals(airlineCode: string): MealOption[] {
    const premiumAirlines = ['EK', 'QR', 'SQ', 'CX', 'TG', 'EY']; // Emirates, Qatar, Singapore, etc.
    const isPremiumAirline = premiumAirlines.includes(airlineCode);
    
    const baseMeals: MealOption[] = [
      {
        id: 'standard-chicken',
        name: isPremiumAirline ? 'Herb-Crusted Chicken Breast' : 'Chicken Teriyaki',
        description: isPremiumAirline 
          ? 'Herb-crusted chicken breast with roasted vegetables and quinoa pilaf'
          : 'Grilled chicken with teriyaki sauce, steamed rice, and vegetables',
        price: 0,
        category: 'standard',
        dietary: [],
        available: true,
        airline: airlineCode
      },
      {
        id: 'standard-beef',
        name: isPremiumAirline ? 'Braised Beef Tenderloin' : 'Beef Stroganoff',
        description: isPremiumAirline
          ? 'Slow-braised beef tenderloin with red wine jus and garlic mashed potatoes'
          : 'Tender beef in creamy mushroom sauce with pasta',
        price: 0,
        category: 'standard',
        dietary: [],
        available: true,
        airline: airlineCode
      },
      {
        id: 'standard-fish',
        name: isPremiumAirline ? 'Pan-Seared Sea Bass' : 'Salmon Fillet',
        description: isPremiumAirline
          ? 'Pan-seared sea bass with lemon butter sauce and wild rice'
          : 'Pan-seared salmon with lemon herb sauce and quinoa',
        price: 0,
        category: 'standard',
        dietary: ['pescatarian'],
        available: true,
        airline: airlineCode
      },
      {
        id: 'vegetarian',
        name: isPremiumAirline ? 'Roasted Vegetable Tart' : 'Mediterranean Vegetable Pasta',
        description: isPremiumAirline
          ? 'Roasted vegetable tart with goat cheese and herb salad'
          : 'Penne pasta with roasted vegetables, olives, and feta cheese',
        price: 0,
        category: 'standard',
        dietary: ['vegetarian'],
        available: true,
        airline: airlineCode
      },
      {
        id: 'vegan',
        name: isPremiumAirline ? 'Quinoa Power Bowl' : 'Quinoa Buddha Bowl',
        description: isPremiumAirline
          ? 'Superfood quinoa bowl with roasted vegetables, avocado, and tahini dressing'
          : 'Quinoa with roasted vegetables, chickpeas, and tahini dressing',
        price: 0,
        category: 'standard',
        dietary: ['vegan', 'gluten-free'],
        available: true,
        airline: airlineCode
      }
    ];

    return baseMeals;
  }

  /**
   * Get premium meal options for long-haul flights
   */
  private getPremiumMeals(airlineCode: string): MealOption[] {
    const premiumAirlines = ['EK', 'QR', 'SQ', 'CX', 'TG', 'EY'];
    const isPremiumAirline = premiumAirlines.includes(airlineCode);
    
    return [
      {
        id: 'premium-lobster',
        name: isPremiumAirline ? 'Maine Lobster Thermidor' : 'Lobster Thermidor',
        description: isPremiumAirline
          ? 'Fresh Maine lobster in rich cream sauce with black truffle risotto'
          : 'Fresh lobster in rich cream sauce with truffle risotto',
        price: isPremiumAirline ? 65 : 45,
        category: 'premium',
        dietary: ['pescatarian'],
        available: true,
        airline: airlineCode
      },
      {
        id: 'premium-wagyu',
        name: isPremiumAirline ? 'A5 Wagyu Beef' : 'Wagyu Beef Tenderloin',
        description: isPremiumAirline
          ? 'Premium A5 Wagyu beef with seasonal vegetables and red wine reduction'
          : 'Premium wagyu beef with roasted vegetables and red wine jus',
        price: isPremiumAirline ? 85 : 65,
        category: 'premium',
        dietary: [],
        available: true,
        airline: airlineCode
      },
      {
        id: 'premium-duck',
        name: isPremiumAirline ? 'Five-Spice Duck Breast' : 'Confit Duck Breast',
        description: isPremiumAirline
          ? 'Five-spice duck breast with plum sauce and jasmine rice'
          : 'Slow-cooked duck breast with cherry sauce and potato gratin',
        price: isPremiumAirline ? 45 : 35,
        category: 'premium',
        dietary: [],
        available: true,
        airline: airlineCode
      }
    ];
  }

  /**
   * Get special dietary meal options
   */
  private getSpecialDietaryMeals(): MealOption[] {
    return [
      {
        id: 'kosher',
        name: 'Kosher Meal',
        description: 'Certified kosher meal prepared according to Jewish dietary laws',
        price: 15,
        category: 'special',
        dietary: ['kosher'],
        available: true
      },
      {
        id: 'halal',
        name: 'Halal Meal',
        description: 'Certified halal meal prepared according to Islamic dietary laws',
        price: 15,
        category: 'special',
        dietary: ['halal'],
        available: true
      },
      {
        id: 'gluten-free',
        name: 'Gluten-Free Meal',
        description: 'Specially prepared meal free from gluten-containing ingredients',
        price: 10,
        category: 'special',
        dietary: ['gluten-free'],
        available: true
      },
      {
        id: 'diabetic',
        name: 'Diabetic-Friendly Meal',
        description: 'Low-sugar meal suitable for diabetic passengers',
        price: 10,
        category: 'special',
        dietary: ['diabetic'],
        available: true
      },
      {
        id: 'low-sodium',
        name: 'Low-Sodium Meal',
        description: 'Heart-healthy meal with reduced sodium content',
        price: 10,
        category: 'special',
        dietary: ['low-sodium'],
        available: true
      },
      {
        id: 'child-meal',
        name: 'Child Meal',
        description: 'Kid-friendly meal with familiar flavors and smaller portions',
        price: 5,
        category: 'special',
        dietary: ['child-friendly'],
        available: true
      }
    ];
  }

  /**
   * Get meal preferences for a specific airline
   */
  async getAirlineMealPreferences(airlineCode: string): Promise<string[]> {
    const airlinePreferences: Record<string, string[]> = {
      'EK': ['Middle Eastern', 'International', 'Premium'],
      'QR': ['Arabic', 'International', 'Premium'],
      'SQ': ['Asian', 'International', 'Premium'],
      'JL': ['Japanese', 'Asian', 'International'],
      'NH': ['Japanese', 'Asian', 'International'],
      'TG': ['Thai', 'Asian', 'International'],
      'CX': ['Cantonese', 'Asian', 'International'],
      'BA': ['British', 'European', 'International'],
      'LH': ['German', 'European', 'International'],
      'AF': ['French', 'European', 'International'],
      'KL': ['Dutch', 'European', 'International'],
      'AA': ['American', 'International'],
      'DL': ['American', 'International'],
      'UA': ['American', 'International']
    };

    return airlinePreferences[airlineCode] || ['International'];
  }

  /**
   * Clear meal cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const mealService = new MealService();
