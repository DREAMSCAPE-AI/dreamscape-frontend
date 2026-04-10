/* eslint-disable no-unused-vars */
// App.js - Version refactorisée utilisant les services modulaires
// DR-498: QR Code Access pour Expérience VR - Deep Linking Integration
import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { VRButton, ARButton, XR, Controllers, Hands } from '@react-three/xr';
import { OrbitControls, Text, Box } from '@react-three/drei';
import * as THREE from 'three';
import { useVRDeepLink } from './hooks/useVRDeepLink';
import useWebXRDetection from './hooks/useWebXRDetection';
import DeepLinkHandler from './components/DeepLinkHandler';
import VRUnavailableScreen from './components/VRUnavailableScreen';
import PanoramaGallery from './components/PanoramaGallery';
import './App.css';

// Services refactorisés (DR-250, DR-251, DR-252, DR-253, DR-410, DR-411)
import {
  getWebGLDetector,
  getTextureLoader,
  getTextureOptimizer,
  getAssetCache
} from './services';
import ImageResizer from './services/ImageResizer';
import ParisEnvironment from './components/ParisEnvironment';
import VRDestinationEnvironment from './components/VRDestinationEnvironment';
import VRPinEntry from './components/VRPinEntry';
import { getVREnvironment } from './data/environments';

// === COMPOSANTS DE DIAGNOSTIC ===

/**
 * Composant de diagnostic des capacités WebGL
 * Basé sur WebGLDiagnostic du PoC mais utilisant le service WebGLDetector
 */
function WebGLDiagnostic() {
  const { gl } = useThree();
  const [glInfo, setGlInfo] = useState(null);
  const [initStatus, setInitStatus] = useState('checking');

  useEffect(() => {
    const checkAndGetInfo = async () => {
      if (!gl) {
        setInitStatus('waiting_context');
        setTimeout(checkAndGetInfo, 100);
        return;
      }

      try {
        // Utiliser le service WebGLDetector
        const detector = getWebGLDetector();
        const limits = await detector.detect();

        if (limits.success) {
          setGlInfo({
            maxTextureSize: limits.maxTextureSize,
            renderer: limits.renderer,
            vendor: limits.vendor,
            version: limits.version,
            maxTextureImageUnits: limits.maxTextureImageUnits,
            extensions: limits.extensions
          });
          setInitStatus('ready');

          console.log('=== DIAGNOSTIC WEBGL (Service) ===');
          console.log('GPU:', limits.renderer);
          console.log('Max texture:', limits.maxTextureSize, 'px');
          console.log('================================');
        } else {
          setInitStatus('error_retrieval');
        }
      } catch (error) {
        console.error('❌ Erreur diagnostic WebGL:', error);
        setInitStatus('error_access');
      }
    };

    checkAndGetInfo();
  }, [gl]);

  if (!glInfo) {
    const messages = {
      checking: '🔍 Vérification WebGL...',
      waiting_context: '⏳ Attente contexte WebGL...',
      error_access: '❌ Erreur accès WebGL',
      error_retrieval: '❌ Erreur récupération infos'
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
        {messages[initStatus] || '⏳ Initialisation...'}
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
Unités texture: ${glInfo.maxTextureImageUnits}`}
    </Text>
  );
}

/**
 * Hook personnalisé pour surveiller la mémoire
 */
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

/**
 * Composant pour afficher la mémoire
 */
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

// === COMPOSANTS DE CHARGEMENT ===

/**
 * Composant de préparation de l'image avec le service ImageResizer
 * Remplace PreflightDiagnostic du PoC
 */
function ImagePreparation({ url, onResults }) {
  const [status, setStatus] = useState('starting');
  const [results, setResults] = useState(null);

  useEffect(() => {
    const prepareImage = async () => {
      console.log('🔍 === PRÉPARATION DE L\'IMAGE (Services) ===');
      setStatus('running');

      try {
        // Utiliser le service ImageResizer
        const resizer = new ImageResizer();
        const processingResult = await resizer.processImage(url);

        console.log('📊 Résultat du traitement:', processingResult);

        const prepResults = {
          success: processingResult.success,
          finalUrl: processingResult.optimizedUrl || url,
          resized: processingResult.resized,
          dimensions: processingResult.finalDimensions,
          memorySavingsMB: processingResult.memorySavingsMB,
          needsCleanup: processingResult.resized
        };

        if (processingResult.success) {
          // Ajouter au cache si redimensionné
          if (processingResult.resized) {
            const cache = getAssetCache();
            // Le cache gérera le blob URL automatiquement
            cache.set(url, processingResult.optimizedUrl, {
              width: processingResult.finalDimensions.width,
              height: processingResult.finalDimensions.height,
              resized: true
            });
          }

          setStatus('success');
          console.log('✅ Image préparée avec succès');
        } else {
          setStatus('failed');
          console.error('❌ Échec de la préparation:', processingResult.error);
        }

        setResults(prepResults);
        onResults(prepResults);

      } catch (error) {
        console.error('❌ Erreur lors de la préparation:', error);
        setStatus('failed');
        onResults({ success: false, error: error.message });
      }
    };

    prepareImage();
  }, [url, onResults]);

  const getMessage = () => {
    switch (status) {
      case 'starting':
        return '🔄 Initialisation...';
      case 'running':
        return '🔍 Analyse et optimisation...';
      case 'failed':
        return '❌ Échec de la préparation\n💡 Vérifiez la console';
      case 'success':
        if (results?.resized) {
          return `✅ Image optimisée!
📐 ${results.dimensions.width}x${results.dimensions.height}
💾 Économie: ${results.memorySavingsMB?.toFixed(1)}MB`;
        }
        return `✅ Image prête!
📐 ${results.dimensions.width}x${results.dimensions.height}`;
      default:
        return 'En attente...';
    }
  };

  const getColor = () => {
    switch (status) {
      case 'starting':
      case 'running':
        return '#00BFFF';
      case 'success':
        return results?.resized ? '#32CD32' : '#00FF00';
      case 'failed':
        return '#FF4500';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <Text
      position={[0, 3, -2]}
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

/**
 * Hook personnalisé pour charger une texture avec le service TextureLoader
 * Remplace useDirectTextureLoading du PoC
 */
function useTextureLoading({ url, shouldLoad }) {
  const [loadingState, setLoadingState] = useState('idle');
  const [texture, setTexture] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (!shouldLoad) return;

    let mounted = true;

    const loadTexture = async () => {
      console.log('🚀 Chargement de la texture (Service TextureLoader)...');
      setLoadingState('loading');

      try {
        const loader = getTextureLoader();

        const loadedTexture = await loader.load(url, {
          onProgress: (progressInfo) => {
            if (mounted) {
              setProgress(progressInfo);
            }
          },
          onSuccess: (tex) => {
            console.log('✅ Texture chargée avec succès');

            // Optimiser la texture avec le service TextureOptimizer
            const optimizer = getTextureOptimizer();
            optimizer.optimizeForVR(tex);

            if (mounted) {
              setTexture(tex);
              setLoadingState('success');
              setError(null);
            }
          },
          onError: (err) => {
            console.error('❌ Erreur de chargement:', err);
            if (mounted) {
              setError(err);
              setLoadingState('error');
            }
          }
        });

      } catch (err) {
        console.error('❌ Exception lors du chargement:', err);
        if (mounted) {
          setError(err);
          setLoadingState('error');
        }
      }
    };

    loadTexture();

    return () => {
      mounted = false;
      // Le nettoyage de la texture sera fait par le composant parent
    };
  }, [url, shouldLoad]);

  return {
    loadingState,
    isLoading: loadingState === 'loading',
    texture,
    error,
    progress
  };
}

/**
 * Composant pour afficher le statut du chargement
 */
function TextureLoadingStatus({ isLoading, loadingState, hasTexture, progress, error }) {
  if (!isLoading && !hasTexture && !error) return null;

  const getMessage = () => {
    if (isLoading) {
      if (progress && progress.percent !== null) {
        return `⏳ Chargement texture...
📊 ${progress.percent.toFixed(1)}% (${progress.loadedMB.toFixed(1)}MB / ${progress.totalMB.toFixed(1)}MB)`;
      }
      return '⏳ Chargement texture...';
    }

    if (hasTexture) {
      return `✅ Texture VR active!
🎨 Optimisée pour la VR
🚀 Prêt pour l'immersion`;
    }

    if (error) {
      return `❌ Erreur de chargement
📝 ${error.message}`;
    }

    return '⚪ En attente...';
  };

  const getColor = () => {
    if (isLoading) return '#FFA500';
    if (hasTexture) return '#00FF00';
    if (error) return '#FF0000';
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

// === ENVIRONNEMENT VR ===

/**
 * Composant VR Environment - Environnement Paris interactif
 */
function VREnvironment() {
  // Récupérer le paramètre destination depuis l'URL
  const searchParams = new URLSearchParams(window.location.search);
  const destination = searchParams.get('destination');
  const showDiagnostics = searchParams.get('debug') === 'true';

  // Tous les hooks DOIVENT être appelés avant tout return conditionnel
  const [prepResults, setPrepResults] = useState(null);
  const [textureReady, setTextureReady] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Callback pour recevoir les résultats de préparation
  const handlePrepResults = useCallback((results) => {
    console.log('📊 Résultats de préparation:', results);
    setPrepResults(results);

    if (results.success) {
      setTextureReady(true);
    }
  }, []);

  // Handlers pour le cube interactif
  const handleCubeClick = useCallback(() => {
    setClicked(prev => !prev);
  }, []);

  const handleCubePointerOver = useCallback(() => {
    document.body.style.cursor = 'pointer';
  }, []);

  const handleCubePointerOut = useCallback(() => {
    document.body.style.cursor = 'default';
  }, []);

  // Charger la texture avec le service
  const { loadingState, isLoading, texture, error, progress } = useTextureLoading({
    url: prepResults?.finalUrl || '/panoramas/paris/eiffel-tower.jpg',
    shouldLoad: textureReady
  });

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (texture) {
        console.log('🧹 Nettoyage de la texture...');
        const loader = getTextureLoader();
        loader.dispose(texture);
      }

      // Nettoyer le cache si nécessaire
      if (prepResults?.needsCleanup && prepResults?.finalUrl) {
        const cache = getAssetCache();
        cache.delete(prepResults.finalUrl);
      }
    };
  }, [texture, prepResults]);

  // APRÈS tous les hooks, on peut faire des returns conditionnels
  // Charger n'importe quel environnement VR enregistré (Paris, Barcelona, etc.)
  if (destination) {
    const env = getVREnvironment(destination);
    if (env) {
      return <VRDestinationEnvironment environment={env} />;
    }
  }

  return (
    <>
      {/* Diagnostics (uniquement si ?debug=true) */}
      {showDiagnostics && (
        <>
          <WebGLDiagnostic />
          <MemoryMonitor />
        </>
      )}

      {/* Préparation de l'image */}
      <ImagePreparation
        url="/panoramas/paris/eiffel-tower.jpg"
        onResults={handlePrepResults}
      />

      {/* Statut du chargement (masqué en production) */}
      {showDiagnostics && (
        <TextureLoadingStatus
          isLoading={isLoading}
          loadingState={loadingState}
          hasTexture={!!texture}
          progress={progress}
          error={error}
        />
      )}

      {/* Sphère panoramique avec texture */}
      {texture && (
        <mesh scale={[-1, 1, 1]}>
          <sphereGeometry args={[500, 60, 40]} />
          <meshBasicMaterial
            map={texture}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Sphère de fallback */}
      {!texture && (
        <mesh scale={[-1, 1, 1]}>
          <sphereGeometry args={[500, 32, 16]} />
          <meshBasicMaterial
            color="#1a1a2e"
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Éclairage */}
      <ambientLight intensity={texture ? 0.6 : 0.8} />

      {/* Cube de test interactif */}
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

      {/* Instructions */}
      <Text
        position={[-3, 1, -2]}
        fontSize={0.15}
        color="#F97316"
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="white"
      >
        {`🎯 DreamScape VR - Architecture Refactorisée
📦 Services modulaires (DR-250)
⚡ WebGLDetector (DR-410)
🎨 ImageResizer (DR-411)
📥 TextureLoader (DR-251)
✨ TextureOptimizer (DR-252)
💾 AssetCache (DR-253)`}
      </Text>

      {/* Support VR */}
      <Controllers />
      <Hands />
    </>
  );
}

// === COMPOSANT PRINCIPAL ===

function App() {
  // Vérifier le mode debug depuis l'URL
  const searchParams = new URLSearchParams(window.location.search);
  const isDebugMode = searchParams.get('debug') === 'true';
  const destination = searchParams.get('destination');
  const showControls = isDebugMode || !destination; // Masquer les contrôles en mode destination (sauf debug)

  const [diagnosticVisible, setDiagnosticVisible] = useState(isDebugMode);
  const initialMode = searchParams.get('mode') || 'auto'; // ?mode=gallery|3d|auto
  const [viewMode, setViewMode] = useState(initialMode);

  // DR-498 / DR-501 / DR-502: Deep Linking for QR Code Access
  const deepLinkState = useVRDeepLink();

  // DR-575: WebXR detection for fallback
  const { isXRSupported, isChecking, xrReason } = useWebXRDetection();

  // DR-574: PIN entry state - show PIN screen when no destination and no deep link
  const showPinEntry = !destination && !deepLinkState.isDeepLink;

  // DR-574: Handle successful PIN validation
  const handlePinSuccess = useCallback(({ destination: dest, autoVR }) => {
    const params = new URLSearchParams({ destination: dest });
    if (autoVR) params.set('autoVR', 'true');
    window.location.search = params.toString();
  }, []);

  // DR-575: View mode navigation callbacks
  const handleSwitchToGallery = useCallback(() => setViewMode('gallery'), []);
  const handleSwitchTo3D = useCallback(() => setViewMode('3d'), []);
  const handleSwitchToVR = useCallback(() => setViewMode('auto'), []);

  const toggleDiagnostic = useCallback(() => {
    setDiagnosticVisible(prev => !prev);
  }, []);

  // Afficher les stats du cache au chargement
  useEffect(() => {
    const cache = getAssetCache();
    cache.logStats();

    // Nettoyage périodique des entrées anciennes (toutes les 5 minutes)
    const pruneInterval = setInterval(() => {
      cache.pruneOld(30); // Nettoyer les entrées > 30 minutes
    }, 5 * 60 * 1000);

    return () => clearInterval(pruneInterval);
  }, []);

  // DR-574: Show PIN entry screen for VR headsets (no destination in URL)
  if (showPinEntry) {
    return <VRPinEntry onSuccess={handlePinSuccess} />;
  }

  // DR-575: Gallery mode
  if (viewMode === 'gallery') {
    return <PanoramaGallery onSwitchToVR={handleSwitchToVR} onSwitchTo3D={handleSwitchTo3D} destination={destination} />;
  }

  // DR-575: VR unavailable — auto-switch to 3D panorama when destination is loaded (PC browser or no headset)
  // Skip fallback when autoVR=true (deep link from VR headset) — always show VR UI with Enter VR button
  const urlParams = new URLSearchParams(window.location.search);
  const forceVR = urlParams.get('autoVR') === 'true';
  if (viewMode === 'auto' && !isXRSupported && !isChecking && !forceVR) {
    if (destination) {
      setTimeout(() => setViewMode('3d'), 0);
      return null;
    }
    return <VRUnavailableScreen xrReason={xrReason} onSwitchToGallery={handleSwitchToGallery} onSwitchTo3D={handleSwitchTo3D} />;
  }

  return (
    <div className="App">
      {/* DR-498 / DR-501: Deep Link Handler */}
      <DeepLinkHandler deepLinkState={deepLinkState} refreshToken={deepLinkState.refreshToken} />

      {showControls && (
        <div className="controls">
        <h1>🎯 DreamScape VR - Architecture Modulaire</h1>
        <p>Version refactorisée avec services (DR-250, DR-251, DR-252, DR-253, DR-410, DR-411)</p>

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
          ⚠️ Placez votre image panoramique 360° nommée 'panorama-test.jpg' dans /public
        </p>

        {(isXRSupported || forceVR) && (
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
        )}

        {(isXRSupported || forceVR) && (
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
        )}

        <button
          onClick={handleSwitchToGallery}
          style={{
            background: 'linear-gradient(45deg, #8B5CF6, #6366F1)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            margin: '10px',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
          }}
        >
          🖼️ Mode Galerie 2D
        </button>
      </div>
      )}

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
                Chargement...
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

      {showControls && (
        <div className="instructions">
          <h3>🎯 Architecture Modulaire Refactorisée</h3>
          <div style={{ textAlign: 'left', margin: '20px' }}>
            <h4>Services implémentés :</h4>
            <p><strong>WebGLDetector (DR-410):</strong> Détection automatique des limites WebGL du GPU</p>
            <p><strong>ImageResizer (DR-411):</strong> Redimensionnement progressif haute qualité</p>
            <p><strong>TextureLoader (DR-251):</strong> Chargement progressif avec retry</p>
            <p><strong>TextureOptimizer (DR-252):</strong> Optimisation pour la VR</p>
            <p><strong>AssetCache (DR-253):</strong> Cache intelligent avec LRU</p>

            <h4>Avantages :</h4>
            <p>✅ Code modulaire et testable</p>
            <p>✅ Séparation des responsabilités</p>
            <p>✅ Réutilisable pour d'autres environnements VR</p>
            <p>✅ Gestion automatique de la mémoire</p>
            <p>✅ Performance optimisée</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
