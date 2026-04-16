/**
 * VRMenu Component - 3D menu visible in immersive VR session
 *
 * Ticket: DR-574 (VR Access)
 *
 * Panneau compact sur la droite du champ de vision avec :
 * - Liste des destinations (charte DreamScape orange→rose sur actif)
 * - Toutes les scènes de la destination courante
 * - Bouton "Quitter la VR"
 * - Toggle pour masquer le panneau entièrement
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { Interactive, useXR } from '@react-three/xr';
import * as THREE from 'three';
import { listVREnvironments, VR_ENVIRONMENTS } from '../../data/environments';

// === Charte graphique DreamScape ===
const BRAND = {
  orange: '#f97316',
  pink: '#ec4899',
  dark: '#0f172a',
  darkMuted: '#1e293b',
  gray: '#334155',
  grayLight: '#64748b',
  textLight: '#f8fafc',
  textMuted: '#94a3b8',
  danger: '#dc2626',
  dangerHover: '#ef4444',
  success: '#10b981'
};

/**
 * Crée une texture canvas avec gradient orange→rose DreamScape
 */
function useBrandGradientTexture(width = 512, height = 128) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, BRAND.orange);
    gradient.addColorStop(1, BRAND.pink);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [width, height]);
}

/**
 * Bouton 3D compact interactif
 * @param {boolean} active - rendu avec gradient orange→rose si true
 */
function MenuButton({
  position,
  label,
  onClick,
  active = false,
  variant = 'default', // 'default' | 'danger' | 'gradient'
  width = 1.0,
  height = 0.18,
  fontSize = 0.065,
  gradientTexture = null
}) {
  const [hovered, setHovered] = useState(false);

  // Couleurs selon variante et état
  let baseColor = BRAND.darkMuted;
  let hoverColor = BRAND.gray;
  let textColor = BRAND.textLight;
  let useGradient = false;

  if (variant === 'danger') {
    baseColor = BRAND.danger;
    hoverColor = BRAND.dangerHover;
  } else if (active || variant === 'gradient') {
    useGradient = true;
  }

  return (
    <Interactive
      onSelect={onClick}
      onHover={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <group position={position}>
        {/* Glow au hover */}
        {hovered && (
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[width + 0.03, height + 0.03]} />
            <meshBasicMaterial color={BRAND.orange} transparent opacity={0.5} />
          </mesh>
        )}
        {/* Background */}
        <mesh onClick={onClick}>
          <planeGeometry args={[width, height]} />
          {useGradient && gradientTexture ? (
            <meshBasicMaterial
              map={gradientTexture}
              transparent
              opacity={hovered ? 1 : 0.95}
            />
          ) : (
            <meshBasicMaterial
              color={hovered ? hoverColor : baseColor}
              transparent
              opacity={0.9}
            />
          )}
        </mesh>
        {/* Label */}
        <Text
          position={[0, 0, 0.01]}
          fontSize={fontSize}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          maxWidth={width - 0.08}
          textAlign="center"
        >
          {label}
        </Text>
      </group>
    </Interactive>
  );
}

/**
 * Petit toggle flottant pour afficher/masquer le menu
 */
function ToggleButton({ visible, onClick, position }) {
  const [hovered, setHovered] = useState(false);
  const size = 0.12;

  return (
    <Interactive
      onSelect={onClick}
      onHover={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <group position={position}>
        {/* Glow au hover */}
        {hovered && (
          <mesh position={[0, 0, -0.001]}>
            <circleGeometry args={[size * 0.9, 32]} />
            <meshBasicMaterial color={BRAND.orange} transparent opacity={0.5} />
          </mesh>
        )}
        <mesh onClick={onClick}>
          <circleGeometry args={[size * 0.75, 32]} />
          <meshBasicMaterial
            color={hovered ? BRAND.pink : BRAND.orange}
            transparent
            opacity={0.95}
          />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.1}
          color={BRAND.textLight}
          anchorX="center"
          anchorY="middle"
        >
          {visible ? '✕' : '☰'}
        </Text>
      </group>
    </Interactive>
  );
}

/**
 * VR Menu principal
 */
export default function VRMenu({
  currentDestination,
  onDestinationChange,
  currentSceneId,
  onSceneChange
}) {
  const { isPresenting, session } = useXR();
  const [visible, setVisible] = useState(true);
  const environments = listVREnvironments();
  const gradientTexture = useBrandGradientTexture();

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
      onDestinationChange(envId);
    }
  }, [currentDestination, onDestinationChange]);

  const handleScene = useCallback((sceneId) => {
    if (sceneId !== currentSceneId && onSceneChange) {
      onSceneChange(sceneId);
    }
  }, [currentSceneId, onSceneChange]);

  const toggleVisible = useCallback(() => setVisible((v) => !v), []);

  if (!isPresenting) return null;

  // Résolution destination (alias → canonical id)
  const resolvedDest = currentDestination
    ? (VR_ENVIRONMENTS[currentDestination.toLowerCase()]
        ? currentDestination.toLowerCase()
        : null)
    : null;
  const currentEnv = resolvedDest ? VR_ENVIRONMENTS[resolvedDest] : null;
  const scenes = currentEnv?.scenes || [];

  // Calcul dynamique hauteur panel (selon nb items)
  const BUTTON_H = 0.22; // hauteur bouton + spacing
  const destCount = environments.length;
  const sceneCount = scenes.length;
  const panelHeight =
    0.22 /* header */ +
    0.12 /* dest subtitle */ +
    destCount * BUTTON_H +
    0.18 /* spacer */ +
    (sceneCount > 0 ? 0.12 /* scene subtitle */ + sceneCount * BUTTON_H : 0) +
    0.18 /* spacer */ +
    0.26 /* exit button + margin */;

  const PANEL_W = 1.05;
  const panelY = 0; // center of panel

  // Position du menu — plus périphérique qu'avant (plus à droite, plus loin, plus incliné)
  const menuPosition = [1.55, 1.4, -1.7];
  const menuRotation = [0, -Math.PI / 4, 0]; // 45° vers la caméra

  return (
    <group position={menuPosition} rotation={menuRotation}>
      {/* Toggle button (toujours visible — petit à gauche du menu) */}
      <ToggleButton
        visible={visible}
        onClick={toggleVisible}
        position={[-PANEL_W / 2 - 0.15, panelHeight / 2 - 0.1, 0]}
      />

      {/* Panneau principal — affiché uniquement si visible */}
      {visible && (
        <>
          {/* Background glassmorphism sombre */}
          <mesh position={[0, panelY, -0.02]}>
            <planeGeometry args={[PANEL_W, panelHeight]} />
            <meshBasicMaterial color={BRAND.dark} transparent opacity={0.88} />
          </mesh>

          {/* Bordure gradient orange→rose (fine, en haut du panel comme une navbar) */}
          <mesh position={[0, panelHeight / 2 - 0.02, -0.015]}>
            <planeGeometry args={[PANEL_W, 0.04]} />
            <meshBasicMaterial map={gradientTexture} transparent opacity={0.95} />
          </mesh>

          {/* Header — "🌍 DreamScape VR" */}
          <Text
            position={[0, panelHeight / 2 - 0.12, 0]}
            fontSize={0.078}
            color={BRAND.textLight}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            🌍 DreamScape
          </Text>
          <Text
            position={[0, panelHeight / 2 - 0.2, 0]}
            fontSize={0.05}
            color={BRAND.orange}
            anchorX="center"
            anchorY="middle"
          >
            VR
          </Text>

          {/* === Section Destinations === */}
          {(() => {
            let cursorY = panelHeight / 2 - 0.32; // début sous le header

            return (
              <>
                <Text
                  position={[0, cursorY, 0]}
                  fontSize={0.042}
                  color={BRAND.textMuted}
                  anchorX="center"
                  anchorY="middle"
                  letterSpacing={0.1}
                >
                  DESTINATIONS
                </Text>
                {environments.map((env, idx) => {
                  const y = cursorY - 0.14 - idx * BUTTON_H;
                  const isActive = env.id === resolvedDest;
                  return (
                    <MenuButton
                      key={env.id}
                      position={[0, y, 0]}
                      label={env.name}
                      onClick={() => handleDestination(env.id)}
                      active={isActive}
                      gradientTexture={gradientTexture}
                      width={0.95}
                      height={0.17}
                      fontSize={0.062}
                    />
                  );
                })}
              </>
            );
          })()}

          {/* Séparateur */}
          {sceneCount > 0 && (
            <mesh
              position={[
                0,
                panelHeight / 2 - 0.32 - 0.14 - destCount * BUTTON_H - 0.05,
                0
              ]}
            >
              <planeGeometry args={[PANEL_W - 0.1, 0.003]} />
              <meshBasicMaterial color={BRAND.gray} transparent opacity={0.6} />
            </mesh>
          )}

          {/* === Section Scènes === */}
          {sceneCount > 0 && (() => {
            const subtitleY =
              panelHeight / 2 - 0.32 - 0.14 - destCount * BUTTON_H - 0.15;

            return (
              <>
                <Text
                  position={[0, subtitleY, 0]}
                  fontSize={0.042}
                  color={BRAND.textMuted}
                  anchorX="center"
                  anchorY="middle"
                  letterSpacing={0.1}
                >
                  SCÈNES ({sceneCount})
                </Text>
                {scenes.map((scene, idx) => {
                  const y = subtitleY - 0.14 - idx * BUTTON_H;
                  const isActive = scene.id === currentSceneId;
                  return (
                    <MenuButton
                      key={scene.id}
                      position={[0, y, 0]}
                      label={`${scene.icon || '📍'}  ${scene.name}`}
                      onClick={() => handleScene(scene.id)}
                      active={isActive}
                      gradientTexture={gradientTexture}
                      width={0.95}
                      height={0.17}
                      fontSize={0.058}
                    />
                  );
                })}
              </>
            );
          })()}

          {/* Bouton Quitter VR — en bas */}
          <MenuButton
            position={[0, -panelHeight / 2 + 0.17, 0]}
            label="✕  Quitter la VR"
            onClick={handleExit}
            variant="danger"
            width={0.95}
            height={0.2}
            fontSize={0.065}
          />
        </>
      )}
    </group>
  );
}
