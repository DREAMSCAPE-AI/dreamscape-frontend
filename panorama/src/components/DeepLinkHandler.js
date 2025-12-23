/**
 * DeepLinkHandler Component
 * DR-498 / DR-501: Affichage des messages de deep linking
 *
 * Affiche des notifications pour:
 * - Tokens expirés
 * - Tokens invalides
 * - Auto-enter VR en cours
 */

import React from 'react';

export default function DeepLinkHandler({ deepLinkState, refreshToken }) {
  const { isDeepLink, isValid, isExpired, autoVR, error, timeRemaining } = deepLinkState;

  if (!isDeepLink) {
    return null;
  }

  // Expired token banner
  if (isExpired) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'rgba(220, 38, 38, 0.95)',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>⏰</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
          QR Code Expired
        </div>
        <div style={{ fontSize: '14px', marginBottom: '12px', opacity: 0.9 }}>
          This VR access link has expired for security reasons
        </div>
        <button
          onClick={refreshToken}
          style={{
            backgroundColor: 'white',
            color: '#DC2626',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Go Back to Scan New QR Code
        </button>
      </div>
    );
  }

  // Invalid token banner
  if (!isValid && error) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'rgba(239, 68, 68, 0.95)',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>🚫</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
          Invalid Access Link
        </div>
        <div style={{ fontSize: '14px', marginBottom: '12px', opacity: 0.9' }}>
          {error}
        </div>
        <button
          onClick={refreshToken}
          style={{
            backgroundColor: 'white',
            color: '#EF4444',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Valid deep link - show auto-VR message
  if (isValid && autoVR) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'rgba(79, 70, 229, 0.95)',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>🥽</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
          Preparing VR Experience
        </div>
        <div style={{ fontSize: '14px', marginBottom: '12px', opacity: 0.9 }}>
          Auto-entering VR mode in a moment...
        </div>
        <div className="loading-dots" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <div className="dot" style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'white',
            animation: 'bounce 1.4s infinite ease-in-out both',
            animationDelay: '-0.32s'
          }}></div>
          <div className="dot" style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'white',
            animation: 'bounce 1.4s infinite ease-in-out both',
            animationDelay: '-0.16s'
          }}></div>
          <div className="dot" style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'white',
            animation: 'bounce 1.4s infinite ease-in-out both'
          }}></div>
        </div>
        {timeRemaining && (
          <div style={{ fontSize: '12px', marginTop: '12px', opacity: 0.8 }}>
            Session expires in {Math.floor(timeRemaining / 1000)}s
          </div>
        )}
      </div>
    );
  }

  // Valid deep link without auto-VR
  if (isValid && !autoVR) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'rgba(34, 197, 94, 0.95)',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
          VR Access Granted
        </div>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          Click "Enter VR" below to start your experience
        </div>
      </div>
    );
  }

  return null;
}
