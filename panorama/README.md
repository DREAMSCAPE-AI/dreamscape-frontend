# DreamScape Panorama

> **Service VR/3D** — Expériences immersives 360° et réalité virtuelle pour la plateforme DreamScape

## Présentation

Le service Panorama offre des expériences de voyage immersives basées sur WebGL et WebXR. Il permet aux utilisateurs de découvrir des destinations en vue à 360° et en réalité virtuelle (Meta Quest 3).

- **Port** : 3006
- **Type** : React application (Create React App)
- **Basename** : `/panorama`

## Stack technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 18.2 | Framework UI |
| TypeScript | 4.9.5 | Type safety |
| Three.js | 0.155 | Moteur 3D WebGL |
| @react-three/fiber | 8.13.7 | Renderer Three.js pour React |
| @react-three/drei | 9.83.7 | Helpers & abstractions Three.js |
| @react-three/xr | 5.6.0 | Support OpenXR / WebXR |

## Quick Start

```bash
# Installation
npm install

# Développement local (accessible depuis le réseau)
npm run dev          # http://localhost:3006 (host 0.0.0.0)
npm run start-local  # http://localhost:3006 (localhost uniquement)

# Mode VR (exposé réseau pour casque Quest)
npm run start-vr     # http://0.0.0.0:3006

# Build de production
npm run build        # Output dans build/
```

## Structure du projet

```
panorama/
├── src/
│   ├── components/     # Composants Three.js / XR
│   ├── scenes/         # Scènes 3D et panoramas
│   ├── hooks/          # Hooks React personnalisés
│   ├── utils/          # Utilitaires WebGL
│   └── App.tsx         # Point d'entrée React
├── public/
│   └── panoramas/      # Fichiers panoramiques (images 360°, HDR)
├── package.json
└── tsconfig.json
```

## Fonctionnalités

- **Vues 360°** — Navigation panoramique dans des destinations de voyage
- **Rendu WebGL** — Performances haute qualité via Three.js
- **Support VR** — Compatible Meta Quest 3 via WebXR / OpenXR (`@react-three/xr`)
- **Interactions immersives** — Points d'intérêt, hotspots, transitions entre scènes
- **Mode desktop** — Navigation souris/clavier pour les utilisateurs sans casque VR

## Développement VR (Meta Quest 3)

Pour tester sur casque Meta Quest 3 :

1. Démarrer le service en mode réseau :
   ```bash
   npm run start-vr
   ```
2. Connecter le Quest au même réseau Wi-Fi
3. Ouvrir le navigateur Meta Quest Browser
4. Naviguer vers `http://<IP_machine>:3006/panorama`
5. Le bouton "Enter VR" déclenchera la session WebXR

> Le casque requiert HTTPS en production. En développement, le navigateur Quest autorise HTTP sur réseau local.

## Variables d'environnement

```env
# Aucune variable obligatoire en développement local
# En production (optionnel) :
REACT_APP_API_URL=http://localhost:4000
REACT_APP_GATEWAY_URL=http://localhost:4000
```

## Intégration avec le Web Client

Le service Panorama est accessible depuis le web-client via une iframe ou redirection :

```typescript
// Depuis web-client — navigation vers un panorama
window.location.href = '/panorama?destination=paris'

// Ou via le Gateway
// GET /panoramas/:id → proxifié vers localhost:3006
```

## Build & Déploiement

```bash
# Build production
npm run build

# Docker (depuis dreamscape-infra/)
docker-compose -f docker/docker-compose.experience-pod.yml up -d
```

L'image Docker est publiée sur `ghcr.io/dreamscape-ai/panorama`.

## Tests

```bash
# Tests unitaires (React Testing Library)
npm test

# Tests en mode watch
npm test -- --watchAll
```

---

*Propriétaire et confidentiel © DreamScape 2025*
