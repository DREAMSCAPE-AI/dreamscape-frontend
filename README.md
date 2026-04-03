# DreamScape Frontend

> **Frontend Platform** — Interface utilisateur web, gateway API et expériences VR immersives

## Structure des applications

| Dossier | Description | Port |
|---------|-------------|------|
| `web-client/` | Application React principale | 5173 (dev) |
| `gateway/` | API Gateway & routage | 4000 (dev) / 3000 (Docker) |
| `panorama/` | Expérience VR 360° immersive | 3006 |

## Stack technique

### Web Client
- **React 18.3** — Library UI avec hooks
- **Vite 5.4** — Build tool & dev server rapide
- **TypeScript 5.5** — Type safety
- **Tailwind CSS 3.4** — Framework CSS utilitaire
- **Zustand** — État global
- **React Query** — Cache & synchronisation API
- **React Context** — État d'authentification
- **React Router v6** — Routing
- **Framer Motion 11** — Animations
- **@dnd-kit** — Drag & Drop
- **Mapbox GL** — Cartographie interactive
- **@stripe/react-stripe-js** — Paiements

### Panorama VR
- **Three.js 0.155** — Moteur 3D WebGL
- **@react-three/fiber** — Renderer Three.js pour React
- **@react-three/drei** — Helpers Three.js
- **@react-three/xr** — Support OpenXR / Meta Quest

### Gateway
- **Express 4.18** — Framework HTTP
- **http-proxy-middleware** — Proxy vers les microservices
- **helmet / CORS / rate-limit** — Sécurité
- **JWT + Redis** — Validation des tokens
- **Swagger UI** — Documentation API

## Quick Start

```bash
# Développement — toutes les apps
cd web-client && npm install && npm run dev     # :5173
cd gateway    && npm install && npm run dev     # :4000
cd panorama   && npm install && npm start       # :3006

# Build de production
cd web-client && npm run build
cd gateway    && npm run build
cd panorama   && npm run build
```

## Architecture

```
┌─────────────────┐    ┌──────────────────┐
│   Web Client    │───►│   API Gateway    │
│  React  (:5173) │    │  Express (:4000) │
└─────────────────┘    └──────────────────┘
         │                      │
         │                      ▼
    ┌──────────┐        ┌───────────────┐
    │ Panorama │        │   Backend     │
    │  VR/3D   │        │ Services      │
    │  (:3006) │        │ (3001–3005)   │
    └──────────┘        └───────────────┘
```

## Communication API

Le Web Client communique exclusivement via le Gateway (`VITE_API_URL`, défaut `http://localhost:4000`) :

```
/api/v1/auth/*           → Auth Service   (3001)
/api/v1/users/*          → User Service   (3002)
/api/v1/voyages/*        → Voyage Service (3003)
/api/v1/payment/*        → Payment Service (3004)
/api/v1/recommendations/* → AI Service    (3005)
/panoramas/*             → Panorama       (3006)
```

## Fonctionnalités principales

### Web Client
- Authentification (login/register, refresh tokens, auth context)
- Recherche voyage — vols, hôtels, activités (Amadeus)
- Panier & réservation multi-items
- Profil utilisateur, préférences, onboarding IA
- Dashboard personnalisé avec recommandations
- Gestion RGPD (consentements, export, suppression)
- Interface admin
- i18n FR/EN (i18next)
- Paiement Stripe intégré
- Cartes Mapbox GL

### Expérience Panoramique
- Vues 360° destinations en WebGL
- Support VR Meta Quest 3 (OpenXR)
- Navigation immersive 3D
- Points d'intérêt interactifs

### API Gateway
- Routage intelligent vers les microservices
- Validation JWT avec cache Redis
- Rate limiting
- CORS centralisé
- Documentation Swagger UI

## Tests

```bash
# Web Client — unitaires (Vitest)
cd web-client && npm test

# Web Client — E2E (Cypress)
cd web-client && npm run cypress:run     # headless
cd web-client && npm run cypress:open   # interactif

# Coverage
cd web-client && npm run test:coverage
```

## Variables d'environnement

**Web Client** (`.env.local`) :
```env
VITE_API_URL=http://localhost:4000
VITE_MAPBOX_TOKEN=pk.xxx
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
```

**Gateway** (`.env`) :
```env
PORT=4000
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
VOYAGE_SERVICE_URL=http://localhost:3003
PAYMENT_SERVICE_URL=http://localhost:3004
AI_SERVICE_URL=http://localhost:3005
JWT_SECRET=your-secret
REDIS_HOST=localhost
```

## Déploiement

- **Web Client** → Cloudflare Pages (build Vite)
- **Gateway** → Docker container (image `ghcr.io/dreamscape-ai/gateway`)
- **Panorama** → servi statiquement ou container dédié

```bash
# Docker (depuis dreamscape-infra/)
docker-compose -f docker/docker-compose.experience-pod.yml up -d
```

## Sécurité

- Content Security Policy via helmet
- HTTPS enforced en production
- Tokens JWT stockés en `localStorage` (clé `auth-storage`)
- Sanitisation des inputs côté client
- Variables d'environnement pour les clés API (jamais dans le repo)

## Contributing

1. Branch : `feature/frontend/description`
2. Développement composant → test unitaire → PR
3. Coverage cible > 80%
4. Conventional commits (`feat:`, `fix:`, `chore:`)
5. Code review requis avant merge

---

*Propriétaire et confidentiel © DreamScape 2025*
