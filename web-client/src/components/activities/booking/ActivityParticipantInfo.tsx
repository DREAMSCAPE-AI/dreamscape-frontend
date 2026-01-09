/**
 * Activity Participant Information Component
 * Collects participant details for activity booking
 */

import { useActivityBookingStore, ParticipantInfo, ActivityContactInfo } from '@/store/activityBookingStore';
import { User, Mail, Phone, Calendar } from 'lucide-react';

export default function ActivityParticipantInfo() {
  const {
    participants,
    contactInfo,
    numberOfParticipants,
    selectedDate,
    selectedTime,
    updateParticipant,
    setContactInfo,
    setSelectedDate,
    setSelectedTime,
  } = useActivityBookingStore();

  const handleParticipantChange = (
    participantId: string,
    field: keyof ParticipantInfo,
    value: string
  ) => {
    updateParticipant(participantId, { [field]: value });
  };

  const handleContactChange = (field: keyof ActivityContactInfo, value: string) => {
    setContactInfo({
      ...contactInfo,
      [field]: value,
    } as ActivityContactInfo);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Participant Information</h2>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Important Information</h3>
            <p className="text-sm text-blue-800">
              Please provide accurate information for all participants. This will be used for confirmation
              and any special requirements during the activity.
            </p>
          </div>
        </div>
      </div>

      {/* Date and Time Selection */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-500" />
          Select Date & Time
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Time (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time (Optional)
            </label>
            <select
              value={selectedTime || ''}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Any time</option>
              <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
              <option value="Afternoon (12:00 PM - 5:00 PM)">Afternoon (12:00 PM - 5:00 PM)</option>
              <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Participant Forms */}
      <div className="space-y-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900">
          Participant Details ({numberOfParticipants} {numberOfParticipants === 1 ? 'person' : 'people'})
        </h3>

        {participants.map((participant, index) => (
          <div
            key={participant.id}
            className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-6 border border-orange-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Participant {index + 1}
                </h4>
                <p className="text-sm text-gray-600 capitalize">{participant.type}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <select
                  value={participant.title}
                  onChange={(e) =>
                    handleParticipantChange(participant.id, 'title', e.target.value as any)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="Mr">Mr</option>
                  <option value="Ms">Ms</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Dr">Dr</option>
                </select>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={participant.firstName}
                  onChange={(e) =>
                    handleParticipantChange(participant.id, 'firstName', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="First Name"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={participant.lastName}
                  onChange={(e) =>
                    handleParticipantChange(participant.id, 'lastName', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Last Name"
                  required
                />
              </div>

              {/* Date of Birth (Optional for activities) */}
              {participant.type !== 'adult' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={participant.dateOfBirth || ''}
                    onChange={(e) =>
                      handleParticipantChange(participant.id, 'dateOfBirth', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Special Requirements */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requirements (Optional)
                </label>
                <textarea
                  value={participant.specialRequirements || ''}
                  onChange={(e) =>
                    handleParticipantChange(participant.id, 'specialRequirements', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Dietary restrictions, accessibility needs, etc."
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={contactInfo?.email || ''}
                onChange={(e) => handleContactChange('email', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="your.email@example.com"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Confirmation and booking details will be sent to this email
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={contactInfo?.phone || ''}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
          </div>

          {/* Emergency Contact Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact Name (Optional)
            </label>
            <input
              type="text"
              value={contactInfo?.emergencyContact?.name || ''}
              onChange={(e) =>
                setContactInfo({
                  ...contactInfo,
                  emergencyContact: {
                    ...contactInfo?.emergencyContact,
                    name: e.target.value,
                    phone: contactInfo?.emergencyContact?.phone || '',
                    relationship: contactInfo?.emergencyContact?.relationship || '',
                  },
                } as ActivityContactInfo)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Emergency contact name"
            />
          </div>

          {/* Emergency Contact Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact Phone (Optional)
            </label>
            <input
              type="tel"
              value={contactInfo?.emergencyContact?.phone || ''}
              onChange={(e) =>
                setContactInfo({
                  ...contactInfo,
                  emergencyContact: {
                    ...contactInfo?.emergencyContact,
                    name: contactInfo?.emergencyContact?.name || '',
                    phone: e.target.value,
                    relationship: contactInfo?.emergencyContact?.relationship || '',
                  },
                } as ActivityContactInfo)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
