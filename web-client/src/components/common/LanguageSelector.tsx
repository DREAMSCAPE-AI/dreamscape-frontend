import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Languages } from 'lucide-react';
import { supportedLanguages } from '@/i18n/languageMapping';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full' | 'settings';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'compact' }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = supportedLanguages.find(lang => lang.code === i18n.language) || supportedLanguages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  // Compact variant - icon + language code (for Header)
  if (variant === 'compact') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1.5 text-gray-700 hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-50"
          title="Change language"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">{currentLanguage.code.toUpperCase()}</span>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                  currentLanguage.code === language.code
                    ? 'bg-orange-50 text-orange-500'
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
                }`}
              >
                <span className="text-lg">{language.flag === 'US' ? '🇺🇸' : '🇫🇷'}</span>
                <span>{language.name}</span>
                {currentLanguage.code === language.code && (
                  <span className="ml-auto text-orange-500">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full variant - icon + label (for Footer)
  if (variant === 'full') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span>{currentLanguage.name} ({currentLanguage.flag})</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                  currentLanguage.code === language.code
                    ? 'bg-orange-50 text-orange-500'
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
                }`}
              >
                <span className="text-lg">{language.flag === 'US' ? '🇺🇸' : '🇫🇷'}</span>
                <span>{language.name}</span>
                {currentLanguage.code === language.code && (
                  <span className="ml-auto text-orange-500">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Settings variant - dropdown matching existing style
  if (variant === 'settings') {
    return (
      <div className="relative">
        <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <select
          value={currentLanguage.name}
          onChange={(e) => {
            const selected = supportedLanguages.find(lang => lang.name === e.target.value);
            if (selected) {
              handleLanguageChange(selected.code);
            }
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none bg-white"
        >
          {supportedLanguages.map((language) => (
            <option key={language.code} value={language.name}>
              {language.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return null;
};

export default LanguageSelector;
