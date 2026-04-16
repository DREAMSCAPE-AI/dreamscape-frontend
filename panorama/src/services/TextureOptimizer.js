/**
 * TextureOptimizer - Service d'optimisation des textures pour VR
 *
 * Ticket: DR-252 - Optimisation des textures
 * Basé sur: Configuration textures du PoC (lignes 811-815)
 *
 * Fonctionnalités:
 * - Configuration optimale des filtres (LinearFilter)
 * - Gestion du wrapping (RepeatWrapping/ClampToEdgeWrapping)
 * - Compression et format optimization
 * - Libération mémoire (disposal)
 */

import * as THREE from 'three';

class TextureOptimizer {
  constructor() {
    this.defaultConfig = {
      // DR-574 fix pixellisation : mipmaps + LinearMipmapLinear pour échantillonnage net
      // sur surfaces obliques (réduit aliasing aux pôles de la sphère panoramique)
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      anisotropy: 16, // Maximum supporté par Quest 3 / casques VR récents
      generateMipmaps: true // Requis pour LinearMipmapLinearFilter
    };
  }

  /**
   * Optimise une texture pour une utilisation VR panoramique
   * @param {THREE.Texture} texture - La texture à optimiser
   * @param {Object} renderer - Le renderer Three.js (optionnel, pour anisotropie)
   * @returns {THREE.Texture} La texture optimisée
   */
  optimizeForVR(texture, renderer = null) {
    if (!texture) {
      console.error('❌ Texture null ou undefined fournie à optimizeForVR');
      return null;
    }

    console.log('🎨 === OPTIMISATION TEXTURE POUR VR ===');
    console.log('🔍 UUID:', texture.uuid);

    // Configuration des filtres pour qualité optimale
    texture.minFilter = this.defaultConfig.minFilter;
    texture.magFilter = this.defaultConfig.magFilter;
    console.log('✅ Filtres configurés: LinearFilter (min/mag)');

    // Wrapping pour panoramas équirectangulaires
    texture.wrapS = this.defaultConfig.wrapS; // Horizontal: RepeatWrapping pour continuité
    texture.wrapT = this.defaultConfig.wrapT; // Vertical: ClampToEdge pour éviter artefacts
    console.log('✅ Wrapping configuré: RepeatWrapping (S) / ClampToEdge (T)');

    // Anisotropie : applique la valeur par défaut (16 pour VR), clamp si renderer dispo
    if (renderer) {
      const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.anisotropy = Math.min(this.defaultConfig.anisotropy, maxAnisotropy);
      console.log(`✅ Anisotropie configurée: ${texture.anisotropy} (max GPU: ${maxAnisotropy})`);
    } else {
      texture.anisotropy = this.defaultConfig.anisotropy;
      console.log(`⚠️ Renderer absent — anisotropie posée à ${texture.anisotropy} (peut être clampée par le GPU)`);
    }

    // Mipmaps
    texture.generateMipmaps = this.defaultConfig.generateMipmaps;
    console.log('✅ Mipmaps:', texture.generateMipmaps ? 'activés' : 'désactivés');

    // Marquer pour mise à jour
    texture.needsUpdate = true;

    // Afficher les dimensions finales
    if (texture.image) {
      console.log('📐 Dimensions:', texture.image.width, 'x', texture.image.height);
      console.log('💾 Mémoire estimée:', this.estimateMemoryUsage(texture).toFixed(1), 'MB');
    }

    console.log('=======================================');

    return texture;
  }

  /**
   * Estime l'utilisation mémoire d'une texture
   * @param {THREE.Texture} texture
   * @returns {number} Mémoire en MB
   */
  estimateMemoryUsage(texture) {
    if (!texture || !texture.image) return 0;

    const width = texture.image.width;
    const height = texture.image.height;

    // RGBA = 4 bytes par pixel
    const bytesPerPixel = 4;
    const bytes = width * height * bytesPerPixel;

    // Si mipmaps activés, ajouter ~33% de mémoire
    const mipmapMultiplier = texture.generateMipmaps ? 1.33 : 1;

    return (bytes * mipmapMultiplier) / 1024 / 1024; // Convert to MB
  }

  /**
   * Optimise une texture pour réduire la consommation mémoire
   * @param {THREE.Texture} texture
   * @param {Object} options - { maxSize, quality }
   * @returns {THREE.Texture}
   */
  optimizeForMemory(texture, options = {}) {
    const { maxSize = 4096, quality = 'balanced' } = options;

    console.log('💾 === OPTIMISATION MÉMOIRE TEXTURE ===');

    // Configuration selon le niveau de qualité
    const qualityPresets = {
      low: {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        anisotropy: 1,
        generateMipmaps: false
      },
      balanced: {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        anisotropy: 2,
        generateMipmaps: false
      },
      high: {
        minFilter: THREE.LinearMipmapLinearFilter,
        magFilter: THREE.LinearFilter,
        anisotropy: 4,
        generateMipmaps: true
      }
    };

    const preset = qualityPresets[quality] || qualityPresets.balanced;

    Object.assign(texture, preset);
    texture.needsUpdate = true;

    console.log('✅ Preset appliqué:', quality);
    console.log('💾 Mémoire estimée:', this.estimateMemoryUsage(texture).toFixed(1), 'MB');

    return texture;
  }

  /**
   * Compare les configurations de deux textures
   * @param {THREE.Texture} texture1
   * @param {THREE.Texture} texture2
   */
  compareTextures(texture1, texture2) {
    console.log('🔬 === COMPARAISON TEXTURES ===');

    const compare = (prop) => {
      const val1 = texture1[prop];
      const val2 = texture2[prop];
      const match = val1 === val2 ? '✅' : '❌';
      console.log(`${match} ${prop}: ${val1} vs ${val2}`);
    };

    compare('minFilter');
    compare('magFilter');
    compare('wrapS');
    compare('wrapT');
    compare('anisotropy');
    compare('generateMipmaps');

    const mem1 = this.estimateMemoryUsage(texture1);
    const mem2 = this.estimateMemoryUsage(texture2);
    console.log(`💾 Mémoire: ${mem1.toFixed(1)}MB vs ${mem2.toFixed(1)}MB`);
    console.log('=======================================');
  }

  /**
   * Dispose proprement d'une texture et libère la mémoire
   * @param {THREE.Texture} texture
   */
  dispose(texture) {
    if (!texture) return;

    console.log('🧹 Disposal de la texture:', texture.uuid);

    const memoryFreed = this.estimateMemoryUsage(texture);

    texture.dispose();

    console.log(`✅ Mémoire libérée: ${memoryFreed.toFixed(1)}MB`);
  }

  /**
   * Batch dispose de multiples textures
   * @param {Array<THREE.Texture>} textures
   */
  disposeAll(textures) {
    console.log(`🧹 Nettoyage de ${textures.length} textures...`);

    let totalMemoryFreed = 0;

    textures.forEach(texture => {
      if (texture) {
        totalMemoryFreed += this.estimateMemoryUsage(texture);
        texture.dispose();
      }
    });

    console.log(`✅ Mémoire totale libérée: ${totalMemoryFreed.toFixed(1)}MB`);
  }

  /**
   * Applique une configuration personnalisée à une texture
   * @param {THREE.Texture} texture
   * @param {Object} config - Configuration personnalisée
   * @returns {THREE.Texture}
   */
  applyCustomConfig(texture, config) {
    console.log('⚙️ Application configuration personnalisée...');

    Object.keys(config).forEach(key => {
      if (texture.hasOwnProperty(key)) {
        texture[key] = config[key];
        console.log(`  ${key}:`, config[key]);
      }
    });

    texture.needsUpdate = true;

    return texture;
  }
}

// Singleton
let optimizerInstance = null;

export const getTextureOptimizer = () => {
  if (!optimizerInstance) {
    optimizerInstance = new TextureOptimizer();
  }
  return optimizerInstance;
};

export default TextureOptimizer;
