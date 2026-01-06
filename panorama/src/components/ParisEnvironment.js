/**
 * ParisEnvironment Component - Environnement VR complet de Paris
 *
 * Ticket: DR-74 (VR-003 - Environnement VR Paris)
 *
 * Orchestration de toutes les scènes VR de Paris avec navigation
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Text } from '@react-three/drei';
import VRScene from './VRScene';
import parisEnvironment from '../data/paris-environment';

/**
 * Composant ParisEnvironment
 * Gère la navigation entre les différentes scènes de Paris
 */
function ParisEnvironment() {
  const [currentSceneId, setCurrentSceneId] = useState(parisEnvironment.defaultScene);
  const [currentScene, setCurrentScene] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sceneHistory, setSceneHistory] = useState([]);
  const [hotspotInfo, setHotspotInfo] = useState(null);

  // Charger la scène actuelle depuis les données
  useEffect(() => {
    const scene = parisEnvironment.scenes.find(s => s.id === currentSceneId);

    if (!scene) {
      console.error(`❌ Scène introuvable: ${currentSceneId}`);
      return;
    }

    console.log(`📍 Changement de scène: ${scene.name}`);
    setCurrentScene(scene);
    setLoading(false);

  }, [currentSceneId]);

  // Changer de scène (navigation)
  const handleSceneChange = useCallback((targetSceneId) => {
    console.log(`🚀 Navigation: ${currentSceneId} → ${targetSceneId}`);

    // Ajouter la scène actuelle à l'historique
    setSceneHistory(prev => [...prev, currentSceneId]);

    // Effet de transition (fade)
    setLoading(true);

    // Changer de scène après un court délai pour la transition
    setTimeout(() => {
      setCurrentSceneId(targetSceneId);
      setHotspotInfo(null); // Réinitialiser l'info hotspot
    }, 500);

  }, [currentSceneId]);

  // Revenir à la scène précédente
  const handleGoBack = useCallback(() => {
    if (sceneHistory.length === 0) {
      console.log('📍 Déjà à la première scène');
      return;
    }

    const previousSceneId = sceneHistory[sceneHistory.length - 1];
    console.log(`⬅️ Retour à: ${previousSceneId}`);

    setSceneHistory(prev => prev.slice(0, -1));
    setCurrentSceneId(previousSceneId);

  }, [sceneHistory]);

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
        environment={parisEnvironment}
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

/**
 * UI de navigation en VR
 */
function NavigationUI({ currentScene, canGoBack, onGoBack, environment }) {
  return (
    <>
      {/* Titre de la scène actuelle (en haut) */}
      <Text
        position={[0, 3.5, -5]}
        fontSize={0.25}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {`📍 ${currentScene.name}`}
      </Text>

      {/* Description de la scène */}
      <Text
        position={[0, 3, -5]}
        fontSize={0.12}
        color="#CCCCCC"
        anchorX="center"
        anchorY="middle"
        maxWidth={4}
        textAlign="center"
      >
        {currentScene.description}
      </Text>

      {/* Bouton retour (si possible) */}
      {canGoBack && (
        <group position={[-4, 1.6, -3]}>
          <mesh
            onClick={onGoBack}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
          >
            <boxGeometry args={[0.6, 0.3, 0.1]} />
            <meshStandardMaterial
              color="#3B82F6"
              emissive="#3B82F6"
              emissiveIntensity={0.3}
            />
          </mesh>
          <Text
            position={[0, 0, 0.06]}
            fontSize={0.12}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
          >
            ⬅️ Retour
          </Text>
        </group>
      )}

      {/* Badge de l'environnement (en bas à gauche) */}
      <Text
        position={[-4, -2.5, -5]}
        fontSize={0.1}
        color="#10B981"
        anchorX="left"
        anchorY="bottom"
      >
        {`🗼 ${environment.name} VR`}
      </Text>
    </>
  );
}

/**
 * Panneau d'information pour les hotspots info
 */
function HotspotInfoPanel({ hotspot, onClose }) {
  return (
    <group position={[0, 1.6, -2.5]}>
      {/* Panneau de fond */}
      <mesh>
        <planeGeometry args={[3, 1.8]} />
        <meshBasicMaterial
          color="#1a1a2e"
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Titre */}
      <Text
        position={[0, 0.6, 0.01]}
        fontSize={0.15}
        color="#F59E0B"
        anchorX="center"
        anchorY="middle"
        font Bold
      >
        {`${hotspot.icon || 'ℹ️'} ${hotspot.title}`}
      </Text>

      {/* Description */}
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.1}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.6}
        textAlign="center"
        lineHeight={1.2}
      >
        {hotspot.description}
      </Text>

      {/* Bouton fermer */}
      <group position={[1.3, 0.8, 0]}>
        <mesh
          onClick={onClose}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial
            color="#FF4444"
            transparent
            opacity={0.8}
          />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.12}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          ✕
        </Text>
      </group>

      {/* Indication audio si disponible */}
      {hotspot.audioUrl && (
        <Text
          position={[0, -0.7, 0.01]}
          fontSize={0.08}
          color="#10B981"
          anchorX="center"
          anchorY="middle"
        >
          🔊 Audio disponible
        </Text>
      )}
    </group>
  );
}

/**
 * Overlay de transition entre scènes
 */
function TransitionOverlay() {
  return (
    <mesh position={[0, 0, -1]}>
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial
        color="#000000"
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

export default ParisEnvironment;
export { NavigationUI, HotspotInfoPanel, TransitionOverlay };
