/**
 * VRAccessButton Component
 * DR-574: Accès VR par Code PIN
 *
 * Generates a 6-digit PIN code for VR headset access.
 * Replaces the previous QR code approach (DR-498) since VR headsets
 * cannot scan QR codes natively.
 */

import { useEffect, useState, useCallback } from 'react';
import { Monitor, X, Hash, RefreshCw } from 'lucide-react';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:4000';
const PANORAMA_PORT = import.meta.env.VITE_PANORAMA_PORT || '3006';

interface QRCodeDisplayProps {
  /** Destination ID for VR experience */
  destinationId: string;
  /** Optional custom VR URL */
  vrUrl?: string;
  /** Session token for authentication (unused, kept for backward compat) */
  sessionToken?: string;
  /** Expiration time in minutes (default: 10) */
  expirationMinutes?: number;
}

export default function QRCodeDisplay({
  destinationId,
  expirationMinutes = 10
}: QRCodeDisplayProps) {
  const [showModal, setShowModal] = useState(false);
  const [pinCode, setPinCode] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(expirationMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);
  const [expirationTime, setExpirationTime] = useState<number | null>(null);

  // Build the panorama URL to display to the user
  const panoramaUrl = `${window.location.hostname}:${PANORAMA_PORT}`;

  // Generate PIN code via gateway API
  const generatePin = useCallback(async () => {
    setPinLoading(true);
    setPinError(null);
    setPinCode(null);
    setIsExpired(false);

    try {
      const response = await fetch(`${GATEWAY_URL}/api/v1/vr/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: destinationId })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setPinCode(data.data.pin);
        setExpirationTime(data.data.expiresAt);
        setTimeRemaining(Math.floor((data.data.expiresAt - Date.now()) / 1000));
      } else {
        setPinError('Impossible de générer le code PIN');
      }
    } catch {
      setPinError('Serveur indisponible. Vérifiez que le gateway est lancé.');
    } finally {
      setPinLoading(false);
    }
  }, [destinationId]);

  // Generate PIN when modal opens
  useEffect(() => {
    if (showModal && !pinCode && !pinLoading) {
      generatePin();
    }
  }, [showModal, pinCode, pinLoading, generatePin]);

  // Countdown timer
  useEffect(() => {
    if (!expirationTime) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expirationTime - Date.now()) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setIsExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expirationTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRefresh = () => {
    generatePin();
  };

  return (
    <>
      {/* VR Access Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
      >
        <Monitor className="w-5 h-5" />
        <span>VR Access</span>
      </button>

      {/* PIN Code Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl mb-4">
                <Hash className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Code d'accès VR
              </h3>
              <p className="text-gray-600 text-sm">
                Entrez ce code dans le navigateur de votre casque VR
              </p>
            </div>

            {/* PIN Display */}
            <div className="flex justify-center mb-6">
              {pinLoading ? (
                <div className="w-full py-8 flex flex-col items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                  <p className="text-gray-500">Génération du code...</p>
                </div>
              ) : pinError ? (
                <div className="w-full py-6 text-center">
                  <p className="text-red-500 mb-3">{pinError}</p>
                  <button
                    onClick={handleRefresh}
                    className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              ) : isExpired ? (
                <div className="w-full py-6 text-center">
                  <div className="text-5xl mb-3">⏰</div>
                  <p className="text-red-600 font-semibold mb-1">Code expiré</p>
                  <p className="text-gray-500 text-sm mb-4">Générez un nouveau code</p>
                  <button
                    onClick={handleRefresh}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                  >
                    Nouveau code
                  </button>
                </div>
              ) : pinCode ? (
                <div className="w-full">
                  {/* PIN Code */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl py-6 px-4 text-center">
                    <p className="text-sm text-indigo-600 font-medium mb-2">Votre code PIN</p>
                    <div className="text-5xl font-mono font-bold tracking-[0.4em] text-indigo-900">
                      {pinCode.slice(0, 3)}&nbsp;{pinCode.slice(3)}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Timer (only when PIN is active) */}
            {pinCode && !isExpired && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Expire dans :</span>
                  <span className={`text-xl font-bold ${
                    timeRemaining < 60 ? 'text-red-600' : 'text-indigo-600'
                  }`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      timeRemaining < 60 ? 'bg-red-500' : 'bg-indigo-500'
                    }`}
                    style={{
                      width: `${(timeRemaining / (expirationMinutes * 60)) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Instructions */}
            {pinCode && !isExpired && (
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold flex-shrink-0">
                    1
                  </div>
                  <p className="text-gray-700">
                    Ouvrez le navigateur de votre casque VR
                  </p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold flex-shrink-0">
                    2
                  </div>
                  <p className="text-gray-700">
                    Allez sur <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{panoramaUrl}</span>
                  </p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold flex-shrink-0">
                    3
                  </div>
                  <p className="text-gray-700">
                    Entrez le code PIN affiché ci-dessus
                  </p>
                </div>
              </div>
            )}

            {/* Actions (when PIN is active) */}
            {pinCode && !isExpired && (
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Nouveau code
                </button>
              </div>
            )}

            {/* Security Note */}
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>🔒 Code à usage unique</p>
              <p>Expire après {expirationMinutes} minutes</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
