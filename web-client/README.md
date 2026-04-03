# DreamScape Web Client

> **Application React** — Interface utilisateur principale de la plateforme DreamScape

- **Port** : 5173 (dev Vite) 
- **API** : via API Gateway (`http://localhost:4000`)
- **Auth state** : `localStorage` (clé `auth-storage`)

## Stack technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 18.3 | Framework UI |
| TypeScript | 5.5 | Type safety |
| Vite | 5.4 | Build tool & dev server |
| Tailwind CSS | 3.4 | Styling utilitaire |
| Zustand | — | État global |
| React Context | — | État d'authentification |
| React Router | v6 | Routing |
| React Query | — | Cache & synchronisation API |
| Framer Motion | 11 | Animations |
| @dnd-kit | — | Drag & Drop (panier, itinéraires) |
| Mapbox GL | — | Cartes interactives |
| @stripe/react-stripe-js | — | Composants paiement |
| i18next | — | Internationalisation FR/EN |
| Vitest | — | Tests unitaires |
| Cypress | — | Tests E2E |

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev       # http://localhost:5173
```

## Scripts

```bash
npm run dev          # Dev server Vite
npm run build        # Build production
npm run preview      # Preview build locale
npm run lint         # ESLint
npm run lint:fix     # Auto-fix ESLint
npm run typecheck    # Vérification TypeScript
npm test             # Tests unitaires (Vitest)
npm run test:coverage # Coverage
npm run cypress:run  # Tests E2E headless
npm run cypress:open # Tests E2E interactif
```

## Structure

```
src/
├── components/
│   ├── common/          # Boutons, modales, formulaires, etc.
│   ├── auth/            # Login, register, guard routes
│   ├── voyage/          # Recherche, résultats, panier
│   ├── panorama/        # Accès expérience VR
│   ├── profile/         # Profil, onboarding, favoris
│   ├── gdpr/            # CookieConsent, ConsentManager, DataRights
│   ├── notifications/   # Composants notifications temps réel
│   └── admin/           # Interface admin
├── pages/               # Composants de page (routes)
├── hooks/               # Custom hooks (useAuth, useCart, etc.)
├── services/            # Classes API (AuthService, VoyageService, etc.)
├── store/               # Stores Zustand
│   ├── authStore.ts
│   ├── cartStore.ts
│   ├── voyageStore.ts
│   ├── recommendationStore.ts
│   └── notificationStore.ts
├── types/               # Interfaces TypeScript partagées
├── utils/               # Helpers (dates, formatage, etc.)
├── i18n/                # Configuration i18next + traductions
│   └── locales/
│       ├── fr/
│       └── en/
├── App.tsx
└── main.tsx
```

## Communication API

Toutes les requêtes passent par le Gateway (`VITE_API_URL`) :

```typescript
// src/services/AuthService.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  withCredentials: true,
})

// Intercepteur — ajoute le Bearer token automatiquement
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

## State Management (Zustand)

Les stores Zustand gèrent l'état global par domaine :

| Store | Contenu |
|-------|---------|
| `authStore` | token, user, isAuthenticated, login/logout |
| `cartStore` | items, total, checkout |
| `voyageStore` | searchResults, selectedFlight/hotel, bookings |
| `recommendationStore` | recommendations, loadingState |
| `notificationStore` | notifications non-lues, Socket.io |

L'état auth est persisté en localStorage (clé `auth-storage`).

## Internationalisation

```typescript
import { useTranslation } from 'react-i18next'

const MyComponent = () => {
  const { t, i18n } = useTranslation()
  
  return (
    <div>
      <p>{t('search.placeholder')}</p>
      <button onClick={() => i18n.changeLanguage('en')}>EN</button>
      <button onClick={() => i18n.changeLanguage('fr')}>FR</button>
    </div>
  )
}
```

Les traductions sont dans `src/i18n/locales/fr/` et `src/i18n/locales/en/`.

## Variables d'environnement

```env
VITE_API_URL=http://localhost:4000
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiZHJlYW1zY2FwZSIsImE...
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
VITE_PANORAMA_URL=http://localhost:3006
```

## Notifications temps réel

Le web client se connecte au User Service via Socket.io pour les notifications :

```typescript
import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3002', {
  auth: { token: `Bearer ${token}` }
})

socket.on('notification', (data) => {
  notificationStore.getState().addNotification(data)
})
```

## Pages principales

| Route | Page |
|-------|------|
| `/` | Home / Landing |
| `/auth/login` | Connexion |
| `/auth/register` | Inscription |
| `/search/flights` | Recherche vols |
| `/search/hotels` | Recherche hôtels |
| `/search/activities` | Recherche activités |
| `/cart` | Panier |
| `/checkout` | Paiement Stripe |
| `/bookings` | Mes réservations |
| `/profile` | Profil & préférences |
| `/onboarding` | Questionnaire voyage IA |
| `/recommendations` | Recommandations IA |
| `/panorama` | Expérience VR |
| `/privacy` | Politique RGPD |
| `/admin` | Administration |

## Tests

```bash
# Unitaires (Vitest + React Testing Library)
npm test
npm run test:coverage    # Seuil cible : 80%

# E2E (Cypress)
npm run cypress:run      # Headless (CI)
npm run cypress:open     # Interactif
```

## Déploiement

```bash
# Build
npm run build    # Output dans dist/

# Déploiement automatique via CI/CD
# main → Cloudflare Pages (production)
# PR → Cloudflare Pages (preview)
```

---

*Propriétaire et confidentiel © DreamScape 2025*
