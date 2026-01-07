# 🌍 Guide des Environnements VR

Ce document liste tous les environnements VR disponibles et comment ajouter les panoramas.

## 📍 Environnements Disponibles

### 🗼 Paris (DR-74)
**ID**: `paris`
**Aliases**: `PAR`, `CDG`, `france`
**Scène par défaut**: Tour Eiffel

**5 Scènes** :
1. **Tour Eiffel** - Vue depuis le Champ de Mars
2. **Musée du Louvre** - La pyramide et le palais
3. **Arc de Triomphe** - Sommet des Champs-Élysées
4. **Notre-Dame** - Cathédrale gothique
5. **Sacré-Cœur** - Basilique de Montmartre

### 🏖️ Barcelona (DR-79)
**ID**: `barcelona`
**Aliases**: `BCN`, `spain`, `catalonia`
**Scène par défaut**: Sagrada Família

**5 Scènes** :
1. **Sagrada Família** - Chef-d'œuvre de Gaudí
2. **Park Güell** - Jardin avec mosaïques colorées
3. **Casa Batlló** - Maison moderniste Gaudí
4. **La Rambla** - Avenue piétonne animée
5. **Barceloneta** - Plage méditerranéenne

---

## 📂 Structure des Fichiers

```
panorama/
└── public/
    └── panoramas/
        ├── paris/
        │   ├── eiffel-tower.jpg
        │   ├── louvre.jpg
        │   ├── arc-triomphe.jpg
        │   ├── notre-dame.jpg
        │   ├── sacre-coeur.jpg
        │   └── thumbnails/
        │       └── *.jpg
        └── barcelona/
            ├── sagrada-familia.jpg
            ├── park-guell.jpg
            ├── casa-batllo.jpg
            ├── la-rambla.jpg
            ├── barceloneta.jpg
            └── thumbnails/
                └── *.jpg
```

## 📸 Spécifications des Images

**Format** : JPEG (.jpg)
**Projection** : Équirectangulaire (360° × 180°)
**Ratio** : 2:1 (largeur:hauteur)
**Taille recommandée** : 8192×4096px (optimisé automatiquement)
**Qualité** : 90-95% JPEG

### Thumbnails
**Dimensions** : 400×200px
**Qualité** : 80%

## 🎨 Sources d'Images 360°

### Gratuites
- **Flickr** : `equirectangular [ville]`
- **Pixabay 360** : Licence commerciale
- **Pexels 360** : Haute qualité

### Payantes
- **Adobe Stock 360**
- **Shutterstock 360**

## 🚀 Comment Utiliser

### 1. Depuis l'URL directe
```
http://localhost:3006?environment=paris
http://localhost:3006?environment=barcelona
```

### 2. Via le QR Code (depuis web-client)
1. Aller sur `/destination/paris` ou `/destination/barcelona`
2. Cliquer "Explorer en VR"
3. Scanner le QR code

### 3. Depuis le code
```javascript
import { getVREnvironment } from './data/environments';

const parisEnv = getVREnvironment('paris');
const barcelonaEnv = getVREnvironment('BCN'); // Via alias
```

## ➕ Ajouter un Nouvel Environnement

### 1. Créer le fichier de données
```javascript
// src/data/tokyo-environment.js
export const tokyoEnvironment = {
  id: 'tokyo',
  name: 'Tokyo',
  description: '...',
  defaultScene: 'shibuya',
  scenes: [
    {
      id: 'shibuya',
      name: 'Shibuya Crossing',
      panoramaUrl: '/panoramas/tokyo/shibuya.jpg',
      hotspots: [...]
    }
    // ... autres scènes
  ],
  settings: { ... },
  resources: { ... }
};
```

### 2. Enregistrer dans le registre
```javascript
// src/data/environments.js
import tokyoEnvironment from './tokyo-environment';

export const VR_ENVIRONMENTS = {
  'paris': parisEnvironment,
  'barcelona': barcelonaEnvironment,
  'tokyo': tokyoEnvironment, // ← Ajouter ici
};

export const ENVIRONMENT_ALIASES = {
  // ...
  'NRT': 'tokyo', // ← Ajouter alias
  'HND': 'tokyo',
};
```

### 3. Ajouter les panoramas
```bash
mkdir -p public/panoramas/tokyo/thumbnails
# Copier vos images 360° dans ce dossier
```

### 4. Créer le composant (optionnel)
```javascript
// src/components/TokyoEnvironment.js
// Similaire à ParisEnvironment.js
```

## 🎯 Hotspots

### Types disponibles
- **`info`** : Point d'information (orange)
- **`teleport`** : Téléportation vers autre scène (vert)

### Structure
```javascript
{
  id: 'unique-id',
  type: 'info' | 'teleport',
  position: [x, y, z], // Position 3D
  title: 'Titre',
  description: 'Description',
  icon: '🎨', // Emoji
  targetScene: 'scene-id', // Pour teleport
  distance: '2.5 km', // Optionnel
  audioUrl: '/audio/...' // Optionnel
}
```

## 🔧 Configuration des Environnements

```javascript
settings: {
  skyColor: '#87CEEB',           // Couleur du ciel
  ambientLightIntensity: 0.7,    // Intensité lumière ambiante
  enableAudio: true,             // Audio activé
  enableMinimap: true,           // Mini-carte
  defaultTransitionDuration: 1000, // ms
  hotspotInteractionDistance: 3,   // mètres
}
```

## 📊 Statistiques

- **Environnements disponibles** : 2 (Paris, Barcelona)
- **Total scènes** : 10
- **Total hotspots** : 30+
- **Destinations supportées** : Extensible à l'infini

## 🐛 Dépannage

### L'environnement ne charge pas
```javascript
// Vérifier dans la console
import { hasVREnvironment } from './data/environments';
console.log(hasVREnvironment('paris')); // true ou false
```

### Image panorama manquante
1. Vérifier le chemin : `/panoramas/[ville]/[scene].jpg`
2. Vérifier les permissions
3. Vérifier le format (JPEG uniquement)

### Hotspots invisibles
- Vérifier la position `[x, y, z]`
- Vérifier que `y` est entre 0 et 3 (hauteur des yeux)
- Vérifier que `z` est négatif (devant la caméra)

---

**Tickets** : DR-74 (Paris), DR-79 (Barcelona)
**Prochains** : DR-80 (Intégration Recommandations)
