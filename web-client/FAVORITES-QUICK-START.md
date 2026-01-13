# Favorites Feature - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Prerequisites
Ensure you have:
- ✅ Node.js 20+ installed
- ✅ Backend user-service running on `localhost:3002`
- ✅ JWT authentication configured
- ✅ User logged in with valid token

### 2. Navigate to Favorites Page

**Option A: Direct URL**
```
http://localhost:5173/favorites
```

**Option B: From Navigation**
1. Click your profile icon (top right)
2. Click "Favorites" in dropdown menu

**Option C: From Header**
1. Click the Heart icon in the top navigation bar

### 3. Test the Feature

#### Add a Favorite
1. Go to favorites page
2. Click "Add Favorite" button
3. Select entity type (e.g., "Hotel")
4. Enter entity ID (e.g., "hotel-123")
5. Optionally add category and notes
6. Click "Add Favorite"

#### View Favorites
- See all your favorites in a grid layout
- Click filter tabs to see specific types
- Each card shows entity info, category, notes, and date

#### Edit a Favorite
1. Click "Edit" button on any favorite card
2. Update category or notes
3. Click "Save Changes"

#### Delete a Favorite
1. Click "Remove" button on any favorite card
2. Confirm deletion in modal
3. Favorite is removed

---

## 💡 Using FavoriteButton Component

### Basic Integration

```tsx
import FavoriteButton from '@/components/favorites/FavoriteButton';

// In your component
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
```

### Real-World Example: Hotel Card

```tsx
import FavoriteButton from '@/components/favorites/FavoriteButton';

const HotelCard = ({ hotel }) => {
  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
      {/* Hotel Image */}
      <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover" />

      {/* Favorite Button - Top Right Corner */}
      <div className="absolute top-3 right-3">
        <FavoriteButton
          entityType="HOTEL"
          entityId={hotel.id}
          entityData={{
            hotelName: hotel.name,
            location: hotel.location,
            pricePerNight: hotel.price,
            rating: hotel.rating,
            image: hotel.image
          }}
          size="md"
        />
      </div>

      {/* Hotel Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg">{hotel.name}</h3>
        <p className="text-gray-600">{hotel.location}</p>
        <p className="text-orange-500 font-bold mt-2">${hotel.price}/night</p>
      </div>
    </div>
  );
};
```

---

## 🎨 Entity Types & Data Structures

### Flight
```tsx
<FavoriteButton
  entityType="FLIGHT"
  entityId="FL123"
  entityData={{
    flightNumber: "AA1234",
    airline: "American Airlines",
    origin: "JFK",
    destination: "LAX",
    departureTime: "2024-01-20T10:00:00Z",
    price: 350
  }}
/>
```

### Hotel
```tsx
<FavoriteButton
  entityType="HOTEL"
  entityId="HTL456"
  entityData={{
    hotelName: "Grand Hotel",
    location: "Paris, France",
    rating: 4.5,
    pricePerNight: 250,
    image: "https://..."
  }}
/>
```

### Activity
```tsx
<FavoriteButton
  entityType="ACTIVITY"
  entityId="ACT789"
  entityData={{
    activityName: "City Tour",
    location: "Paris",
    duration: "3 hours",
    price: 50,
    category: "Sightseeing"
  }}
/>
```

### Destination
```tsx
<FavoriteButton
  entityType="DESTINATION"
  entityId="DEST012"
  entityData={{
    destinationName: "Paris",
    country: "France",
    description: "City of Light",
    image: "https://..."
  }}
/>
```

### Booking
```tsx
<FavoriteButton
  entityType="BOOKING"
  entityId="BK345"
  entityData={{
    bookingId: "BK345",
    confirmationCode: "ABC123",
    type: "hotel",
    destination: "Paris",
    totalPrice: 1500
  }}
/>
```

---

## 🎯 Button Sizes

```tsx
// Small - for compact cards
<FavoriteButton size="sm" {...props} />

// Medium (default) - standard use
<FavoriteButton size="md" {...props} />

// Large - for hero sections
<FavoriteButton size="lg" {...props} />
```

---

## 🔧 Troubleshooting

### Button not working?
1. Check if user is logged in
2. Verify JWT token in localStorage (`auth-storage`)
3. Check browser console for errors
4. Ensure backend is running on port 3002

### Favorites page empty?
1. Try adding a favorite manually
2. Check API response in Network tab
3. Verify backend favorites endpoint is working
4. Check filter tabs - you might have a filter active

### API errors?
1. Check backend is running: `http://localhost:3002/health`
2. Verify JWT token is valid
3. Check CORS configuration
4. Review backend logs

### TypeScript errors?
1. Run `npm install` to ensure dependencies
2. Restart TypeScript server in VS Code
3. Check import paths are correct

---

## 📱 Testing Checklist

- [ ] Navigate to `/favorites` page
- [ ] Click "Add Favorite" button
- [ ] Fill form and submit
- [ ] See new favorite in grid
- [ ] Click filter tabs (All, Flights, Hotels, etc.)
- [ ] Click "Edit" on a favorite
- [ ] Update notes/category
- [ ] Click "Remove" on a favorite
- [ ] Confirm deletion
- [ ] Test FavoriteButton on a card
- [ ] Click heart icon to favorite
- [ ] Click again to unfavorite
- [ ] Check favorites page updates
- [ ] Test on mobile viewport
- [ ] Test on tablet viewport
- [ ] Test on desktop viewport

---

## 🎓 Learning Resources

### Documentation Files
- `src/components/favorites/README.md` - Full feature documentation
- `src/components/favorites/INTEGRATION_EXAMPLES.md` - Code examples
- `FAVORITES-ARCHITECTURE.md` - Technical architecture
- `DR-84-IMPLEMENTATION-SUMMARY.md` - Implementation details

### Code Files
- `src/types/favorites.ts` - TypeScript types
- `src/services/favoritesService.ts` - API service
- `src/components/favorites/FavoriteButton.tsx` - Reusable button
- `src/pages/favorites/index.tsx` - Main favorites page

---

## 🚦 Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type check
npm run type-check

# Lint code
npm run lint
```

---

## 💬 Support

**Issues?**
1. Check documentation files (listed above)
2. Review browser console for errors
3. Check Network tab for API calls
4. Verify backend is running

**Questions?**
- Review `INTEGRATION_EXAMPLES.md` for usage patterns
- Check `README.md` for component props
- Inspect existing implementations

---

## ✨ Next Steps

### Enhance Your Implementation
1. Add FavoriteButton to all entity cards
2. Customize entityData for your use case
3. Add toast notifications on favorite toggle
4. Track analytics events
5. Implement sharing functionality

### Advanced Features
1. Create favorite collections
2. Add bulk operations
3. Implement export functionality
4. Add search within favorites
5. Create smart recommendations

---

## 📊 Success Indicators

You'll know it's working when:
✅ Heart button toggles between filled and outline
✅ Favorites page shows your saved items
✅ Filter tabs update counts correctly
✅ Edit modal updates notes/category
✅ Delete removes items with confirmation
✅ Empty state shows helpful message
✅ Loading states appear during API calls
✅ Error messages display on failures

---

**Happy Coding!** 🎉

For detailed implementation, see:
- `DR-84-IMPLEMENTATION-SUMMARY.md` (complete feature overview)
- `FAVORITES-ARCHITECTURE.md` (technical architecture)
- `src/components/favorites/README.md` (component documentation)
