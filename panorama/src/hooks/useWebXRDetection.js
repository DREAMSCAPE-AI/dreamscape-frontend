/**
 * useWebXRDetection Hook
 * DR-575: Détection WebXR et fallback gracieux
 *
 * Vérifie si le navigateur supporte WebXR et si un casque VR est disponible.
 * Retourne l'état de support avec une raison explicite.
 */

import { useState, useEffect } from 'react';

/**
 * @returns {{ isXRSupported: boolean, isChecking: boolean, xrReason: string }}
 * - xrReason: 'supported' | 'no-webxr-api' | 'no-headset' | 'error'
 */
export default function useWebXRDetection() {
  const [isXRSupported, setIsXRSupported] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [xrReason, setXrReason] = useState('supported');

  useEffect(() => {
    let mounted = true;

    async function checkXR() {
      // No WebXR API at all
      if (!navigator.xr) {
        if (mounted) {
          setIsXRSupported(false);
          setXrReason('no-webxr-api');
          setIsChecking(false);
        }
        return;
      }

      try {
        const supported = await navigator.xr.isSessionSupported('immersive-vr');
        if (mounted) {
          setIsXRSupported(supported);
          setXrReason(supported ? 'supported' : 'no-headset');
          setIsChecking(false);
        }
      } catch (err) {
        console.warn('WebXR detection error:', err);
        if (mounted) {
          setIsXRSupported(false);
          setXrReason('error');
          setIsChecking(false);
        }
      }
    }

    checkXR();

    return () => {
      mounted = false;
    };
  }, []);

  return { isXRSupported, isChecking, xrReason };
}
