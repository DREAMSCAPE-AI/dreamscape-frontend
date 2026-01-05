/**
 * ActivityHotspot Component
 *
 * DR-205: VR-005.2 - Interactive hotspots for activities in VR
 * DR-206: VR-005.3 - Activity preview functionality
 * DR-207: VR-005.4 - Redirection to booking
 *
 * Displays an interactive 3D hotspot in VR environment for an activity recommendation
 */

import React, { useState, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Convert geographical coordinates to VR sphere position
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} radius - Sphere radius (default 480 to be inside the panorama sphere)
 * @returns {Array} [x, y, z] position
 */
const geoToVRPosition = (lat, lon, radius = 480) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
};

/**
 * ActivityHotspot Component
 * DR-205: Interactive 3D marker for activities
 */
function ActivityHotspot({
  activity,
  position,
  onSelect,
  onBook,
  isSelected = false
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Pulsating animation for hotspot
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);

      // Rotate the hotspot slowly
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
  });

  const handleClick = useCallback(() => {
    setShowPreview(!showPreview);
    if (onSelect) {
      onSelect(activity);
    }
  }, [showPreview, activity, onSelect]);

  const handleBook = useCallback((e) => {
    e.stopPropagation();
    if (onBook) {
      onBook(activity);
    }
  }, [activity, onBook]);

  const hotspotColor = hovered ? '#F97316' : (isSelected ? '#3B82F6' : '#22C55E');

  return (
    <group position={position}>
      {/* Main hotspot sphere - DR-205 */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color={hotspotColor}
          emissive={hotspotColor}
          emissiveIntensity={0.5}
          transparent={true}
          opacity={0.8}
        />
      </mesh>

      {/* Outer ring for visual effect */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.8, 32]} />
        <meshBasicMaterial
          color={hotspotColor}
          transparent={true}
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Activity label - always visible */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        {activity.title}
      </Text>

      {/* Price tag */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.2}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="black"
      >
        {activity.price}{activity.currency}
      </Text>

      {/* Preview panel - DR-206: Activity preview functionality */}
      {showPreview && (
        <Html
          position={[0, 2, 0]}
          center
          distanceFactor={10}
          style={{
            pointerEvents: 'auto'
          }}
        >
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              width: '350px',
              border: '2px solid #3B82F6',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview header */}
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#3B82F6', fontSize: '18px' }}>
                {activity.title}
              </h3>
              <p style={{ margin: '0', color: '#9CA3AF', fontSize: '12px' }}>
                📍 {activity.location}
              </p>
            </div>

            {/* Activity image */}
            {activity.image && (
              <div style={{ marginBottom: '15px' }}>
                <img
                  src={activity.image}
                  alt={activity.title}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Description */}
            <p style={{
              margin: '0 0 15px 0',
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#E5E7EB'
            }}>
              {activity.description}
            </p>

            {/* Activity details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '15px',
              fontSize: '13px'
            }}>
              <div>
                ⭐ {activity.rating} ({activity.reviewCount} avis)
              </div>
              <div>
                ⏱️ {activity.duration}
              </div>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: '15px' }}>
              {activity.tags && activity.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-block',
                    background: '#1F2937',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    marginRight: '5px',
                    marginBottom: '5px',
                    color: '#9CA3AF'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Price and booking - DR-207: Redirection to booking */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #374151',
              paddingTop: '15px'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFD700' }}>
                {activity.price}{activity.currency}
                {activity.originalPrice && (
                  <span style={{
                    fontSize: '14px',
                    textDecoration: 'line-through',
                    color: '#9CA3AF',
                    marginLeft: '8px'
                  }}>
                    {activity.originalPrice}{activity.currency}
                  </span>
                )}
              </div>

              <button
                onClick={handleBook}
                style={{
                  background: 'linear-gradient(45deg, #F97316, #DB2777)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                🎫 Réserver
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowPreview(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>
        </Html>
      )}

      {/* Hover info - minimal info when not in preview mode */}
      {hovered && !showPreview && (
        <Text
          position={[0, -1, 0]}
          fontSize={0.15}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {`⭐ ${activity.rating} • ${activity.duration}\nClick to preview`}
        </Text>
      )}
    </group>
  );
}

export default ActivityHotspot;
export { geoToVRPosition };
