import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, MapPin, DollarSign, Sparkles, Edit2, Save, Plus, X } from 'lucide-react';
import type { Experience } from '@/services/voyage/types';

interface ItineraryBuilderProps {
  itinerary: DayPlan[];
  onUpdateItinerary: (itinerary: DayPlan[]) => void;
  onGenerateAISuggestions: (day: number) => Promise<Experience[]>;
}

interface DayPlan {
  date: string;
  activities: Activity[];
  notes?: string;
  weatherForecast?: {
    condition: string;
    temperature: number;
    precipitation: number;
  };
}

interface Activity {
  id: string;
  title: string;
  type: 'attraction' | 'restaurant' | 'transport' | 'accommodation';
  startTime: string;
  duration: string;
  location: string;
  cost: {
    amount: number;
    currency: string;
  };
  booking?: {
    required: boolean;
    status?: 'pending' | 'confirmed' | 'failed';
    reference?: string;
  };
  notes?: string;
}

const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({
  itinerary,
  onUpdateItinerary,
  onGenerateAISuggestions
}) => {
  const { t } = useTranslation('planner');
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateSuggestions = async () => {
    setLoading(true);
    try {
      const suggestions = await onGenerateAISuggestions(selectedDay);
      setAISuggestions(suggestions);
      setShowAISuggestions(true);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = (activity: Activity) => {
    const updatedItinerary = [...itinerary];
    updatedItinerary[selectedDay].activities.push(activity);
    onUpdateItinerary(updatedItinerary);
  };

  const handleUpdateActivity = (activityId: string, updates: Partial<Activity>) => {
    const updatedItinerary = [...itinerary];
    const dayPlan = updatedItinerary[selectedDay];
    const activityIndex = dayPlan.activities.findIndex(a => a.id === activityId);
    
    if (activityIndex !== -1) {
      dayPlan.activities[activityIndex] = {
        ...dayPlan.activities[activityIndex],
        ...updates
      };
      onUpdateItinerary(updatedItinerary);
    }
  };

  const handleRemoveActivity = (activityId: string) => {
    const updatedItinerary = [...itinerary];
    updatedItinerary[selectedDay].activities = updatedItinerary[selectedDay].activities.filter(
      a => a.id !== activityId
    );
    onUpdateItinerary(updatedItinerary);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Days Navigation */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">{t('itineraryBuilder.tripDays')}</h2>
          <div className="space-y-2">
            {itinerary.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                  selectedDay === index
                    ? 'bg-orange-50 text-orange-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5" />
                  <span>{t('itineraryBuilder.day', { number: index + 1 })}</span>
                </div>
                <span className="text-sm">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('itineraryBuilder.aiSuggestions')}</h2>
            <button
              onClick={handleGenerateSuggestions}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('itineraryBuilder.generate')}</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : showAISuggestions && (
            <div className="space-y-4">
              {aiSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
                  onClick={() => handleAddActivity({
                    id: crypto.randomUUID(),
                    title: suggestion.title,
                    type: 'attraction',
                    startTime: '09:00',
                    duration: suggestion.duration,
                    location: suggestion.location,
                    cost: suggestion.price
                  })}
                >
                  <h3 className="font-medium mb-2">{suggestion.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{suggestion.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        {suggestion.price.currency} {suggestion.price.amount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Day Timeline */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {t('itineraryBuilder.day', { number: selectedDay + 1 })} - {new Date(itinerary[selectedDay].date).toLocaleDateString()}
            </h2>
            <button
              onClick={() => handleAddActivity({
                id: crypto.randomUUID(),
                title: 'New Activity',
                type: 'attraction',
                startTime: '09:00',
                duration: '2 hours',
                location: '',
                cost: { amount: 0, currency: 'USD' }
              })}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('itineraryBuilder.addActivity')}</span>
            </button>
          </div>

          <div className="space-y-6">
            {itinerary[selectedDay].activities.map((activity, index) => (
              <div key={activity.id} className="relative flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">
                    {activity.startTime}
                  </div>
                  {index < itinerary[selectedDay].activities.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 absolute top-10 left-5" />
                  )}
                </div>

                {/* Activity Card */}
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-xl p-4">
                    {editingActivity === activity.id ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={activity.title}
                          onChange={(e) => handleUpdateActivity(activity.id, { title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="time"
                            value={activity.startTime}
                            onChange={(e) => handleUpdateActivity(activity.id, { startTime: e.target.value })}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                          />
                          <input
                            type="text"
                            value={activity.duration}
                            onChange={(e) => handleUpdateActivity(activity.id, { duration: e.target.value })}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                            placeholder={t('itineraryBuilder.duration')}
                          />
                        </div>
                        <input
                          type="text"
                          value={activity.location}
                          onChange={(e) => handleUpdateActivity(activity.id, { location: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                          placeholder={t('itineraryBuilder.location')}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingActivity(null)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            {t('itineraryBuilder.cancel')}
                          </button>
                          <button
                            onClick={() => setEditingActivity(null)}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            {t('itineraryBuilder.save')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{activity.title}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{activity.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{activity.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span>
                                  {activity.cost.currency} {activity.cost.amount}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingActivity(activity.id)}
                              className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveActivity(activity.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {activity.booking?.required && (
                          <div className={`mt-2 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1 ${
                            activity.booking.status === 'confirmed'
                              ? 'bg-green-50 text-green-600'
                              : activity.booking.status === 'pending'
                              ? 'bg-orange-50 text-orange-600'
                              : 'bg-red-50 text-red-600'
                          }`}>
                            <span>
                              {activity.booking.status === 'confirmed' ? t('itineraryBuilder.bookingConfirmed') :
                               activity.booking.status === 'pending' ? t('itineraryBuilder.bookingPending') :
                               t('itineraryBuilder.bookingRequired')}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryBuilder;