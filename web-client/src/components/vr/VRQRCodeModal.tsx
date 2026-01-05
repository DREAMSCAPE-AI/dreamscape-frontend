/**
 * VR QR Code Modal Component
 *
 * Ticket: DR-498 (VR-009 - QR Code Access)
 *
 * Génère un QR code pour accéder à l'expérience VR d'une destination
 * depuis un appareil mobile ou un casque VR
 */

import React, { useEffect, useRef } from 'react';
import { X, Smartphone, Glasses } from 'lucide-react';
import QRCode from 'qrcode';

interface VRQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationId: string;
  destinationName: string;
}

const VRQRCodeModal: React.FC<VRQRCodeModalProps> = ({
  isOpen,
  onClose,
  destinationId,
  destinationName
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      generateQRCode();
    }
  }, [isOpen, destinationId]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    // Construire l'URL de l'expérience VR
    const baseUrl = window.location.origin;
    const vrUrl = `${baseUrl}/vr/${destinationId}`;

    try {
      await QRCode.toCanvas(canvasRef.current, vrUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1F2937',  // gray-800
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });

      console.log('✅ QR Code généré:', vrUrl);
    } catch (error) {
      console.error('❌ Erreur génération QR Code:', error);
    }
  };

  const handleCopyLink = () => {
    const vrUrl = `${window.location.origin}/vr/${destinationId}`;
    navigator.clipboard.writeText(vrUrl);

    // TODO: Ajouter un toast de confirmation
    alert('Lien copié dans le presse-papiers!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fadeIn">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Expérience VR 360°
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {destinationName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
              <canvas ref={canvasRef} className="mx-auto" />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Sur smartphone
                </h3>
                <p className="text-sm text-blue-700">
                  Scannez le QR code avec votre téléphone pour explorer la destination en réalité virtuelle
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <Glasses className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-1">
                  Avec casque VR
                </h3>
                <p className="text-sm text-purple-700">
                  Utilisez le navigateur de votre casque VR (Meta Quest, HTC Vive, etc.) pour une immersion totale
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCopyLink}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Copier le lien
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-colors shadow-lg"
            >
              Fermer
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 text-center">
              💡 <strong>Astuce :</strong> Pour la meilleure expérience, utilisez un casque VR
              ou activez le mode VR de votre navigateur mobile
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VRQRCodeModal;
