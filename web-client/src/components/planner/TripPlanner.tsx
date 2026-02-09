import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Sun, Cloud, Umbrella, Wind } from 'lucide-react';
import TripTimeline from './TripTimeline';
import TripBudget from './TripBudget';
import TripCollaborators from './TripCollaborators';
import WeatherForecast from './WeatherForecast';
import PracticalInfo from './PracticalInfo';
import TripOptimizer from './TripOptimizer';

const TripPlanner = () => {
  const { t } = useTranslation('planner');
  const { tripId } = useParams();
  const [activeTab, setActiveTab] = useState('timeline');

  const trip = {
    id: 'luxury-kyoto-2024',
    title: 'Luxury Kyoto Experience',
    destination: 'Kyoto, Japan',
    dates: { start: '2024-04-05', end: '2024-04-10' },
    collaborators: [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80',
        role: 'owner' as const
      }
    ],
    weather: [
      { date: '2024-04-05', temp: 18, condition: 'sunny', icon: Sun },
      { date: '2024-04-06', temp: 19, condition: 'sunny', icon: Sun },
      { date: '2024-04-07', temp: 17, condition: 'cloudy', icon: Cloud },
      { date: '2024-04-08', temp: 16, condition: 'rainy', icon: Umbrella },
      { date: '2024-04-09', temp: 18, condition: 'sunny', icon: Sun },
      { date: '2024-04-10', temp: 19, condition: 'sunny', icon: Sun }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Trip Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{trip.title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{trip.dates.start} - {trip.dates.end}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{trip.collaborators.length} {t('tripPlanner.collaborators')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 mt-6">
            {[
              { id: 'timeline', label: t('tripPlanner.timeline') },
              { id: 'budget', label: t('tripPlanner.budget') },
              { id: 'collaborators', label: t('tripPlanner.collaboratorsTab') },
              { id: 'info', label: t('tripPlanner.practicalInfo') }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'timeline' && <TripTimeline />}
            {activeTab === 'budget' && <TripBudget />}
            {activeTab === 'collaborators' && <TripCollaborators collaborators={trip.collaborators} />}
            {activeTab === 'info' && <PracticalInfo destination={trip.destination} />}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Weather Forecast */}
            <WeatherForecast forecast={trip.weather} />

            {/* Trip Optimizer */}
            <TripOptimizer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;