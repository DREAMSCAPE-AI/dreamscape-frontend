interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
}

interface UnsplashResponse {
  results: UnsplashImage[];
}

class ImageService {
  private readonly baseUrl = 'https://api.unsplash.com';
  private readonly accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';
  private readonly cache = new Map<string, string>();
  private readonly cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  private readonly cacheTimestamps = new Map<string, number>();

  // Fallback images for when API fails or no key is provided
  private readonly fallbackImages = {
    destinations: {
      'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
      'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800',
      'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800',
      'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800',
      'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800',
      'bangkok': 'https://images.unsplash.com/photo-1563492065-1a4e2d0b4b5a?auto=format&fit=crop&q=80&w=800',
      'rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800',
      'barcelona': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&q=80&w=800',
      'amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&q=80&w=800',
      'sydney': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800',
      'istanbul': 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=800',
      'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=800'
    },
    activities: {
      'museum': 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&q=80&w=800',
      'tour': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800',
      'food': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800',
      'adventure': 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800',
      'culture': 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&q=80&w=800',
      'nature': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800',
      'wellness': 'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80&w=800',
      'entertainment': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800',
      'shopping': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
      'nightlife': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
    },
    default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800'
  };

  /**
   * Get image for a destination
   */
  async getDestinationImage(destinationName: string): Promise<string> {
    const cacheKey = `dest_${destinationName.toLowerCase()}`;
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Try to fetch from Unsplash if API key is available
    if (this.accessKey) {
      try {
        const imageUrl = await this.fetchFromUnsplash(`${destinationName} city landmark`, 'landscape');
        if (imageUrl) {
          this.setCacheItem(cacheKey, imageUrl);
          return imageUrl;
        }
      } catch (error) {
        console.warn('Failed to fetch destination image from Unsplash:', error);
      }
    }

    // Fallback to predefined images
    const fallbackKey = destinationName.toLowerCase();
    const fallbackImage = this.fallbackImages.destinations[fallbackKey as keyof typeof this.fallbackImages.destinations];
    
    if (fallbackImage) {
      this.setCacheItem(cacheKey, fallbackImage);
      return fallbackImage;
    }

    // Ultimate fallback
    return this.fallbackImages.default;
  }

  /**
   * Get image for an activity/experience
   */
  async getActivityImage(activityName: string, category?: string, location?: string): Promise<string> {
    const cacheKey = `activity_${activityName.toLowerCase()}_${category || 'general'}`;
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Try to fetch from Unsplash if API key is available
    if (this.accessKey) {
      try {
        let searchQuery = activityName;
        if (location) {
          searchQuery += ` ${location}`;
        }
        if (category) {
          searchQuery += ` ${category}`;
        }

        const imageUrl = await this.fetchFromUnsplash(searchQuery, 'landscape');
        if (imageUrl) {
          this.setCacheItem(cacheKey, imageUrl);
          return imageUrl;
        }
      } catch (error) {
        console.warn('Failed to fetch activity image from Unsplash:', error);
      }
    }

    // Fallback based on category or activity type
    const fallbackImage = this.getFallbackActivityImage(activityName, category);
    this.setCacheItem(cacheKey, fallbackImage);
    return fallbackImage;
  }

  /**
   * Get multiple images for a location (useful for galleries)
   */
  async getLocationImages(location: string, count: number = 4): Promise<string[]> {
    const cacheKey = `gallery_${location.toLowerCase()}_${count}`;
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return JSON.parse(this.cache.get(cacheKey)!);
    }

    // Try to fetch from Unsplash if API key is available
    if (this.accessKey) {
      try {
        const images = await this.fetchMultipleFromUnsplash(`${location} travel`, count);
        if (images.length > 0) {
          this.setCacheItem(cacheKey, JSON.stringify(images));
          return images;
        }
      } catch (error) {
        console.warn('Failed to fetch location images from Unsplash:', error);
      }
    }

    // Fallback to single image repeated
    const singleImage = await this.getDestinationImage(location);
    const fallbackImages = Array(count).fill(singleImage);
    this.setCacheItem(cacheKey, JSON.stringify(fallbackImages));
    return fallbackImages;
  }

  /**
   * Fetch image from Unsplash API
   */
  private async fetchFromUnsplash(query: string, orientation: 'landscape' | 'portrait' = 'landscape'): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=${orientation}&client_id=${this.accessKey}`
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data: UnsplashResponse = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.regular;
      }
      
      return null;
    } catch (error) {
      console.warn('Unsplash API request failed:', error);
      return null;
    }
  }

  /**
   * Fetch multiple images from Unsplash API
   */
  private async fetchMultipleFromUnsplash(query: string, count: number): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&client_id=${this.accessKey}`
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data: UnsplashResponse = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results.map(img => img.urls.regular);
      }
      
      return [];
    } catch (error) {
      console.warn('Unsplash API request failed:', error);
      return [];
    }
  }

  /**
   * Get fallback image for activities based on keywords
   */
  private getFallbackActivityImage(activityName: string, category?: string): string {
    const name = activityName.toLowerCase();
    const cat = category?.toLowerCase();

    // Check category first
    if (cat && this.fallbackImages.activities[cat as keyof typeof this.fallbackImages.activities]) {
      return this.fallbackImages.activities[cat as keyof typeof this.fallbackImages.activities];
    }

    // Check activity name for keywords
    const keywords = Object.keys(this.fallbackImages.activities);
    for (const keyword of keywords) {
      if (name.includes(keyword)) {
        return this.fallbackImages.activities[keyword as keyof typeof this.fallbackImages.activities];
      }
    }

    return this.fallbackImages.default;
  }

  /**
   * Check if cache item is valid
   */
  private isCacheValid(key: string): boolean {
    if (!this.cache.has(key) || !this.cacheTimestamps.has(key)) {
      return false;
    }

    const timestamp = this.cacheTimestamps.get(key)!;
    return Date.now() - timestamp < this.cacheExpiry;
  }

  /**
   * Set cache item with timestamp
   */
  private setCacheItem(key: string, value: string): void {
    this.cache.set(key, value);
    this.cacheTimestamps.set(key, Date.now());
  }

  /**
   * Clear expired cache items
   */
  public clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (now - timestamp >= this.cacheExpiry) {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
  }

  /**
   * Set Unsplash access key (for dynamic configuration)
   */
  public setAccessKey(key: string): void {
    (this as any).accessKey = key;
  }

  /**
   * Get fallback image for different types
   */
  public getFallbackImage(type: string): string {
    switch (type.toLowerCase()) {
      case 'activity':
        return this.fallbackImages.activities.tour;
      case 'destination':
        return this.fallbackImages.destinations.paris;
      case 'museum':
        return this.fallbackImages.activities.museum;
      case 'tour':
        return this.fallbackImages.activities.tour;
      case 'food':
        return this.fallbackImages.activities.food;
      case 'adventure':
        return this.fallbackImages.activities.adventure;
      case 'culture':
        return this.fallbackImages.activities.culture;
      case 'nature':
        return this.fallbackImages.activities.nature;
      case 'wellness':
        return this.fallbackImages.activities.wellness;
      case 'entertainment':
        return this.fallbackImages.activities.entertainment;
      default:
        return this.fallbackImages.default;
    }
  }
}

export default new ImageService();
