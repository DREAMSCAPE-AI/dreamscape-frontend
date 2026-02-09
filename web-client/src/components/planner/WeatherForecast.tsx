import React from 'react';
import { useTranslation } from 'react-i18next';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface WeatherForecastProps {
  forecast: Array<{
    date: string;
    temp: number;
    condition: string;
    icon: LucideIcon;
  }>;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ forecast }) => {
  const { t } = useTranslation('planner');
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">{t('weather.title')}</h2>
      <div className="space-y-4">
        {forecast.map((day) => {
          const Icon = day.icon;
          return (
            <div key={day.date} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-orange-500" />
                <div>
                  <div className="text-sm font-medium">{day.date}</div>
                  <div className="text-sm text-gray-600">{day.condition}</div>
                </div>
              </div>
              <div className="text-lg font-medium">{day.temp}°C</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeatherForecast;