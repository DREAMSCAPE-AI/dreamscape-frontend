# Favorites Management Feature (DR-84)

Complete frontend implementation for managing user favorites in DreamScape.

## Overview

The Favorites Management feature allows users to save and organize their favorite travel items (flights, hotels, activities, destinations, and bookings) for quick access later.

## Components

### 1. FavoriteButton (`FavoriteButton.tsx`)
Reusable heart button component for adding/removing items from favorites.

**Features:**
- Animated heart icon (filled when favorited)
- Optimistic UI updates
- Loading states
- Automatic favorite status checking
- Three size variants (sm, md, lg)
- Optional text label

**Props:**
```typescript
interface FavoriteButtonProps {
  entityType: FavoriteType;        // FLIGHT, HOTEL, ACTIVITY, DESTINATION, BOOKING
  entityId: string;                // Unique identifier for the entity
  entityData: FavoriteEntityData;  // JSON data to cache entity information
  onToggle?: (isFavorited: boolean, favoriteId?: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}
```

### 2. FavoritesPage (`pages/favorites/index.tsx`)
Main page for viewing and managing all favorites.

**Features:**
- Filter tabs by entity type (All, Flights, Hotels, Activities, Destinations, Bookings)
- Responsive grid layout (1-3 columns)
- Color-coded cards by entity type
- Edit notes and categories
- Delete with confirmation
- Empty states
- Loading and error states
- Add new favorites manually

### 3. AddFavoriteModal (`AddFavoriteModal.tsx`)
Modal for manually adding favorites.

**Features:**
- Entity type selector
- Entity ID input
- Category field (optional)
- Notes textarea (optional)
- Form validation
- Loading states

### 4. EditFavoriteModal (`EditFavoriteModal.tsx`)
Modal for editing favorite notes and categories.

**Features:**
- Update category
- Update notes
- Character count (500 max)
- Loading states
- Validation

## Service Layer

### FavoritesService (`services/favoritesService.ts`)

**Methods:**
- `getFavorites(params?)` - List favorites with optional filters
- `getFavorite(id)` - Get specific favorite
- `addFavorite(data)` - Add new favorite
- `updateFavorite(id, data)` - Update favorite
- `deleteFavorite(id)` - Remove favorite
- `checkFavorite(entityType, entityId)` - Check if favorited

**Features:**
- Axios instance with interceptors
- JWT authentication from localStorage
- Automatic 401 redirect to auth
- Comprehensive error handling
- TypeScript type safety

## Type Definitions

### Core Types (`types/favorites.ts`)

```typescript
type FavoriteType = 'FLIGHT' | 'HOTEL' | 'ACTIVITY' | 'DESTINATION' | 'BOOKING';

interface Favorite {
  id: string;
  userId: string;
  entityType: FavoriteType;
  entityId: string;
  entityData: FavoriteEntityData;
  category?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface FavoriteEntityData {
  [key: string]: any;
}
```

## Routing

Added to `App.tsx`:
```typescript
<Route path="/favorites" element={
  <OnboardingGuard requireOnboarding={false}>
    <FavoritesPage />
  </OnboardingGuard>
} />
```

## Navigation Integration

Updated in `components/layout/Header.tsx`:
- Heart icon in top navigation (links to /favorites)
- "Favorites" menu item in user dropdown
- "History" menu item added to user dropdown

## Color Coding

Entity types have distinct color schemes:

- **FLIGHT**: Blue (`bg-blue-100 text-blue-700`)
- **HOTEL**: Purple (`bg-purple-100 text-purple-700`)
- **ACTIVITY**: Green (`bg-green-100 text-green-700`)
- **DESTINATION**: Orange (`bg-orange-100 text-orange-700`)
- **BOOKING**: Red (`bg-red-100 text-red-700`)

## API Integration

**Base URL:** `http://localhost:3002/api/v1/users/favorites`

**Authentication:** Bearer token from localStorage (`auth-storage`)

**Endpoints:**
- `GET /` - List favorites (with filters)
- `POST /` - Add favorite
- `GET /:id` - Get favorite
- `PUT /:id` - Update favorite
- `DELETE /:id` - Delete favorite
- `GET /check/:entityType/:entityId` - Check if favorited

## Usage Examples

### Adding FavoriteButton to a Card

```tsx
import FavoriteButton from '@/components/favorites/FavoriteButton';

<div className="card relative">
  <div className="absolute top-4 right-4">
    <FavoriteButton
      entityType="HOTEL"
      entityId="hotel-123"
      entityData={{
        hotelName: "Grand Hotel",
        location: "Paris, France",
        price: 250,
        rating: 4.5
      }}
    />
  </div>
  {/* Card content */}
</div>
```

### Navigating to Favorites Page

```tsx
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

<Link to="/favorites" className="nav-link">
  <Heart className="w-5 h-5" />
  My Favorites
</Link>
```

## Design Patterns

1. **Consistent with History Page**: Follows same layout and styling patterns
2. **Mobile-First**: Responsive grid that adapts to screen size
3. **Optimistic UI**: Immediate feedback on actions
4. **Error Boundaries**: Graceful error handling
5. **Loading States**: Skeleton loaders and spinners
6. **Empty States**: Helpful messages when no data
7. **Confirmation Dialogs**: Prevent accidental deletions

## Testing Checklist

- [ ] Favorite button toggles correctly
- [ ] Favorite status persists across page reloads
- [ ] Filter tabs show correct counts
- [ ] Grid layout responsive on mobile/tablet/desktop
- [ ] Edit modal updates notes and categories
- [ ] Delete confirmation works
- [ ] Empty state displays correctly
- [ ] Loading states show during API calls
- [ ] Error messages display on failures
- [ ] Navigation links work from header and user menu
- [ ] Color coding matches entity types
- [ ] Add favorite modal validates inputs

## Future Enhancements

1. **Collections**: Group favorites into custom collections
2. **Sharing**: Share favorite lists with other users
3. **Bulk Actions**: Select multiple favorites for batch operations
4. **Sorting**: Sort by date, name, type
5. **Search**: Search within favorites
6. **Export**: Export favorites as PDF or JSON
7. **Recommendations**: Suggest related items based on favorites
8. **Notifications**: Alert when favorited items have updates

## Files Created

```
src/
├── types/
│   └── favorites.ts                          # TypeScript types
├── services/
│   └── favoritesService.ts                   # API service layer
├── components/
│   └── favorites/
│       ├── FavoriteButton.tsx                # Reusable favorite button
│       ├── AddFavoriteModal.tsx              # Add favorite modal
│       ├── EditFavoriteModal.tsx             # Edit favorite modal
│       ├── README.md                         # This file
│       └── INTEGRATION_EXAMPLES.md           # Integration guide
└── pages/
    └── favorites/
        └── index.tsx                         # Main favorites page
```

## Dependencies

All dependencies already exist in the project:
- `react` & `react-dom`
- `react-router-dom` - Routing
- `axios` - HTTP client
- `lucide-react` - Icons
- `tailwindcss` - Styling

## Backend Requirements

Requires `user-service` (port 3002) running with the following endpoints implemented:
- `/api/v1/users/favorites` (all CRUD operations)
- JWT authentication enabled

See backend API documentation for details.

## Support

For questions or issues:
1. Check `INTEGRATION_EXAMPLES.md` for usage examples
2. Review `types/favorites.ts` for data structures
3. Inspect browser console for API errors
4. Verify backend service is running on port 3002
