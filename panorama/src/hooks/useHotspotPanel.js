/**
 * useHotspotPanel - Hook pour gérer le panneau de hotspots en overlay HTML
 *
 * Crée et gère un panneau HTML en dehors du Canvas Three.js pour éviter
 * les conflits avec React Three Fiber
 */

import { useEffect, useRef } from 'react';

function useHotspotPanel(hotspots, onHotspotClick) {
  const containerRef = useRef(null);
  const hoveredIndexRef = useRef(null);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    if (!hotspots || hotspots.length === 0) return;

    // Créer le conteneur du panneau
    const container = document.createElement('div');
    container.id = 'hotspot-panel-overlay';
    container.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 300px;
      max-height: 100vh;
      background-color: rgba(26, 26, 46, 0.9);
      padding: 16px;
      overflow-y: auto;
      box-shadow: -4px 0 12px rgba(0, 0, 0, 0.5);
      font-family: system-ui, -apple-system, sans-serif;
      color: white;
      z-index: 1000;
      backdrop-filter: blur(10px);
      transition: opacity 0.3s ease;
    `;

    // Séparer les hotspots par type
    const infoHotspots = hotspots.filter(h => h.type === 'info');
    const teleportHotspots = hotspots.filter(h => h.type === 'teleport');

    // Créer le titre
    const title = document.createElement('h2');
    title.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 12px;
    `;
    title.textContent = "Points d'intérêt";
    container.appendChild(title);

    // Fonction pour créer un item de hotspot
    const createHotspotItem = (hotspot, color, index, type) => {
      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        align-items: center;
        padding: 10px;
        margin-bottom: 6px;
        background-color: rgba(42, 42, 62, 0.6);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid transparent;
      `;

      // Icône
      const icon = document.createElement('span');
      icon.style.cssText = `
        font-size: 20px;
        margin-right: 10px;
        flex-shrink: 0;
      `;
      icon.textContent = hotspot.icon || '📍';
      item.appendChild(icon);

      // Contenu
      const content = document.createElement('div');
      content.style.cssText = `
        flex: 1;
        min-width: 0;
      `;

      const titleDiv = document.createElement('div');
      titleDiv.style.cssText = `
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `;
      titleDiv.textContent = hotspot.title;
      content.appendChild(titleDiv);

      if (hotspot.distance) {
        const distance = document.createElement('div');
        distance.style.cssText = `
          font-size: 11px;
          color: #AAAAAA;
          margin-top: 2px;
        `;
        distance.textContent = hotspot.distance;
        content.appendChild(distance);
      }

      item.appendChild(content);

      // Events
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = color;
        item.style.border = `1px solid ${color}`;
        hoveredIndexRef.current = `${type}-${index}`;
      });

      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'rgba(42, 42, 62, 0.6)';
        item.style.border = '1px solid transparent';
        hoveredIndexRef.current = null;
      });

      item.addEventListener('click', () => {
        if (onHotspotClick) {
          onHotspotClick(hotspot);
        }
      });

      return item;
    };

    // Section Informations
    if (infoHotspots.length > 0) {
      const infoSection = document.createElement('div');
      infoSection.style.marginBottom = '20px';

      const infoTitle = document.createElement('h3');
      infoTitle.style.cssText = `
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #F59E0B;
        font-weight: bold;
      `;
      infoTitle.textContent = '📍 Informations';
      infoSection.appendChild(infoTitle);

      infoHotspots.forEach((hotspot, index) => {
        const item = createHotspotItem(hotspot, '#F59E0B', index, 'info');
        infoSection.appendChild(item);
      });

      container.appendChild(infoSection);
    }

    // Section Destinations
    if (teleportHotspots.length > 0) {
      const teleportSection = document.createElement('div');

      const teleportTitle = document.createElement('h3');
      teleportTitle.style.cssText = `
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #10B981;
        font-weight: bold;
      `;
      teleportTitle.textContent = '🚀 Destinations';
      teleportSection.appendChild(teleportTitle);

      teleportHotspots.forEach((hotspot, index) => {
        const item = createHotspotItem(hotspot, '#10B981', index, 'teleport');
        teleportSection.appendChild(item);
      });

      container.appendChild(teleportSection);
    }

    // Ajouter au DOM
    document.body.appendChild(container);
    containerRef.current = container;

    // Gérer la transparence lors du mouvement de la caméra
    let isMoving = false;

    const handleCameraMove = () => {
      // Rendre transparent pendant le mouvement
      if (!isMoving) {
        container.style.opacity = '0.2';
        isMoving = true;
      }

      // Réinitialiser le timer
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      // Réafficher après 500ms d'inactivité
      hideTimerRef.current = setTimeout(() => {
        container.style.opacity = '1';
        isMoving = false;
      }, 500);
    };

    // Écouter les mouvements de souris et touch
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('mousemove', handleCameraMove);
      canvas.addEventListener('touchmove', handleCameraMove);
      canvas.addEventListener('wheel', handleCameraMove);
    }

    // Nettoyage
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      if (canvas) {
        canvas.removeEventListener('mousemove', handleCameraMove);
        canvas.removeEventListener('touchmove', handleCameraMove);
        canvas.removeEventListener('wheel', handleCameraMove);
      }

      if (containerRef.current && containerRef.current.parentNode) {
        containerRef.current.parentNode.removeChild(containerRef.current);
      }
      containerRef.current = null;
    };
  }, [hotspots, onHotspotClick]);

  return null;
}

export default useHotspotPanel;
