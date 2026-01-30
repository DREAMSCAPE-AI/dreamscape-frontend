/**
 * ActivityHotspotsManager Component
 *
 * DR-205: VR-005.2 - Manages all activity hotspots in VR environment
 * DR-206: VR-005.3 - Coordinates activity previews
 * DR-207: VR-005.4 - Handles booking redirections
 *
 * Fetches recommendations from AI service and displays interactive hotspots
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Text } from '@react-three/drei';
import ActivityHotspot, { geoToVRPosition } from './ActivityHotspot';
import { getVRRecommendationsService } from '../../services/api/recommendationsService';

/**
 * ActivityHotspotsManager Component
 * Manages the lifecycle and display of activity hotspots in VR
 */
function ActivityHotspotsManager({
  environmentId = 'paris',
  onBookingRequest
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Fetch recommendations on mount and when environment changes
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`🎯 Loading recommendations for environment: ${environmentId}`);

        const vrRecsService = getVRRecommendationsService();
        const data = await vrRecsService.getRecommendationsForEnvironment(environmentId);

        console.log(`✅ Loaded ${data.all.length} recommendations`);

        // Combine all recommendations (personalized, trending, deals)
        setRecommendations(data.all);
      } catch (err) {
        console.error('❌ Failed to load recommendations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [environmentId]);

  // Handle activity selection
  const handleSelectActivity = useCallback((activity) => {
    console.log('🎯 Activity selected:', activity.title);
    setSelectedActivity(activity);
  }, []);

  // Handle booking request - DR-207: Redirection to booking
  const handleBookActivity = useCallback((activity) => {
    console.log('🎫 Booking requested for:', activity.title);

    // Option 1: Open booking in a new window/tab
    if (typeof window !== 'undefined') {
      // Construct booking URL
      // This should point to your web-client booking page
      const bookingUrl = `/booking/${activity.id}?type=${activity.type}&location=${encodeURIComponent(activity.location)}`;

      // Open in new tab (user can switch out of VR)
      window.open(bookingUrl, '_blank');

      console.log('✅ Booking page opened in new tab:', bookingUrl);
    }

    // Option 2: If parent component wants to handle it
    if (onBookingRequest) {
      onBookingRequest(activity);
    }

    // Could also trigger an event or state update to show booking UI in VR
  }, [onBookingRequest]);

  // Loading state
  if (loading) {
    return (
      <Text
        position={[0, 2, -5]}
        fontSize={0.3}
        color="#FFA500"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        🔄 Loading activity recommendations...
      </Text>
    );
  }

  // Error state
  if (error) {
    return (
      <Text
        position={[0, 2, -5]}
        fontSize={0.25}
        color="#FF4444"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
        whiteSpace="pre-line"
      >
        {`❌ Failed to load recommendations\n${error}\nCheck console for details`}
      </Text>
    );
  }

  // No recommendations
  if (recommendations.length === 0) {
    return (
      <Text
        position={[0, 2, -5]}
        fontSize={0.25}
        color="#FFAA00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        ℹ️ No recommendations available for {environmentId}
      </Text>
    );
  }

  return (
    <group>
      {/* Info text */}
      <Text
        position={[0, 4.5, -5]}
        fontSize={0.2}
        color="#3B82F6"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="black"
      >
        {`🎯 ${recommendations.length} activities available in ${environmentId}`}
      </Text>

      {/* Render all activity hotspots */}
      {recommendations.map((activity, index) => {
        // Calculate position based on coordinates or use a circular layout
        let position;

        if (activity.coordinates) {
          // Use geographical coordinates if available
          position = geoToVRPosition(
            activity.coordinates.lat,
            activity.coordinates.lon
          );
        } else {
          // Fallback: circular layout around the viewer
          const angle = (index / recommendations.length) * Math.PI * 2;
          const radius = 480;
          position = [
            Math.cos(angle) * radius,
            Math.sin(index * 0.5) * 100, // Vary height slightly
            Math.sin(angle) * radius
          ];
        }

        return (
          <ActivityHotspot
            key={activity.id}
            activity={activity}
            position={position}
            onSelect={handleSelectActivity}
            onBook={handleBookActivity}
            isSelected={selectedActivity?.id === activity.id}
          />
        );
      })}

      {/* Selected activity indicator */}
      {selectedActivity && (
        <Text
          position={[0, -4, -5]}
          fontSize={0.18}
          color="#22C55E"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="black"
        >
          {`✅ Selected: ${selectedActivity.title}`}
        </Text>
      )}

      {/* Instructions */}
      <Text
        position={[0, -4.5, -5]}
        fontSize={0.15}
        color="#9CA3AF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
        whiteSpace="pre-line"
      >
        {`👆 Click on hotspots to preview activities\n🎫 Click "Réserver" to book`}
      </Text>
    </group>
  );
}

export default ActivityHotspotsManager;
