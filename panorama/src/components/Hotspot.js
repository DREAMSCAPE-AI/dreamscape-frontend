/**
 * Hotspot Component - Point d'intérêt interactif dans l'environnement VR
 *
 * Ticket: DR-74 (VR-003 - Environnement VR Paris)
 *
 * Affiche des hotspots cliquables pour:
 * - Type 'info': Afficher des informations sur un monument
 * - Type 'teleport': Se téléporter vers un autre panorama
 */

import React, { useState, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Composant Hotspot
 * Point d'intérêt interactif en 3D
 */
function Hotspot({ hotspot, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Animation pulsante pour attirer l'attention
  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Pulse animation
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.15;
      meshRef.current.scale.set(scale, scale, scale);

      // Rotation lente
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.8;
    }
  });

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(hotspot);
    }
  }, [hotspot, onClick]);

  // Couleurs selon le type de hotspot
  const colors = {
    info: '#F59E0B',      // Orange pour info
    teleport: '#10B981',  // Vert pour téléportation
    default: '#3B82F6'    // Bleu par défaut
  };

  const hotspotColor = hovered
    ? '#F97316'
    : (colors[hotspot.type] || colors.default);

  // Taille selon le type
  const size = hotspot.type === 'teleport' ? 0.25 : 0.2;

  return (
    <group position={hotspot.position}>
      {/* Sphère principale du hotspot */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={hotspotColor}
          emissive={hotspotColor}
          emissiveIntensity={hovered ? 0.8 : 0.5}
          metalness={0.5}
          roughness={0.3}
          transparent
          opacity={hovered ? 0.95 : 0.85}
        />
      </mesh>

      {/* Halo lumineux autour du hotspot - Désactivé pour éviter les ombres sur le panorama */}
      {/*
      <mesh position={[0, 0, 0]}>
        <ringGeometry args={[size * 1.2, size * 1.5, 32]} />
        <meshBasicMaterial
          color={hotspotColor}
          transparent
          opacity={hovered ? 0.4 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      */}

      {/* Icône émoji au centre */}
      {hotspot.icon && (
        <Text
          position={[0, 0, size + 0.05]}
          fontSize={0.15}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {hotspot.icon}
        </Text>
      )}

      {/* Label au-dessus du hotspot (visible au survol ou pour téléport) */}
      {(hovered || hotspot.type === 'teleport') && (
        <Html
          position={[0, size + 0.4, 0]}
          center
          distanceFactor={10}
          style={{
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              border: `2px solid ${hotspotColor}`,
              backdropFilter: 'blur(8px)'
            }}
          >
            {hotspot.title}
            {hotspot.distance && (
              <div
                style={{
                  fontSize: '11px',
                  opacity: 0.8,
                  marginTop: '4px'
                }}
              >
                📍 {hotspot.distance}
              </div>
            )}
          </div>
        </Html>
      )}

      {/* Description complète (visible uniquement au survol pour type info) */}
      {hovered && hotspot.type === 'info' && hotspot.description && (
        <Html
          position={[0, -size - 0.5, 0]}
          center
          distanceFactor={10}
          style={{
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              maxWidth: '250px',
              lineHeight: '1.4',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              border: `2px solid ${hotspotColor}`,
              backdropFilter: 'blur(8px)'
            }}
          >
            {hotspot.description}
          </div>
        </Html>
      )}

      {/* Indicateur de téléportation (flèche vers le haut) */}
      {hotspot.type === 'teleport' && (
        <mesh position={[0, size + 0.6, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.08, 0.2, 4]} />
          <meshStandardMaterial
            color={hotspotColor}
            emissive={hotspotColor}
            emissiveIntensity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

export default Hotspot;
