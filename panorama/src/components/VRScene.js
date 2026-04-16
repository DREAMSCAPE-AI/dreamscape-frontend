/**
 * VRScene Component - Scène VR 360° réutilisable
 *
 * Ticket: DR-74 (VR-003 - Environnement VR Paris)
 *
 * Composant pour afficher une scène panoramique 360° avec hotspots interactifs
 * Utilise les services créés dans DR-250
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Html } from '@react-three/drei';
import ImageResizer from '../services/ImageResizer';
import Hotspot from './Hotspot';
import {
  getTextureLoader,
  getTextureOptimizer,
  getAssetCache
} from '../services';

// DR-574 fix pixellisation : augmenter la résolution de la sphère panoramique
// 60×40 → 128×64 réduit la distortion aux pôles et améliore le mapping UV
const PANORAMA_SPHERE_SEGMENTS_W = 128;
const PANORAMA_SPHERE_SEGMENTS_H = 64;

/**
 * Composant VRScene
 * @param {Object} scene - Données de la scène (panoramaUrl, hotspots, etc.)
 * @param {Function} onSceneChange - Callback pour changer de scène
 * @param {Function} onHotspotClick - Callback pour interaction hotspot
 */
function VRScene({ scene, onSceneChange, onHotspotClick }) {
  const [textureLoaded, setTextureLoaded] = useState(false);
  const [texture, setTexture] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { gl: renderer } = useThree(); // Renderer pour anisotropie max GPU

  // Charger le panorama de la scène
  useEffect(() => {
    if (!scene || !scene.panoramaUrl) {
      console.warn('❌ Scène invalide ou URL de panorama manquante');
      setError(new Error('Configuration de scène invalide'));
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadPanorama = async () => {
      console.log(`🌍 Chargement de la scène: ${scene.name}`);
      console.log(`📸 Panorama: ${scene.panoramaUrl}`);
      setLoading(true);
      setError(null);

      try {
        // Étape 1: Vérifier le cache
        const cache = getAssetCache();
        const cachedEntry = cache.get(scene.panoramaUrl);

        let finalUrl = scene.panoramaUrl;

        if (cachedEntry) {
          console.log('✅ Panorama trouvé dans le cache');
          finalUrl = cachedEntry.cachedUrl;
        } else {
          // Étape 2: Redimensionner l'image si nécessaire
          console.log('🔧 Optimisation de l\'image...');
          const resizer = new ImageResizer();
          const result = await resizer.processImage(scene.panoramaUrl);

          if (result.success) {
            finalUrl = result.optimizedUrl || scene.panoramaUrl;

            // Mettre en cache si redimensionné
            if (result.resized) {
              cache.set(scene.panoramaUrl, finalUrl, {
                width: result.finalDimensions.width,
                height: result.finalDimensions.height
              });
              console.log(`💾 Image mise en cache (${result.memorySavingsMB?.toFixed(1)}MB économisés)`);
            }
          } else {
            console.warn('⚠️ Optimisation échouée, utilisation de l\'image originale');
          }
        }

        // Étape 3: Charger la texture avec le service TextureLoader
        const loader = getTextureLoader();
        const loadedTexture = await loader.load(finalUrl);

        // Étape 4: Optimiser la texture pour la VR
        // DR-574 : passer le renderer pour activer anisotropie max (16x sur Quest 3)
        const optimizer = getTextureOptimizer();
        optimizer.optimizeForVR(loadedTexture, renderer);

        if (mounted) {
          setTexture(loadedTexture);
          setTextureLoaded(true);
          setLoading(false);
          console.log(`✅ Scène ${scene.name} chargée avec succès`);
        }

      } catch (err) {
        console.error(`❌ Erreur lors du chargement de la scène ${scene.name}:`, err);
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    loadPanorama();

    return () => {
      mounted = false;
      // Nettoyer la texture lors du démontage
      if (texture) {
        const loader = getTextureLoader();
        loader.dispose(texture);
      }
    };
  }, [scene]);

  // Rendu de la sphère panoramique
  if (loading) {
    return null; // Le composant parent affichera un indicateur de chargement
  }

  if (error) {
    console.error('Erreur de scène:', error);
    return null;
  }

  if (!textureLoaded || !texture) {
    return null;
  }

  return (
    <>
      {/* Sphère panoramique 360° */}
      {/* DR-574 fix pixellisation : 128×64 segments (vs 60×40) pour mapping plus fin */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[500, PANORAMA_SPHERE_SEGMENTS_W, PANORAMA_SPHERE_SEGMENTS_H]} />
        <meshBasicMaterial
          map={texture}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Éclairage ambiant adapté */}
      <ambientLight intensity={scene.settings?.ambientLightIntensity || 0.7} />
    </>
  );
}

export default VRScene;
