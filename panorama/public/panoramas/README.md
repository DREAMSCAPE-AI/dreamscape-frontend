# 📸 Panoramas VR Directory

Placez vos images panoramiques 360° ici.

## Structure

```
panoramas/
├── paris/
│   ├── eiffel-tower.jpg (8192x4096)
│   ├── louvre.jpg
│   ├── arc-triomphe.jpg
│   ├── notre-dame.jpg
│   ├── sacre-coeur.jpg
│   └── thumbnails/
│       ├── eiffel-tower-thumb.jpg (400x200)
│       └── ...
└── barcelona/
    ├── sagrada-familia.jpg
    ├── park-guell.jpg
    ├── casa-batllo.jpg
    ├── la-rambla.jpg
    ├── barceloneta.jpg
    └── thumbnails/
        └── ...
```

## Instructions

Consultez `DOWNLOAD_PANORAMAS.md` à la racine du projet panorama pour :
- Où télécharger des images 360° gratuites
- Comment générer les thumbnails
- Comment tester les panoramas

## Quick Start

```bash
# Générer des placeholders pour tester
bash scripts/generate-placeholders.sh

# Générer les thumbnails
python scripts/generate-thumbnails.py
```
