import React from 'react';
import { Plane, Instagram, Twitter, Facebook, Youtube, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/common/LanguageSelector';

const Footer = () => {
  const { t } = useTranslation('common');
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Plane className="h-8 w-8 text-orange-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-pink-600 bg-clip-text text-transparent">
                DreamScape
              </span>
            </div>
            <p className="text-gray-600 mb-6">
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-400/10 to-pink-600/10 hover:from-orange-400 hover:to-pink-600 group transition-all duration-300"
                >
                  <Icon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-800">{t('footer.destinations')}</h3>
            <ul className="space-y-3">
              {[
                { key: 'popularCities', label: t('footer.popularCities') },
                { key: 'adventureSpots', label: t('footer.adventureSpots') },
                { key: 'beachGetaways', label: t('footer.beachGetaways') },
                { key: 'culturalSites', label: t('footer.culturalSites') },
                { key: 'hiddenGems', label: t('footer.hiddenGems') }
              ].map((item) => (
                <li key={item.key}>
                  <a href="#" className="text-gray-600 hover:text-orange-500 transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-800">{t('footer.resources')}</h3>
            <ul className="space-y-3">
              {[
                { key: 'travelGuide', label: t('footer.travelGuide') },
                { key: 'faqs', label: t('footer.faqs') },
                { key: 'customerSupport', label: t('footer.customerSupport') },
                { key: 'travelInsurance', label: t('footer.travelInsurance') },
                { key: 'blog', label: t('footer.blog') }
              ].map((item) => (
                <li key={item.key}>
                  <a href="#" className="text-gray-600 hover:text-orange-500 transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-800">{t('footer.stayInspired')}</h3>
            <p className="text-gray-600 mb-4">
              {t('footer.newsletterDesc')}
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-md text-white hover:opacity-90 transition-opacity">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-orange-500 transition-colors">{t('footer.privacyPolicy')}</a>
              <a href="#" className="hover:text-orange-500 transition-colors">{t('footer.termsOfService')}</a>
              <a href="#" className="hover:text-orange-500 transition-colors">{t('footer.cookieSettings')}</a>
              <span>{t('footer.copyright')}</span>
            </div>
            <LanguageSelector variant="full" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;