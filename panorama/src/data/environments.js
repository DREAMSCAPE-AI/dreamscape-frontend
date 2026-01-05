/**
 * VR Environments Registry
 *
 * Tickets: DR-74 (Paris), DR-79 (Barcelona)
 *
 * Registre centralisé de tous les environnements VR disponibles
 * Permet le chargement dynamique des environnements par ID
 */

import parisEnvironment from './paris-environment';
import barcelonaEnvironment from './barcelona-environment';

/**
 * Map de tous les environnements VR disponibles
 * Clé = ID de l'environnement (utilisé dans l'URL)
 * Valeur = Configuration complète de l'environnement
 */
export const VR_ENVIRONMENTS = {
  'paris': parisEnvironment,
  'barcelona': barcelonaEnvironment,
  // Prochains environnements à ajouter :
  // 'new-york': newYorkEnvironment,
  // 'tokyo': tokyoEnvironment,
  // 'dubai': dubaiEnvironment,
  // 'london': londonEnvironment,
};

/**
 * Alias pour faciliter l'accès par code d'aéroport ou noms alternatifs
 */
export const ENVIRONMENT_ALIASES = {
  // Paris
  'PAR': 'paris',
  'CDG': 'paris',
  'france': 'paris',

  // Barcelona
  'BCN': 'barcelona',
  'spain': 'barcelona',
  'catalonia': 'barcelona',

  // Futurs aliases
  'JFK': 'new-york',
  'NYC': 'new-york',
  'NRT': 'tokyo',
  'DXB': 'dubai',
  'LHR': 'london',
};

/**
 * Récupère un environnement VR par son ID ou alias
 * @param {string} idOrAlias - ID ou alias de l'environnement
 * @returns {Object|null} Configuration de l'environnement ou null si non trouvé
 */
export function getVREnvironment(idOrAlias) {
  if (!idOrAlias) {
    console.warn('⚠️ Aucun ID d\'environnement fourni');
    return null;
  }

  // Normaliser l'ID (lowercase, trim)
  const normalized = idOrAlias.toLowerCase().trim();

  // Chercher d'abord dans les environnements directs
  if (VR_ENVIRONMENTS[normalized]) {
    console.log(`✅ Environnement trouvé: ${normalized}`);
    return VR_ENVIRONMENTS[normalized];
  }

  // Chercher dans les alias
  const aliasTarget = ENVIRONMENT_ALIASES[normalized];
  if (aliasTarget && VR_ENVIRONMENTS[aliasTarget]) {
    console.log(`✅ Environnement trouvé via alias: ${normalized} → ${aliasTarget}`);
    return VR_ENVIRONMENTS[aliasTarget];
  }

  console.warn(`❌ Environnement VR introuvable: ${idOrAlias}`);
  return null;
}

/**
 * Liste tous les environnements VR disponibles
 * @returns {Array} Liste des environnements avec ID et nom
 */
export function listVREnvironments() {
  return Object.entries(VR_ENVIRONMENTS).map(([id, env]) => ({
    id,
    name: env.name,
    description: env.description,
    sceneCount: env.scenes?.length || 0,
    defaultScene: env.defaultScene
  }));
}

/**
 * Vérifie si un environnement VR existe
 * @param {string} idOrAlias - ID ou alias de l'environnement
 * @returns {boolean}
 */
export function hasVREnvironment(idOrAlias) {
  return getVREnvironment(idOrAlias) !== null;
}

// Export par défaut du registre
export default {
  environments: VR_ENVIRONMENTS,
  aliases: ENVIRONMENT_ALIASES,
  get: getVREnvironment,
  list: listVREnvironments,
  has: hasVREnvironment
};
