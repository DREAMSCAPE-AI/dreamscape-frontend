#!/usr/bin/env python3
"""
Thumbnail Generator for VR Panoramas

Automatically generates 400x200 thumbnails from panorama images.
Requires: pip install Pillow

Usage:
  python scripts/generate-thumbnails.py
"""

from PIL import Image
import os
import sys

# Configuration
THUMBNAIL_SIZE = (400, 200)
THUMBNAIL_QUALITY = 80

# Panoramas à traiter
PANORAMAS = {
    'paris': [
        'eiffel-tower',
        'louvre',
        'arc-triomphe',
        'notre-dame',
        'sacre-coeur'
    ],
    'barcelona': [
        'sagrada-familia',
        'park-guell',
        'casa-batllo',
        'la-rambla',
        'barceloneta'
    ]
}

def create_thumbnail(input_path, output_path):
    """Créer un thumbnail à partir d'une image source"""
    try:
        print(f"  📸 Traitement: {os.path.basename(input_path)}")

        # Ouvrir l'image
        with Image.open(input_path) as img:
            # Afficher les dimensions originales
            print(f"     Original: {img.size[0]}x{img.size[1]}")

            # Créer le thumbnail
            img.thumbnail(THUMBNAIL_SIZE, Image.Resampling.LANCZOS)

            # Sauvegarder
            img.save(output_path, 'JPEG', quality=THUMBNAIL_QUALITY, optimize=True)

            print(f"     ✅ Thumbnail créé: {THUMBNAIL_SIZE[0]}x{THUMBNAIL_SIZE[1]}")
            return True

    except FileNotFoundError:
        print(f"     ⚠️  Fichier non trouvé - Skipper")
        return False
    except Exception as e:
        print(f"     ❌ Erreur: {e}")
        return False

def main():
    """Générer tous les thumbnails"""
    print("🎨 === GÉNÉRATEUR DE THUMBNAILS VR ===\n")

    # Répertoire de base
    base_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'panoramas')

    if not os.path.exists(base_dir):
        print(f"❌ Répertoire non trouvé: {base_dir}")
        print("   Assurez-vous d'être dans le bon répertoire!")
        return 1

    total_created = 0
    total_skipped = 0

    # Traiter chaque ville
    for city, scenes in PANORAMAS.items():
        print(f"\n📍 {city.upper()}")
        print(f"   {len(scenes)} scènes à traiter\n")

        city_dir = os.path.join(base_dir, city)
        thumbnails_dir = os.path.join(city_dir, 'thumbnails')

        # Créer le dossier thumbnails si nécessaire
        os.makedirs(thumbnails_dir, exist_ok=True)

        # Traiter chaque scène
        for scene in scenes:
            input_file = os.path.join(city_dir, f'{scene}.jpg')
            output_file = os.path.join(thumbnails_dir, f'{scene}-thumb.jpg')

            if create_thumbnail(input_file, output_file):
                total_created += 1
            else:
                total_skipped += 1

    # Résumé
    print(f"\n{'='*50}")
    print(f"✅ Thumbnails créés: {total_created}")
    print(f"⚠️  Fichiers skippés: {total_skipped}")
    print(f"{'='*50}\n")

    if total_skipped > 0:
        print("💡 Les fichiers skippés n'ont pas encore été téléchargés.")
        print("   Consultez DOWNLOAD_PANORAMAS.md pour les instructions.\n")

    return 0

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Annulé par l'utilisateur")
        sys.exit(1)
