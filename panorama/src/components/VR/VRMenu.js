/**
 * VRMenu Component - 3D menu visible in immersive VR session
 *
 * Ticket: DR-574 (VR Access)
 *
 * Affiche un panneau 3D sur la droite du champ de vision contenant :
 * - Liste des destinations disponibles (changement sans sortir de la VR)
 * - Liste des scènes de la destination courante
 * - Bouton "Quitter la VR" qui termine la session WebXR
 *
 * Utilise @react-three/xr Interactive pour les events controller/gaze.
 */

import React, { useState, useCallback } from 'react';
import { Text } from '@react-three/drei';
import { Interactive, useXR } from '@react-three/xr';
import { listVREnvironments, VR_ENVIRONMENTS } from '../../data/environments';

/**
 * Bouton 3D interactif cliquable via controller ray ou gaze
 */
function MenuButton({
  position,
  label,
  onClick,
  color = '#f97316',
  hoverColor = '#ec4899',
  textColor = '#ffffff',
  width = 1.4,
  height = 0.28,
  fontSize = 0.1
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Interactive
      onSelect={onClick}
      onHover={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <group position={position}>
        {/* Background plane */}
        <mesh onClick={onClick}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            color={hovered ? hoverColor : color}
            transparent
            opacity={0.92}
          />
        </mesh>
        {/* Border glow when hovered */}
        {hovered && (
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[width + 0.04, height + 0.04]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
          </mesh>
        )}
        {/* Label */}
        <Text
          position={[0, 0, 0.01]}
          fontSize={fontSize}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          maxWidth={width - 0.1}
          textAlign="center"
        >
          {label}
        </Text>
      </group>
    </Interactive>
  );
}

/**
 * VR Menu principal — panneau flottant à droite du joueur
 *
 * @param {Object} props
 * @param {string} props.currentDestination - ID de la destination actuelle
 * @param {Function} props.onDestinationChange - Callback pour changer de destination
 * @param {string} [props.currentSceneId] - ID de la scène actuelle (optionnel)
 * @param {Function} [props.onSceneChange] - Callback pour changer de scène
 */
export default function VRMenu({
  currentDestination,
  onDestinationChange,
  currentSceneId,
  onSceneChange
}) {
  const { isPresenting, session } = useXR();
  const environments = listVREnvironments();

  const handleExit = useCallback(() => {
    if (session) {
      try {
        session.end();
      } catch (e) {
        console.warn('⚠️ Erreur fin de session VR:', e);
      }
    }
  }, [session]);

  const handleDestination = useCallback((envId) => {
    if (envId !== currentDestination && onDestinationChange) {
      console.log(`🌍 [VR Menu] Changement destination: ${currentDestination} → ${envId}`);
      onDestinationChange(envId);
    }
  }, [currentDestination, onDestinationChange]);

  const handleScene = useCallback((sceneId) => {
    if (sceneId !== currentSceneId && onSceneChange) {
      console.log(`📍 [VR Menu] Changement scène: ${currentSceneId} → ${sceneId}`);
      onSceneChange(sceneId);
    }
  }, [currentSceneId, onSceneChange]);

  // Ne pas afficher le menu en dehors de la session VR
  if (!isPresenting) return null;

  // Résolution de la destination courante (alias → id canonique)
  const resolvedDest = currentDestination
    ? (VR_ENVIRONMENTS[currentDestination.toLowerCase()]
        ? currentDestination.toLowerCase()
        : null)
    : null;
  const currentEnv = resolvedDest ? VR_ENVIRONMENTS[resolvedDest] : null;
  const scenes = currentEnv?.scenes || [];

  return (
    <group position={[1.3, 1.5, -1.4]} rotation={[0, -Math.PI / 6, 0]}>
      {/* Panneau de fond principal */}
      <mesh position={[0, 0.1, -0.02]}>
        <planeGeometry args={[1.7, 2.6]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.9} />
      </mesh>
      {/* Bordure orange subtile */}
      <mesh position={[0, 0.1, -0.025]}>
        <planeGeometry args={[1.74, 2.64]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.5} />
      </mesh>

      {/* === Header === */}
      <Text
        position={[0, 1.28, 0]}
        fontSize={0.11}
        color="#f97316"
        anchorX="center"
        anchorY="middle"
      >
        🌍 DREAMSCAPE VR
      </Text>
      <mesh position={[0, 1.16, 0]}>
        <planeGeometry args={[1.5, 0.004]} />
        <meshBasicMaterial color="#f97316" />
      </mesh>

      {/* === Section Destinations === */}
      <Text
        position={[0, 1.05, 0]}
        fontSize={0.08}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        DESTINATIONS
      </Text>

      {environments.map((env, idx) => {
        const isActive = env.id === resolvedDest;
        return (
          <MenuButton
            key={env.id}
            position={[0, 0.85 - idx * 0.32, 0]}
            label={(isActive ? '● ' : '') + env.name}
            onClick={() => handleDestination(env.id)}
            color={isActive ? '#ec4899' : '#334155'}
            hoverColor={isActive ? '#f472b6' : '#475569'}
            width={1.45}
            height={0.26}
            fontSize={0.095}
          />
        );
      })}

      {/* === Section Scènes (si applicable) === */}
      {scenes.length > 0 && (
        <>
          <mesh position={[0, 0.85 - environments.length * 0.32 - 0.05, 0]}>
            <planeGeometry args={[1.4, 0.003]} />
            <meshBasicMaterial color="#475569" />
          </mesh>
          <Text
            position={[0, 0.85 - environments.length * 0.32 - 0.15, 0]}
            fontSize={0.075}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
          >
            SCÈNES
          </Text>
          {scenes.slice(0, 3).map((scene, idx) => {
            const isActive = scene.id === currentSceneId;
            const yOffset = 0.85 - environments.length * 0.32 - 0.35 - idx * 0.27;
            return (
              <MenuButton
                key={scene.id}
                position={[0, yOffset, 0]}
                label={(scene.icon || '📍') + ' ' + scene.name}
                onClick={() => handleScene(scene.id)}
                color={isActive ? '#0891b2' : '#1e293b'}
                hoverColor={isActive ? '#06b6d4' : '#334155'}
                width={1.45}
                height={0.22}
                fontSize={0.07}
              />
            );
          })}
        </>
      )}

      {/* === Bouton Quitter VR (toujours en bas) === */}
      <mesh position={[0, -1.0, 0]}>
        <planeGeometry args={[1.5, 0.003]} />
        <meshBasicMaterial color="#dc2626" transparent opacity={0.6} />
      </mesh>
      <MenuButton
        position={[0, -1.17, 0]}
        label="✕ Quitter la VR"
        onClick={handleExit}
        color="#dc2626"
        hoverColor="#ef4444"
        width={1.5}
        height={0.3}
        fontSize={0.1}
      />
    </group>
  );
}
