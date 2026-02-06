/**
 * HotspotPanelOverlay - Panneau HTML overlay pour afficher les points d'intérêt
 *
 * Utilise ReactDOM.createPortal pour rendre le panneau en dehors du Canvas Three.js
 * afin d'éviter les problèmes de positionnement CSS avec @react-three/drei
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * Composant HotspotPanelOverlay
 * @param {Array} hotspots - Liste des hotspots à afficher
 * @param {Function} onHotspotClick - Callback appelé lors du clic sur un hotspot
 */
function HotspotPanelOverlay({ hotspots, onHotspotClick }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [portalContainer, setPortalContainer] = useState(null);

  useEffect(() => {
    // Créer ou réutiliser un conteneur pour le portail
    let container = document.getElementById('hotspot-panel-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'hotspot-panel-container';
      document.body.appendChild(container);
    }
    setPortalContainer(container);

    return () => {
      // Nettoyer le conteneur au démontage
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);

  if (!portalContainer || !hotspots || hotspots.length === 0) {
    return null;
  }

  // Séparer les hotspots par type
  const infoHotspots = hotspots.filter(h => h.type === 'info');
  const teleportHotspots = hotspots.filter(h => h.type === 'teleport');

  const panelContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '300px',
        maxHeight: '100vh',
        backgroundColor: 'rgba(26, 26, 46, 0.9)',
        padding: '16px',
        overflowY: 'auto',
        boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.5)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'white',
        zIndex: 1000,
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Titre */}
      <h2
        style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
          paddingBottom: '12px'
        }}
      >
        Points d'intérêt
      </h2>

      {/* Section Informations */}
      {infoHotspots.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3
            style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              color: '#F59E0B',
              fontWeight: 'bold'
            }}
          >
            📍 Informations
          </h3>
          {infoHotspots.map((hotspot, index) => (
            <HotspotItem
              key={hotspot.id}
              hotspot={hotspot}
              isHovered={hoveredIndex === `info-${index}`}
              onHover={() => setHoveredIndex(`info-${index}`)}
              onUnhover={() => setHoveredIndex(null)}
              onClick={() => onHotspotClick(hotspot)}
              color="#F59E0B"
            />
          ))}
        </div>
      )}

      {/* Section Destinations */}
      {teleportHotspots.length > 0 && (
        <div>
          <h3
            style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              color: '#10B981',
              fontWeight: 'bold'
            }}
          >
            🚀 Destinations
          </h3>
          {teleportHotspots.map((hotspot, index) => (
            <HotspotItem
              key={hotspot.id}
              hotspot={hotspot}
              isHovered={hoveredIndex === `teleport-${index}`}
              onHover={() => setHoveredIndex(`teleport-${index}`)}
              onUnhover={() => setHoveredIndex(null)}
              onClick={() => onHotspotClick(hotspot)}
              color="#10B981"
            />
          ))}
        </div>
      )}
    </div>
  );

  // Utiliser un portail pour rendre le panneau en dehors de la hiérarchie React principale
  return ReactDOM.createPortal(panelContent, portalContainer);
}

/**
 * Item individuel dans le panneau
 */
function HotspotItem({ hotspot, isHovered, onHover, onUnhover, onClick, color }) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onUnhover}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        marginBottom: '6px',
        backgroundColor: isHovered ? color : 'rgba(42, 42, 62, 0.6)',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: `1px solid ${isHovered ? color : 'transparent'}`
      }}
    >
      {/* Icône */}
      <span
        style={{
          fontSize: '20px',
          marginRight: '10px',
          flexShrink: 0
        }}
      >
        {hotspot.icon || '📍'}
      </span>

      {/* Contenu */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {hotspot.title}
        </div>
        {hotspot.distance && (
          <div
            style={{
              fontSize: '11px',
              color: '#AAAAAA',
              marginTop: '2px'
            }}
          >
            {hotspot.distance}
          </div>
        )}
      </div>
    </div>
  );
}

export default HotspotPanelOverlay;
