/**
 * VRScene Component - Scène VR 360° réutilisable
 *
 * Ticket: DR-74 (VR-003 - Environnement VR Paris)
 *
 * Composant pour afficher une scène panoramique 360° avec hotspots interactifs
 * Utilise les services créés dans DR-250
 */

import React, { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import ImageResizer from '../services/ImageResizer';
import {
  getTextureLoader,
  getTextureOptimizer,
  getAssetCache
} from '../services';

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
        const optimizer = getTextureOptimizer();
        optimizer.optimizeForVR(loadedTexture);

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
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial
          map={texture}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Éclairage ambiant adapté */}
      <ambientLight intensity={scene.settings?.ambientLightIntensity || 0.7} />

      {/* Rendu des hotspots - sera implémenté dans un composant séparé */}
      {scene.hotspots && scene.hotspots.map((hotspot) => (
        <Hotspot
          key={hotspot.id}
          hotspot={hotspot}
          onSceneChange={onSceneChange}
          onInteraction={onHotspotClick}
        />
      ))}
    </>
  );
}

/**
 * Composant Hotspot - Point d'intérêt interactif
 */
function Hotspot({ hotspot, onSceneChange, onInteraction }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleClick = useCallback(() => {
    setClicked(true);

    console.log(`🎯 Hotspot cliqué: ${hotspot.title}`);

    if (hotspot.type === 'teleport' && hotspot.targetScene && onSceneChange) {
      console.log(`🚀 Téléportation vers: ${hotspot.targetScene}`);
      onSceneChange(hotspot.targetScene);
    }

    if (onInteraction) {
      onInteraction(hotspot);
    }

    // Animation de clic
    setTimeout(() => setClicked(false), 300);
  }, [hotspot, onSceneChange, onInteraction]);

  const handlePointerOver = useCallback(() => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  }, []);

  // Couleur selon le type de hotspot
  const getColor = () => {
    if (clicked) return '#FFFFFF';
    if (hovered) return '#FFD700';

    switch (hotspot.type) {
      case 'teleport':
        return '#10B981'; // Vert
      case 'info':
        return '#F59E0B'; // Orange
      default:
        return '#3B82F6'; // Bleu
    }
  };

  // Icône selon le type
  const getIcon = () => {
    if (hotspot.icon) return hotspot.icon;

    switch (hotspot.type) {
      case 'teleport':
        return '🚪';
      case 'info':
        return 'ℹ️';
      default:
        return '📍';
    }
  };

  const position = hotspot.position || [0, 1.6, -3];
  const scale = clicked ? 1.3 : hovered ? 1.2 : 1;

  return (
    <group position={position}>
      {/* Sphère cliquable */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={scale}
      >
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          transparent
          opacity={hovered ? 0.9 : 0.7}
        />
      </mesh>

      {/* Texte du hotspot */}
      {hovered && (
        <group position={[0, 0.4, 0]}>
          <mesh>
            <planeGeometry args={[2, 0.5]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={0.7}
            />
          </mesh>
          <text
            position={[0, 0, 0.01]}
            fontSize={0.12}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
          >
            {`${getIcon()} ${hotspot.title}`}
            {hotspot.distance && `\n${hotspot.distance}`}
          </text>
        </group>
      )}

      {/* Effet de pulsation pour attirer l'attention */}
      {!hovered && (
        <mesh scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial
            color={getColor()}
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}

export default VRScene;
export { Hotspot };
