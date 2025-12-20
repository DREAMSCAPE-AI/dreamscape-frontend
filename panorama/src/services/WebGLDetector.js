/**
 * WebGLDetector - Service de détection des capacités WebGL du GPU
 *
 * Ticket: DR-410 - Détection limites WebGL GPU
 * Basé sur: ImageResizer.detectWebGLLimits() du PoC (lignes 201-270)
 *
 * Fonctionnalités:
 * - Détection automatique de MAX_TEXTURE_SIZE du GPU
 * - Test de création de texture aux dimensions limites
 * - Gestion d'erreurs avec fallback conservateur
 * - Retour d'informations détaillées sur les capacités WebGL
 */

class WebGLDetector {
  constructor() {
    this.detectionComplete = false;
    this.limits = {
      maxTextureSize: 8192, // Valeur par défaut
      maxUnits: null,
      maxCombined: null,
      renderer: null,
      vendor: null
    };
  }

  /**
   * Détecte les vraies limites WebGL du système
   * @returns {Promise<Object>} Résultat de la détection avec success, maxTextureSize, etc.
   */
  async detect() {
    console.log('🔍 === DÉTECTION DES VRAIES LIMITES WEBGL ===');

    try {
      // Créer un contexte WebGL temporaire pour tester les limites
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      if (!gl) {
        console.error('❌ WebGL non disponible pour la détection des limites');
        return this._fallback(2048, 'WebGL not available');
      }

      // Obtenir la vraie limite de texture de ce GPU spécifique
      const detectedMaxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const maxUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
      const maxCombined = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);

      console.log('📊 Limites détectées du GPU:');
      console.log('   GPU:', renderer);
      console.log('   Vendor:', vendor);
      console.log('   Taille texture maximum:', detectedMaxSize, 'pixels');
      console.log('   Unités de texture:', maxUnits);
      console.log('   Unités combinées:', maxCombined);

      // Test pratique : essayer de créer une texture aux dimensions limites
      const testSize = Math.min(detectedMaxSize, 8192); // Commencer avec une taille raisonnable
      const testTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, testTexture);

      let finalMaxTextureSize;

      try {
        // Tenter de créer une texture à la taille théorique maximum
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, testSize, testSize / 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        const error = gl.getError();

        if (error === gl.NO_ERROR) {
          console.log('✅ Test de création texture réussi à', testSize, 'pixels');
          finalMaxTextureSize = testSize;
        } else {
          console.warn('⚠️ Échec du test à', testSize, 'pixels, error code:', error);
          // Réduire la taille et réessayer
          const conservativeSize = Math.min(testSize / 2, 4096);
          finalMaxTextureSize = conservativeSize;
          console.log('🎯 Utilisation de la taille conservatrice:', conservativeSize, 'pixels');
        }
      } catch (testError) {
        console.warn('⚠️ Exception lors du test de texture:', testError.message);
        finalMaxTextureSize = 4096; // Très conservateur
      }

      // Nettoyer les ressources de test
      gl.deleteTexture(testTexture);

      // Stocker les résultats
      this.limits = {
        maxTextureSize: finalMaxTextureSize,
        maxUnits,
        maxCombined,
        renderer,
        vendor,
        detectedMaxSize
      };

      this.detectionComplete = true;

      console.log('🎯 Limite WebGL finale retenue:', finalMaxTextureSize, 'pixels');
      console.log('=======================================');

      return {
        success: true,
        ...this.limits
      };

    } catch (error) {
      console.error('❌ Erreur lors de la détection WebGL:', error);
      return this._fallback(2048, error.message);
    }
  }

  /**
   * Fallback en cas d'échec de détection
   * @private
   */
  _fallback(size, reason) {
    this.limits.maxTextureSize = size;
    this.detectionComplete = true;
    return {
      success: false,
      maxTextureSize: size,
      reason
    };
  }

  /**
   * Récupère les limites détectées (déclenche la détection si pas encore faite)
   * @returns {Promise<Object>} Les limites WebGL
   */
  async getLimits() {
    if (!this.detectionComplete) {
      await this.detect();
    }
    return this.limits;
  }

  /**
   * Récupère uniquement la taille maximale de texture
   * @returns {Promise<number>} La taille maximale de texture
   */
  async getMaxTextureSize() {
    const limits = await this.getLimits();
    return limits.maxTextureSize;
  }
}

// Singleton pour éviter de multiples détections
let detectorInstance = null;

export const getWebGLDetector = () => {
  if (!detectorInstance) {
    detectorInstance = new WebGLDetector();
  }
  return detectorInstance;
};

export default WebGLDetector;
