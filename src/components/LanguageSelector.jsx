import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Search, Check, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' }
];

export default function LanguageSelector({ variant = 'navbar' }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
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

  const filteredLanguages = LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.native.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setIsOpen(false);
    setSearch('');
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
        <span className="hidden sm:inline">{currentLang.flag}</span>
        <span className="font-semibold">{currentLang.native}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-eco-600 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 pb-2 pt-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search language..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-eco-200 dark:border-dark-border bg-eco-50 dark:bg-dark-bg text-stone-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto px-1 space-y-0.5">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
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
              ))
            ) : (
              <p className="text-xs text-center text-stone-400 py-3">No language found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
