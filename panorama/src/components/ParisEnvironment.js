/**
 * ParisEnvironment Component - Environnement VR complet de Paris
 *
 * Ticket: DR-74 (VR-003 - Environnement VR Paris)
 *
 * Wrapper rétro-compatible autour de VRDestinationEnvironment
 * pour l'environnement Paris.
 */

import React from 'react';
import { Text } from '@react-three/drei';
import parisEnvironment from '../data/paris-environment';
import VRDestinationEnvironment from './VRDestinationEnvironment';

/**
 * Composant ParisEnvironment
 * Wrapper rétro-compatible qui délègue à VRDestinationEnvironment
 */
function ParisEnvironment() {
  return <VRDestinationEnvironment environment={parisEnvironment} />;
}

/**
 * UI de navigation en VR - Tous les éléments en bas à gauche
 */
function NavigationUI({ currentScene, canGoBack, onGoBack, environment }) {
  return (
    <group position={[-4.5, -2.8, -5]}>
      {/* Badge de l'environnement */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.1}
        color="#10B981"
        anchorX="left"
        anchorY="bottom"
      >
        {`🗼 ${environment.name} VR`}
      </Text>

      {/* Titre de la scène actuelle */}
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.18}
        color="#FFFFFF"
        anchorX="left"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {`📍 ${currentScene.name}`}
      </Text>

      {/* Description de la scène */}
      <Text
        position={[0, 0.55, 0]}
        fontSize={0.1}
        color="#CCCCCC"
        anchorX="left"
        anchorY="bottom"
        maxWidth={3.5}
        textAlign="left"
      >
        {currentScene.description}
      </Text>

      {/* Bouton retour (si possible) */}
      {canGoBack && (
        <group position={[0, 0.95, 0]}>
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
    </group>
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
        fontWeight="bold"
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
