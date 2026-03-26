/**
 * PanoramaGallery Component
 * DR-575: Mode galerie 2D comme alternative au mode VR
 *
 * Pure HTML/CSS - aucune dépendance Three.js/Canvas (zéro overhead WebGL).
 * Réutilise les données de environments.js.
 * Charte graphique DreamScape : orange (#f97316) / pink (#ec4899) / blanc.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { listVREnvironments, VR_ENVIRONMENTS } from '../data/environments';

export default function PanoramaGallery({ onSwitchToVR, onSwitchTo3D, destination }) {
  // Si une destination est spécifiée (via ?destination=paris), on démarre directement dessus
  const [selectedEnv, setSelectedEnv] = useState(destination || null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  // Si destination fixée, ne pas montrer la grille multi-destinations
  const isLockedDestination = !!destination;

  const environments = listVREnvironments();

  // Get scenes for the selected environment
  const scenes = selectedEnv ? (VR_ENVIRONMENTS[selectedEnv]?.scenes || []) : [];
  const currentScene = scenes[currentSceneIndex] || null;

  // Keyboard navigation
  useEffect(() => {
    if (!selectedEnv) return;

    function handleKeyDown(e) {
      if (e.key === 'ArrowLeft') {
        setCurrentSceneIndex(prev => (prev > 0 ? prev - 1 : scenes.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentSceneIndex(prev => (prev < scenes.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape' && !isLockedDestination) {
        setSelectedEnv(null);
        setCurrentSceneIndex(0);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEnv, scenes.length, isLockedDestination]);

  const handleSelectEnv = useCallback((envId) => {
    setSelectedEnv(envId);
    setCurrentSceneIndex(0);
  }, []);

  const handleBackToGrid = useCallback(() => {
    setSelectedEnv(null);
    setCurrentSceneIndex(0);
  }, []);

  const handlePrevScene = useCallback(() => {
    setCurrentSceneIndex(prev => (prev > 0 ? prev - 1 : scenes.length - 1));
  }, [scenes.length]);

  const handleNextScene = useCallback(() => {
    setCurrentSceneIndex(prev => (prev < scenes.length - 1 ? prev + 1 : 0));
  }, [scenes.length]);

  return (
    <div style={styles.container}>
      {/* Header — style navbar DreamScape */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerLogo}>🌍</span>
          <span style={styles.headerTitle}>DreamScape</span>
          <span style={styles.headerBadge}>Galerie 2D</span>
        </div>
        <div style={styles.headerButtons}>
          <button onClick={onSwitchTo3D} style={styles.headerBtnSecondary} aria-label="Mode 3D interactif">
            🔄 Mode 3D
          </button>
          <button onClick={onSwitchToVR} style={styles.headerBtnPrimary} aria-label="Retour en mode VR">
            🥽 Mode VR
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={styles.main}>
        {!selectedEnv ? (
          /* === GRID VIEW === */
          <div style={styles.gridContainer}>
            <h1 style={styles.title}>Explorez nos destinations</h1>
            <p style={styles.subtitle}>
              Sélectionnez une destination pour parcourir ses panoramas
            </p>

            <div style={styles.grid}>
              {environments.map((env) => {
                const envData = VR_ENVIRONMENTS[env.id];
                const firstScene = envData?.scenes?.[0];
                const thumbUrl = firstScene?.thumbnailUrl;

                return (
                  <button
                    key={env.id}
                    onClick={() => handleSelectEnv(env.id)}
                    style={styles.card}
                    aria-label={`Explorer ${env.name}`}
                  >
                    <div style={styles.cardImageWrapper}>
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={env.name}
                          loading="lazy"
                          style={styles.cardImage}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={styles.cardImageFallback}>
                          <span style={{ fontSize: '48px' }}>{firstScene?.icon || '🌍'}</span>
                        </div>
                      )}
                      <div style={styles.cardOverlay}>
                        <span style={styles.cardBadge}>
                          {env.sceneCount} panorama{env.sceneCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div style={styles.cardBody}>
                      <h3 style={styles.cardName}>{env.name}</h3>
                      <p style={styles.cardDescription}>{env.description}</p>
                      <span style={styles.cardCta}>Explorer →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* === PANORAMA VIEWER === */
          <div style={styles.viewerContainer}>
            {/* Back button */}
            {!isLockedDestination && (
              <button onClick={handleBackToGrid} style={styles.backButton} aria-label="Retour aux destinations">
                ← Retour aux destinations
              </button>
            )}

            {/* Scene image */}
            <div style={styles.imageContainer}>
              {currentScene?.panoramaUrl ? (
                <img
                  src={currentScene.panoramaUrl}
                  alt={currentScene.name}
                  style={styles.panoramaImage}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div style={styles.imagePlaceholder}>
                  <span style={{ fontSize: '56px' }}>{currentScene?.icon || '🌍'}</span>
                  <p style={styles.placeholderText}>Image non disponible</p>
                </div>
              )}

              {/* Overlay bar */}
              <div style={styles.overlayBar}>
                <button
                  onClick={handlePrevScene}
                  style={styles.navButton}
                  aria-label="Scène précédente"
                  disabled={scenes.length <= 1}
                >
                  ◀
                </button>

                <div style={styles.sceneInfo}>
                  <span style={styles.sceneName}>
                    {currentScene?.icon} {currentScene?.name}
                  </span>
                  <span style={styles.sceneDescription}>{currentScene?.description}</span>
                  <span style={styles.sceneCounter}>
                    {currentSceneIndex + 1} / {scenes.length}
                  </span>
                </div>

                <button
                  onClick={handleNextScene}
                  style={styles.navButton}
                  aria-label="Scène suivante"
                  disabled={scenes.length <= 1}
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Scene thumbnails strip */}
            {scenes.length > 1 && (
              <div style={styles.thumbStrip}>
                {scenes.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => setCurrentSceneIndex(idx)}
                    style={{
                      ...styles.thumbItem,
                      ...(idx === currentSceneIndex ? styles.thumbItemActive : {}),
                    }}
                    aria-label={scene.name}
                  >
                    <span style={styles.thumbIcon}>{scene.icon}</span>
                    <span style={styles.thumbName}>{scene.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Styles — Charte DreamScape (orange/pink/blanc) ---

const styles = {
  // === Layout ===
  container: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f9fafb',
    overflow: 'auto',
  },

  // === Header — style navbar DreamScape (frosted white) ===
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid #f3f4f6',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  headerLogo: {
    fontSize: '28px',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerBadge: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#f97316',
    background: '#fff7ed',
    padding: '2px 10px',
    borderRadius: '50px',
  },
  headerButtons: {
    display: 'flex',
    gap: '8px',
  },
  headerBtnSecondary: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  headerBtnPrimary: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
    transition: 'all 0.2s',
  },

  // === Main Content ===
  main: {
    flex: 1,
    padding: '32px 24px',
    overflow: 'auto',
  },

  // === Grid View ===
  gridContainer: {
    maxWidth: '960px',
    margin: '0 auto',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 8px 0',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 32px 0',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    border: 'none',
    padding: 0,
    width: '100%',
    textAlign: 'left',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s',
  },
  cardImageWrapper: {
    position: 'relative',
    width: '100%',
    height: '180px',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s',
  },
  cardImageFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #fff7ed 0%, #fce7f3 100%)',
  },
  cardOverlay: {
    position: 'absolute',
    top: '12px',
    right: '12px',
  },
  cardBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
    borderRadius: '50px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  cardBody: {
    padding: '16px',
  },
  cardName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 4px 0',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 12px 0',
    lineHeight: '1.4',
  },
  cardCta: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f97316',
  },

  // === Viewer ===
  viewerContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '16px',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#1f2937',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
  },
  panoramaImage: {
    width: '100%',
    height: '500px',
    objectFit: 'cover',
    display: 'block',
  },
  imagePlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '500px',
    background: 'linear-gradient(135deg, #fff7ed 0%, #fce7f3 100%)',
  },
  placeholderText: {
    color: '#6b7280',
    marginTop: '12px',
    fontSize: '15px',
  },
  overlayBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    padding: '20px 24px',
    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0) 100%)',
    gap: '16px',
  },
  navButton: {
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  sceneInfo: {
    flex: 1,
    textAlign: 'center',
  },
  sceneName: {
    display: 'block',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '2px',
  },
  sceneDescription: {
    display: 'block',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '2px',
  },
  sceneCounter: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#fdba74',
  },

  // === Thumbnails strip ===
  thumbStrip: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
    overflowX: 'auto',
    padding: '4px 0',
  },
  thumbItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#ffffff',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  thumbItemActive: {
    borderColor: '#f97316',
    background: '#fff7ed',
  },
  thumbIcon: {
    fontSize: '18px',
  },
  thumbName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    whiteSpace: 'nowrap',
  },
};
