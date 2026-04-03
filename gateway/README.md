# DreamScape API Gateway

> **Point d'entrée unique** — Proxy, authentification JWT, rate limiting et routage vers les microservices

- **Port** : 4000 (développement) / 3000 (Docker)
- **Base de route** : `/api/v1/<service>`
- **Docs Swagger** : `http://localhost:4000/docs`

## Responsabilités

- Point d'entrée unique pour le web client
- Validation des tokens JWT avec cache Redis
- Proxy vers les microservices backend
- Rate limiting global
- CORS centralisé
- Logging des requêtes

## Stack

| Technologie | Version | Rôle |
|-------------|---------|------|
| Express 4.18 | — | Framework HTTP |
| TypeScript | — | Type safety |
| http-proxy-middleware 2.0 | — | Proxy vers les services |
| jsonwebtoken | — | Validation JWT |
| Redis | — | Cache des tokens validés |
| express-rate-limit | — | Rate limiting |
| helmet | — | Headers de sécurité |
| swagger-ui-express | — | Documentation API |

## Routes proxifiées

| Route Gateway | Service cible | Port |
|---------------|---------------|------|
| `/api/v1/auth/**` | auth-service | 3001 |
| `/api/v1/users/**` | user-service | 3002 |
| `/api/v1/voyages/**` | voyage-service | 3003 |
| `/api/v1/payment/**` | payment-service | 3004 |
| `/api/v1/ai/**` | ai-service | 3005 |
| `/panoramas/**` | panorama | 3006 |

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev      # http://localhost:4000 (nodemon)
npm run build    # Compile TypeScript
npm start        # Production
```

## Variables d'environnement

```env
NODE_ENV=development
PORT=4000

# URLs des microservices
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
VOYAGE_SERVICE_URL=http://localhost:3003
PAYMENT_SERVICE_URL=http://localhost:3004
AI_SERVICE_URL=http://localhost:3005
PANORAMA_SERVICE_URL=http://localhost:3006

# Sécurité
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:5173

# Redis (cache validation JWT)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Architecture

```
Web Client (5173)
      │
      ▼
API Gateway (4000)
      │
      ├─ Helmet (security headers)
      ├─ CORS
      ├─ Rate Limiting
      ├─ JWT Validation (+ Redis cache)
      │
      ├──► Auth Service  (3001)   /api/v1/auth/**
      ├──► User Service  (3002)   /api/v1/users/**
      ├──► Voyage Service (3003)  /api/v1/voyages/**
      ├──► Payment Service (3004) /api/v1/payment/**
      ├──► AI Service    (3005)   /api/v1/ai/**
      └──► Panorama      (3006)   /panoramas/**
```

## Authentification

Le Gateway valide le JWT sur toutes les routes protégées avant de proxifier :

1. Extrait le token `Authorization: Bearer <token>`
2. Vérifie la signature avec `JWT_SECRET`
3. Cache le résultat dans Redis (TTL = durée restante du token)
4. Ajoute le header `x-user-id` pour les services en aval

Les routes publiques (login, register, health) bypasse la validation.

## Health check

```bash
curl http://localhost:4000/health

# Réponse
{
  "status": "healthy",
  "uptime": 123.45,
  "services": {
    "auth": "connected",
    "user": "connected",
    "voyage": "connected",
    "payment": "connected",
    "ai": "connected"
  },
  "cache": "connected"
}
```

## Déploiement Docker

```bash
# Depuis dreamscape-infra/
docker-compose -f docker/docker-compose.experience-pod.yml up -d
```

Image : `ghcr.io/dreamscape-ai/gateway:latest`

## Tests

```bash
npm test
npm run lint
```

---

*Propriétaire et confidentiel © DreamScape 2025*
