/**
 * VR Recommendations Integration Example
 *
 * DR-80: VR-005 - Intégration Recommandations-VR
 *
 * This file shows how to integrate ActivityHotspotsManager into your VR environment.
 * Copy the relevant parts into your App.js
 */

import React, { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { VRButton, XR, Controllers, Hands } from '@react-three/xr';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Import the VR recommendations components
import { ActivityHotspotsManager } from './components/VR';

import './App.css';

/**
 * VR Environment with Activity Recommendations
 * Integration of DR-80 components
 */
function VREnvironmentWithRecommendations() {
  const [selectedEnvironment, setSelectedEnvironment] = useState('paris');

  // Handle booking requests from VR
  // DR-207: Booking redirection
  const handleBookingRequest = useCallback((activity) => {
    console.log('🎫 VR Booking requested for:', activity.title);
    console.log('📍 Location:', activity.location);
    console.log('💰 Price:', activity.price, activity.currency);

    // Option 1: Open booking in new tab (recommended for VR)
    if (typeof window !== 'undefined') {
      const bookingUrl = `/booking/${activity.id}?source=vr`;
      window.open(bookingUrl, '_blank');
      console.log('✅ Booking page opened:', bookingUrl);
    }

    // Option 2: Custom in-app handling
    // You could show a toast notification, analytics event, etc.

  }, []);

  return (
    <group>
      {/* Panoramic sphere (your existing 360 environment) */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial
          color="#1a1a2e"
          side={THREE.BackSide}
        />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />

      {/* DR-80: Activity Recommendations Hotspots */}
      <ActivityHotspotsManager
        environmentId={selectedEnvironment}
        onBookingRequest={handleBookingRequest}
      />

      {/* Environment selector (optional) */}
      <group position={[0, 3, -10]}>
        <Text
          fontSize={0.3}
          color="#3B82F6"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="black"
        >
          {`Current Environment: ${selectedEnvironment.toUpperCase()}`}
        </Text>
      </group>

      {/* VR Controllers */}
      <Controllers />
      <Hands />
    </group>
  );
}

/**
 * Main App Component with VR Support
 */
function AppWithVRRecommendations() {
  return (
    <div className="App">
      <div className="controls">
        <h1>🎯 DreamScape VR - Activity Recommendations</h1>
        <p>DR-80: Intégration Recommandations-VR</p>

        <div style={{ margin: '20px 0' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>
            ✨ Features:
          </p>
          <ul style={{ textAlign: 'left', fontSize: '13px', color: '#888' }}>
            <li>✅ DR-204: API endpoints for recommendations</li>
            <li>✅ DR-205: Interactive 3D hotspots</li>
            <li>✅ DR-206: Activity preview panels</li>
            <li>✅ DR-207: Booking redirection</li>
          </ul>
        </div>

        {/* VR Button */}
        <VRButton
          style={{
            background: 'linear-gradient(45deg, #F97316, #DB2777)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            margin: '10px',
            boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)'
          }}
        />
      </div>

      <Canvas
        style={{
          height: '80vh',
          width: '100%',
          background: 'linear-gradient(to bottom, #1a1a2e, #16213e)'
        }}
        camera={{ position: [0, 1.6, 0], fov: 75 }}
      >
        <XR>
          <Suspense
            fallback={
              <Text
                position={[0, 2, -2]}
                fontSize={0.4}
                color="yellow"
                anchorX="center"
                anchorY="middle"
              >
                Loading VR Environment...
              </Text>
            }
          >
            <VREnvironmentWithRecommendations />
          </Suspense>

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            maxDistance={10}
            minDistance={0.1}
          />
        </XR>
      </Canvas>

      <div className="instructions">
        <h3>🎮 How to Use VR Recommendations:</h3>
        <div style={{ textAlign: 'left', margin: '20px', fontSize: '14px' }}>
          <ol>
            <li>
              <strong>Start Services:</strong>
              <ul>
                <li>AI Service: <code>cd dreamscape-services/ai && npm run dev</code></li>
                <li>Panorama: <code>cd dreamscape-frontend/panorama && npm start</code></li>
              </ul>
            </li>
            <li>
              <strong>Enter VR:</strong> Click the "Enter VR" button above
            </li>
            <li>
              <strong>Explore Activities:</strong> Look around for green hotspots
            </li>
            <li>
              <strong>Preview:</strong> Click a hotspot to see activity details
            </li>
            <li>
              <strong>Book:</strong> Click "Réserver" button in preview panel
            </li>
          </ol>

          <h4 style={{ marginTop: '20px', color: '#3B82F6' }}>Environment Variables:</h4>
          <pre style={{
            background: '#1a1a2e',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#00FF00'
          }}>
            REACT_APP_AI_API_URL=http://localhost:3005/api/v1
          </pre>

          <h4 style={{ marginTop: '20px', color: '#3B82F6' }}>Test API:</h4>
          <pre style={{
            background: '#1a1a2e',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#00FF00'
          }}>
            curl http://localhost:3005/api/v1/recommendations/personalized
          </pre>
        </div>
      </div>
    </div>
  );
}

export default AppWithVRRecommendations;
