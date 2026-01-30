# 🗼 Guide des Panoramas VR - Paris

Ce document explique comment ajouter des images panoramiques 360° pour l'environnement VR de Paris.

## 📂 Structure des Fichiers

```
panorama/
└── public/
    └── panoramas/
        └── paris/
            ├── eiffel-tower.jpg      # Tour Eiffel
            ├── louvre.jpg            # Musée du Louvre
            ├── arc-triomphe.jpg      # Arc de Triomphe
            ├── notre-dame.jpg        # Notre-Dame
            ├── sacre-coeur.jpg       # Sacré-Cœur
            ├── thumbnails/
            │   ├── eiffel-tower-thumb.jpg
            │   ├── louvre-thumb.jpg
            │   ├── arc-triomphe-thumb.jpg
            │   ├── notre-dame-thumb.jpg
            │   └── sacre-coeur-thumb.jpg
            └── audio/
                ├── eiffel-tower.mp3
                ├── louvre.mp3
                ├── arc-triomphe.mp3
                ├── notre-dame.mp3
                └── sacre-coeur.mp3
```

## 📸 Spécifications des Images

### Images Panoramiques Principales

**Format** : JPEG (.jpg)
**Projection** : Équirectangulaire (360° × 180°)
**Ratio** : 2:1 (ex: 8192×4096px, 4096×2048px)
**Taille recommandée** :
- Optimale : 8192×4096px (sera automatiquement redimensionné si nécessaire)
- Minimum : 4096×2048px
- Maximum : 16384×8192px (sera automatiquement optimisé)

**Qualité** :
- 90-95% pour JPEG
- Éviter la compression excessive (artéfacts visibles)

### Thumbnails (Vignettes)

**Dimensions** : 400×200px
**Format** : JPEG
**Qualité** : 80%
**Usage** : Navigation et aperçus

## 🎨 Sources d'Images 360°

### Options Gratuites

1. **Flickr** (Recherche "equirectangular paris")
   - Licence : Creative Commons
   - Qualité : Variable
   - URL : https://www.flickr.com/search/?text=equirectangular%20paris

2. **Pixabay / Pexels 360**
   - Licence : Gratuite pour usage commercial
   - Qualité : Bonne

3. **Google Street View** (Utilisation limitée)
   - Peut être téléchargé pour usage non-commercial
   - Qualité : Excellente

### Options Payantes

1. **Adobe Stock 360**
   - Haute qualité professionnelle
   - Licence commerciale

2. **Shutterstock 360**
   - Large sélection
   - Diverses résolutions

## 🛠️ Conversion et Préparation

### Si vous avez des images non-équirectangulaires

Utilisez des outils comme :
- **Hugin** (gratuit, open-source)
- **PTGui** (payant, professionnel)
- **Adobe Photoshop** (avec plugin Panorama)

### Optimisation Automatique

⚡ **Bonne nouvelle** : L'application optimise automatiquement les images !

Le service `ImageResizer` :
- Détecte les limites WebGL de votre GPU
- Redimensionne automatiquement si nécessaire
- Conserve le ratio 2:1
- Économise la mémoire GPU

Vous pouvez donc fournir des images haute résolution sans souci.

## 📥 Installation des Panoramas

### Méthode 1 : Fichiers Locaux

1. Créer la structure de dossiers :
```bash
cd panorama/public
mkdir -p panoramas/paris/thumbnails
mkdir -p audio/paris
```

2. Copier vos images :
```bash
cp /path/to/your/eiffel-tower.jpg public/panoramas/paris/
cp /path/to/your/louvre.jpg public/panoramas/paris/
# ... etc
```

3. Générer les thumbnails (si nécessaire) :
```bash
# Exemple avec ImageMagick
convert eiffel-tower.jpg -resize 400x200 thumbnails/eiffel-tower-thumb.jpg
```

### Méthode 2 : CDN / URL Externe

Modifier le fichier `src/data/paris-environment.js` :

```javascript
scenes: [
  {
    id: 'eiffel-tower',
    name: 'Tour Eiffel',
    panoramaUrl: 'https://your-cdn.com/panoramas/eiffel-tower.jpg',
    // ...
  }
]
```

## 🎵 Fichiers Audio (Optionnel)

**Format** : MP3
**Bitrate** : 128-192 kbps
**Durée** : 30-60 secondes
**Contenu** : Description audio du lieu, ambiance

Placer dans `public/audio/paris/`

## ✅ Vérification

Après avoir ajouté vos images, vérifiez :

1. **Accessibilité** :
```bash
# Ouvrir dans un navigateur
http://localhost:3006/panoramas/paris/eiffel-tower.jpg
```

2. **Console** : Vérifier les logs de chargement
```
🖼️ === DÉBUT DU TRAITEMENT AUTOMATIQUE D'IMAGE AVANCÉ ===
📥 URL source: /panoramas/paris/eiffel-tower.jpg
📐 Dimensions originales: 8192 x 4096
...
```

3. **Performance** :
   - FPS > 30 (visible dans les stats VR)
   - Temps de chargement < 5s

## 🚨 Dépannage

### Image ne charge pas

1. Vérifier le chemin dans les outils de développement (F12)
2. Vérifier les permissions du fichier
3. Vérifier le format (doit être JPEG, pas PNG)

### Image floue ou pixelisée

1. Augmenter la résolution source
2. Vérifier la qualité JPEG (> 90%)
3. Vérifier que le ratio est bien 2:1

### Performance lente

1. Réduire la résolution (l'app optimisera automatiquement)
2. Vérifier la mémoire disponible
3. Utiliser le format JPEG (pas PNG)

## 📚 Ressources

- [Qu'est-ce qu'une image équirectangulaire ?](https://en.wikipedia.org/wiki/Equirectangular_projection)
- [Créer des panoramas 360°](https://www.adobe.com/creativecloud/photography/discover/360-photography.html)
- [Three.js VR Best Practices](https://threejs.org/docs/#manual/en/introduction/How-to-create-VR-content)

## 🎯 Prochaines Étapes

Une fois les panoramas ajoutés :
1. Tester l'environnement VR
2. Vérifier les transitions entre scènes
3. Tester les hotspots interactifs
4. Ajuster les positions des hotspots si nécessaire

---

**Ticket** : DR-74 (VR-003 - Environnement VR Paris)
**Documentation** : Cette implémentation utilise les services modulaires créés dans DR-250
