/**
 * ImageResizer - Service de redimensionnement progressif haute qualité
 *
 * Ticket: DR-411 - Redimensionnement progressif images
 * Basé sur: ImageResizer.resizeInSteps() du PoC (lignes 381-402)
 *
 * Fonctionnalités:
 * - Redimensionnement progressif multi-étapes pour qualité optimale
 * - Analyse facteur de réduction et adaptation automatique
 * - imageSmoothingQuality='high' pour meilleure netteté
 * - Validation post-traitement
 */

import { getWebGLDetector } from './WebGLDetector.js';

class ImageResizer {
  constructor() {
    this.targetRatio = 2; // Ratio 2:1 parfait pour panoramas équirectangulaires
    // DR-574 fix pixellisation : qualité JPEG quasi-max pour éviter compression visible en VR
    this.jpegQuality = 0.95;
    this.webglDetector = getWebGLDetector();
  }

  /**
   * Traitement complet d'une image avec redimensionnement si nécessaire
   * @param {string} imageUrl - URL de l'image à traiter
   * @returns {Promise<Object>} Résultat avec optimizedUrl, dimensions, etc.
   */
  async processImage(imageUrl) {
    console.log('🖼️ === DÉBUT DU TRAITEMENT AUTOMATIQUE D\'IMAGE ===');
    console.log('📥 URL source:', imageUrl);

    try {
      // Étape 1: Obtenir les limites WebGL
      const limits = await this.webglDetector.getLimits();
      const maxTextureSize = limits.maxTextureSize;
      console.log('🎯 Limite WebGL:', maxTextureSize, 'pixels');

      // Étape 2: Charger l'image originale
      const originalImage = await this.loadImage(imageUrl);
      console.log('📐 Dimensions originales:', originalImage.width, 'x', originalImage.height);

      // Étape 3: Analyser si un redimensionnement est nécessaire
      const analysis = this.analyzeImageNeed(originalImage, maxTextureSize);
      console.log('🔍 Analyse:', analysis.needsResize ? 'Redimensionnement requis' : 'Dimensions acceptables');

      if (!analysis.needsResize) {
        console.log('✅ Image déjà aux bonnes dimensions, utilisation directe');
        return {
          success: true,
          resized: false,
          originalUrl: imageUrl,
          optimizedUrl: imageUrl,
          originalDimensions: { width: originalImage.width, height: originalImage.height },
          finalDimensions: { width: originalImage.width, height: originalImage.height },
          webglLimits: { maxTextureSize }
        };
      }

      // Étape 4: Redimensionner avec méthode progressive
      console.log('🔧 Redimensionnement vers:', analysis.targetWidth, 'x', analysis.targetHeight);
      const resizedBlob = await this.resizeImageProgressive(originalImage, analysis.targetWidth, analysis.targetHeight);

      // Étape 5: Créer URL optimisée
      const optimizedUrl = URL.createObjectURL(resizedBlob);

      // Étape 6: Validation
      console.log('🧪 Validation de l\'image redimensionnée...');
      const validationResult = await this.validateResizedImage(optimizedUrl, analysis.targetWidth, analysis.targetHeight, maxTextureSize);

      if (!validationResult.valid) {
        console.error('❌ Validation échouée:', validationResult.error);
        URL.revokeObjectURL(optimizedUrl);
        throw new Error('Image redimensionnée invalide: ' + validationResult.error);
      }

      // Calcul des économies
      const originalMemoryMB = (originalImage.width * originalImage.height * 4) / 1024 / 1024;
      const optimizedMemoryMB = (analysis.targetWidth * analysis.targetHeight * 4) / 1024 / 1024;
      const memorySavings = originalMemoryMB - optimizedMemoryMB;

      console.log('💾 Mémoire GPU originale:', originalMemoryMB.toFixed(1), 'MB');
      console.log('💾 Mémoire GPU optimisée:', optimizedMemoryMB.toFixed(1), 'MB');
      console.log('💰 Économie de mémoire:', memorySavings.toFixed(1), 'MB');
      console.log('✅ Redimensionnement terminé avec succès');

      return {
        success: true,
        resized: true,
        originalUrl: imageUrl,
        optimizedUrl,
        originalDimensions: { width: originalImage.width, height: originalImage.height },
        finalDimensions: { width: analysis.targetWidth, height: analysis.targetHeight },
        memorySavingsMB: memorySavings,
        fileSizeMB: resizedBlob.size / 1024 / 1024,
        webglLimits: { maxTextureSize },
        validationPassed: true
      };

    } catch (error) {
      console.error('❌ Erreur lors du traitement d\'image:', error);
      return {
        success: false,
        error: error.message,
        originalUrl: imageUrl
      };
    }
  }

  /**
   * Analyse si l'image nécessite un redimensionnement
   * @private
   */
  analyzeImageNeed(image, maxTextureSize) {
    const maxDimension = Math.max(image.width, image.height);
    const needsResize = maxDimension > maxTextureSize;

    if (!needsResize) {
      return { needsResize: false };
    }

    // Calculer les dimensions cibles en respectant le ratio
    let targetWidth, targetHeight;
    if (image.width > image.height) {
      targetWidth = maxTextureSize;
      targetHeight = Math.round((image.height / image.width) * maxTextureSize);
    } else {
      targetHeight = maxTextureSize;
      targetWidth = Math.round((image.width / image.height) * maxTextureSize);
    }

    return {
      needsResize: true,
      targetWidth,
      targetHeight
    };
  }

  /**
   * Redimensionnement progressif haute qualité
   * Si réduction > 50%, redimensionnement multi-étapes pour qualité optimale
   * @private
   */
  async resizeImageProgressive(image, targetWidth, targetHeight) {
    console.log('🎨 Redimensionnement progressif haute qualité...');

    const originalWidth = image.width;
    const originalHeight = image.height;

    // Calculer le facteur de réduction
    const reductionFactor = (targetWidth * targetHeight) / (originalWidth * originalHeight);

    if (reductionFactor < 0.5) {
      console.log('📉 Réduction importante détectée (< 50%), redimensionnement en étapes...');
      return await this.resizeInSteps(image, targetWidth, targetHeight);
    } else {
      console.log('📐 Réduction modérée, redimensionnement direct...');
      return await this.resizeImageDirect(image, targetWidth, targetHeight);
    }
  }

  /**
   * Redimensionnement en étapes pour qualité optimale sur grandes réductions
   * Réduit par étapes de 70% jusqu'à atteindre la taille cible
   * @private
   */
  async resizeInSteps(image, finalWidth, finalHeight) {
    let currentImage = image;
    let currentWidth = image.width;
    let currentHeight = image.height;

    // Réduire par étapes de 70% à chaque fois (jamais plus de 30% de réduction)
    while (currentWidth > finalWidth * 1.5 || currentHeight > finalHeight * 1.5) {
      const stepWidth = Math.max(Math.round(currentWidth * 0.7), finalWidth);
      const stepHeight = Math.max(Math.round(currentHeight * 0.7), finalHeight);

      console.log(`📏 Étape: ${currentWidth}x${currentHeight} → ${stepWidth}x${stepHeight}`);

      const stepBlob = await this.resizeImageDirect(currentImage, stepWidth, stepHeight);
      currentImage = await this.loadImageFromBlob(stepBlob);
      currentWidth = stepWidth;
      currentHeight = stepHeight;
    }

    // Dernière étape vers les dimensions finales
    console.log(`🎯 Étape finale: ${currentWidth}x${currentHeight} → ${finalWidth}x${finalHeight}`);
    return await this.resizeImageDirect(currentImage, finalWidth, finalHeight);
  }

  /**
   * Redimensionnement direct avec Canvas haute qualité
   * @private
   */
  async resizeImageDirect(image, targetWidth, targetHeight) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Configuration haute qualité
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Échec de la conversion canvas vers blob'));
          }
        },
        'image/jpeg',
        this.jpegQuality
      );
    });
  }

  /**
   * Charger une image depuis un Blob
   * @private
   */
  async loadImageFromBlob(blob) {
    const url = URL.createObjectURL(blob);
    try {
      const image = await this.loadImage(url);
      return image;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Validation de l'image redimensionnée
   * @private
   */
  async validateResizedImage(url, expectedWidth, expectedHeight, maxTextureSize) {
    try {
      const image = await this.loadImage(url);

      if (image.width !== expectedWidth || image.height !== expectedHeight) {
        return {
          valid: false,
          error: `Dimensions incorrectes: attendu ${expectedWidth}x${expectedHeight}, obtenu ${image.width}x${image.height}`
        };
      }

      if (image.width <= 0 || image.height <= 0) {
        return {
          valid: false,
          error: 'Dimensions invalides (zéro ou négatives)'
        };
      }

      const maxDimension = Math.max(image.width, image.height);
      if (maxDimension > maxTextureSize) {
        return {
          valid: false,
          error: `Dimension ${maxDimension} dépasse la limite WebGL ${maxTextureSize}`
        };
      }

      console.log('✅ Validation réussie:', image.width, 'x', image.height);
      return { valid: true };

    } catch (error) {
      return {
        valid: false,
        error: 'Impossible de valider l\'image: ' + error.message
      };
    }
  }

  /**
   * Charger une image de manière asynchrone
   * @private
   */
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        console.log('✅ Image chargée:', img.width, 'x', img.height);
        resolve(img);
      };

      img.onerror = (error) => {
        console.error('❌ Erreur lors du chargement de l\'image:', error);
        reject(new Error('Impossible de charger l\'image'));
      };

      img.src = url;
    });
  }
}

export default ImageResizer;
