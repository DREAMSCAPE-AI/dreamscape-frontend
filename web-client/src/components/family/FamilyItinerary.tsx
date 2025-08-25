import React, { useState } from 'react';
import { Users, Baby, Heart, Clock, MapPin, Accessibility, Sun, Umbrella, AlertCircle } from 'lucide-react';
import type { Experience } from '../../services/api/types';

interface FamilyItineraryProps {
  activities: FamilyActivity[];
  onUpdateActivity: (activity: FamilyActivity) => void;
  onAddActivity: (activity: FamilyActivity) => void;
}

interface FamilyActivity {
  id: string;
  title: string;
  time: string;
  duration: string;
  location: string;
  ageRange: string;
  accessibility: {
    wheelchairAccessible: boolean;
    strollerAccessible: boolean;
    quietSpaces: boolean;
    familyRestrooms: boolean;
  };
  weatherDependent: boolean;
  indoorBackup?: string;
  familyGroups: string[];
  notes: string;
}

const FamilyItinerary: React.FC<FamilyItineraryProps> = ({
  activities,
  onUpdateActivity,
  onAddActivity
}) => {
  const [showAccessibility, setShowAccessibility] = useState(false);

  return (
    <div className="space-y-8">
      {/* Timeline View */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Family Day Plan</h2>
          <button
            onClick={() => setShowAccessibility(!showAccessibility)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Accessibility className="w-4 h-4" />
            <span>Accessibility Info</span>
          </button>
        </div>

        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative flex gap-4">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">
                  {activity.time}
                </div>
                {index < activities.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 absolute top-10 left-5" />
                )}
              </div>

              {/* Activity Card */}
              <div className="flex-1">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
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
                          <Baby className="w-4 h-4" />
                          <span>Ages {activity.ageRange}</span>
                        </div>
                      </div>
                    </div>

                    {activity.weatherDependent && (
                      <div className="flex gap-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Sun className="w-4 h-4" />
                        </div>
                        {activity.indoorBackup && (
                          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <Umbrella className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Accessibility Information */}
                  {showAccessibility && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(activity.accessibility).map(([key, value]) => (
                          <div
                            key={key}
                            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                              value ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                            }`}
                          >
                            <Accessibility className="w-4 h-4" />
                            <span className="capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Family Groups */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activity.familyGroups.map((group, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm flex items-center gap-1"
                      >
                        <Users className="w-4 h-4" />
                        <span>{group}</span>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {activity.notes && (
                    <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <p>{activity.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FamilyItinerary;