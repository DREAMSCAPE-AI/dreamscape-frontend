/**
 * Recommendations Service for VR
 *
 * Ticket: DR-80 (VR-005 - Intégration Recommandations-VR)
 *
 * Service pour récupérer les recommandations AI depuis le backend
 * et les afficher dans les environnements VR
 */

import axios from 'axios';

// URL du backend AI service for recommendations
// DR-204: Point to ai-service (port 3005) instead of auth-service
const API_BASE_URL = process.env.REACT_APP_AI_API_URL || 'http://localhost:3005/api/v1';

// Instance axios avec authentification
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Service de gestion des recommandations en VR
 */
class VRRecommendationsService {
  /**
   * Récupère les recommandations personnalisées pour l'utilisateur
   * @returns {Promise<Array>} Liste des recommandations
   */
  async getPersonalizedRecommendations() {
    try {
      console.log('📡 Récupération des recommandations personnalisées...');
      const response = await api.get('/recommendations/personalized');
      console.log(`✅ ${response.data.length} recommandations reçues`);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Erreur récupération recommandations:', error.message);
      // Retourner des recommandations par défaut en cas d'erreur
      return this.getDefaultRecommendations();
    }
  }

  /**
   * Récupère les destinations tendances
   * @returns {Promise<Array>} Liste des destinations tendances
   */
  async getTrendingDestinations() {
    try {
      console.log('📡 Récupération des destinations tendances...');
      const response = await api.get('/recommendations/trending');
      console.log(`✅ ${response.data.length} destinations tendances reçues`);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Erreur destinations tendances:', error.message);
      return [];
    }
  }

  /**
   * Récupère les offres et promotions
   * @returns {Promise<Array>} Liste des offres
   */
  async getDealsAndOffers() {
    try {
      console.log('📡 Récupération des offres...');
      const response = await api.get('/recommendations/deals');
      console.log(`✅ ${response.data.length} offres reçues`);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Erreur récupération offres:', error.message);
      return [];
    }
  }

  /**
   * Filtre les recommandations par type
   * @param {Array} recommendations - Liste complète des recommandations
   * @param {string} type - Type recherché ('destination', 'activity', etc.)
   * @returns {Array} Recommandations filtrées
   */
  filterByType(recommendations, type) {
    return recommendations.filter(rec => rec.type === type);
  }

  /**
   * Filtre les recommandations par destination/ville
   * @param {Array} recommendations - Liste des recommandations
   * @param {string} location - Ville recherchée (ex: 'Paris', 'Barcelona')
   * @returns {Array} Recommandations pour cette ville
   */
  filterByLocation(recommendations, location) {
    return recommendations.filter(rec =>
      rec.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  /**
   * Retourne des recommandations par défaut (fallback)
   * @returns {Array} Recommandations par défaut
   */
  getDefaultRecommendations() {
    return [
      {
        id: 'default-1',
        type: 'destination',
        title: 'Explorez Paris en VR',
        description: 'Découvrez la Tour Eiffel, le Louvre et plus encore',
        location: 'Paris, France',
        price: 299,
        currency: '€',
        rating: 4.8,
        image: '/panoramas/paris/eiffel-tower.jpg',
        tags: ['culture', 'architecture', 'romance'],
        confidence: 0.85
      },
      {
        id: 'default-2',
        type: 'destination',
        title: 'Découvrez Barcelona',
        description: 'Gaudí, plages et gastronomie catalane',
        location: 'Barcelona, Spain',
        price: 349,
        currency: '€',
        rating: 4.9,
        image: '/panoramas/barcelona/sagrada-familia.jpg',
        tags: ['art', 'beach', 'food'],
        confidence: 0.82
      },
      {
        id: 'default-3',
        type: 'activity',
        title: 'Croisière sur la Seine',
        description: 'Vue panoramique de Paris depuis l\'eau',
        location: 'Paris, France',
        price: 45,
        currency: '€',
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
        tags: ['romantic', 'sightseeing'],
        confidence: 0.78
      }
    ];
  }

  /**
   * Récupère les recommandations spécifiques pour un environnement VR
   * @param {string} environmentId - ID de l'environnement ('paris', 'barcelona', etc.)
   * @returns {Promise<Object>} Recommandations filtrées + trending + deals
   */
  async getRecommendationsForEnvironment(environmentId) {
    try {
      console.log(`🌍 Chargement recommandations pour: ${environmentId}`);

      // Récupérer toutes les recommandations en parallèle
      const [personalized, trending, deals] = await Promise.all([
        this.getPersonalizedRecommendations(),
        this.getTrendingDestinations(),
        this.getDealsAndOffers()
      ]);

      // Mapper l'ID d'environnement à un nom de ville
      const locationMap = {
        'paris': 'Paris',
        'barcelona': 'Barcelona',
        'new-york': 'New York',
        'tokyo': 'Tokyo',
        'dubai': 'Dubai',
        'london': 'London'
      };

      const location = locationMap[environmentId.toLowerCase()] || environmentId;

      // Filtrer par location si applicable
      const localRecommendations = this.filterByLocation(personalized, location);

      return {
        local: localRecommendations,
        personalized: personalized.slice(0, 6),
        trending: trending.slice(0, 4),
        deals: deals.slice(0, 3),
        all: [...personalized, ...trending, ...deals]
      };

    } catch (error) {
      console.error('❌ Erreur chargement recommandations environnement:', error);
      return {
        local: [],
        personalized: this.getDefaultRecommendations(),
        trending: [],
        deals: [],
        all: this.getDefaultRecommendations()
      };
    }
  }
}

// Singleton
let instance = null;

export const getVRRecommendationsService = () => {
  if (!instance) {
    instance = new VRRecommendationsService();
  }
  return instance;
};

export default VRRecommendationsService;
