/**
 * Barcelona VR Environment Data
 *
 * Ticket: DR-79 (VR-004 - Environnement VR Barcelona)
 *
 * Structure des scènes VR de Barcelone avec panoramas 360° et hotspots interactifs
 */

export const barcelonaEnvironment = {
  id: 'barcelona',
  name: 'Barcelona',
  description: 'Découvrez la capitale catalane en réalité virtuelle',
  defaultScene: 'sagrada-familia',

  scenes: [
    {
      id: 'sagrada-familia',
      name: 'Sagrada Família',
      description: 'Le chef-d\'œuvre inachevé de Gaudí',
      panoramaUrl: '/panoramas/barcelona/sagrada-familia.jpg',
      thumbnailUrl: '/panoramas/barcelona/thumbnails/sagrada-familia-thumb.jpg',
      position: { lat: 41.4036, lng: 2.1744 },

      hotspots: [
        {
          id: 'sagrada-info',
          type: 'info',
          position: [0, 1.7, -3],
          title: 'Sagrada Família',
          description: 'Basilique emblématique conçue par Antoni Gaudí, en construction depuis 1882. Chef-d\'œuvre du modernisme catalan.',
          icon: '⛪',
          audioUrl: '/audio/barcelona/sagrada-familia.mp3'
        },
        {
          id: 'gaudi-info',
          type: 'info',
          position: [-2, 1.6, -2.5],
          title: 'Antoni Gaudí',
          description: 'Architecte catalan visionnaire (1852-1926), créateur du style moderniste unique qui définit Barcelone.',
          icon: '🎨'
        },
        {
          id: 'to-park-guell',
          type: 'teleport',
          position: [3, 1.5, -2],
          title: 'Aller au Park Güell',
          targetScene: 'park-guell',
          icon: '🏞️',
          distance: '2.8 km'
        },
        {
          id: 'to-casa-batllo',
          type: 'teleport',
          position: [-3, 1.5, -2],
          title: 'Aller à Casa Batlló',
          targetScene: 'casa-batllo',
          icon: '🏛️',
          distance: '1.9 km'
        }
      ]
    },

    {
      id: 'park-guell',
      name: 'Park Güell',
      description: 'Jardin public extraordinaire avec mosaïques colorées',
      panoramaUrl: '/panoramas/barcelona/park-guell.jpg',
      thumbnailUrl: '/panoramas/barcelona/thumbnails/park-guell-thumb.jpg',
      position: { lat: 41.4145, lng: 2.1527 },

      hotspots: [
        {
          id: 'park-info',
          type: 'info',
          position: [0, 1.6, -3],
          title: 'Park Güell',
          description: 'Parc public créé par Gaudí entre 1900 et 1914, célèbre pour ses mosaïques colorées et son architecture organique unique.',
          icon: '🏞️',
          audioUrl: '/audio/barcelona/park-guell.mp3'
        },
        {
          id: 'mosaic-info',
          type: 'info',
          position: [2, 1.3, -2],
          title: 'Banc en mosaïque',
          description: 'Le célèbre banc serpentin long de 110 mètres, décoré de fragments de céramique colorée (trencadís).',
          icon: '🎨'
        },
        {
          id: 'to-sagrada',
          type: 'teleport',
          position: [-3, 1.5, -2],
          title: 'Retour à la Sagrada Família',
          targetScene: 'sagrada-familia',
          icon: '⛪',
          distance: '2.8 km'
        },
        {
          id: 'to-barceloneta',
          type: 'teleport',
          position: [3, 1.5, -2],
          title: 'Aller à Barceloneta',
          targetScene: 'barceloneta',
          icon: '🏖️',
          distance: '4.2 km'
        }
      ]
    },

    {
      id: 'casa-batllo',
      name: 'Casa Batlló',
      description: 'Maison moderniste sur le Passeig de Gràcia',
      panoramaUrl: '/panoramas/barcelona/casa-batllo.jpg',
      thumbnailUrl: '/panoramas/barcelona/thumbnails/casa-batllo-thumb.jpg',
      position: { lat: 41.3916, lng: 2.1649 },

      hotspots: [
        {
          id: 'batllo-info',
          type: 'info',
          position: [0, 1.8, -3],
          title: 'Casa Batlló',
          description: 'Bâtiment moderniste de Gaudí (1904-1906), surnommé "Casa dels ossos" (maison des os) pour ses formes organiques.',
          icon: '🏛️',
          audioUrl: '/audio/barcelona/casa-batllo.mp3'
        },
        {
          id: 'passeig-info',
          type: 'info',
          position: [-2, 1.5, -2.5],
          title: 'Passeig de Gràcia',
          description: 'Avenue emblématique de Barcelone, abritant les plus beaux exemples d\'architecture moderniste.',
          icon: '🛍️'
        },
        {
          id: 'to-sagrada',
          type: 'teleport',
          position: [3, 1.5, -2],
          title: 'Aller à la Sagrada Família',
          targetScene: 'sagrada-familia',
          icon: '⛪',
          distance: '1.9 km'
        },
        {
          id: 'to-ramblas',
          type: 'teleport',
          position: [-3, 1.5, -2],
          title: 'Aller à La Rambla',
          targetScene: 'la-rambla',
          icon: '🚶',
          distance: '1.3 km'
        }
      ]
    },

    {
      id: 'la-rambla',
      name: 'La Rambla',
      description: 'Avenue piétonne animée du centre historique',
      panoramaUrl: '/panoramas/barcelona/la-rambla.jpg',
      thumbnailUrl: '/panoramas/barcelona/thumbnails/la-rambla-thumb.jpg',
      position: { lat: 41.3818, lng: 2.1744 },

      hotspots: [
        {
          id: 'rambla-info',
          type: 'info',
          position: [0, 1.6, -3],
          title: 'La Rambla',
          description: 'Avenue emblématique de 1,2 km reliant la Plaça de Catalunya au port. Célèbre pour ses artistes de rue et ses kiosques.',
          icon: '🚶',
          audioUrl: '/audio/barcelona/la-rambla.mp3'
        },
        {
          id: 'boqueria-info',
          type: 'info',
          position: [2, 1.4, -2],
          title: 'Marché de la Boqueria',
          description: 'Marché couvert historique depuis 1840, paradis gastronomique avec fruits, poissons et tapas catalans.',
          icon: '🍎'
        },
        {
          id: 'to-barceloneta',
          type: 'teleport',
          position: [3, 1.5, -2],
          title: 'Aller à Barceloneta',
          targetScene: 'barceloneta',
          icon: '🏖️',
          distance: '1.8 km'
        },
        {
          id: 'to-batllo',
          type: 'teleport',
          position: [-3, 1.5, -2],
          title: 'Retour à Casa Batlló',
          targetScene: 'casa-batllo',
          icon: '🏛️',
          distance: '1.3 km'
        }
      ]
    },

    {
      id: 'barceloneta',
      name: 'Plage de Barceloneta',
      description: 'Plage méditerranéenne emblématique de Barcelone',
      panoramaUrl: '/panoramas/barcelona/barceloneta.jpg',
      thumbnailUrl: '/panoramas/barcelona/thumbnails/barceloneta-thumb.jpg',
      position: { lat: 41.3773, lng: 2.1900 },

      hotspots: [
        {
          id: 'beach-info',
          type: 'info',
          position: [0, 1.5, -3],
          title: 'Plage de Barceloneta',
          description: 'Plage urbaine de 1,1 km, réaménagée pour les JO de 1992. Lieu de détente favori des barcelonais et touristes.',
          icon: '🏖️',
          audioUrl: '/audio/barcelona/barceloneta.mp3'
        },
        {
          id: 'port-info',
          type: 'info',
          position: [-2, 1.3, -2.5],
          title: 'Port Vell',
          description: 'Vieux port de Barcelone, transformé en marina moderne avec restaurants et promenades en bord de mer.',
          icon: '⚓'
        },
        {
          id: 'olimpic-info',
          type: 'info',
          position: [2, 1.4, -2],
          title: 'Port Olímpic',
          description: 'Port moderne construit pour les Jeux Olympiques de 1992, centre de vie nocturne et de sports nautiques.',
          icon: '⛵'
        },
        {
          id: 'to-rambla',
          type: 'teleport',
          position: [-3, 1.5, -2],
          title: 'Retour à La Rambla',
          targetScene: 'la-rambla',
          icon: '🚶',
          distance: '1.8 km'
        },
        {
          id: 'to-park-guell',
          type: 'teleport',
          position: [3, 1.5, -2],
          title: 'Aller au Park Güell',
          targetScene: 'park-guell',
          icon: '🏞️',
          distance: '4.2 km'
        }
      ]
    }
  ],

  // Configuration de l'environnement
  settings: {
    skyColor: '#FFB84D',  // Ciel méditerranéen doré
    ambientLightIntensity: 0.8,
    enableAudio: true,
    enableMinimap: true,
    defaultTransitionDuration: 1000, // ms
    hotspotInteractionDistance: 3, // mètres
  },

  // Ressources partagées
  resources: {
    audioBasePath: '/audio/barcelona/',
    panoramaBasePath: '/panoramas/barcelona/',
    defaultHotspotColor: '#E63946',  // Rouge catalan
    teleportHotspotColor: '#FFB84D',  // Or méditerranéen
    infoHotspotColor: '#F4A261'  // Orange Gaudí
  }
};

export default barcelonaEnvironment;
