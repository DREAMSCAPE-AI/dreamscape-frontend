import React, { useState } from 'react';
import { Calendar, Users, Bell, Shield, AlertCircle } from 'lucide-react';
import BookingFlow from './BookingFlow';
import BookingStatus from './BookingStatus';
import RealTimeUpdates from './RealTimeUpdates';
import type { FlightOffer, HotelOffer, Experience } from '../../services/api/types';

interface BookingManagerProps {
  items: (FlightOffer | HotelOffer | Experience)[];
  onComplete: (bookingDetails: any) => void;
}

const BookingManager: React.FC<BookingManagerProps> = ({ items, onComplete }) => {
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [activeBooking, setActiveBooking] = useState<any | null>(null);
  const [updates, setUpdates] = useState<any[]>([]);

  const handleBookingComplete = (bookingDetails: any) => {
    setActiveBooking(bookingDetails);
    setShowBookingFlow(false);
    
    // Add initial booking confirmation update
    addUpdate({
      id: crypto.randomUUID(),
      type: 'success',
      title: 'Booking Confirmed',
      message: 'Your travel arrangements have been confirmed. Check your email for details.',
      timestamp: new Date().toISOString()
    });

    onComplete(bookingDetails);
  };

  const addUpdate = (update: any) => {
    setUpdates(prev => [update, ...prev]);
  };

  const handleUpdateDismiss = (updateId: string) => {
    setUpdates(prev => prev.filter(u => u.id !== updateId));
  };

  const handleUpdateAction = (updateId: string, action: string) => {
    // Handle update actions (e.g., rebooking, cancellation)
    console.log('Update action:', updateId, action);
  };

  return (
    <div className="space-y-8">
      {/* Active Booking Status */}
      {activeBooking && (
        <BookingStatus
          booking={activeBooking}
          onRebook={(booking) => {
            setShowBookingFlow(true);
            setActiveBooking(null);
          }}
          onCancel={(booking) => {
            // Handle booking cancellation
            addUpdate({
              id: crypto.randomUUID(),
              type: 'info',
              title: 'Booking Cancelled',
              message: 'Your booking has been cancelled. Refund will be processed within 5-7 business days.',
              timestamp: new Date().toISOString()
            });
            setActiveBooking(null);
          }}
        />
      )}

      {/* Real-Time Updates */}
      {updates.length > 0 && (
        <RealTimeUpdates
          updates={updates}
          onDismiss={handleUpdateDismiss}
          onAction={handleUpdateAction}
        />
      )}

      {/* Booking Flow */}
      {showBookingFlow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <BookingFlow
              items={items}
              onComplete={handleBookingComplete}
              onCancel={() => setShowBookingFlow(false)}
            />
          </div>
        </div>
      )}

      {/* Start Booking Button */}
      {!showBookingFlow && !activeBooking && (
        <button
          onClick={() => setShowBookingFlow(true)}
          className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Start Booking
        </button>
      )}
    </div>
  );
};

export default BookingManager;