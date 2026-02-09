/**
 * Flight Passenger Information Component
 * Step 6 of flight booking workflow
 */

import { useTranslation } from 'react-i18next';
import { useFlightBookingStore, PassengerInfo, ContactInfo } from '@/store/flightBookingStore';
import { User, Mail, Phone } from 'lucide-react';

export default function FlightPassengerInfo() {
  const { t } = useTranslation('flights');
  const { passengers, contactInfo, updatePassenger, setContactInfo } = useFlightBookingStore();

  const handlePassengerChange = (passengerId: string, field: keyof PassengerInfo, value: string) => {
    updatePassenger(passengerId, { [field]: value });
  };

  const handleContactChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo({
      ...contactInfo,
      [field]: value,
    } as ContactInfo);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('passengerInfo.title')}</h2>

      {/* Info Banner */}
      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">{t('passengerInfo.importantTitle')}</h3>
            <p className="text-sm text-yellow-800">
              {t('passengerInfo.importantText')}
            </p>
          </div>
        </div>
      </div>

      {/* Passenger Forms */}
      <div className="space-y-6 mb-8">
        {passengers.map((passenger, index) => (
          <div
            key={passenger.id}
            className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-6 border border-orange-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('passengerInfo.passenger', { number: index + 1 })}
                </h3>
                <p className="text-sm text-gray-600 capitalize">{passenger.type}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('passengerInfo.title_field')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={passenger.title}
                  onChange={(e) => handlePassengerChange(passenger.id, 'title', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="Mr">{t('passengerInfo.titleOptions.mr')}</option>
                  <option value="Ms">{t('passengerInfo.titleOptions.ms')}</option>
                  <option value="Mrs">{t('passengerInfo.titleOptions.mrs')}</option>
                  <option value="Dr">{t('passengerInfo.titleOptions.dr')}</option>
                </select>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('passengerInfo.firstName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={passenger.firstName}
                  onChange={(e) => handlePassengerChange(passenger.id, 'firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={t('passengerInfo.firstName')}
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('passengerInfo.lastName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={passenger.lastName}
                  onChange={(e) => handlePassengerChange(passenger.id, 'lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={t('passengerInfo.lastName')}
                  required
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('passengerInfo.dateOfBirth')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={passenger.dateOfBirth}
                  onChange={(e) => handlePassengerChange(passenger.id, 'dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Nationality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('passengerInfo.nationality')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={passenger.nationality}
                  onChange={(e) => handlePassengerChange(passenger.id, 'nationality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={t('passengerInfo.nationalityPlaceholder')}
                  required
                />
              </div>

              {/* Passport Number (Optional for domestic) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('passengerInfo.passportNumber')}
                </label>
                <input
                  type="text"
                  value={passenger.passportNumber || ''}
                  onChange={(e) => handlePassengerChange(passenger.id, 'passportNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={t('passengerInfo.passportPlaceholder')}
                />
              </div>

              {/* Passport Expiry */}
              {passenger.passportNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('passengerInfo.passportExpiry')}
                  </label>
                  <input
                    type="date"
                    value={passenger.passportExpiry || ''}
                    onChange={(e) => handlePassengerChange(passenger.id, 'passportExpiry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}

              {/* Frequent Flyer Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('passengerInfo.frequentFlyer')}
                </label>
                <input
                  type="text"
                  value={passenger.frequentFlyerNumber || ''}
                  onChange={(e) => handlePassengerChange(passenger.id, 'frequentFlyerNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={t('passengerInfo.frequentFlyerPlaceholder')}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg p-6 border-2 border-orange-300">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">{t('passengerInfo.contactInfo')}</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {t('passengerInfo.contactText')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('passengerInfo.email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={contactInfo?.email || ''}
              onChange={(e) => handleContactChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={t('passengerInfo.emailPlaceholder')}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('passengerInfo.phone')} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={contactInfo?.phone || ''}
              onChange={(e) => handleContactChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={t('passengerInfo.phonePlaceholder')}
              required
            />
          </div>
        </div>
      </div>

      {/* Required Fields Notice */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          <span className="text-red-500">*</span> {t('passengerInfo.requiredFields')}
        </p>
      </div>
    </div>
  );
}
