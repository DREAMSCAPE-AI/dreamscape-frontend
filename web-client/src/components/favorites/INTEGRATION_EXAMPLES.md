# Favorites Integration Examples

This document shows how to integrate the `FavoriteButton` component into existing DreamScape components.

## Basic Usage

```tsx
import FavoriteButton from '@/components/favorites/FavoriteButton';

// In your component
<FavoriteButton
  entityType="FLIGHT"
  entityId="flight-123"
  entityData={{
    flightNumber: "AA1234",
    origin: "JFK",
    destination: "LAX",
    price: "$350"
  }}
  onToggle={(isFavorited, favoriteId) => {
    console.log('Favorite toggled:', isFavorited, favoriteId);
  }}
/>
```

## Flight Search Results Integration

```tsx
// In src/pages/flights/index.tsx or FlightCard component

import FavoriteButton from '@/components/favorites/FavoriteButton';

const FlightCard = ({ flight }) => {
  return (
    <div className="flight-card relative">
      {/* Existing flight card content */}
      <div className="flight-info">
        <h3>{flight.airline} - {flight.flightNumber}</h3>
        <p>{flight.origin} → {flight.destination}</p>
        <p className="price">${flight.price}</p>
      </div>

      {/* Add Favorite Button */}
      <div className="absolute top-4 right-4">
        <FavoriteButton
          entityType="FLIGHT"
          entityId={flight.id}
          entityData={{
            flightNumber: flight.flightNumber,
            airline: flight.airline,
            origin: flight.origin,
            destination: flight.destination,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            price: flight.price,
            duration: flight.duration
          }}
          size="md"
        />
      </div>
    </div>
  );
};
```

## Hotel Listing Integration

```tsx
// In src/pages/hotels/index.tsx or HotelCard component

import FavoriteButton from '@/components/favorites/FavoriteButton';

const HotelCard = ({ hotel }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
      {/* Hotel Image */}
      <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover" />

      {/* Favorite Button Overlay */}
      <div className="absolute top-2 right-2">
        <FavoriteButton
          entityType="HOTEL"
          entityId={hotel.id}
          entityData={{
            hotelName: hotel.name,
            location: hotel.location,
            city: hotel.city,
            rating: hotel.rating,
            pricePerNight: hotel.price,
            image: hotel.image,
            amenities: hotel.amenities
          }}
          size="md"
        />
      </div>

      {/* Hotel Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg">{hotel.name}</h3>
        <p className="text-gray-600">{hotel.location}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-orange-500 font-bold">${hotel.price}/night</span>
          <span className="text-sm text-gray-500">⭐ {hotel.rating}</span>
        </div>
      </div>
    </div>
  );
};
```

## Destination Card Integration

```tsx
// In src/pages/destinations/index.tsx or DestinationCard component

import FavoriteButton from '@/components/favorites/FavoriteButton';

const DestinationCard = ({ destination }) => {
  return (
    <div className="destination-card group relative overflow-hidden rounded-lg">
      {/* Background Image */}
      <div
        className="h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${destination.image})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all" />

        {/* Favorite Button */}
        <div className="absolute top-4 right-4 z-10">
          <FavoriteButton
            entityType="DESTINATION"
            entityId={destination.id}
            entityData={{
              destinationName: destination.name,
              country: destination.country,
              description: destination.description,
              image: destination.image,
              highlights: destination.highlights,
              bestTimeToVisit: destination.bestTimeToVisit
            }}
            size="lg"
          />
        </div>

        {/* Destination Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl font-bold">{destination.name}</h3>
          <p className="text-sm opacity-90">{destination.country}</p>
        </div>
      </div>
    </div>
  );
};
```

## Activity Card Integration

```tsx
// In src/pages/activities/index.tsx or ActivityCard component

import FavoriteButton from '@/components/favorites/FavoriteButton';

const ActivityCard = ({ activity }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={activity.image}
          alt={activity.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />

        {/* Favorite Button */}
        <div className="absolute top-3 right-3">
          <FavoriteButton
            entityType="ACTIVITY"
            entityId={activity.id}
            entityData={{
              activityName: activity.name,
              location: activity.location,
              description: activity.description,
              duration: activity.duration,
              price: activity.price,
              category: activity.category,
              image: activity.image
            }}
            size="md"
          />
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{activity.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{activity.location}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-green-600 font-medium">${activity.price}</span>
          <span className="text-xs text-gray-500">{activity.duration}</span>
        </div>
      </div>
    </div>
  );
};
```

## Booking Details Integration

```tsx
// In booking confirmation or details page

import FavoriteButton from '@/components/favorites/FavoriteButton';

const BookingDetails = ({ booking }) => {
  return (
    <div className="booking-details p-6 bg-white rounded-lg shadow">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Booking #{booking.id}</h2>
          <p className="text-gray-600">Confirmation Code: {booking.confirmationCode}</p>
        </div>

        {/* Save Booking to Favorites */}
        <FavoriteButton
          entityType="BOOKING"
          entityId={booking.id}
          entityData={{
            bookingId: booking.id,
            confirmationCode: booking.confirmationCode,
            type: booking.type, // flight, hotel, activity
            destination: booking.destination,
            startDate: booking.startDate,
            endDate: booking.endDate,
            totalPrice: booking.totalPrice,
            status: booking.status
          }}
          size="lg"
          showText
        />
      </div>

      {/* Rest of booking details */}
    </div>
  );
};
```

## With Custom Callback

```tsx
import FavoriteButton from '@/components/favorites/FavoriteButton';
import { toast } from 'react-hot-toast'; // or your preferred notification library

const MyComponent = ({ item }) => {
  const handleFavoriteToggle = (isFavorited: boolean, favoriteId?: string) => {
    if (isFavorited) {
      toast.success('Added to favorites!');
      // Track analytics event
      analytics.track('favorite_added', {
        entityType: item.type,
        entityId: item.id
      });
    } else {
      toast.info('Removed from favorites');
      // Track analytics event
      analytics.track('favorite_removed', {
        favoriteId
      });
    }
  };

  return (
    <FavoriteButton
      entityType={item.type}
      entityId={item.id}
      entityData={item.data}
      onToggle={handleFavoriteToggle}
    />
  );
};
```

## Button Sizes

The component supports three sizes:

- `sm`: Small button (w-4 h-4 icon, p-1.5 button)
- `md`: Medium button (w-5 h-5 icon, p-2 button) - Default
- `lg`: Large button (w-6 h-6 icon, p-2.5 button)

```tsx
// Small - for compact layouts
<FavoriteButton size="sm" {...props} />

// Medium - default, for most use cases
<FavoriteButton size="md" {...props} />

// Large - for hero sections or prominent placement
<FavoriteButton size="lg" {...props} />
```

## With Text Label

```tsx
<FavoriteButton
  entityType="DESTINATION"
  entityId="paris-123"
  entityData={{ destinationName: "Paris" }}
  showText
  size="lg"
/>
// Displays "Favorite" or "Favorited" text next to icon
```

## Best Practices

1. **Entity Data**: Always include descriptive information in `entityData` for better display on the Favorites page
2. **Unique IDs**: Ensure `entityId` is unique and stable across page loads
3. **Loading States**: The button handles its own loading states during API calls
4. **Error Handling**: Errors are logged to console; consider adding global error handling
5. **Optimistic Updates**: The button updates immediately for better UX, reverting on error
6. **Positioning**: Use absolute positioning for overlay on cards/images
7. **Size Selection**: Choose size based on card dimensions and visual hierarchy

## Common entityData Structures

### Flight
```tsx
{
  flightNumber: string,
  airline: string,
  origin: string,
  destination: string,
  departureTime: string,
  arrivalTime: string,
  price: number,
  duration: string
}
```

### Hotel
```tsx
{
  hotelName: string,
  location: string,
  city: string,
  rating: number,
  pricePerNight: number,
  image: string,
  amenities: string[]
}
```

### Destination
```tsx
{
  destinationName: string,
  country: string,
  description: string,
  image: string,
  highlights: string[],
  bestTimeToVisit: string
}
```

### Activity
```tsx
{
  activityName: string,
  location: string,
  description: string,
  duration: string,
  price: number,
  category: string,
  image: string
}
```

### Booking
```tsx
{
  bookingId: string,
  confirmationCode: string,
  type: string,
  destination: string,
  startDate: string,
  endDate: string,
  totalPrice: number,
  status: string
}
```
