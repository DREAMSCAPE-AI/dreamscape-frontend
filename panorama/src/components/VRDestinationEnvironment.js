/**
 * VRDestinationEnvironment - Generic VR environment component
 *
 * Ticket: DR-79 (VR-004 - Environnement VR Barcelona)
 *
 * Composant générique qui gère n'importe quel environnement VR
 * (Paris, Barcelona, ou toute future destination) à partir d'un objet environment.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Text } from '@react-three/drei';
import VRScene from './VRScene';
import useHotspotPanel from '../hooks/useHotspotPanel';
import { NavigationUI, HotspotInfoPanel, TransitionOverlay } from './ParisEnvironment';

/**
 * Composant VRDestinationEnvironment
 * Gère la navigation entre les différentes scènes d'un environnement VR
 *
 * @param {Object} props
 * @param {Object} props.environment - Configuration de l'environnement (scenes, defaultScene, name, etc.)
 */
function VRDestinationEnvironment({ environment, controlledSceneId, onSceneChange }) {
  // Si controlledSceneId fourni, utilise-le; sinon state local initialisé sur defaultScene
  const [localSceneId, setLocalSceneId] = useState(environment.defaultScene);
  const currentSceneId = controlledSceneId || localSceneId;
  const [currentScene, setCurrentScene] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sceneHistory, setSceneHistory] = useState([]);
  const [hotspotInfo, setHotspotInfo] = useState(null);

  // Reset sur la scène par défaut quand l'environnement change
  useEffect(() => {
    setLocalSceneId(environment.defaultScene);
    setSceneHistory([]);
  }, [environment]);

  // Charger la scène actuelle depuis les données
  useEffect(() => {
    const scene = environment.scenes.find(s => s.id === currentSceneId);

    if (!scene) {
      console.error(`❌ Scène introuvable: ${currentSceneId}`);
      return;
    }

    console.log(`📍 [${environment.name}] Changement de scène: ${scene.name}`);
    setCurrentScene(scene);
    setLoading(false);

  }, [currentSceneId, environment]);

  // Changer de scène (navigation) — propage vers le parent si contrôlé
  const applySceneChange = useCallback((targetSceneId) => {
    if (onSceneChange) {
      onSceneChange(targetSceneId);
    } else {
      setLocalSceneId(targetSceneId);
    }
  }, [onSceneChange]);

  const handleSceneChange = useCallback((targetSceneId) => {
    console.log(`🚀 [${environment.name}] Navigation: ${currentSceneId} → ${targetSceneId}`);

    // Ajouter la scène actuelle à l'historique
    setSceneHistory(prev => [...prev, currentSceneId]);

    // Effet de transition (fade)
    setLoading(true);

    // Changer de scène après un court délai pour la transition
    setTimeout(() => {
      applySceneChange(targetSceneId);
      setHotspotInfo(null); // Réinitialiser l'info hotspot
    }, 500);

  }, [currentSceneId, environment.name, applySceneChange]);

  // Revenir à la scène précédente
  const handleGoBack = useCallback(() => {
    if (sceneHistory.length === 0) {
      console.log('📍 Déjà à la première scène');
      return;
    }

    const previousSceneId = sceneHistory[sceneHistory.length - 1];
    console.log(`⬅️ Retour à: ${previousSceneId}`);

    setSceneHistory(prev => prev.slice(0, -1));
    applySceneChange(previousSceneId);

  }, [sceneHistory, applySceneChange]);

  // Interaction avec un hotspot
  const handleHotspotClick = useCallback((hotspot) => {
    console.log(`📌 Interaction hotspot: ${hotspot.title} (${hotspot.type})`);

    if (hotspot.type === 'info') {
      setHotspotInfo(hotspot);

      // Masquer l'info après 10 secondes
      setTimeout(() => {
        setHotspotInfo(null);
      }, 10000);
    } else if (hotspot.type === 'teleport') {
      // Téléportation vers une autre scène
      console.log(`🚀 Téléportation vers: ${hotspot.targetScene}`);
      handleSceneChange(hotspot.targetScene);
    }

  }, [handleSceneChange]);

  // Utiliser le hook pour gérer le panneau de hotspots
  useHotspotPanel(currentScene?.hotspots, handleHotspotClick);

  if (!currentScene) {
    return (
      <Text
        position={[0, 1.6, -3]}
        fontSize={0.3}
        color="#FF0000"
        anchorX="center"
        anchorY="middle"
      >
        ❌ Erreur: Scène introuvable
      </Text>
    );
  }

  return (
    <>
      {/* Scène VR actuelle */}
      <VRScene
        scene={currentScene}
        onSceneChange={handleSceneChange}
        onHotspotClick={handleHotspotClick}
      />

      {/* UI de navigation */}
      <NavigationUI
        currentScene={currentScene}
        canGoBack={sceneHistory.length > 0}
        onGoBack={handleGoBack}
        environment={environment}
      />

      {/* Affichage des informations hotspot */}
      {hotspotInfo && (
        <HotspotInfoPanel
          hotspot={hotspotInfo}
          onClose={() => setHotspotInfo(null)}
        />
      )}

      {/* Indicateur de chargement pendant transition */}
      {loading && (
        <TransitionOverlay />
      )}
    </>
  );
}

export default VRDestinationEnvironment;
