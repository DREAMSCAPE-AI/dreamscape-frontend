/**
 * TextureLoader - Service de chargement progressif de textures VR
 *
 * Ticket: DR-251 - Service de chargement progressif
 * Basé sur: useDirectTextureLoading du PoC (lignes 767-896)
 *
 * Fonctionnalités:
 * - Chargement progressif avec Three.js TextureLoader
 * - Suivi de la progression (pourcentage, MB téléchargés)
 * - Configuration automatique des textures pour VR
 * - Gestion d'erreurs robuste avec callbacks
 */

import * as THREE from 'three';

class TextureLoader {
  constructor() {
    this.loader = new THREE.TextureLoader();
    this.activeLoads = new Map(); // Track active loads by URL
  }

  /**
   * Charge une texture de manière progressive avec suivi détaillé
   * @param {string} url - URL de la texture à charger
   * @param {Object} callbacks - { onProgress, onSuccess, onError }
   * @returns {Promise<THREE.Texture>} La texture chargée et configurée
   */
  async load(url, callbacks = {}) {
    const { onProgress, onSuccess, onError } = callbacks;

    console.log('🚀 === DÉBUT DU CHARGEMENT PROGRESSIF ===');
    console.log('📋 URL:', url);
    console.log('⏰ Heure de début:', new Date().toLocaleTimeString());

    const startTime = Date.now();

    // Éviter les chargements en double
    if (this.activeLoads.has(url)) {
      console.log('⚠️ Chargement déjà en cours pour:', url);
      return this.activeLoads.get(url);
    }

    const loadPromise = new Promise((resolve, reject) => {
      this.loader.load(
        url,

        // Success callback
        (loadedTexture) => {
          const loadTime = (Date.now() - startTime) / 1000;

          console.log('🎉 === SUCCÈS CHARGEMENT ===');
          console.log('⏱️ Temps total:', loadTime.toFixed(2), 'secondes');
          console.log('🔍 Texture:', loadedTexture.uuid);

          // Vérification critique de l'image
          if (!loadedTexture.image) {
            const error = new Error('Texture chargée sans données d\'image valides');
            console.error('❌', error.message);
            this.activeLoads.delete(url);
            if (onError) onError(error);
            reject(error);
            return;
          }

          console.log('✅ Image présente:');
          console.log('   Dimensions:', loadedTexture.image.width, 'x', loadedTexture.image.height);
          console.log('   Complete:', loadedTexture.image.complete);

          // Configuration optimale pour VR (sera aussi fait dans TextureOptimizer)
          loadedTexture.minFilter = THREE.LinearFilter;
          loadedTexture.magFilter = THREE.LinearFilter;
          loadedTexture.wrapS = THREE.RepeatWrapping;
          loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
          loadedTexture.needsUpdate = true;

          console.log('✅ Texture configurée et prête');

          this.activeLoads.delete(url);
          if (onSuccess) onSuccess(loadedTexture);
          resolve(loadedTexture);
        },

        // Progress callback
        (progress) => {
          if (progress.lengthComputable) {
            const percentComplete = (progress.loaded / progress.total) * 100;
            const loadedMB = progress.loaded / 1024 / 1024;
            const totalMB = progress.total / 1024 / 1024;

            console.log(`📊 Progression: ${percentComplete.toFixed(1)}% (${loadedMB.toFixed(1)}MB / ${totalMB.toFixed(1)}MB)`);

            if (onProgress) {
              onProgress({
                percent: percentComplete,
                loaded: progress.loaded,
                total: progress.total,
                loadedMB,
                totalMB
              });
            }
          } else {
            console.log('📊 Téléchargement en cours (taille inconnue)...');
            if (onProgress) {
              onProgress({
                percent: null,
                loaded: progress.loaded,
                total: null
              });
            }
          }
        },

        // Error callback
        (error) => {
          const loadTime = (Date.now() - startTime) / 1000;

          console.error('💥 === ÉCHEC CHARGEMENT ===');
          console.error('⏱️ Temps avant échec:', loadTime.toFixed(2), 'secondes');
          console.error('🔴 Type:', error.constructor.name);
          console.error('📝 Message:', error.message);

          this.activeLoads.delete(url);
          if (onError) onError(error);
          reject(error);
        }
      );
    });

    this.activeLoads.set(url, loadPromise);
    return loadPromise;
  }

  /**
   * Charge une texture avec retry automatique en cas d'échec
   * @param {string} url - URL de la texture
   * @param {Object} options - { maxRetries, callbacks }
   * @returns {Promise<THREE.Texture>}
   */
  async loadWithRetry(url, options = {}) {
    const { maxRetries = 3, callbacks = {} } = options;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentative ${attempt}/${maxRetries} de chargement...`);
        const texture = await this.load(url, callbacks);
        return texture;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Échec tentative ${attempt}/${maxRetries}:`, error.message);

        if (attempt < maxRetries) {
          // Délai exponentiel entre les tentatives
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Nouvelle tentative dans ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Échec du chargement après ${maxRetries} tentatives: ${lastError.message}`);
  }

  /**
   * Précharge une liste de textures
   * @param {Array<string>} urls - Liste des URLs à précharger
   * @returns {Promise<Array<THREE.Texture>>}
   */
  async preloadTextures(urls) {
    console.log(`📦 Préchargement de ${urls.length} textures...`);

    const promises = urls.map(url => this.load(url).catch(error => {
      console.warn(`⚠️ Échec préchargement ${url}:`, error.message);
      return null; // Continue même si une texture échoue
    }));

    const textures = await Promise.all(promises);
    const successCount = textures.filter(t => t !== null).length;

    console.log(`✅ Préchargement terminé: ${successCount}/${urls.length} réussis`);
    return textures;
  }

  /**
   * Annule tous les chargements en cours
   */
  cancelAll() {
    console.log(`🛑 Annulation de ${this.activeLoads.size} chargements en cours...`);
    this.activeLoads.clear();
  }

  /**
   * Dispose d'une texture et libère ses ressources
   * @param {THREE.Texture} texture - La texture à disposer
   */
  dispose(texture) {
    if (texture && texture.dispose) {
      console.log('🧹 Nettoyage de la texture:', texture.uuid);
      texture.dispose();
    }
  }
}

// Singleton pour éviter de multiples instances
let loaderInstance = null;

export const getTextureLoader = () => {
  if (!loaderInstance) {
    loaderInstance = new TextureLoader();
  }
  return loaderInstance;
};

export default TextureLoader;
