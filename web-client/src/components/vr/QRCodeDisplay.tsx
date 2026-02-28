/**
 * QRCodeDisplay Component
 * DR-498 / DR-500: Frontend - Interface d'affichage QR code
 * DR-574: PIN code display for VR headsets without QR scanner
 *
 * Displays a QR code + PIN code for quick VR access from mobile or VR headsets
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { QrCode, Smartphone, X, Hash } from 'lucide-react';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:4000';

interface QRCodeDisplayProps {
  /** Destination ID for VR experience */
  destinationId: string;
  /** Optional custom VR URL */
  vrUrl?: string;
  /** Session token for authentication */
  sessionToken?: string;
  /** Expiration time in minutes (default: 10) */
  expirationMinutes?: number;
}

export default function QRCodeDisplay({
  destinationId,
  vrUrl,
  sessionToken,
  expirationMinutes = 10
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState(expirationMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);

  // Generate unique session token if not provided
  const [token] = useState(() =>
    sessionToken || `vr_${Date.now()}_${Math.random().toString(36).substring(7)}`
  );

  // Calculate expiration time
  const [expirationTime] = useState(() => Date.now() + (expirationMinutes * 60 * 1000));

  // DR-574: PIN code state
  const [pinCode, setPinCode] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // DR-574: Generate PIN code via gateway API
  const generatePin = useCallback(async () => {
    setPinLoading(true);
    setPinError(null);
    try {
      const response = await fetch(`${GATEWAY_URL}/api/v1/vr/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: destinationId })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setPinCode(data.data.pin);
      } else {
        setPinError('Failed to generate PIN');
      }
    } catch {
      setPinError('Server unavailable');
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

  // Build VR deep link URL
  const buildVRUrl = () => {
    // Use custom URL or build default panorama URL
    const baseUrl = vrUrl || `${window.location.origin}/panorama`;
    const params = new URLSearchParams({
      destination: destinationId,
      token,
      exp: expirationTime.toString(),
      autoVR: 'true' // Auto-enter VR mode
    });

    return `${baseUrl}?${params.toString()}`;
  };

  // Generate QR Code
  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = buildVRUrl();

        // Generate QR code to canvas
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, url, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            errorCorrectionLevel: 'H'
          });
        }

        // Also generate data URL for modal
        const dataUrl = await QRCode.toDataURL(url, {
          width: 512,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H'
        });

        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [destinationId, token, expirationTime]);

  // Countdown timer
  useEffect(() => {
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

  const refreshToken = () => {
    // Reload component with new token
    window.location.reload();
  };

  return (
    <>
      {/* QR Code Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
      >
        <QrCode className="w-5 h-5" />
        <span>VR Quick Access</span>
      </button>

      {/* QR Code Modal */}
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
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Scan for VR Experience
              </h3>
              <p className="text-gray-600 text-sm">
                Use your phone or VR headset to scan this code
              </p>
            </div>

            {/* QR Code Display */}
            <div className="flex justify-center mb-6">
              {!isExpired ? (
                <div className="relative">
                  <img
                    src={qrDataUrl}
                    alt="VR Access QR Code"
                    className="w-64 h-64 border-4 border-gray-100 rounded-xl shadow-lg"
                  />
                  {/* Hidden canvas for generation */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : (
                <div className="w-64 h-64 border-4 border-red-200 rounded-xl bg-red-50 flex flex-col items-center justify-center">
                  <div className="text-red-600 text-6xl mb-2">⏰</div>
                  <p className="text-red-600 font-semibold">QR Code Expired</p>
                  <p className="text-red-500 text-sm mt-2">Click refresh to generate new</p>
                </div>
              )}
            </div>

            {/* DR-574: PIN Code for VR Headsets */}
            {!isExpired && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-indigo-700">VR Headset? Use PIN Code</span>
                </div>
                {pinLoading ? (
                  <div className="text-center text-indigo-500 text-sm py-2">Generating PIN...</div>
                ) : pinError ? (
                  <div className="text-center">
                    <p className="text-red-500 text-sm mb-2">{pinError}</p>
                    <button
                      onClick={generatePin}
                      className="text-sm text-indigo-600 underline hover:text-indigo-800"
                    >
                      Retry
                    </button>
                  </div>
                ) : pinCode ? (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-mono font-bold tracking-[0.3em] text-indigo-900">
                        {pinCode.slice(0, 3)} {pinCode.slice(3)}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-500 mt-2 text-center">
                      Open your VR headset browser, go to the panorama URL, and enter this code
                    </p>
                  </>
                ) : null}
              </div>
            )}

            {/* Timer */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Time remaining:</span>
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

            {/* Instructions */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold flex-shrink-0">
                  1
                </div>
                <p className="text-gray-700">
                  Open your phone camera or VR headset browser
                </p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold flex-shrink-0">
                  2
                </div>
                <p className="text-gray-700">
                  Scan this QR code to access the VR experience
                </p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold flex-shrink-0">
                  3
                </div>
                <p className="text-gray-700">
                  Click "Enter VR" when the page loads
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {isExpired ? (
                <button
                  onClick={refreshToken}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  Generate New QR Code
                </button>
              ) : (
                <>
                  <button
                    onClick={() => window.open(buildVRUrl(), '_blank')}
                    className="flex-1 border-2 border-indigo-600 text-indigo-600 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                  >
                    Open Direct Link
                  </button>
                  <button
                    onClick={refreshToken}
                    className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Refresh
                  </button>
                </>
              )}
            </div>

            {/* Security Note */}
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>🔒 Secured with one-time token</p>
              <p>Expires in {expirationMinutes} minutes for your security</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
