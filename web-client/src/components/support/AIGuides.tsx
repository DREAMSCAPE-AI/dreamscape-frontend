import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Sparkles } from 'lucide-react';

interface GuideItem { title: string; description: string; tags: string[] }

const AIGuides = () => {
  const { t } = useTranslation('support');
  const [destination, setDestination] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  const availableInterests = Object.entries(
    t('guides.interests', { returnObjects: true }) as Record<string, string>
  );
  const guides = t('guides.items', { returnObjects: true }) as GuideItem[];

  const toggleInterest = (key: string) => {
    setInterests(prev => prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-semibold">{t('guides.generatorTitle')}</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('guides.destinationLabel')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center">
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={t('guides.destinationPlaceholder')}
                className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('guides.interestsLabel')}</label>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => toggleInterest(key)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    interests.includes(key) ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity">
            {t('guides.generateButton')}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">{t('guides.featuredTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide, i) => (
            <div key={i} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">{guide.title}</h3>
                <p className="text-gray-600 mb-4">{guide.description}</p>
                <div className="flex flex-wrap gap-2">
                  {guide.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIGuides;
