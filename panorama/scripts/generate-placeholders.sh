#!/bin/bash
###############################################################################
# Placeholder Generator for VR Panoramas
#
# Generates placeholder 360° images for testing before real panoramas are ready
# Uses placeholder.com service to generate colored placeholder images
#
# Usage: bash scripts/generate-placeholders.sh
###############################################################################

set -e

echo "🎨 === GÉNÉRATEUR DE PLACEHOLDERS VR ==="
echo ""

# Configuration
BASE_DIR="public/panoramas"
SIZE="8192x4096"  # Ratio 2:1 pour panoramas équirectangulaires

# Créer les dossiers si nécessaire
mkdir -p "$BASE_DIR/paris/thumbnails"
mkdir -p "$BASE_DIR/barcelona/thumbnails"

# Couleurs par ville
PARIS_COLOR="87CEEB"      # Bleu ciel parisien
BARCELONA_COLOR="FFB84D"  # Or méditerranéen

echo "📍 PARIS"
echo "   Génération de 5 placeholders..."
echo ""

# Paris placeholders
curl -s "https://via.placeholder.com/$SIZE/$PARIS_COLOR/FFFFFF?text=Tour+Eiffel+360" \
  -o "$BASE_DIR/paris/eiffel-tower.jpg"
echo "  ✅ eiffel-tower.jpg"

curl -s "https://via.placeholder.com/$SIZE/$PARIS_COLOR/FFFFFF?text=Louvre+360" \
  -o "$BASE_DIR/paris/louvre.jpg"
echo "  ✅ louvre.jpg"

curl -s "https://via.placeholder.com/$SIZE/$PARIS_COLOR/FFFFFF?text=Arc+de+Triomphe+360" \
  -o "$BASE_DIR/paris/arc-triomphe.jpg"
echo "  ✅ arc-triomphe.jpg"

curl -s "https://via.placeholder.com/$SIZE/$PARIS_COLOR/FFFFFF?text=Notre+Dame+360" \
  -o "$BASE_DIR/paris/notre-dame.jpg"
echo "  ✅ notre-dame.jpg"

curl -s "https://via.placeholder.com/$SIZE/$PARIS_COLOR/FFFFFF?text=Sacre+Coeur+360" \
  -o "$BASE_DIR/paris/sacre-coeur.jpg"
echo "  ✅ sacre-coeur.jpg"

echo ""
echo "📍 BARCELONA"
echo "   Génération de 5 placeholders..."
echo ""

# Barcelona placeholders
curl -s "https://via.placeholder.com/$SIZE/$BARCELONA_COLOR/FFFFFF?text=Sagrada+Familia+360" \
  -o "$BASE_DIR/barcelona/sagrada-familia.jpg"
echo "  ✅ sagrada-familia.jpg"

curl -s "https://via.placeholder.com/$SIZE/$BARCELONA_COLOR/FFFFFF?text=Park+Guell+360" \
  -o "$BASE_DIR/barcelona/park-guell.jpg"
echo "  ✅ park-guell.jpg"

curl -s "https://via.placeholder.com/$SIZE/$BARCELONA_COLOR/FFFFFF?text=Casa+Batllo+360" \
  -o "$BASE_DIR/barcelona/casa-batllo.jpg"
echo "  ✅ casa-batllo.jpg"

curl -s "https://via.placeholder.com/$SIZE/$BARCELONA_COLOR/FFFFFF?text=La+Rambla+360" \
  -o "$BASE_DIR/barcelona/la-rambla.jpg"
echo "  ✅ la-rambla.jpg"

curl -s "https://via.placeholder.com/$SIZE/$BARCELONA_COLOR/FFFFFF?text=Barceloneta+Beach+360" \
  -o "$BASE_DIR/barcelona/barceloneta.jpg"
echo "  ✅ barceloneta.jpg"

echo ""
echo "===================================================="
echo "✅ 10 placeholders générés (8192x4096)"
echo ""
echo "💡 Prochaine étape:"
echo "   python scripts/generate-thumbnails.py"
echo ""
echo "⚠️  Note: Ce sont des placeholders pour tester."
echo "   Remplacez-les par de vraies images 360° avant production."
echo "   Consultez DOWNLOAD_PANORAMAS.md pour les instructions."
echo "===================================================="
