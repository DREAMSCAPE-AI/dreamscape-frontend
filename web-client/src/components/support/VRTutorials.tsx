import { useTranslation } from 'react-i18next';
import { Headset, Play, Book, Download } from 'lucide-react';

interface VRStep { title: string; description: string }
interface VRTutorial { title: string; duration: string; level: string; description: string }

const stepIcons = [Headset, Play, Book];

const VRTutorials = () => {
  const { t } = useTranslation('support');
  const steps = t('vr.steps', { returnObjects: true }) as VRStep[];
  const tutorials = t('vr.tutorials', { returnObjects: true }) as VRTutorial[];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">{t('vr.quickStartTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <Icon className="w-8 h-8 text-orange-500 mb-3" />
                <h3 className="font-medium mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">{t('vr.tutorialsTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorials.map((tutorial, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={[
                    'https://images.unsplash.com/photo-1626387346567-68d0c49ce1e5?auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80',
                  ][i]}
                  alt={tutorial.title}
                  className="w-full h-full object-cover"
                />
                <button className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 transition-colors">
                  <Play className="w-12 h-12 text-white" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{tutorial.title}</h3>
                  <span className="text-sm text-gray-500">{tutorial.duration}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{tutorial.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-500">{t(`vr.levels.${tutorial.level}`)}</span>
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors">
                    <Download className="w-4 h-4" />{t('vr.downloadResources')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VRTutorials;
