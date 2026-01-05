/**
 * Dynamic VR Viewer Page
 *
 * Ticket: DR-498 (VR-009 - QR Code Access) + DR-74 (Paris VR)
 *
 * Page qui charge dynamiquement l'environnement VR en fonction de la destination
 * Accessible via QR code depuis la page destination
 */

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Mapping des destinations vers leurs environnements VR
const VR_ENVIRONMENT_MAP: Record<string, string> = {
  'paris': 'paris',
  'PAR': 'paris',
  'barcelona': 'barcelona',
  'BCN': 'barcelona',
  'new-york': 'new-york',
  'JFK': 'new-york',
  'tokyo': 'tokyo',
  'NRT': 'tokyo',
  'dubai': 'dubai',
  'DXB': 'dubai',
  'london': 'london',
  'LHR': 'london'
};

export default function VRViewerPage() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) {
      console.error('❌ Aucune destination spécifiée');
      return;
    }

    // Normaliser l'ID (lowercase, trim)
    const normalizedId = id.toLowerCase().trim();

    // Récupérer l'environnement VR correspondant
    const vrEnvironment = VR_ENVIRONMENT_MAP[normalizedId] || normalizedId;

    console.log(`🗺️ Destination: ${id}`);
    console.log(`🌍 Environnement VR: ${vrEnvironment}`);

    // Rediriger vers l'application panorama avec le bon environnement
    // L'application panorama tourne sur le port 3006
    const panoramaUrl = `${window.location.protocol}//${window.location.hostname}:3006?environment=${vrEnvironment}`;

    console.log(`🚀 Redirection vers: ${panoramaUrl}`);

    // Rediriger vers l'application panorama
    window.location.href = panoramaUrl;

  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="text-center text-white p-8">
        {/* Logo/Icon VR */}
        <div className="mb-8 animate-bounce">
          <svg
            className="w-24 h-24 mx-auto text-white opacity-80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Titre */}
        <h1 className="text-4xl font-bold mb-4 animate-pulse">
          Lancement de l'expérience VR
        </h1>

        {/* Message de chargement */}
        <p className="text-xl mb-8 opacity-90">
          Préparez votre casque VR...
        </p>

        {/* Destination */}
        {id && (
          <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full mb-8">
            <p className="text-lg font-medium">
              📍 {id.replace('-', ' ').toUpperCase()}
            </p>
          </div>
        )}

        {/* Spinner */}
        <div className="flex justify-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>

        {/* Instructions */}
        <div className="mt-12 max-w-md mx-auto text-sm opacity-75">
          <p className="mb-2">💡 Si vous n'êtes pas redirigé automatiquement :</p>
          <p>Assurez-vous que l'application panorama est en cours d'exécution</p>
        </div>
      </div>
    </div>
  );
}
