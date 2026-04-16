/**
 * VRMenu Component - 3D menu visible in immersive VR session
 *
 * Ticket: DR-574 (VR Access)
 *
 * UX:
 * - Toggle button (☰/✕) suit la tête de l'utilisateur en périphérie droite
 *   (smoothly lerped pour pas être "collé") → toujours retrouvable.
 * - Panel principal world-locked à l'ouverture (placé devant l'user au moment du clic)
 *   → l'utilisateur peut tourner 360° librement sans que le panel le suive ni bloque la vue.
 * - Cliquer le toggle re-positionne le panel devant la vue actuelle si déjà ouvert.
 * - Charte DreamScape (orange→rose gradient sur actifs).
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Text } from '@react-three/drei';
import { Interactive, useXR } from '@react-three/xr';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { listVREnvironments, VR_ENVIRONMENTS } from '../../data/environments';

// === Charte graphique DreamScape ===
const BRAND = {
  orange: '#f97316',
  pink: '#ec4899',
  dark: '#0f172a',
  darkMuted: '#1e293b',
  gray: '#334155',
  textLight: '#f8fafc',
  textMuted: '#94a3b8',
  danger: '#dc2626',
  dangerHover: '#ef4444',
};

/**
 * Texture canvas avec gradient orange→rose DreamScape
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
 * Calcule une position dans l'espace relative à la caméra (horizontal-projected).
 * Évite que le menu monte/descende quand l'user regarde vers le haut/bas.
 *
 * @param {THREE.Camera} camera
 * @param {number} forwardDist - distance devant la caméra
 * @param {number} rightOffset - offset à droite (négatif = gauche)
 * @param {number} upOffset - offset vertical (relatif à hauteur caméra)
 */
function computeHudPosition(camera, forwardDist, rightOffset, upOffset) {
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  fwd.y = 0;
  if (fwd.lengthSq() < 0.0001) {
    fwd.set(0, 0, -1); // fallback si caméra regarde verticalement
  } else {
    fwd.normalize();
  }
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  right.y = 0;
  if (right.lengthSq() < 0.0001) {
    right.set(1, 0, 0);
  } else {
    right.normalize();
  }
  const pos = new THREE.Vector3()
    .copy(camera.position)
    .addScaledVector(fwd, forwardDist)
    .addScaledVector(right, rightOffset);
  pos.y = camera.position.y + upOffset;
  return pos;
}

/**
 * Bouton 3D compact
 */
function MenuButton({
  position,
  label,
  onClick,
  active = false,
  variant = 'default',
  width = 0.95,
  height = 0.17,
  fontSize = 0.062,
  gradientTexture = null,
}) {
  const [hovered, setHovered] = useState(false);

  let baseColor = BRAND.darkMuted;
  let hoverColor = BRAND.gray;
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
        {hovered && (
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[width + 0.03, height + 0.03]} />
            <meshBasicMaterial color={BRAND.orange} transparent opacity={0.5} />
          </mesh>
        )}
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
        <Text
          position={[0, 0, 0.01]}
          fontSize={fontSize}
          color={BRAND.textLight}
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
 * Toggle button — petit, suit la tête en périphérie droite avec lerp doux
 */
function HudToggle({ visible, onClick }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!groupRef.current) return;
    // Position périphérique droite, légèrement bas
    targetPos.current.copy(
      computeHudPosition(camera, 0.85, 0.55, -0.12)
    );
    // Lerp doux pour pas être "collé"
    groupRef.current.position.lerp(targetPos.current, 0.12);
    // Toujours regarder la caméra
    groupRef.current.lookAt(camera.position);
  });

  return (
    <group ref={groupRef}>
      <Interactive
        onSelect={onClick}
        onHover={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <group>
          {hovered && (
            <mesh position={[0, 0, -0.001]}>
              <circleGeometry args={[0.075, 32]} />
              <meshBasicMaterial color={BRAND.orange} transparent opacity={0.5} />
            </mesh>
          )}
          <mesh onClick={onClick}>
            <circleGeometry args={[0.06, 32]} />
            <meshBasicMaterial
              color={hovered ? BRAND.pink : BRAND.orange}
              transparent
              opacity={0.95}
            />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.07}
            color={BRAND.textLight}
            anchorX="center"
            anchorY="middle"
          >
            {visible ? '✕' : '☰'}
          </Text>
        </group>
      </Interactive>
    </group>
  );
}

/**
 * VR Menu principal
 */
export default function VRMenu({
  currentDestination,
  onDestinationChange,
  currentSceneId,
  onSceneChange,
}) {
  const { isPresenting, session } = useXR();
  const { camera } = useThree();
  const [visible, setVisible] = useState(false); // caché par défaut
  const panelRef = useRef();
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

  const handleDestination = useCallback(
    (envId) => {
      if (envId !== currentDestination && onDestinationChange) {
        onDestinationChange(envId);
      }
    },
    [currentDestination, onDestinationChange]
  );

  const handleScene = useCallback(
    (sceneId) => {
      if (sceneId !== currentSceneId && onSceneChange) {
        onSceneChange(sceneId);
      }
    },
    [currentSceneId, onSceneChange]
  );

  // Toggle: si on ouvre, repositionne le panel devant la vue actuelle
  const toggleVisible = useCallback(() => {
    setVisible((prev) => {
      const next = !prev;
      if (next && panelRef.current) {
        // Place le panel devant l'user (un peu à droite pour pas masquer le centre)
        const target = computeHudPosition(camera, 1.6, 0.35, 0);
        panelRef.current.position.copy(target);
        panelRef.current.lookAt(camera.position);
      }
      return next;
    });
  }, [camera]);

  // À la première activation après isPresenting, on ne fait rien (panel caché)
  // L'user verra le toggle et pourra l'ouvrir.

  if (!isPresenting) return null;

  // Résolution destination
  const resolvedDest = currentDestination
    ? VR_ENVIRONMENTS[currentDestination.toLowerCase()]
      ? currentDestination.toLowerCase()
      : null
    : null;
  const currentEnv = resolvedDest ? VR_ENVIRONMENTS[resolvedDest] : null;
  const scenes = currentEnv?.scenes || [];

  // Layout
  const BUTTON_H = 0.22;
  const PANEL_W = 1.05;
  const destCount = environments.length;
  const sceneCount = scenes.length;
  const panelHeight =
    0.22 + 0.12 + destCount * BUTTON_H + 0.18 +
    (sceneCount > 0 ? 0.12 + sceneCount * BUTTON_H : 0) +
    0.18 + 0.26;

  return (
    <>
      {/* Toggle HUD (toujours visible, suit la tête doucement) */}
      <HudToggle visible={visible} onClick={toggleVisible} />

      {/* Panel principal world-locked (positionné à l'ouverture) */}
      <group ref={panelRef} visible={visible}>
        {/* Background sombre translucide */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[PANEL_W, panelHeight]} />
          <meshBasicMaterial color={BRAND.dark} transparent opacity={0.88} />
        </mesh>

        {/* Bandeau gradient en haut (navbar style) */}
        <mesh position={[0, panelHeight / 2 - 0.02, -0.015]}>
          <planeGeometry args={[PANEL_W, 0.04]} />
          <meshBasicMaterial map={gradientTexture} transparent opacity={0.95} />
        </mesh>

        {/* Header */}
        <Text
          position={[0, panelHeight / 2 - 0.12, 0]}
          fontSize={0.078}
          color={BRAND.textLight}
          anchorX="center"
          anchorY="middle"
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

        {/* Destinations */}
        {(() => {
          const subtitleY = panelHeight / 2 - 0.32;
          return (
            <>
              <Text
                position={[0, subtitleY, 0]}
                fontSize={0.042}
                color={BRAND.textMuted}
                anchorX="center"
                anchorY="middle"
              >
                DESTINATIONS
              </Text>
              {environments.map((env, idx) => {
                const y = subtitleY - 0.14 - idx * BUTTON_H;
                return (
                  <MenuButton
                    key={env.id}
                    position={[0, y, 0]}
                    label={env.name}
                    onClick={() => handleDestination(env.id)}
                    active={env.id === resolvedDest}
                    gradientTexture={gradientTexture}
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
              0,
            ]}
          >
            <planeGeometry args={[PANEL_W - 0.1, 0.003]} />
            <meshBasicMaterial color={BRAND.gray} transparent opacity={0.6} />
          </mesh>
        )}

        {/* Scènes */}
        {sceneCount > 0 &&
          (() => {
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
                >
                  SCÈNES ({sceneCount})
                </Text>
                {scenes.map((scene, idx) => {
                  const y = subtitleY - 0.14 - idx * BUTTON_H;
                  return (
                    <MenuButton
                      key={scene.id}
                      position={[0, y, 0]}
                      label={`${scene.icon || '📍'}  ${scene.name}`}
                      onClick={() => handleScene(scene.id)}
                      active={scene.id === currentSceneId}
                      gradientTexture={gradientTexture}
                      fontSize={0.058}
                    />
                  );
                })}
              </>
            );
          })()}

        {/* Quitter VR */}
        <MenuButton
          position={[0, -panelHeight / 2 + 0.17, 0]}
          label="✕  Quitter la VR"
          onClick={handleExit}
          variant="danger"
          height={0.2}
          fontSize={0.065}
        />
      </group>
    </>
  );
}
