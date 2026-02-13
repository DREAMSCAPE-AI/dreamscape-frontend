import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Clock, MapPin, DollarSign, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TripTimeline = () => {
  const { t } = useTranslation('planner');
  const [activities, setActivities] = useState([
    // Day 1 - April 5
    {
      id: 'day1-1',
      time: '15:00',
      title: 'Private Check-in at The Ritz-Carlton Kyoto',
      location: 'Kamogawa Nijo-Ohashi Hotori, Nakagyo-ku',
      duration: '1 hour',
      cost: '¥120,000/night',
      type: 'accommodation',
      notes: 'Luxury River View Suite with traditional Japanese elements'
    },
    {
      id: 'day1-2',
      time: '17:00',
      title: 'Traditional Tea Ceremony',
      location: 'Hotel Private Garden',
      duration: '1.5 hours',
      cost: '¥25,000',
      type: 'cultural'
    },
    {
      id: 'day1-3',
      time: '19:30',
      title: 'Kaiseki Dinner at Kikunoi',
      location: 'Shimogawara, Higashiyama-ku',
      duration: '2.5 hours',
      cost: '¥45,000',
      type: 'dining',
      notes: '3 Michelin stars, advance reservation required'
    },
    // Day 2 - April 6
    {
      id: 'day2-1',
      time: '07:00',
      title: 'Private Meditation Session',
      location: 'Kennin-ji Temple',
      duration: '1 hour',
      cost: '¥30,000',
      type: 'wellness'
    },
    {
      id: 'day2-2',
      time: '09:00',
      title: 'Private Tour of Kinkaku-ji (Golden Pavilion)',
      location: 'Kinkakuji-cho',
      duration: '2 hours',
      cost: '¥35,000',
      type: 'cultural',
      notes: 'Early access before public opening'
    },
    {
      id: 'day2-3',
      time: '12:00',
      title: 'Traditional Japanese Lunch',
      location: 'Hyotei Restaurant',
      duration: '1.5 hours',
      cost: '¥30,000',
      type: 'dining'
    },
    {
      id: 'day2-4',
      time: '14:30',
      title: 'Private Kimono Fitting & Photo Session',
      location: 'Gion District',
      duration: '3 hours',
      cost: '¥50,000',
      type: 'cultural'
    },
    {
      id: 'day2-5',
      time: '19:00',
      title: 'Exclusive Geisha Dinner Experience',
      location: 'Private Teahouse in Gion',
      duration: '3 hours',
      cost: '¥100,000',
      type: 'dining'
    },
    // Day 3 - April 7
    {
      id: 'day3-1',
      time: '08:00',
      title: 'Private Zen Garden Tour',
      location: 'Ryoan-ji Temple',
      duration: '2 hours',
      cost: '¥40,000',
      type: 'cultural'
    },
    {
      id: 'day3-2',
      time: '11:00',
      title: 'Japanese Art Workshop',
      location: 'Traditional Artisan Studio',
      duration: '2.5 hours',
      cost: '¥45,000',
      type: 'cultural'
    },
    {
      id: 'day3-3',
      time: '15:00',
      title: 'Private Tea Farm Visit & Tasting',
      location: 'Uji Region',
      duration: '3 hours',
      cost: '¥60,000',
      type: 'experience'
    },
    {
      id: 'day3-4',
      time: '19:30',
      title: 'Innovative Kaiseki at Narisawa',
      location: 'Minami-Aoyama',
      duration: '2.5 hours',
      cost: '¥55,000',
      type: 'dining'
    },
    // Day 4 - April 8
    {
      id: 'day4-1',
      time: '09:00',
      title: 'Private Bamboo Grove Walk',
      location: 'Arashiyama',
      duration: '1.5 hours',
      cost: '¥25,000',
      type: 'nature'
    },
    {
      id: 'day4-2',
      time: '11:00',
      title: 'Traditional Crafts Workshop',
      location: 'Artisan District',
      duration: '2 hours',
      cost: '¥40,000',
      type: 'cultural'
    },
    {
      id: 'day4-3',
      time: '14:00',
      title: 'Private Sake Tasting',
      location: 'Historic Sake Brewery',
      duration: '2 hours',
      cost: '¥35,000',
      type: 'experience'
    },
    {
      id: 'day4-4',
      time: '19:00',
      title: 'Private Chef Experience',
      location: 'Hotel Suite',
      duration: '3 hours',
      cost: '¥80,000',
      type: 'dining'
    },
    // Day 5 - April 9
    {
      id: 'day5-1',
      time: '08:00',
      title: 'Private Helicopter Tour',
      location: 'Kyoto Heliport',
      duration: '1.5 hours',
      cost: '¥150,000',
      type: 'experience'
    },
    {
      id: 'day5-2',
      time: '11:00',
      title: 'Luxury Spa Treatment',
      location: 'Ritz-Carlton Spa',
      duration: '3 hours',
      cost: '¥65,000',
      type: 'wellness'
    },
    {
      id: 'day5-3',
      time: '15:00',
      title: 'Private Shopping Experience',
      location: 'Nishiki Market & Luxury Boutiques',
      duration: '3 hours',
      cost: '¥40,000',
      type: 'shopping'
    },
    {
      id: 'day5-4',
      time: '19:30',
      title: 'Farewell Dinner at Kitcho Arashiyama',
      location: 'Sagakitayama',
      duration: '3 hours',
      cost: '¥70,000',
      type: 'dining'
    },
    // Day 6 - April 10
    {
      id: 'day6-1',
      time: '09:00',
      title: 'Private Japanese Garden Visit',
      location: 'Saiho-ji Moss Garden',
      duration: '2 hours',
      cost: '¥30,000',
      type: 'nature'
    },
    {
      id: 'day6-2',
      time: '12:00',
      title: 'Final Lunch at Nishikawa',
      location: 'Gion Shirakawa',
      duration: '1.5 hours',
      cost: '¥35,000',
      type: 'dining'
    }
  ]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t('timeline.dayTitle')}</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors">
          <Plus className="w-4 h-4" />
          {t('timeline.addActivity')}
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex gap-4 pb-8"
          >
            {/* Timeline */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">
                {activity.time}
              </div>
              {index < activities.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 absolute top-8 left-4" />
              )}
            </div>

            {/* Activity Card */}
            <div className="flex-1 bg-gray-50 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-2">{activity.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{activity.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{activity.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{activity.cost}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TripTimeline;