/**
 * Services VR pour panorama
 *
 * Architecture refactorisée du PoC en services modulaires
 *
 * Tickets implémentés:
 * - DR-410: WebGLDetector - Détection limites WebGL GPU
 * - DR-411: ImageResizer - Redimensionnement progressif images
 * - DR-251: TextureLoader - Service de chargement progressif
 * - DR-252: TextureOptimizer - Optimisation des textures
 * - DR-253: AssetCache - Cache local des assets VR
 */

// Détection WebGL (DR-410)
import WebGLDetector, { getWebGLDetector } from './WebGLDetector.js';

// Redimensionnement images (DR-411)
import ImageResizer from './ImageResizer.js';

// Chargement textures (DR-251)
import TextureLoader, { getTextureLoader } from './TextureLoader.js';

// Optimisation textures (DR-252)
import TextureOptimizer, { getTextureOptimizer } from './TextureOptimizer.js';

// Cache assets (DR-253)
import AssetCache, { getAssetCache } from './AssetCache.js';

// Exports individuels
export {
  WebGLDetector,
  getWebGLDetector,
  ImageResizer,
  TextureLoader,
  getTextureLoader,
  TextureOptimizer,
  getTextureOptimizer,
  AssetCache,
  getAssetCache
};

// Export par défaut d'un objet contenant tous les singletons
export default {
  getWebGLDetector,
  getTextureLoader,
  getTextureOptimizer,
  getAssetCache
};
