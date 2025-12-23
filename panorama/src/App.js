/* eslint-disable no-unused-vars */
// App.js - Version restructurée respectant les règles des hooks React
// DR-498: QR Code Access pour Expérience VR - Deep Linking Integration
import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { VRButton, ARButton, XR, Controllers, Hands } from '@react-three/xr';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { useVRDeepLink } from './hooks/useVRDeepLink';
import DeepLinkHandler from './components/DeepLinkHandler';
import './App.css';

// Composant de diagnostic des capacités WebGL
function WebGLDiagnostic() {
  const { gl } = useThree();
  const [glInfo, setGlInfo] = useState(null);
  const [initStatus, setInitStatus] = useState('checking');

  useEffect(() => {
    const checkWebGLAvailability = () => {
      console.log('🔍 Vérification de la disponibilité WebGL...');
      
      if (!gl) {
        console.log('⏳ Contexte WebGL pas encore disponible');
        setInitStatus('waiting_context');
        return false;
      }
      
      if (typeof gl.getParameter !== 'function') {
        console.log('⏳ Méthodes WebGL pas encore initialisées');
        setInitStatus('waiting_methods');
        return false;
      }
      
      try {
        const testParam = gl.getParameter(gl.VERSION);
        if (!testParam) {
          console.log('⏳ Paramètres WebGL pas encore accessibles');
          setInitStatus('waiting_parameters');
          return false;
        }
      } catch (error) {
        console.log('⏳ Erreur d\'accès aux paramètres WebGL:', error.message);
        setInitStatus('error_access');
        return false;
      }
      
      return true;
    };

    const getWebGLInfo = () => {
      try {
        console.log('✅ WebGL complètement disponible, récupération des infos...');
        
        const info = {
          maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
          renderer: gl.getParameter(gl.RENDERER),
          vendor: gl.getParameter(gl.VENDOR),
          version: gl.getParameter(gl.VERSION),
          maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
          maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
          extensions: {
            textureFloat: !!gl.getExtension('OES_texture_float'),
            textureHalfFloat: !!gl.getExtension('OES_texture_half_float'),
            compressedTextures: !!gl.getExtension('WEBGL_compressed_texture_s3tc'),
            anisotropicFiltering: !!gl.getExtension('EXT_texture_filter_anisotropic')
          }
        };
        
        setGlInfo(info);
        setInitStatus('ready');
        
        console.log('=== DIAGNOSTIC WEBGL COMPLET ===');
        console.log('Taille texture maximum:', info.maxTextureSize, 'pixels');
        console.log('Ton image fait 12000x6000, limit dépassée?', 12000 > info.maxTextureSize);
        console.log('GPU:', info.renderer);
        console.log('Vendor:', info.vendor);
        console.log('Unités de texture disponibles:', info.maxTextureImageUnits);
        console.log('Extensions supportées:', info.extensions);
        console.log('================================');
        
        return info;
        
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des infos WebGL:', error);
        setInitStatus('error_retrieval');
        return null;
      }
    };

    const initializeWebGLDiagnostic = () => {
      if (checkWebGLAvailability()) {
        getWebGLInfo();
      } else {
        setTimeout(initializeWebGLDiagnostic, 100);
      }
    };

    initializeWebGLDiagnostic();
    
  }, [gl]);

  if (!glInfo) {
    const getInitMessage = () => {
      switch (initStatus) {
        case 'checking': return '🔍 Vérification WebGL...';
        case 'waiting_context': return '⏳ Attente contexte WebGL...';
        case 'waiting_methods': return '⏳ Initialisation méthodes...';
        case 'waiting_parameters': return '⏳ Chargement paramètres...';
        case 'error_access': return '❌ Erreur accès WebGL';
        case 'error_retrieval': return '❌ Erreur récupération infos';
        default: return '⏳ Initialisation...';
      }
    };

    return (
      <Text
        position={[0, 4, -2]}
        fontSize={0.15}
        color="#FFAA00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="black"
      >
        {getInitMessage()}
      </Text>
    );
  }

  return (
    <Text
      position={[0, 4, -2]}
      fontSize={0.15}
      color="#00FF00"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.01}
      outlineColor="black"
    >
      {`GPU: ${glInfo.renderer.substring(0, 30)}...
Limite texture: ${glInfo.maxTextureSize}px
Ton image: 12000px ${12000 > glInfo.maxTextureSize ? '❌ TROP GRANDE' : '✅ OK'}
Unités texture: ${glInfo.maxTextureImageUnits}`}
    </Text>
  );
}

// Hook personnalisé pour surveiller la mémoire proprement
function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (performance.memory) {
        setMemoryInfo({
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

// Composant pour afficher la mémoire
function MemoryMonitor() {
  const memoryInfo = useMemoryMonitor();

  if (!memoryInfo) return null;

  return (
    <Text
      position={[3, 4, -2]}
      fontSize={0.12}
      color="#FFD700"
      anchorX="left"
      anchorY="middle"
      outlineWidth={0.01}
      outlineColor="black"
    >
      {`Mémoire JS:
${memoryInfo.used}MB / ${memoryInfo.total}MB
Limite: ${memoryInfo.limit}MB`}
    </Text>
  );
}

// Service de redimensionnement automatique d'images pour VR avec détection WebGL avancée
class ImageResizer {
  constructor() {
    this.maxTextureSize = 8192; // Valeur par défaut, sera mise à jour
    this.targetRatio = 2; // Ratio 2:1 parfait pour panoramas équirectangulaires
    this.jpegQuality = 0.92; // Qualité élevée mais avec compression raisonnable
    this.webglLimitsDetected = false;
  }

  // Nouvelle méthode pour détecter les vraies limites WebGL du système
  async detectWebGLLimits() {
    console.log('🔍 === DÉTECTION DES VRAIES LIMITES WEBGL ===');
    
    try {
      // Créer un contexte WebGL temporaire pour tester les limites
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        console.error('❌ WebGL non disponible pour la détection des limites');
        return { success: false, maxTextureSize: 2048 }; // Fallback très conservateur
      }
      
      // Obtenir la vraie limite de texture de ce GPU spécifique
      const detectedMaxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const maxUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
      const maxCombined = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
      
      console.log('📊 Limites détectées du GPU:');
      console.log('   Taille texture maximum:', detectedMaxSize, 'pixels');
      console.log('   Unités de texture:', maxUnits);
      console.log('   Unités combinées:', maxCombined);
      
      // Test pratique : essayer de créer une texture aux dimensions limites
      const testSize = Math.min(detectedMaxSize, 8192); // Commencer avec une taille raisonnable
      const testTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, testTexture);
      
      try {
        // Tenter de créer une texture à la taille théorique maximum
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, testSize, testSize / 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        const error = gl.getError();
        
        if (error === gl.NO_ERROR) {
          console.log('✅ Test de création texture réussi à', testSize, 'pixels');
          this.maxTextureSize = testSize;
        } else {
          console.warn('⚠️ Échec du test à', testSize, 'pixels, error code:', error);
          // Réduire la taille et réessayer
          const conservativeSize = Math.min(testSize / 2, 4096);
          this.maxTextureSize = conservativeSize;
          console.log('🎯 Utilisation de la taille conservatrice:', conservativeSize, 'pixels');
        }
      } catch (testError) {
        console.warn('⚠️ Exception lors du test de texture:', testError.message);
        this.maxTextureSize = 4096; // Très conservateur
      }
      
      // Nettoyer les ressources de test
      gl.deleteTexture(testTexture);
      
      this.webglLimitsDetected = true;
      
      console.log('🎯 Limite WebGL finale retenue:', this.maxTextureSize, 'pixels');
      console.log('=======================================');
      
      return { 
        success: true, 
        maxTextureSize: this.maxTextureSize,
        detectedMaxSize,
        maxUnits,
        maxCombined
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de la détection WebGL:', error);
      this.maxTextureSize = 2048; // Très conservateur en cas d'erreur
      return { success: false, maxTextureSize: this.maxTextureSize };
    }
  }

  // Méthode principale enrichie avec détection automatique des limites
  async processImage(imageUrl) {
    console.log('🖼️ === DÉBUT DU TRAITEMENT AUTOMATIQUE D\'IMAGE AVANCÉ ===');
    console.log('📥 URL source:', imageUrl);
    
    try {
      // Étape 0: Détecter les vraies limites WebGL si pas encore fait
      if (!this.webglLimitsDetected) {
        console.log('🔍 Détection des limites WebGL du système...');
        const limitsResult = await this.detectWebGLLimits();
        if (limitsResult.success) {
          console.log('✅ Limites WebGL détectées, max texture:', this.maxTextureSize, 'pixels');
        }
      }
      
      // Étape 1: Charger l'image originale pour analyser ses dimensions
      const originalImage = await this.loadImage(imageUrl);
      console.log('📐 Dimensions originales:', originalImage.width, 'x', originalImage.height);
      
      // Étape 2: Analyser si un redimensionnement est nécessaire avec les vraies limites
      const analysis = this.analyzeImageNeed(originalImage);
      console.log('🔍 Analyse avec limites réelles:', analysis.needsResize ? 'Redimensionnement requis' : 'Dimensions acceptables');
      
      if (!analysis.needsResize) {
        console.log('✅ Image déjà aux bonnes dimensions pour ce GPU, utilisation directe');
        return {
          success: true,
          resized: false,
          originalUrl: imageUrl,
          optimizedUrl: imageUrl,
          originalDimensions: { width: originalImage.width, height: originalImage.height },
          finalDimensions: { width: originalImage.width, height: originalImage.height },
          webglLimits: { maxTextureSize: this.maxTextureSize }
        };
      }
      
      // Étape 3: Redimensionner avec méthode haute qualité progressive
      console.log('🔧 Redimensionnement optimisé vers:', analysis.targetWidth, 'x', analysis.targetHeight);
      console.log('🎯 Adapté spécifiquement aux limites de votre GPU:', this.maxTextureSize, 'pixels');
      
      const resizedBlob = await this.resizeImageProgressive(originalImage, analysis.targetWidth, analysis.targetHeight);
      
      // Étape 4: Créer une URL temporaire avec validation supplémentaire
      const optimizedUrl = URL.createObjectURL(resizedBlob);
      
      // Étape 5: Validation que l'image redimensionnée est correcte
      console.log('🧪 Validation de l\'image redimensionnée...');
      const validationResult = await this.validateResizedImage(optimizedUrl, analysis.targetWidth, analysis.targetHeight);
      
      if (!validationResult.valid) {
        console.error('❌ Validation échouée:', validationResult.error);
        URL.revokeObjectURL(optimizedUrl);
        throw new Error('Image redimensionnée invalide: ' + validationResult.error);
      }
      
      // Calcul des économies de mémoire
      const originalMemoryMB = (originalImage.width * originalImage.height * 4) / 1024 / 1024;
      const optimizedMemoryMB = (analysis.targetWidth * analysis.targetHeight * 4) / 1024 / 1024;
      const memorySavings = originalMemoryMB - optimizedMemoryMB;
      
      console.log('💾 Mémoire GPU originale:', originalMemoryMB.toFixed(1), 'MB');
      console.log('💾 Mémoire GPU optimisée:', optimizedMemoryMB.toFixed(1), 'MB');
      console.log('💰 Économie de mémoire:', memorySavings.toFixed(1), 'MB');
      console.log('✅ Redimensionnement et validation terminés avec succès');
      
      return {
        success: true,
        resized: true,
        originalUrl: imageUrl,
        optimizedUrl: optimizedUrl,
        originalDimensions: { width: originalImage.width, height: originalImage.height },
        finalDimensions: { width: analysis.targetWidth, height: analysis.targetHeight },
        memorySavingsMB: memorySavings,
        fileSizeMB: resizedBlob.size / 1024 / 1024,
        webglLimits: { maxTextureSize: this.maxTextureSize },
        validationPassed: true
      };
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement d\'image avancé:', error);
      return {
        success: false,
        error: error.message,
        originalUrl: imageUrl,
        webglLimits: { maxTextureSize: this.maxTextureSize }
      };
    }
  }

  // Nouvelle méthode de redimensionnement progressif pour une qualité optimale
  async resizeImageProgressive(image, targetWidth, targetHeight) {
    console.log('🎨 Redimensionnement progressif haute qualité...');
    
    const originalWidth = image.width;
    const originalHeight = image.height;
    
    // Si la réduction est importante (> 50%), faire un redimensionnement en étapes
    const reductionFactor = (targetWidth * targetHeight) / (originalWidth * originalHeight);
    
    if (reductionFactor < 0.5) {
      console.log('📉 Réduction importante détectée, redimensionnement en étapes...');
      return await this.resizeInSteps(image, targetWidth, targetHeight);
    } else {
      console.log('📐 Réduction modérée, redimensionnement direct...');
      return await this.resizeImageDirect(image, targetWidth, targetHeight);
    }
  }

  // Redimensionnement en étapes pour une qualité optimale sur de grandes réductions
  async resizeInSteps(image, finalWidth, finalHeight) {
    let currentImage = image;
    let currentWidth = image.width;
    let currentHeight = image.height;
    
    // Réduire par étapes de maximum 50% à chaque fois
    while (currentWidth > finalWidth * 1.5 || currentHeight > finalHeight * 1.5) {
      const stepWidth = Math.max(Math.round(currentWidth * 0.7), finalWidth);
      const stepHeight = Math.max(Math.round(currentHeight * 0.7), finalHeight);
      
      console.log(`📏 Étape de redimensionnement: ${currentWidth}x${currentHeight} → ${stepWidth}x${stepHeight}`);
      
      const stepBlob = await this.resizeImageDirect(currentImage, stepWidth, stepHeight);
      currentImage = await this.loadImageFromBlob(stepBlob);
      currentWidth = stepWidth;
      currentHeight = stepHeight;
    }
    
    // Dernière étape vers les dimensions finales
    console.log(`🎯 Étape finale: ${currentWidth}x${currentHeight} → ${finalWidth}x${finalHeight}`);
    return await this.resizeImageDirect(currentImage, finalWidth, finalHeight);
  }

  // Charger une image depuis un blob
  async loadImageFromBlob(blob) {
    const url = URL.createObjectURL(blob);
    try {
      const image = await this.loadImage(url);
      return image;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // Effectuer le redimensionnement avec Canvas pour une qualité optimale (inchangé)
  async resizeImageDirect(image, targetWidth, targetHeight) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
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

  // Nouvelle méthode de validation de l'image redimensionnée
  async validateResizedImage(url, expectedWidth, expectedHeight) {
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
      if (maxDimension > this.maxTextureSize) {
        return {
          valid: false,
          error: `Dimension ${maxDimension} dépasse la limite WebGL ${this.maxTextureSize}`
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

  // Charger une image de manière asynchrone avec gestion d'erreur robuste (inchangé)
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('✅ Image chargée:', img.width, 'x', img.height);
        resolve(img);
      };
      
      img.onerror = (error) => {
        console.error('❌ Échec du chargement de l\'image');
        reject(new Error(`Impossible de charger l'image: ${url}`));
      };
      
      setTimeout(() => {
        reject(new Error('Timeout: Image trop lente à charger'));
      }, 15000);
      
      img.src = url;
    });
  }

  // Analyser si l'image nécessite un redimensionnement avec les vraies limites WebGL
  analyzeImageNeed(image) {
    const { width, height } = image;
    const maxDimension = Math.max(width, height);
    
    console.log('🔍 Analyse avec limite WebGL détectée:', this.maxTextureSize, 'pixels');
    
    // Vérifier si l'image dépasse les vraies limites WebGL détectées
    if (maxDimension <= this.maxTextureSize) {
      return { needsResize: false };
    }
    
    // Calculer les nouvelles dimensions en conservant le ratio optimal
    let targetWidth, targetHeight;
    
    const currentRatio = width / height;
    
    if (currentRatio >= this.targetRatio) {
      targetWidth = Math.min(width, this.maxTextureSize);
      targetHeight = Math.round(targetWidth / this.targetRatio);
    } else {
      targetHeight = Math.min(height, this.maxTextureSize / this.targetRatio);
      targetWidth = Math.round(targetHeight * this.targetRatio);
    }
    
    // S'assurer que les dimensions restent dans les limites
    targetWidth = Math.min(targetWidth, this.maxTextureSize);
    targetHeight = Math.min(targetHeight, this.maxTextureSize / this.targetRatio);
    
    console.log('🎯 Dimensions cibles calculées avec limites réelles:', targetWidth, 'x', targetHeight);
    console.log('📊 Ratio cible atteint:', (targetWidth / targetHeight).toFixed(2));
    
    return {
      needsResize: true,
      targetWidth,
      targetHeight,
      reductionFactor: (targetWidth * targetHeight) / (width * height)
    };
  }

  // Nettoyer les URL temporaires pour éviter les fuites mémoire (inchangé)
  cleanup(optimizedUrl) {
    if (optimizedUrl && optimizedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(optimizedUrl);
      console.log('🧹 URL temporaire nettoyée');
    }
  }
}

// Instance globale du service de redimensionnement
const imageResizer = new ImageResizer();
function PreflightDiagnostic({ url, onResults }) {
  const [preflightStatus, setPreflightStatus] = useState('starting');
  const [results, setResults] = useState(null);
  const [resizeStatus, setResizeStatus] = useState(null); // Nouveau état pour le redimensionnement

  useEffect(() => {
    console.log('🔍 === DIAGNOSTIC PRÉALABLE AVEC REDIMENSIONNEMENT AUTOMATIQUE ===');
    
    const runEnhancedPreflightChecks = async () => {
      setPreflightStatus('running');
      const testResults = {
        fileExists: false,
        fileSize: null,
        contentType: null,
        accessibleViaFetch: false,
        accessibleViaImage: false,
        imageProcessingResult: null, // Nouveau champ pour le résultat du redimensionnement
        finalUrl: url, // URL finale à utiliser (originale ou optimisée)
        serverResponse: null,
        imageDimensions: null,
        needsOptimization: false, // Nouveau champ pour indiquer si l'image a été optimisée
        timestamp: new Date().toLocaleTimeString()
      };

      // Test 1: Vérification de l'existence du fichier via HEAD request
      console.log('📋 Test 1: Vérification existence fichier...');
      try {
        const headResponse = await fetch(url, { method: 'HEAD' });
        testResults.serverResponse = headResponse.status;
        
        if (headResponse.ok) {
          testResults.fileExists = true;
          testResults.fileSize = headResponse.headers.get('content-length');
          testResults.contentType = headResponse.headers.get('content-type');
          
          console.log('✅ Fichier trouvé sur le serveur');
          console.log('📊 Taille:', testResults.fileSize ? `${(testResults.fileSize / 1024 / 1024).toFixed(1)}MB` : 'inconnue');
          console.log('🎭 Type:', testResults.contentType || 'inconnu');
        } else {
          console.error('❌ Fichier non trouvé (HTTP', headResponse.status, ')');
          console.error('🔍 URL testée:', url);
          console.error('💡 Vérifiez que le fichier est dans le dossier /public');
        }
      } catch (headError) {
        console.error('❌ Erreur lors du test d\'existence:', headError.message);
        testResults.serverResponse = 'ERROR';
      }

      // Test 2: Tentative de chargement via fetch
      if (testResults.fileExists) {
        console.log('📋 Test 2: Test de téléchargement via fetch...');
        try {
          const fetchResponse = await fetch(url);
          if (fetchResponse.ok) {
            testResults.accessibleViaFetch = true;
            console.log('✅ Fichier téléchargeable via fetch');
          } else {
            console.error('❌ Échec du téléchargement fetch:', fetchResponse.status);
          }
        } catch (fetchError) {
          console.error('❌ Erreur lors du test fetch:', fetchError.message);
        }
      }

      // Test 3: NOUVEAU - Chargement et optimisation automatique intelligente
      if (testResults.accessibleViaFetch) {
        console.log('📋 Test 3: Analyse et optimisation automatique de l\'image...');
        setResizeStatus('analyzing');
        
        try {
          // Utiliser notre service de redimensionnement intelligent
          const processingResult = await imageResizer.processImage(url);
          testResults.imageProcessingResult = processingResult;
          
          if (processingResult.success) {
            testResults.accessibleViaImage = true;
            testResults.imageDimensions = processingResult.finalDimensions;
            testResults.finalUrl = processingResult.optimizedUrl; // URL optimisée si redimensionnée
            testResults.needsOptimization = processingResult.resized;
            
            if (processingResult.resized) {
              console.log('🎯 Image automatiquement optimisée pour WebGL!');
              console.log('📐 Dimensions finales:', processingResult.finalDimensions.width, 'x', processingResult.finalDimensions.height);
              console.log('💾 Économie mémoire:', processingResult.memorySavingsMB?.toFixed(1), 'MB');
              setResizeStatus('resized');
            } else {
              console.log('✅ Image déjà aux dimensions optimales');
              setResizeStatus('optimal');
            }
          } else {
            console.error('❌ Échec du traitement automatique:', processingResult.error);
            setResizeStatus('failed');
          }
          
        } catch (imageError) {
          console.error('❌ Erreur lors du traitement d\'image:', imageError.message);
          setResizeStatus('failed');
        }
      }

      setResults(testResults);
      
      // Analyse des résultats et détermination du statut final
      console.log('📊 === RÉSULTATS DU DIAGNOSTIC PRÉALABLE ENRICHI ===');
      console.log('Fichier existe:', testResults.fileExists ? '✅' : '❌');
      console.log('Téléchargeable:', testResults.accessibleViaFetch ? '✅' : '❌');
      console.log('Traitement image:', testResults.accessibleViaImage ? '✅' : '❌');
      console.log('Optimisation appliquée:', testResults.needsOptimization ? '✅ Redimensionné' : '⚪ Non nécessaire');
      console.log('URL finale:', testResults.finalUrl);
      
      if (!testResults.fileExists) {
        setPreflightStatus('file_not_found');
      } else if (!testResults.accessibleViaFetch) {
        setPreflightStatus('fetch_failed');
      } else if (!testResults.accessibleViaImage) {
        setPreflightStatus('process_failed');
      } else {
        setPreflightStatus('success');
      }
      
      // Transmettre les résultats enrichis au composant parent
      onResults(testResults);
    };

    runEnhancedPreflightChecks();
  }, [url, onResults]);

  const getStatusMessage = () => {
    switch (preflightStatus) {
      case 'starting':
        return '🔄 Initialisation du diagnostic enrichi...';
      case 'running':
        return `🔍 Tests préalables en cours...\n${getResizeStatusMessage()}`;
      case 'file_not_found':
        return '❌ Fichier panorama-test.jpg introuvable\n💡 Placez-le dans le dossier /public';
      case 'fetch_failed':
        return '❌ Impossible de télécharger le fichier\n💡 Vérifiez les permissions et le serveur';
      case 'process_failed':
        return '❌ Échec du traitement automatique\n💡 Format d\'image non supporté ou corrompu';
      case 'success':
        return getSuccessMessage();
      default:
        return 'État de test inconnu';
    }
  };

  const getResizeStatusMessage = () => {
    switch (resizeStatus) {
      case 'analyzing':
        return '🔍 Analyse des dimensions de l\'image...';
      case 'resized':
        return '🎯 Redimensionnement automatique appliqué';
      case 'optimal':
        return '✅ Dimensions déjà optimales';
      case 'failed':
        return '⚠️ Problème lors de l\'optimisation';
      default:
        return '';
    }
  };

  const getSuccessMessage = () => {
    if (!results?.imageProcessingResult) return '✅ Tests préalables réussis!';
    
    const processing = results.imageProcessingResult;
    if (processing.resized) {
      return `✅ Image automatiquement optimisée!
📐 ${processing.originalDimensions.width}x${processing.originalDimensions.height} → ${processing.finalDimensions.width}x${processing.finalDimensions.height}
💾 Économie: ${processing.memorySavingsMB?.toFixed(1)}MB mémoire GPU
🚀 Prête pour WebGL et VR!`;
    } else {
      return `✅ Image déjà aux bonnes dimensions!
📐 ${processing.finalDimensions.width}x${processing.finalDimensions.height}
🎯 Optimale pour WebGL sans modification`;
    }
  };

  const getStatusColor = () => {
    switch (preflightStatus) {
      case 'starting':
      case 'running':
        return '#00BFFF';
      case 'success':
        return results?.needsOptimization ? '#32CD32' : '#00FF00'; // Vert différent si optimisé
      case 'file_not_found':
      case 'fetch_failed':
      case 'process_failed':
        return '#FF4500';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <Text
      position={[0, 3, -2]}
      fontSize={0.18}
      color={getStatusColor()}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.02}
      outlineColor="black"
      whiteSpace="pre-line"
    >
      {getStatusMessage()}
    </Text>
  );
}

// Hook personnalisé enrichi pour diagnostiquer les problèmes useLoader/WebGL
// Hook personnalisé qui utilise Three.js directement au lieu de useLoader
function useDirectTextureLoading({ url, shouldLoad, onTextureLoaded, onTextureError }) {
  const [loadingState, setLoadingState] = useState('idle');
  const [detailedStatus, setDetailedStatus] = useState('En attente...');
  const [progressInfo, setProgressInfo] = useState(null);
  const [webglAttemptStarted, setWebglAttemptStarted] = useState(false);
  const startTimeRef = useRef(null);
  const textureRef = useRef(null);
  
  useEffect(() => {
    if (shouldLoad && !webglAttemptStarted) {
      console.log('🚀 === DÉBUT DU CHARGEMENT DIRECT THREE.JS ===');
      console.log('📋 URL à charger:', url);
      console.log('⏰ Heure de début:', new Date().toLocaleTimeString());
      setWebglAttemptStarted(true);
      setDetailedStatus('Initialisation du chargement direct...');
      setLoadingState('starting');
      startTimeRef.current = Date.now();
      
      // Créer un loader Three.js directement
      const loader = new THREE.TextureLoader();
      
      // Configurer le chargement avec nos callbacks détaillés
      loader.load(
        url,
        
        // Callback de succès - identique à votre diagnostic précédent
        (loadedTexture) => {
          const loadTime = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 'inconnu';
          
          console.log('🎉 === SUCCÈS CHARGEMENT DIRECT THREE.JS ===');
          console.log('⏱️ Temps total de chargement:', loadTime, 'secondes');
          console.log('🔍 Inspection de l\'objet texture reçu:');
          console.log('   Type:', typeof loadedTexture);
          console.log('   Constructor:', loadedTexture.constructor.name);
          console.log('   UUID:', loadedTexture.uuid);
          
          // Vérification critique de la propriété image
          if (loadedTexture.image) {
            console.log('✅ Propriété image présente:');
            console.log('   Dimensions:', loadedTexture.image.width, 'x', loadedTexture.image.height);
            console.log('   Type image:', typeof loadedTexture.image);
            console.log('   Complete:', loadedTexture.image.complete);
            
            // Configuration optimale de la texture pour VR
            loadedTexture.minFilter = THREE.LinearFilter;
            loadedTexture.magFilter = THREE.LinearFilter;
            loadedTexture.wrapS = THREE.RepeatWrapping;
            loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
            loadedTexture.needsUpdate = true;
            
            console.log('✅ Configuration de texture réussie');
            
            setLoadingState('success');
            setDetailedStatus('Texture configurée et prête');
            textureRef.current = loadedTexture;
            
            // Notifier le parent que la texture est prête
            if (onTextureLoaded) {
              console.log('📤 Transmission de la texture au composant parent...');
              onTextureLoaded(loadedTexture);
            }
            
          } else {
            console.error('❌ PROBLÈME CRITIQUE: texture.image est undefined même en direct!');
            setLoadingState('error');
            setDetailedStatus('Texture invalide - pas d\'image');
            if (onTextureError) {
              onTextureError(new Error('Texture chargée mais sans données d\'image valides'));
            }
          }
        },
        
        // Callback de progression
        (progress) => {
          if (progress.lengthComputable) {
            const percentComplete = (progress.loaded / progress.total) * 100;
            const progressText = `${percentComplete.toFixed(1)}% (${(progress.loaded / 1024 / 1024).toFixed(1)}MB / ${(progress.total / 1024 / 1024).toFixed(1)}MB)`;
            console.log(`📊 Progression chargement direct: ${progressText}`);
            setProgressInfo({
              percent: percentComplete,
              loaded: progress.loaded,
              total: progress.total
            });
            setDetailedStatus(`Téléchargement en cours: ${progressText}`);
            setLoadingState('downloading');
          } else {
            console.log('📊 Progression chargement direct: données en cours...');
            setDetailedStatus('Téléchargement en cours (taille inconnue)');
            setLoadingState('downloading');
          }
        },
        
        // Callback d'erreur
        (error) => {
          const loadTime = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 'inconnu';
          
          console.error('💥 === ÉCHEC CHARGEMENT DIRECT THREE.JS ===');
          console.error('⏱️ Temps avant échec:', loadTime, 'secondes');
          console.error('🔴 Type d\'erreur:', error.constructor.name);
          console.error('📝 Message d\'erreur:', error.message);
          
          setLoadingState('error');
          setDetailedStatus(`Erreur: ${error.message}`);
          
          if (onTextureError) {
            onTextureError(error);
          }
        }
      );
    }
  }, [shouldLoad, url, onTextureLoaded, onTextureError, webglAttemptStarted]);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (textureRef.current) {
        console.log('🧹 Nettoyage de la texture Three.js direct...');
        textureRef.current.dispose();
      }
    };
  }, []);

  return {
    loadingState,
    isLoading: shouldLoad && loadingState !== 'success' && loadingState !== 'error',
    detailedStatus,
    progressInfo,
    webglAttemptStarted
  };
}

// Composant enrichi pour afficher le statut détaillé du chargement de texture
function TextureLoadingStatus({ isLoading, loadingState, hasTexture, detailedStatus, progressInfo, webglAttemptStarted }) {
  if (!webglAttemptStarted && !hasTexture) return null;
  
  const getMessage = () => {
    if (isLoading) {
      if (progressInfo) {
        return `⏳ ${detailedStatus}
📊 ${progressInfo.percent.toFixed(1)}% téléchargé
📦 ${(progressInfo.loaded / 1024 / 1024).toFixed(1)}MB / ${(progressInfo.total / 1024 / 1024).toFixed(1)}MB`;
      }
      return `⏳ ${detailedStatus}`;
    }
    
    if (hasTexture) {
      return `✅ Texture panoramique active!
🎨 Image appliquée au material Three.js
🔧 Configuration VR optimisée`;
    }
    
    if (loadingState === 'error') {
      return `❌ Échec chargement WebGL
📝 ${detailedStatus}
🔍 Consultez la console pour l'analyse complète`;
    }
    
    return `⚪ État: ${detailedStatus}`;
  };
  
  const getColor = () => {
    if (isLoading) return '#FFA500';
    if (hasTexture) return '#00FF00';
    if (loadingState === 'error') return '#FF0000';
    return '#FFFFFF';
  };
  
  return (
    <Text
      position={[0, 2, -2]}
      fontSize={0.18}
      color={getColor()}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.02}
      outlineColor="black"
      whiteSpace="pre-line"
    >
      {getMessage()}
    </Text>
  );
}

// Composant VR Environment restructuré pour une architecture correcte
function VREnvironment() {
  const [clicked, setClicked] = useState(false);
  const [preflightResults, setPreflightResults] = useState(null);
  const [textureLoadingAllowed, setTextureLoadingAllowed] = useState(false);
  const [finalTexture, setFinalTexture] = useState(null);
  const [loadingError, setLoadingError] = useState(null);

  // Callback enrichi pour recevoir les résultats des tests préalables avec optimisation
  const handlePreflightResults = useCallback((results) => {
    setPreflightResults(results);
    
    // Autoriser le chargement de texture seulement si tous les tests préalables ont réussi
    if (results.fileExists && results.accessibleViaFetch && results.accessibleViaImage) {
      console.log('🎉 Tests préalables réussis avec optimisation automatique');
      
      if (results.needsOptimization) {
        console.log('🎯 Image automatiquement redimensionnée pour WebGL');
        console.log('📐 Dimensions finales:', results.imageDimensions.width, 'x', results.imageDimensions.height);
        console.log('🔗 URL optimisée générée:', results.finalUrl);
      } else {
        console.log('✅ Image déjà aux dimensions optimales');
      }
      
      setTextureLoadingAllowed(true);
    } else {
      console.log('❌ Tests préalables échoués, chargement texture bloqué');
      setTextureLoadingAllowed(false);
      setFinalTexture(null);
    }
  }, []);

  // Gestionnaires pour le chargement de texture avec diagnostic enrichi
  const handleTextureLoaded = useCallback((texture) => {
    console.log('🎉 Texture finale prête pour affichage VR');
    console.log('📊 Propriétés de la texture reçue:', {
      width: texture.image?.width,
      height: texture.image?.height,
      format: texture.format,
      type: texture.type
    });
    setFinalTexture(texture);
    setLoadingError(null);
  }, []);

  const handleTextureError = useCallback((error) => {
    console.error('❌ Erreur finale de chargement texture:', error);
    setLoadingError(error);
    setFinalTexture(null);
  }, []);

  // ✅ CORRECT: Utilisation du hook enrichi avec l'URL optimisée
  // Dans VREnvironment, remplacez l'appel useTextureLoading par :
const { loadingState, isLoading, detailedStatus, progressInfo, webglAttemptStarted } = useDirectTextureLoading({
  url: preflightResults?.finalUrl || '/panorama-test.jpg',
  shouldLoad: textureLoadingAllowed,
  onTextureLoaded: handleTextureLoaded,
  onTextureError: handleTextureError
});

  // Nettoyage des ressources lors du démontage du composant
  useEffect(() => {
    return () => {
      // Nettoyer les URL temporaires créées par le redimensionnement
      if (preflightResults?.finalUrl && preflightResults.finalUrl !== preflightResults.originalUrl) {
        console.log('🧹 Nettoyage des ressources temporaires...');
        imageResizer.cleanup(preflightResults.finalUrl);
      }
    };
  }, [preflightResults]);

  // Gestionnaires d'événements mémorisés pour l'interaction
  const handleCubeClick = useCallback(() => {
    setClicked(prev => !prev);
    console.log('🎯 Interaction cube détectée - VR fonctionne!');
  }, []);

  const handleCubePointerOver = useCallback(() => {
    document.body.style.cursor = 'pointer';
    console.log('👆 Survol cube détecté');
  }, []);

  const handleCubePointerOut = useCallback(() => {
    document.body.style.cursor = 'auto';
  }, []);

  return (
    <>
      {/* Diagnostic WebGL - Informations sur les capacités du GPU */}
      <WebGLDiagnostic />
      
      {/* Moniteur mémoire - Surveillance des ressources système */}
      <MemoryMonitor />
      
      {/* Tests préalables - Vérification du fichier avant chargement texture */}
      <PreflightDiagnostic 
        url="/panorama-test.jpg" 
        onResults={handlePreflightResults}
      />
      
      {/* Indicateur de statut enrichi du chargement de texture WebGL */}
      <TextureLoadingStatus 
        isLoading={isLoading}
        loadingState={loadingState}
        hasTexture={!!finalTexture}
        detailedStatus={detailedStatus}
        progressInfo={progressInfo}
        webglAttemptStarted={webglAttemptStarted}
      />

      {/* ✅ CORRECT: La texture est utilisée ICI dans un contexte Three.js approprié */}
      {/* Sphère panoramique - Seulement si la texture finale est disponible */}
      {finalTexture && (
        <mesh scale={[-1, 1, 1]}>
          <sphereGeometry args={[500, 60, 40]} />
          <meshBasicMaterial 
            map={finalTexture}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      {/* Sphère de fallback avec environnement de base quand pas de texture */}
      {!finalTexture && (
        <mesh scale={[-1, 1, 1]}>
          <sphereGeometry args={[500, 32, 16]} />
          <meshBasicMaterial 
            color="#1a1a2e"
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      {/* Éclairage adaptatif selon la présence de la texture panoramique */}
      <ambientLight intensity={finalTexture ? 0.6 : 0.8} />
      
      {/* Cube de test interactif - Validation que les interactions VR fonctionnent */}
      <Box
        position={[0, 1.5, -2]}
        scale={clicked ? 1.5 : 1}
        onClick={handleCubeClick}
        onPointerOver={handleCubePointerOver}
        onPointerOut={handleCubePointerOut}
      >
        <meshStandardMaterial 
          color={clicked ? '#F97316' : '#3B82F6'} 
          transparent={true} 
          opacity={0.8} 
        />
      </Box>
      
  {/* Instructions mises à jour pour refléter les nouvelles capacités */}
  <Text
    position={[-3, 1, -2]}
    fontSize={0.15}
    color="#F97316"
    anchorX="left"
    anchorY="middle"
    outlineWidth={0.01}
    outlineColor="white"
  >
    🤖 Optimisation automatique intégrée
    📋 1. Tests préalables automatiques
    🎯 2. Redimensionnement intelligent si nécessaire
    ⚡ 3. Chargement WebGL optimisé
    🎮 4. Affichage VR haute performance
    🧹 5. Gestion mémoire automatique
  </Text>
      
      {/* Affichage des erreurs de chargement avec diagnostic */}
      {loadingError && (
        <Text
          position={[0, 0.5, -2]}
          fontSize={0.18}
          color="#FF6B6B"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="black"
          whiteSpace="pre-line"
        >
          {`❌ Erreur de chargement final:
${loadingError.message}
🔍 Détails disponibles dans la console
💡 Vérifiez les résultats des tests préalables`}
        </Text>
      )}
      
      {/* Support VR complet - Contrôleurs et tracking des mains */}
      <SimpleTextureTest />
      <Controllers />
      <Hands />
    </>
  );
}
// Composant de test ultra-simple pour isoler le problème Three.js
function SimpleTextureTest() {
  const [testResult, setTestResult] = useState('Initialisation...');
  const [testDetails, setTestDetails] = useState('');

  useEffect(() => {
    const runSimpleTest = async () => {
      console.log('🧪 === TEST DE DIAGNOSTIC ULTRA-SIMPLE ===');
      setTestResult('Test en cours...');
      
      try {
        // Test 1: Créer un loader Three.js basique
        console.log('📋 Test 1: Création du TextureLoader...');
        const loader = new THREE.TextureLoader();
        
        // Test 2: Essayer de charger notre image avec des callbacks détaillés
        console.log('📋 Test 2: Chargement direct via Three.js...');
        
        loader.load(
          '/panorama-test.jpg',
          
          // Callback de succès
          (texture) => {
            console.log('✅ Succès du chargement Three.js direct!');
            console.log('📊 Propriétés de la texture:');
            console.log('   texture.image existe:', !!texture.image);
            console.log('   texture.image.width:', texture.image?.width);
            console.log('   texture.image.height:', texture.image?.height);
            console.log('   texture.image.complete:', texture.image?.complete);
            console.log('   texture.format:', texture.format);
            console.log('   texture.type:', texture.type);
            
            if (texture.image && texture.image.width && texture.image.height) {
              setTestResult('✅ SUCCESS! Three.js peut charger la texture');
              setTestDetails(`Dimensions: ${texture.image.width}x${texture.image.height}`);
              console.log('🎉 CONCLUSION: Le problème ne vient PAS de Three.js de base');
              console.log('🔍 Le problème est probablement dans React Three Fiber ou useLoader');
            } else {
              setTestResult('❌ ÉCHEC: texture.image manquante même en Three.js direct');
              setTestDetails('Problème au niveau de Three.js lui-même');
              console.log('🚨 CONCLUSION: Problème fondamental avec Three.js dans cet environnement');
            }
          },
          
          // Callback de progression
          (progress) => {
            const percentComplete = progress.lengthComputable ? 
              (progress.loaded / progress.total) * 100 : 0;
            console.log(`📊 Progression: ${percentComplete.toFixed(1)}%`);
            setTestDetails(`Chargement: ${percentComplete.toFixed(1)}%`);
          },
          
          // Callback d'erreur
          (error) => {
            console.error('❌ Erreur lors du test Three.js direct:', error);
            setTestResult('❌ ÉCHEC: Erreur dans Three.js direct');
            setTestDetails(`Erreur: ${error.message}`);
            console.log('🚨 CONCLUSION: Problème fondamental avec Three.js ou l\'environnement');
          }
        );
        
      } catch (error) {
        console.error('❌ Erreur critique lors du test:', error);
        setTestResult('❌ ÉCHEC CRITIQUE');
        setTestDetails(`Exception: ${error.message}`);
      }
    };

    runSimpleTest();
  }, []);

  return (
    <>
      <Text
        position={[0, 2, -2]}
        fontSize={0.3}
        color={testResult.includes('SUCCESS') ? '#00FF00' : 
              testResult.includes('ÉCHEC') ? '#FF0000' : '#FFA500'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
        whiteSpace="pre-line"
      >
        {`🧪 Test de diagnostic Three.js
${testResult}
${testDetails}`}
      </Text>
      
      {/* Cube de référence pour confirmer que Three.js fonctionne basiquement */}
      <Box
        position={[0, 0, -2]}
        scale={1}
      >
        <meshStandardMaterial color="#3B82F6" />
      </Box>
      
      <ambientLight intensity={0.8} />
    </>
  );
}
// Composant principal
function App() {
  const [diagnosticVisible, setDiagnosticVisible] = useState(true);

  // DR-498 / DR-501 / DR-502: Deep Linking for QR Code Access
  const deepLinkState = useVRDeepLink();

  const toggleDiagnostic = useCallback(() => {
    setDiagnosticVisible(prev => !prev);
  }, []);

  return (
    <div className="App">
      {/* DR-498 / DR-501: Deep Link Handler */}
      <DeepLinkHandler deepLinkState={deepLinkState} refreshToken={deepLinkState.refreshToken} />

      <div className="controls">
        <h1>🔬 DreamScape VR - Architecture Hooks Corrigée</h1>
        <p>Version restructurée respectant les règles des hooks React</p>

        {/* DR-498: Show deep link status */}
        {deepLinkState.isDeepLink && deepLinkState.isValid && (
          <div style={{
            background: 'linear-gradient(45deg, #10B981, #3B82F6)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            margin: '10px 0',
            fontSize: '14px'
          }}>
            🔗 VR Deep Link Active - Destination: <strong>{deepLinkState.destination}</strong>
          </div>
        )}
        
        <button 
          onClick={toggleDiagnostic}
          style={{
            background: diagnosticVisible ? '#22C55E' : '#6B7280',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            margin: '10px',
            cursor: 'pointer'
          }}
        >
          {diagnosticVisible ? '🔍 Diagnostic ON' : '🔍 Diagnostic OFF'}
        </button>
        
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
          ⚠️ Placez votre image panoramique 360° nommée 'panorama-test.jpg' dans le dossier /public
        </p>
        
        <p style={{ fontSize: '12px', color: '#888' }}>
          📊 Cette version respecte les règles des hooks et effectue des tests préalables
        </p>
        
        <VRButton 
          style={{
            background: 'linear-gradient(45deg, #F97316, #DB2777)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            margin: '10px',
            boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)'
          }}
        />
        
        <ARButton 
          style={{
            background: 'linear-gradient(45deg, #3B82F6, #22C55E)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            margin: '10px',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
          }}
        />
      </div>

      <Canvas
        style={{ 
          height: '80vh', 
          width: '100%',
          background: 'linear-gradient(to bottom, #1a1a2e, #16213e)'
        }}
        camera={{ position: [0, 1.6, 0], fov: 75 }}
        onError={(error) => {
          console.error('❌ ERREUR CANVAS:', error);
        }}
      >
        <XR>
          <Suspense 
            fallback={
              <Text
                position={[0, 2, -2]}
                fontSize={0.4}
                color="yellow"
                anchorX="center"
                anchorY="middle"
              >
                Chargement Suspense...
              </Text>
            }
          >
            <VREnvironment />
          </Suspense>
          
          <OrbitControls 
            enableZoom={true} 
            enablePan={false}
            enableRotate={true}
            maxDistance={10}
            minDistance={0.1}
          />
        </XR>
      </Canvas>
      
      <div className="instructions">
        <h3>🔬 Architecture Corrigée - Diagnostic par Phases :</h3>
        <div style={{ textAlign: 'left', margin: '20px' }}>
          <h4>Corrections architecturales majeures :</h4>
          <p><strong>Séparation des responsabilités :</strong> Chaque aspect du diagnostic est maintenant géré par un composant dédié, évitant les violations des règles des hooks.</p>
          
          <p><strong>Hooks appelés de manière cohérente :</strong> useLoader est toujours appelé mais avec une URL conditionnelle, respectant ainsi les règles fondamentales de React.</p>
          
          <p><strong>Tests préalables indépendants :</strong> Le diagnostic du fichier, de la connectivité et du décodage d'image se fait avant tout appel à useLoader.</p>
          
          <p><strong>Chargement conditionnel sécurisé :</strong> useLoader ne tente de charger la vraie texture que si tous les tests préalables ont confirmé que c'est possible.</p>
          
          <h4>Ce que vous devriez maintenant observer :</h4>
          <p>Phase 1 : Tests préalables s'exécutant automatiquement au chargement</p>
          <p>Phase 2 : Autorisation ou blocage du chargement de texture selon les résultats</p>
          <p>Phase 3 : Affichage réussi de la texture ou message d'erreur spécifique</p>
        </div>
      </div>
    </div>
  );
}

export default App;