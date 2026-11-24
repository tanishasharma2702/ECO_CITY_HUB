import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';

// EcoCity Hub - Exclusively English and Hindi
const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' }
];

export default function LanguageSelector({ variant = 'navbar' }) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-eco-100/60 dark:bg-dark-card border border-eco-200 dark:border-dark-border text-eco-900 dark:text-dark-text hover:bg-eco-200/80 transition-colors shadow-sm"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-eco-700 dark:text-eco-400" />
        <span className="text-base leading-none">{currentLang.flag}</span>
        <span className="font-semibold text-xs sm:text-sm">{currentLang.native}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-eco-600 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-1 space-y-0.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => selectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                  i18n.language === lang.code
                    ? 'bg-eco-100 dark:bg-eco-950/60 text-eco-900 dark:text-eco-200 font-semibold'
                    : 'text-stone-700 dark:text-dark-muted hover:bg-eco-50 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <span className="text-stone-800 dark:text-dark-text">{lang.native}</span>
                  <span className="text-xs text-stone-400">({lang.name})</span>
                </div>
                {i18n.language === lang.code && (
                  <Check className="w-4 h-4 text-eco-700 dark:text-eco-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
