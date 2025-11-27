# DreamScape Onboarding System

Un système complet de questionnaire d'onboarding multi-étapes pour personnaliser l'expérience utilisateur.

## Fonctionnalités

✅ **13 étapes de questionnaire** avec navigation fluide
✅ **Sauvegarde automatique** à chaque étape
✅ **État persistant** avec Zustand + localStorage
✅ **API intégrée** avec gestion d'erreurs
✅ **Animations fluides** avec Framer Motion
✅ **Design responsive** mobile-first
✅ **Composants réutilisables** et modulaires
✅ **Types TypeScript** complets
✅ **Progress tracking** avec indicateur visuel

## Architecture

```
src/
├── components/onboarding/
│   ├── OnboardingWizard.tsx         # Composant principal
│   ├── OnboardingStepWrapper.tsx    # Wrapper pour étapes
│   ├── ProgressIndicator.tsx        # Barre de progression
│   ├── FormComponents.tsx           # Composants de formulaire
│   └── steps/
│       ├── DestinationsStep.tsx     # Étape destinations
│       ├── BudgetStep.tsx           # Étape budget
│       ├── TravelTypesStep.tsx      # Étape types de voyage
│       └── ... (10 autres étapes)
├── store/
│   └── onboardingStore.ts           # Store Zustand
├── services/
│   └── onboardingService.ts         # API client
├── types/
│   └── onboarding.ts                # Types TypeScript
└── pages/
    └── onboarding/
        └── index.tsx                # Page d'onboarding
```

## Utilisation

### 1. Navigation vers l'onboarding

```typescript
// Rediriger vers l'onboarding
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/onboarding');
```

### 2. Vérification du statut

```typescript
import useOnboardingStore from '@/store/onboardingStore';

const { progress, profile } = useOnboardingStore();

// Vérifier si complété
const isCompleted = progress?.progressPercentage === 100;

// Vérifier étapes complétées
const completedSteps = progress?.completedSteps || [];
```

### 3. Accès aux données du profil

```typescript
const { profile } = useOnboardingStore();

// Destinations préférées
const destinations = profile.preferredDestinations;

// Budget
const budget = profile.globalBudgetRange;

// Types de voyage
const travelTypes = profile.travelTypes;
```

## Endpoints API utilisés

```typescript
// GET /api/v1/users/onboarding - Récupérer profil
// PUT /api/v1/users/onboarding/step - Sauvegarder étape
// GET /api/v1/users/onboarding/progress - Progression
// POST /api/v1/users/onboarding/complete - Finaliser
// DELETE /api/v1/users/onboarding - Réinitialiser
```

## Composants personnalisables

### SelectableCard
```typescript
<SelectableCard
  id="luxury"
  title="Voyage de luxe"
  description="Expériences haut de gamme"
  icon={<Crown />}
  isSelected={selected}
  onToggle={handleToggle}
/>
```

### RangeSlider
```typescript
<RangeSlider
  min={500}
  max={10000}
  value={[1000, 5000]}
  onChange={setBudget}
  formatLabel={(val) => `${val}€`}
/>
```

### TagInput
```typescript
<TagInput
  value={destinations}
  onChange={setDestinations}
  suggestions={popularDestinations}
  placeholder="Ajoutez une destination..."
/>
```

## Personnalisation

### Ajouter une nouvelle étape

1. Créer le composant d'étape :
```typescript
// src/components/onboarding/steps/NewStep.tsx
const NewStep: React.FC = () => {
  const { profile, updateProfile } = useOnboardingStore();

  return (
    <OnboardingStepWrapper
      title="Nouvelle étape"
      description="Description de l'étape"
      icon="🆕"
    >
      {/* Contenu de l'étape */}
    </OnboardingStepWrapper>
  );
};
```

2. Ajouter dans `ONBOARDING_STEPS` :
```typescript
// src/types/onboarding.ts
{
  id: 'new-step',
  title: 'Nouvelle étape',
  description: 'Description',
  icon: '🆕',
  required: false,
  order: 14
}
```

3. Importer dans `OnboardingWizard.tsx` :
```typescript
case 'new-step':
  return <NewStep />;
```

### Modifier le style

```css
/* src/styles/onboarding.css */
.custom-step {
  /* Styles personnalisés */
}
```

## Gestion des erreurs

Le système gère automatiquement :
- **Erreurs réseau** avec retry automatique
- **Validation côté client** avant sauvegarde
- **Tokens expirés** avec redirection
- **Données corrompues** avec fallback

## Performance

- **Lazy loading** des étapes
- **Debounced saves** pour éviter les appels excessifs
- **Memoization** des composants lourds
- **Pagination** pour les grandes listes

## Tests

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run cypress:run
```

## Déploiement

Le système est automatiquement inclus dans le build de production. Assurez-vous que :

1. Les variables d'environnement API sont configurées
2. L'authentification fonctionne
3. Les endpoints backend sont accessibles

## Roadmap

- [ ] **Validation avancée** avec schémas
- [ ] **Étapes conditionnelles** basées sur les réponses
- [ ] **Import/export** de profils
- [ ] **A/B testing** des étapes
- [ ] **Analytics** détaillées
- [ ] **Support multilingue** complet