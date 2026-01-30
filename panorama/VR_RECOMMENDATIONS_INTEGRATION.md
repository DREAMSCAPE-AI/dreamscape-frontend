# VR Recommendations Integration Guide

**Ticket:** DR-80 (VR-005 - Intégration Recommandations-VR)

## Overview

This guide explains how to integrate AI-powered activity recommendations into the VR panorama experience.

## Architecture

### Backend (AI Service - Port 3005)

**File:** `dreamscape-services/ai/src/routes/recommendations.ts`

New API endpoints created:
- `GET /api/v1/recommendations/personalized` - User-specific recommendations
- `GET /api/v1/recommendations/trending` - Trending destinations/activities
- `GET /api/v1/recommendations/deals` - Special offers and deals
- `GET /api/v1/recommendations/activities/:location` - Location-specific activities

### Frontend (Panorama Service - Port 3006)

**Components Created:**

1. **ActivityHotspot** (`src/components/VR/ActivityHotspot.js`)
   - DR-205: Interactive 3D hotspot markers
   - DR-206: Activity preview panel with details
   - DR-207: Booking button with redirection

2. **ActivityHotspotsManager** (`src/components/VR/ActivityHotspotsManager.js`)
   - Fetches recommendations from AI service
   - Manages hotspot lifecycle
   - Coordinates preview and booking actions

3. **Updated Service** (`src/services/api/recommendationsService.js`)
   - Points to ai-service (port 3005) instead of auth-service
   - Handles API communication with proper error handling

## Integration Steps

### Step 1: Import Components

```javascript
import { ActivityHotspotsManager } from './components/VR';
```

### Step 2: Add to VR Environment

```javascript
function VREnvironment() {
  const handleBookingRequest = (activity) => {
    console.log('Booking requested:', activity);
    // Custom handling if needed
  };

  return (
    <>
      {/* Your existing VR content */}
      <WebGLDiagnostic />
      <MemoryMonitor />

      {/* Add activity hotspots - DR-80 */}
      <ActivityHotspotsManager
        environmentId="paris"
        onBookingRequest={handleBookingRequest}
      />

      {/* Rest of your VR scene */}
      <Controllers />
      <Hands />
    </>
  );
}
```

### Step 3: Configure Environment

Set the environment variable in `.env`:

```bash
REACT_APP_AI_API_URL=http://localhost:3005/api/v1
```

For production:

```bash
REACT_APP_AI_API_URL=http://ai-service:3005/api/v1
```

## Features Implemented

### ✅ DR-204: API Access from VR
- RESTful API endpoints for recommendations
- Mock data with realistic structure
- Ready for AI model integration

### ✅ DR-205: Interactive VR Hotspots
- Pulsating 3D spheres at activity locations
- Geographic coordinate mapping to VR space
- Hover effects and visual feedback
- Color coding (green = available, blue = selected, orange = hovered)

### ✅ DR-206: Activity Preview
- Detailed preview panel on click
- Activity image, description, ratings
- Duration, price, and tags display
- Smooth show/hide animations

### ✅ DR-207: Booking Redirection
- "Réserver" button in preview panel
- Opens booking page in new tab
- Callback support for custom handling
- Activity ID and parameters passed to booking flow

## User Experience Flow

1. **User enters VR environment** → Hotspots appear at activity locations
2. **User looks at hotspot** → Hotspot highlights (orange)
3. **User clicks hotspot** → Preview panel opens with activity details
4. **User clicks "Réserver"** → Booking page opens (exit VR or new tab)

## API Response Format

```json
{
  "id": "rec-1",
  "type": "activity",
  "title": "Croisière sur la Seine",
  "description": "Vue panoramique de Paris depuis l'eau",
  "location": "Paris, France",
  "coordinates": { "lat": 48.8566, "lon": 2.3522 },
  "price": 89,
  "currency": "€",
  "rating": 4.8,
  "reviewCount": 1245,
  "image": "https://...",
  "tags": ["romantic", "sightseeing"],
  "confidence": 0.92,
  "duration": "2 hours",
  "category": "cruise"
}
```

## Customization Options

### Change Hotspot Appearance

Edit `ActivityHotspot.js`:

```javascript
// Change hotspot size
<sphereGeometry args={[0.5, 16, 16]} /> // [radius, width, height]

// Change colors
const hotspotColor = hovered ? '#YOUR_COLOR' : '#DEFAULT_COLOR';
```

### Filter Recommendations

Pass location to manager:

```javascript
<ActivityHotspotsManager
  environmentId="paris"  // 'paris', 'barcelona', 'tokyo', etc.
/>
```

### Custom Booking Handler

```javascript
const handleBookingRequest = (activity) => {
  // Custom logic: show in-VR checkout, analytics, etc.
  trackEvent('vr_booking_initiated', activity);
  openInVRBrowser(`/book/${activity.id}`);
};

<ActivityHotspotsManager onBookingRequest={handleBookingRequest} />
```

## Testing

### 1. Start Services

```bash
# Terminal 1: AI Service
cd dreamscape-services/ai
npm run dev

# Terminal 2: Panorama Service
cd dreamscape-frontend/panorama
npm start
```

### 2. Test API Endpoints

```bash
# Test personalized recommendations
curl http://localhost:3005/api/v1/recommendations/personalized

# Test location-specific activities
curl http://localhost:3005/api/v1/recommendations/activities/paris
```

### 3. Test in VR

1. Open http://localhost:3006
2. Click "Enter VR" button
3. Look around for green hotspots
4. Click a hotspot to see preview
5. Click "Réserver" to test booking flow

## Performance Considerations

- Hotspots use instanced rendering for performance
- Preview panels are lazy-loaded (only when opened)
- Images are loaded on-demand
- Recommendations are cached by environment

## Future Enhancements

### Phase 2: Real AI Integration
- Replace mock data with real AI recommendations
- User preference learning
- Personalization based on behavior

### Phase 3: Advanced VR Features
- 360° activity previews within VR
- In-VR booking flow (no tab switching)
- Voice commands for activity selection
- Haptic feedback on hotspot interaction

### Phase 4: Social Features
- Share activities with friends in VR
- Group booking from VR
- Live guide avatars at activity locations

## Troubleshooting

### Hotspots not appearing

1. Check console for API errors
2. Verify ai-service is running on port 3005
3. Check REACT_APP_AI_API_URL environment variable

### Preview panel not showing

1. Ensure Html component from @react-three/drei is installed
2. Check browser console for React errors
3. Verify activity data has required fields

### Booking redirection not working

1. Check if window.open is blocked (popup blocker)
2. Verify booking URL construction
3. Test onBookingRequest callback

## Related Documentation

- [CLAUDE.md](../../CLAUDE.md) - Repository overview
- [AI Service API](../../dreamscape-services/ai/README.md)
- [Web Client Booking Flow](../../dreamscape-frontend/web-client/docs/BOOKING.md)

## Support

For issues or questions:
- Check GitHub Issues: https://github.com/DREAMSCAPE-AI/dreamscape-frontend/issues
- Jira Ticket: DR-80
- Sub-tasks: DR-204, DR-205, DR-206, DR-207
