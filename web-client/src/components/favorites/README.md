# Favorites Components

Components for managing user favorites across the DreamScape platform.

## Components

### FavoriteButton

A reusable button component that allows users to add/remove items from their favorites.

**Props:**
- `entityType` (required): Type of entity (FLIGHT, HOTEL, ACTIVITY, DESTINATION, BOOKING)
- `entityId` (required): Unique identifier of the entity
- `entityData` (optional): Additional data to cache with the favorite
- `className` (optional): Additional CSS classes
- `size` (optional): Button size - 'sm', 'md', or 'lg' (default: 'md')
- `showLabel` (optional): Whether to show text label (default: false)

**Example Usage:**

```tsx
import { FavoriteButton } from '@/components/favorites';
import { FavoriteType } from '@/services/user/FavoritesService';

// In a Flight Card component
<FavoriteButton
  entityType={FavoriteType.FLIGHT}
  entityId={flight.id}
  entityData={{
    title: `${flight.origin} → ${flight.destination}`,
    origin: flight.origin,
    destination: flight.destination,
    price: flight.price,
    currency: flight.currency,
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
  }}
  size="md"
  className="absolute top-4 right-4"
/>

// In a Hotel Card component
<FavoriteButton
  entityType={FavoriteType.HOTEL}
  entityId={hotel.id}
  entityData={{
    name: hotel.name,
    location: hotel.location,
    pricePerNight: hotel.pricePerNight,
    currency: hotel.currency,
    rating: hotel.rating,
    amenities: hotel.amenities,
  }}
  size="sm"
/>

// In an Activity Card component
<FavoriteButton
  entityType={FavoriteType.ACTIVITY}
  entityId={activity.id}
  entityData={{
    title: activity.title,
    location: activity.location,
    price: activity.price,
    currency: activity.currency,
    description: activity.description,
  }}
  showLabel={true}
/>
```

## Favorites Page

The `/favorites` route displays all user favorites organized by category with filtering capabilities.

**Features:**
- View all favorites
- Filter by entity type (Flights, Hotels, Activities, Destinations)
- Delete favorites
- Display entity-specific data preview
- View categories and notes
- Empty state with CTA to explore destinations

## Integration Guide

### 1. Add FavoriteButton to existing card components

Find your card components (e.g., `FlightCard.tsx`, `HotelCard.tsx`, `ActivityCard.tsx`) and import the FavoriteButton:

```tsx
import { FavoriteButton } from '@/components/favorites';
import { FavoriteType } from '@/services/user/FavoritesService';
```

Add the button to your card layout:

```tsx
<div className="relative">
  {/* Existing card content */}

  {/* Add Favorite Button (position as needed) */}
  <FavoriteButton
    entityType={FavoriteType.FLIGHT} // or HOTEL, ACTIVITY, etc.
    entityId={item.id}
    entityData={{
      // Include relevant data for preview in favorites page
      title: item.title,
      ...item
    }}
    className="absolute top-2 right-2"
  />
</div>
```

### 2. Backend API

The favorites API is already implemented at `user-service`:

- `GET /api/v1/users/favorites` - Get all favorites
- `POST /api/v1/users/favorites` - Add favorite
- `GET /api/v1/users/favorites/:id` - Get specific favorite
- `PUT /api/v1/users/favorites/:id` - Update favorite
- `DELETE /api/v1/users/favorites/:id` - Delete favorite
- `GET /api/v1/users/favorites/check/:entityType/:entityId` - Check if favorited

### 3. Accessing the Favorites Page

Users can access their favorites through:
- Navigate to `/favorites`
- Click "Favorites" in the user menu (Header)
- Use the Heart icon in the navigation

## Criteria d'Acceptance (DR-84)

✅ **Ajout/suppression de favoris** - FavoriteButton component handles add/remove
✅ **Organisation par catégorie** - Favorites page filters by entity type
✅ **Comparaison côte à côte** - Grid layout displays favorites for visual comparison
✅ **Synchronisation multi-appareils** - Backend API stores favorites in database
✅ **Persistance des données** - PostgreSQL database with Prisma ORM

## Technical Details

- **Frontend Service**: `FavoritesService.ts` - Axios-based API client
- **Backend Routes**: `user/src/routes/favorites.ts`
- **Backend Controller**: `user/src/controllers/favoriteController.ts`
- **Database Model**: `Favorite` in `prisma/schema.prisma`
- **Authentication**: Required for all favorites endpoints
