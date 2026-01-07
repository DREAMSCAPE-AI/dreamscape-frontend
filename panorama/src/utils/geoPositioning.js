/**
 * Utilitaires de positionnement géographique pour les hotspots VR
 *
 * Convertit les positions GPS réelles en positions 3D dans une sphère panoramique
 * pour que les hotspots pointent dans la vraie direction géographique
 */

/**
 * Calcule l'azimut (angle de direction) entre deux points GPS
 * @param {Object} from - Point de départ {lat, lng}
 * @param {Object} to - Point d'arrivée {lat, lng}
 * @returns {number} Azimut en degrés (0 = Nord, 90 = Est, 180 = Sud, 270 = Ouest)
 */
export function calculateBearing(from, to) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const bearing = toDeg(Math.atan2(y, x));

  // Normaliser entre 0 et 360
  return (bearing + 360) % 360;
}

/**
 * Calcule la distance entre deux points GPS (en km)
 * @param {Object} from - Point de départ {lat, lng}
 * @param {Object} to - Point d'arrivée {lat, lng}
 * @returns {number} Distance en kilomètres
 */
export function calculateDistance(from, to) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Rayon de la Terre en km

  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convertit un azimut géographique en position 3D dans une sphère panoramique
 *
 * Dans un panorama équirectangulaire :
 * - L'azimut 0° (Nord) correspond à la direction -Z (devant si on regarde Nord)
 * - L'azimut 90° (Est) correspond à la direction +X (droite)
 * - L'azimut 180° (Sud) correspond à la direction +Z (derrière)
 * - L'azimut 270° (Ouest) correspond à la direction -X (gauche)
 *
 * @param {number} bearing - Azimut en degrés (0-360)
 * @param {number} height - Hauteur du hotspot (y) par défaut 1.6m
 * @param {number} radius - Distance depuis le centre, par défaut 3m
 * @returns {Array} Position [x, y, z]
 */
export function bearingToPosition(bearing, height = 1.6, radius = 3) {
  // Convertir l'azimut en radians
  const bearingRad = (bearing * Math.PI) / 180;

  // Dans Three.js et les panoramas :
  // - X positif = Est (droite)
  // - Z négatif = Nord (devant)
  // - Z positif = Sud (derrière)
  // - X négatif = Ouest (gauche)

  // Calculer x et z en fonction de l'azimut
  // On inverse le signe de Z car Three.js utilise un système de coordonnées main gauche
  const x = radius * Math.sin(bearingRad);
  const z = -radius * Math.cos(bearingRad);

  return [x, height, z];
}

/**
 * Calcule la position 3D d'un hotspot basée sur la géographie réelle
 * @param {Object} fromScene - Scène de départ avec position GPS
 * @param {Object} toScene - Scène cible avec position GPS
 * @param {number} height - Hauteur du hotspot (défaut 1.6m)
 * @param {number} radius - Distance depuis le centre (défaut 3m)
 * @returns {Object} Position 3D et informations
 */
export function calculateHotspotPosition(fromScene, toScene, height = 1.6, radius = 3) {
  // Calculer la direction réelle
  const bearing = calculateBearing(fromScene.position, toScene.position);

  // Calculer la distance réelle
  const distance = calculateDistance(fromScene.position, toScene.position);

  // Convertir en position 3D
  const position = bearingToPosition(bearing, height, radius);

  return {
    position,
    bearing: Math.round(bearing),
    distance: distance.toFixed(1) + ' km',
    direction: getCardinalDirection(bearing)
  };
}

/**
 * Convertit un azimut en direction cardinale (N, NE, E, SE, S, SW, W, NW)
 * @param {number} bearing - Azimut en degrés
 * @returns {string} Direction cardinale
 */
export function getCardinalDirection(bearing) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Génère automatiquement les hotspots avec positions géographiques réelles
 * @param {Array} scenes - Liste de toutes les scènes avec positions GPS
 * @returns {Array} Scènes avec hotspots calculés géographiquement
 */
export function generateGeographicHotspots(scenes) {
  return scenes.map(scene => {
    // Créer les hotspots de téléportation vers les autres scènes
    const teleportHotspots = scenes
      .filter(targetScene => targetScene.id !== scene.id)
      .map(targetScene => {
        const hotspotData = calculateHotspotPosition(scene, targetScene);

        return {
          id: `to-${targetScene.id}`,
          type: 'teleport',
          position: hotspotData.position,
          title: `Aller à ${targetScene.name}`,
          targetScene: targetScene.id,
          icon: targetScene.icon || '📍',
          distance: hotspotData.distance,
          bearing: hotspotData.bearing,
          direction: hotspotData.direction
        };
      });

    return {
      ...scene,
      hotspots: [
        ...(scene.hotspots || []).filter(h => h.type === 'info'), // Garder les hotspots info
        ...teleportHotspots // Ajouter les hotspots de téléportation calculés
      ]
    };
  });
}

export default {
  calculateBearing,
  calculateDistance,
  bearingToPosition,
  calculateHotspotPosition,
  getCardinalDirection,
  generateGeographicHotspots
};
