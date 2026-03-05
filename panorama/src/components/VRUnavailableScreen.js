/**
 * VRUnavailableScreen Component
 * DR-575: Écran de fallback quand WebXR n'est pas disponible
 *
 * Affiche un message contextuel selon la raison et propose
 * des alternatives (galerie 2D ou mode 3D interactif).
 * Charte graphique DreamScape : orange (#f97316) / pink (#ec4899) / blanc.
 */

import React from 'react';

const REASON_CONFIG = {
  'no-webxr-api': {
    icon: '🌐',
    title: 'Navigateur non compatible WebXR',
    message: 'Votre navigateur ne supporte pas la réalité virtuelle WebXR.',
    suggestion: 'Essayez Google Chrome, Microsoft Edge ou Meta Quest Browser pour une expérience VR complète.',
  },
  'no-headset': {
    icon: '🥽',
    title: 'Casque VR non détecté',
    message: 'Aucun casque de réalité virtuelle n\'a été détecté sur cet appareil.',
    suggestion: 'Connectez votre casque VR (Meta Quest, HTC Vive, etc.) et rafraîchissez la page.',
  },
  'error': {
    icon: '⚠️',
    title: 'Erreur de détection VR',
    message: 'Une erreur est survenue lors de la vérification du support WebXR.',
    suggestion: 'Vérifiez que votre navigateur est à jour et réessayez.',
  },
};

export default function VRUnavailableScreen({ xrReason, onSwitchToGallery, onSwitchTo3D }) {
  const config = REASON_CONFIG[xrReason] || REASON_CONFIG['error'];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🌍</span>
          <span style={styles.logoText}>DreamScape</span>
        </div>

        {/* Status card */}
        <div style={styles.statusCard}>
          <div style={styles.statusIcon}>{config.icon}</div>
          <h1 style={styles.title}>{config.title}</h1>
          <p style={styles.message}>{config.message}</p>
          <p style={styles.suggestion}>{config.suggestion}</p>
        </div>

        {/* CTA buttons */}
        <div style={styles.buttonContainer}>
          <button
            onClick={onSwitchToGallery}
            style={styles.primaryButton}
            aria-label="Explorer en mode Galerie 2D"
          >
            <span style={styles.buttonIcon}>🖼️</span>
            <span>Explorer en mode Galerie 2D</span>
          </button>

          <button
            onClick={onSwitchTo3D}
            style={styles.secondaryButton}
            aria-label="Voir en mode 3D interactif"
          >
            <span style={styles.buttonIcon}>🔄</span>
            <span>Voir en mode 3D interactif</span>
          </button>
        </div>

        {/* Help section */}
        <div style={styles.helpSection}>
          <p style={styles.helpTitle}>Comment activer la VR ?</p>
          <div style={styles.helpStep}>
            <span style={styles.stepNumber}>1</span>
            <span>Utilisez un navigateur compatible (Chrome, Edge, Firefox)</span>
          </div>
          <div style={styles.helpStep}>
            <span style={styles.stepNumber}>2</span>
            <span>Connectez et allumez votre casque VR</span>
          </div>
          <div style={styles.helpStep}>
            <span style={styles.stepNumber}>3</span>
            <span>Rafraîchissez cette page pour relancer la détection</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Styles — Charte DreamScape (orange/pink/blanc) ---

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f9fafb',
    overflow: 'auto',
  },
  content: {
    textAlign: 'center',
    padding: '40px 32px',
    maxWidth: '520px',
    width: '100%',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '32px',
  },
  logoIcon: {
    fontSize: '36px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusCard: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '32px 24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
  },
  statusIcon: {
    fontSize: '56px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 8px 0',
  },
  message: {
    fontSize: '15px',
    color: '#6b7280',
    margin: '0 0 8px 0',
    lineHeight: '1.5',
  },
  suggestion: {
    fontSize: '14px',
    color: '#f97316',
    margin: '0',
    lineHeight: '1.5',
    fontWeight: '500',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)',
    transition: 'all 0.2s',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#374151',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonIcon: {
    fontSize: '22px',
  },
  helpSection: {
    textAlign: 'left',
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  },
  helpTitle: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 14px 0',
  },
  helpStep: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '10px',
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.4',
  },
  stepNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '26px',
    height: '26px',
    borderRadius: '50%',
    background: '#fff7ed',
    color: '#f97316',
    fontSize: '13px',
    fontWeight: 'bold',
  },
};
