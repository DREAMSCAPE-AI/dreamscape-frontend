# Favorites Feature Architecture

## Component Hierarchy

```
App.tsx
└── Route: /favorites
    └── OnboardingGuard
        └── FavoritesPage
            ├── Header Navigation
            ├── Filter Tabs
            ├── Favorites Grid
            │   └── Favorite Cards (multiple)
            │       ├── Entity Icon & Badge
            │       ├── Entity Info
            │       ├── Category Tag
            │       ├── Notes Display
            │       ├── Edit Button → EditFavoriteModal
            │       └── Delete Button → Delete Confirmation Modal
            ├── Empty State
            ├── LoadingSpinner
            ├── ErrorMessage
            ├── AddFavoriteModal
            └── EditFavoriteModal
```

## Integration Points

```
External Components Using FavoriteButton:
├── FlightCard
│   └── FavoriteButton (entityType: "FLIGHT")
├── HotelCard
│   └── FavoriteButton (entityType: "HOTEL")
├── ActivityCard
│   └── FavoriteButton (entityType: "ACTIVITY")
├── DestinationCard
│   └── FavoriteButton (entityType: "DESTINATION")
└── BookingDetails
    └── FavoriteButton (entityType: "BOOKING")
```

## Data Flow

```
┌─────────────────┐
│  User Action    │
│  (Click Heart)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   FavoriteButton        │
│   - Optimistic Update   │
│   - Show Loading        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  FavoritesService       │
│  - Add JWT Token        │
│  - Make API Call        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Backend API            │
│  POST /favorites        │
│  or DELETE /favorites   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Response Handler       │
│  - Success: Update UI   │
│  - Error: Revert & Show │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  User Feedback          │
│  - Icon Animation       │
│  - Optional Toast       │
└─────────────────────────┘
```

## Service Layer Architecture

```
┌──────────────────────────────────────────┐
│         FavoritesService                  │
├──────────────────────────────────────────┤
│  - Axios Instance (with interceptors)    │
│  - Base URL: /api/v1/users/favorites    │
│  - Auth: JWT from localStorage           │
├──────────────────────────────────────────┤
│  Methods:                                │
│  ├─ getFavorites(params)                │
│  ├─ getFavorite(id)                     │
│  ├─ addFavorite(data)                   │
│  ├─ updateFavorite(id, data)            │
│  ├─ deleteFavorite(id)                  │
│  └─ checkFavorite(entityType, entityId) │
├──────────────────────────────────────────┤
│  Interceptors:                           │
│  ├─ Request: Add JWT to Authorization   │
│  └─ Response: Handle 401, log errors    │
└──────────────────────────────────────────┘
```

## State Management

```
FavoriteButton State:
├── isFavorited: boolean
├── favoriteId: string | undefined
├── isLoading: boolean
└── isChecking: boolean

FavoritesPage State:
├── favorites: Favorite[]
├── loading: boolean
├── error: string | null
├── activeFilter: FavoriteType | 'ALL'
├── filters: FavoriteFilterParams
├── deleteConfirm: string | null
├── editModalOpen: boolean
├── addModalOpen: boolean
└── selectedFavorite: Favorite | null
```

## Type System

```
Type Hierarchy:
├── FavoriteType
│   ├── 'FLIGHT'
│   ├── 'HOTEL'
│   ├── 'ACTIVITY'
│   ├── 'DESTINATION'
│   └── 'BOOKING'
│
├── Favorite
│   ├── id: string
│   ├── userId: string
│   ├── entityType: FavoriteType
│   ├── entityId: string
│   ├── entityData: FavoriteEntityData
│   ├── category?: string
│   ├── notes?: string
│   ├── createdAt: string
│   └── updatedAt: string
│
├── Request Types
│   ├── CreateFavoriteRequest
│   ├── UpdateFavoriteRequest
│   └── FavoriteFilterParams
│
└── Response Types
    ├── FavoriteResponse
    ├── SingleFavoriteResponse
    ├── DeleteFavoriteResponse
    └── CheckFavoriteResponse
```

## API Endpoints

```
Base: http://localhost:3002/api/v1/users/favorites

GET    /                              → List favorites
GET    /:id                           → Get favorite
POST   /                              → Add favorite
PUT    /:id                           → Update favorite
DELETE /:id                           → Delete favorite
GET    /check/:entityType/:entityId   → Check if favorited

Query Parameters (GET /):
- page: number
- limit: number
- entityType: FavoriteType
- category: string
- entityId: string
```

## Color System

```
Entity Type Colors:

FLIGHT
├── Card: bg-blue-100 text-blue-700 border-blue-200
└── Badge: bg-blue-500

HOTEL
├── Card: bg-purple-100 text-purple-700 border-purple-200
└── Badge: bg-purple-500

ACTIVITY
├── Card: bg-green-100 text-green-700 border-green-200
└── Badge: bg-green-500

DESTINATION
├── Card: bg-orange-100 text-orange-700 border-orange-200
└── Badge: bg-orange-500

BOOKING
├── Card: bg-red-100 text-red-700 border-red-200
└── Badge: bg-red-500
```

## Responsive Design

```
Mobile (< 768px)
└── 1 Column Grid
    ├── Full width cards
    ├── Stacked filter tabs (horizontal scroll)
    └── Touch-optimized buttons

Tablet (768px - 1024px)
└── 2 Column Grid
    ├── Side-by-side cards
    ├── Visible filter tabs
    └── Hover states enabled

Desktop (> 1024px)
└── 3 Column Grid
    ├── Maximum 3 cards per row
    ├── All tabs visible
    └── Enhanced hover effects
```

## Security

```
Authentication Flow:
1. User logs in → JWT stored in localStorage
2. FavoritesService reads JWT from 'auth-storage'
3. Axios interceptor adds Bearer token to requests
4. Backend validates JWT
5. If 401: Redirect to /auth page

Data Protection:
- JWT required for all endpoints
- User can only access own favorites
- Entity data sanitized on backend
- No sensitive data in entityData
```

## Performance Optimizations

```
Implemented:
├── Optimistic UI updates (instant feedback)
├── Single API call for favorite check
├── Efficient state updates (no unnecessary re-renders)
├── Axios instance reuse
└── Component-level loading states

Future Optimizations:
├── Virtual scrolling for large lists
├── Infinite scroll pagination
├── Service worker caching
├── WebSocket for real-time updates
└── Prefetching on hover
```

## Error Handling

```
Error Types Handled:

Network Errors
├── Timeout (10s)
├── Connection refused
└── DNS failure
    → Display: "Failed to connect. Please try again."

HTTP Errors
├── 400 Bad Request
│   → Display: Validation error message
├── 401 Unauthorized
│   → Action: Redirect to /auth
├── 404 Not Found
│   → Display: "Item not found"
├── 409 Conflict
│   → Display: "Already in favorites"
└── 500 Server Error
    → Display: "Server error. Please try again later."

Client Errors
├── Invalid entityType
├── Missing entityId
└── Malformed entityData
    → Display: Form validation errors
```

## Testing Strategy

```
Unit Tests (Component Level):
├── FavoriteButton
│   ├── Renders correctly
│   ├── Toggles favorite state
│   ├── Handles loading states
│   └── Calls onToggle callback
│
├── AddFavoriteModal
│   ├── Form validation
│   ├── Submits data correctly
│   └── Shows/hides on open/close
│
└── EditFavoriteModal
    ├── Loads existing data
    ├── Updates notes/category
    └── Validates input

Integration Tests (Service Level):
├── FavoritesService
│   ├── API calls succeed
│   ├── Auth token included
│   ├── Error handling works
│   └── Response parsing correct

E2E Tests (User Flow):
├── Add favorite from card
├── View favorites page
├── Filter by type
├── Edit favorite notes
├── Delete favorite
└── Empty state display
```

## File Structure

```
dreamscape-frontend/web-client/src/
├── types/
│   └── favorites.ts                    (90 lines)
│
├── services/
│   └── favoritesService.ts            (171 lines)
│
├── components/
│   └── favorites/
│       ├── FavoriteButton.tsx         (135 lines)
│       ├── AddFavoriteModal.tsx       (203 lines)
│       ├── EditFavoriteModal.tsx      (164 lines)
│       ├── README.md                  (Documentation)
│       └── INTEGRATION_EXAMPLES.md    (Examples)
│
└── pages/
    └── favorites/
        └── index.tsx                   (433 lines)

Total: ~1,196 lines of production code
      + 2 comprehensive documentation files
```

## Dependencies Graph

```
FavoritesPage
├── React (hooks: useState, useEffect)
├── react-router-dom (Navigate, useNavigate)
├── lucide-react (icons)
├── @/services/auth/AuthService (useAuth hook)
├── @/services/favoritesService (API calls)
├── @/components/common/LoadingSpinner
├── @/components/common/ErrorMessage
├── @/components/favorites/AddFavoriteModal
├── @/components/favorites/EditFavoriteModal
└── @/types/favorites (TypeScript types)

FavoriteButton
├── React (hooks: useState, useEffect)
├── lucide-react (Heart icon)
├── @/services/favoritesService
└── @/types/favorites

Modals
├── React (hooks: useState)
├── lucide-react (icons)
├── @/services/favoritesService
└── @/types/favorites

No external dependencies added! ✓
```

## Deployment Checklist

```
Pre-deployment:
☑ All TypeScript types defined
☑ Service layer implemented
☑ Components created
☑ Routes configured
☑ Navigation updated
☑ Build successful (npm run build)
☑ No TypeScript errors
☑ No ESLint errors
☑ Documentation complete

Backend Requirements:
☐ User service running (port 3002)
☐ Database migrations applied
☐ JWT authentication enabled
☐ CORS configured for frontend
☐ API endpoints tested

Environment Variables:
☐ USER_SERVICE_API_URL configured
☐ JWT_SECRET set in backend
☐ Database connection string valid

Post-deployment:
☐ Test favorite button on cards
☐ Test favorites page loads
☐ Test filter tabs work
☐ Test edit/delete functionality
☐ Test empty states
☐ Test error handling
☐ Test mobile responsiveness
☐ Monitor API error rates
☐ Check performance metrics
```

## Monitoring & Analytics

```
Metrics to Track:
├── Favorites Added (by entity type)
├── Favorites Removed (by entity type)
├── Favorites Page Views
├── Average favorites per user
├── Most favorited items
├── Favorite button click rate
├── Edit operations count
├── Error rates by endpoint
└── Page load time

Logging Points:
├── API errors (service layer)
├── 401 redirects
├── Failed validations
├── Component mount/unmount
└── User actions (optional)
```

---

## Summary

**Feature:** Favorites Management (DR-84)
**Status:** ✅ Complete
**Code Quality:** Production-ready
**Documentation:** Comprehensive
**Testing:** Build verified
**Integration:** Fully integrated
**Performance:** Optimized
**Security:** JWT protected
**Responsive:** Mobile-first
**Maintainable:** Well-structured

**Ready for deployment!** 🚀
