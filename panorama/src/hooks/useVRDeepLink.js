/**
 * useVRDeepLink Hook
 * DR-498 / DR-501 / DR-502: Deep Linking pour accès VR via QR Code
 *
 * Gère:
 * - Parsing des paramètres URL
 * - Validation des tokens
 * - Vérification de l'expiration
 * - Auto-enter VR mode
 */

import { useState, useEffect, useCallback } from 'react';

export function useVRDeepLink() {
  const [deepLinkState, setDeepLinkState] = useState({
    isDeepLink: false,
    destination: null,
    token: null,
    isValid: false,
    isExpired: false,
    autoVR: false,
    error: null
  });

  const [vrSessionStarted, setVRSessionStarted] = useState(false);

  // Parse URL parameters
  useEffect(() => {
    const parseURLParams = () => {
      const params = new URLSearchParams(window.location.search);

      const destination = params.get('destination');
      const token = params.get('token');
      const expiration = params.get('exp');
      const autoVR = params.get('autoVR') === 'true';

      // Not a deep link if no required params
      if (!destination || !token || !expiration) {
        setDeepLinkState(prev => ({
          ...prev,
          isDeepLink: false
        }));
        return;
      }

      // Validate token format
      const tokenRegex = /^vr_\d+_[a-z0-9]+$/;
      const isValidToken = tokenRegex.test(token);

      // Check expiration
      const expirationTime = parseInt(expiration, 10);
      const currentTime = Date.now();
      const isExpired = currentTime > expirationTime;

      // Calculate time remaining
      const timeRemaining = Math.max(0, expirationTime - currentTime);

      setDeepLinkState({
        isDeepLink: true,
        destination,
        token,
        isValid: isValidToken && !isExpired,
        isExpired,
        autoVR,
        timeRemaining,
        expirationTime,
        error: isExpired ? 'QR Code expired' : (!isValidToken ? 'Invalid token' : null)
      });

      // Log deep link access
      console.log('🔗 VR Deep Link Detected:', {
        destination,
        token: `${token.substring(0, 15)}...`,
        valid: isValidToken && !isExpired,
        expired: isExpired,
        autoVR,
        timeRemaining: `${Math.floor(timeRemaining / 1000)}s`
      });

      // Store used token to prevent reuse
      if (isValidToken && !isExpired) {
        const usedTokens = JSON.parse(localStorage.getItem('vr_used_tokens') || '[]');
        if (!usedTokens.includes(token)) {
          usedTokens.push(token);
          // Keep only last 100 tokens
          if (usedTokens.length > 100) {
            usedTokens.shift();
          }
          localStorage.setItem('vr_used_tokens', JSON.stringify(usedTokens));
        }
      }
    };

    parseURLParams();
  }, []);

  // Auto-enter VR if requested
  const enterVRAutomatically = useCallback(() => {
    if (deepLinkState.autoVR && deepLinkState.isValid && !vrSessionStarted) {
      console.log('🚀 Auto-entering VR mode...');

      // Wait for VRButton to be available in DOM
      setTimeout(() => {
        const vrButton = document.querySelector('button[type="button"][aria-label="Enter VR"]') ||
                        document.querySelector('.vr-button') ||
                        document.getElementById('VRButton');

        if (vrButton) {
          vrButton.click();
          setVRSessionStarted(true);
          console.log('✅ VR session started automatically');
        } else {
          console.warn('⚠️ VR button not found, cannot auto-enter');
        }
      }, 2000); // Wait 2s for page to fully load
    }
  }, [deepLinkState.autoVR, deepLinkState.isValid, vrSessionStarted]);

  // Trigger auto-VR after state is set
  useEffect(() => {
    if (deepLinkState.isDeepLink && deepLinkState.isValid) {
      enterVRAutomatically();
    }
  }, [deepLinkState.isDeepLink, deepLinkState.isValid, enterVRAutomatically]);

  // Refresh token (regenerate QR code)
  const refreshToken = useCallback(() => {
    // Remove URL params and reload
    window.location.href = window.location.pathname;
  }, []);

  return {
    ...deepLinkState,
    refreshToken,
    enterVRAutomatically
  };
}
