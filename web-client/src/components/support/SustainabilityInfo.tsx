import { useTranslation } from 'react-i18next';
import { Leaf, Recycle, TreePine, Globe } from 'lucide-react';

interface Initiative { title: string; description: string }
interface Stat { value: string; label: string }

const initiativeIcons = [TreePine, Recycle, Globe];

const SustainabilityInfo = () => {
  const { t } = useTranslation('support');
  const initiatives = t('sustainability.initiatives', { returnObjects: true }) as Initiative[];
  const stats = t('sustainability.stats', { returnObjects: true }) as Stat[];
  const tips = t('sustainability.tips', { returnObjects: true }) as string[];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&q=80"
            alt="Nature"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative p-8">
          <div className="flex items-center gap-3 mb-4">
            <Leaf className="w-8 h-8" />
            <h2 className="text-2xl font-semibold">{t('sustainability.bannerTitle')}</h2>
          </div>
          <p className="text-green-50 max-w-2xl">{t('sustainability.bannerText')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {initiatives.map((item, i) => {
          const Icon = initiativeIcons[i];
          return (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-6">{t('sustainability.impactTitle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4">{t('sustainability.tipsTitle')}</h3>
        <div className="space-y-4">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-gray-600">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SustainabilityInfo;
