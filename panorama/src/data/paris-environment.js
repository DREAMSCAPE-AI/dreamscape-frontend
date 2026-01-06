/**
 * Paris VR Environment Data
 *
 * Ticket: DR-74 (VR-003 - Environnement VR Paris)
 *
 * Structure des scènes VR de Paris avec panoramas 360° et hotspots interactifs
 * Les positions des hotspots de téléportation sont calculées géographiquement
 */

import { calculateHotspotPosition } from '../utils/geoPositioning';

// Données de base des scènes (avant calcul géographique)
const parisEnvironmentBase = {
  id: 'paris',
  name: 'Paris',
  description: 'Découvrez la Ville Lumière en réalité virtuelle',
  defaultScene: 'eiffel-tower',

  scenes: [
    {
      id: 'eiffel-tower',
      name: 'Tour Eiffel',
      description: 'Vue panoramique depuis le Champ de Mars',
      panoramaUrl: '/panoramas/paris/eiffel-tower.jpg',
      thumbnailUrl: '/panoramas/paris/thumbnails/eiffel-tower-thumb.jpg',
      position: { lat: 48.8584, lng: 2.2945 },

      icon: '🗼',
      hotspots: [
        {
          id: 'eiffel-info',
          type: 'info',
          position: [-2, 1.6, -3],
          title: 'Tour Eiffel',
          description: 'Construite en 1889 pour l\'Exposition Universelle, la Tour Eiffel mesure 330 mètres de haut.',
          icon: '🗼',
          audioUrl: '/audio/paris/eiffel-tower.mp3'
        }
        // Les hotspots de téléportation seront calculés géographiquement
      ]
    },

    {
      id: 'louvre',
      name: 'Musée du Louvre',
      description: 'La pyramide du Louvre et le palais royal',
      panoramaUrl: '/panoramas/paris/louvre.jpg',
      thumbnailUrl: '/panoramas/paris/thumbnails/louvre-thumb.jpg',
      position: { lat: 48.8606, lng: 2.3376 },

      icon: '🖼️',
      hotspots: [
        {
          id: 'louvre-info',
          type: 'info',
          position: [0, 1.6, -3],
          title: 'Musée du Louvre',
          description: 'Le plus grand musée d\'art au monde avec plus de 35 000 œuvres d\'art, dont la Joconde.',
          icon: '🖼️',
          audioUrl: '/audio/paris/louvre.mp3'
        },
        {
          id: 'pyramid-info',
          type: 'info',
          position: [2, 1.2, -2],
          title: 'Pyramide du Louvre',
          description: 'Conçue par I.M. Pei et inaugurée en 1989, cette pyramide de verre et de métal est devenue un symbole moderne de Paris.',
          icon: '🔺'
        }
      ]
    },

    {
      id: 'arc-triomphe',
      name: 'Arc de Triomphe',
      description: 'Monument emblématique au sommet des Champs-Élysées',
      panoramaUrl: '/panoramas/paris/arc-triomphe.jpg',
      thumbnailUrl: '/panoramas/paris/thumbnails/arc-triomphe-thumb.jpg',
      position: { lat: 48.8738, lng: 2.2950 },

      icon: '🏛️',
      hotspots: [
        {
          id: 'arc-info',
          type: 'info',
          position: [0, 1.8, -3],
          title: 'Arc de Triomphe',
          description: 'Monument commandé par Napoléon en 1806 pour célébrer ses victoires. Haut de 50 mètres.',
          icon: '🏛️',
          audioUrl: '/audio/paris/arc-triomphe.mp3'
        },
        {
          id: 'champs-elysees-info',
          type: 'info',
          position: [-2, 1.5, -2.5],
          title: 'Champs-Élysées',
          description: 'L\'avenue la plus célèbre de Paris, longue de 1,9 km, bordée de boutiques de luxe et de cafés.',
          icon: '🛍️'
        }
      ]
    },

    {
      id: 'notre-dame',
      name: 'Cathédrale Notre-Dame',
      description: 'Chef-d\'œuvre de l\'architecture gothique',
      panoramaUrl: '/panoramas/paris/notre-dame.jpg',
      thumbnailUrl: '/panoramas/paris/thumbnails/notre-dame-thumb.jpg',
      position: { lat: 48.8530, lng: 2.3499 },

      icon: '⛪',
      hotspots: [
        {
          id: 'notre-dame-info',
          type: 'info',
          position: [0, 1.7, -3],
          title: 'Notre-Dame de Paris',
          description: 'Cathédrale gothique du XIIe siècle, célèbre pour ses vitraux, ses gargouilles et son histoire.',
          icon: '⛪',
          audioUrl: '/audio/paris/notre-dame.mp3'
        },
        {
          id: 'seine-info',
          type: 'info',
          position: [2, 1.3, -2],
          title: 'La Seine',
          description: 'Le fleuve qui traverse Paris, classé au patrimoine mondial de l\'UNESCO.',
          icon: '🌊'
        }
      ]
    },

    {
      id: 'sacre-coeur',
      name: 'Basilique du Sacré-Cœur',
      description: 'Basilique au sommet de la butte Montmartre',
      panoramaUrl: '/panoramas/paris/sacre-coeur.jpg',
      thumbnailUrl: '/panoramas/paris/thumbnails/sacre-coeur-thumb.jpg',
      position: { lat: 48.8867, lng: 2.3431 },

      icon: '⛪',
      hotspots: [
        {
          id: 'sacre-coeur-info',
          type: 'info',
          position: [0, 1.8, -3],
          title: 'Sacré-Cœur de Montmartre',
          description: 'Basilique romano-byzantine construite entre 1875 et 1914, offrant une vue panoramique sur Paris.',
          icon: '⛪',
          audioUrl: '/audio/paris/sacre-coeur.mp3'
        },
        {
          id: 'montmartre-info',
          type: 'info',
          position: [-2, 1.5, -2.5],
          title: 'Quartier de Montmartre',
          description: 'Quartier bohème historique, célèbre pour ses artistes, le Moulin Rouge et ses rues pavées.',
          icon: '🎨'
        }
      ]
    }
  ],

  // Configuration de l'environnement
  settings: {
    skyColor: '#87CEEB',  // Bleu ciel parisien
    ambientLightIntensity: 0.7,
    enableAudio: true,
    enableMinimap: true,
    defaultTransitionDuration: 1000, // ms
    hotspotInteractionDistance: 3, // mètres
  },

  // Ressources partagées
  resources: {
    audioBasePath: '/audio/paris/',
    panoramaBasePath: '/panoramas/paris/',
    defaultHotspotColor: '#3B82F6',
    teleportHotspotColor: '#10B981',
    infoHotspotColor: '#F59E0B'
  }
};

// Calculer les hotspots de téléportation avec positions géographiques réelles
const scenesWithGeoHotspots = parisEnvironmentBase.scenes.map(scene => {
  // Créer les hotspots de téléportation vers les autres scènes
  const teleportHotspots = parisEnvironmentBase.scenes
    .filter(targetScene => targetScene.id !== scene.id)
    .map(targetScene => {
      const hotspotData = calculateHotspotPosition(scene, targetScene, 1.5, 3);

      return {
        id: `to-${targetScene.id}`,
        type: 'teleport',
        position: hotspotData.position,
        title: `${targetScene.name}`,
        targetScene: targetScene.id,
        icon: targetScene.icon || '📍',
        distance: hotspotData.distance,
        bearing: `${hotspotData.bearing}° ${hotspotData.direction}`
      };
    });

  return {
    ...scene,
    hotspots: [
      ...scene.hotspots, // Garder les hotspots info existants
      ...teleportHotspots // Ajouter les hotspots de téléportation calculés
    ]
  };
});

// Exporter l'environnement avec les hotspots calculés
export const parisEnvironment = {
  ...parisEnvironmentBase,
  scenes: scenesWithGeoHotspots
};

export default parisEnvironment;
