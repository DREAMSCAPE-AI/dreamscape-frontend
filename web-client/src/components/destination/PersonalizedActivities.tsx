import React from 'react';
import { Clock, MapPin } from 'lucide-react';

interface PersonalizedActivitiesProps {
  destinationId: string;
}

const PersonalizedActivities: React.FC<PersonalizedActivitiesProps> = ({ destinationId }) => {
  const activities = [
    {
      id: 1,
      title: "Sunset Sailing Adventure",
      duration: "3 hours",
      location: "Marina Bay",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80",
      price: {
        amount: 120,
        currency: "$"
      }
    },
    {
      id: 2,
      title: "Local Cooking Class",
      duration: "4 hours",
      location: "City Center",
      image: "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?auto=format&fit=crop&q=80",
      price: {
        amount: 85,
        currency: "$"
      }
    }
  ];

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="group relative overflow-hidden rounded-lg cursor-pointer"
        >
          <div className="aspect-[16/9]">
            <img
              src={activity.image}
              alt={activity.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 p-4 w-full">
            <h4 className="text-white font-semibold mb-2">{activity.title}</h4>
            <div className="flex items-center justify-between text-sm text-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{activity.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{activity.location}</span>
                </div>
              </div>
              <span className="font-medium">
                {activity.price.currency}{activity.price.amount}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PersonalizedActivities;