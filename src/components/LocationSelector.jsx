import React, { useState, useEffect, useRef } from 'react';
import { statesList, getCitiesForState } from '../data/locations';
import { MapPin, ChevronDown, Search, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LocationSelector({
  state = '',
  city = '',
  onChange = () => {},
  disabled = false,
  layout = 'grid' // 'grid' (2 columns) or 'stacked' (vertical)
}) {
  const { t } = useTranslation();
  const [selectedState, setSelectedState] = useState(state || '');
  const [selectedCity, setSelectedCity] = useState(city || '');

  // Search states for dropdowns
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const stateRef = useRef(null);
  const cityRef = useRef(null);

  useEffect(() => {
    setSelectedState(state || '');
  }, [state]);

  useEffect(() => {
    setSelectedCity(city || '');
  }, [city]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setStateOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setCityOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableCities = getCitiesForState(selectedState);

  const filteredStates = statesList.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredCities = availableCities.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleSelectState = (s) => {
    setSelectedState(s);
    setStateOpen(false);
    setStateSearch('');

    const cities = getCitiesForState(s);
    const newCity = cities.includes(selectedCity) ? selectedCity : (cities[0] || '');
    setSelectedCity(newCity);
    onChange({ country: 'India', state: s, city: newCity });
  };

  const handleSelectCity = (c) => {
    setSelectedCity(c);
    setCityOpen(false);
    setCitySearch('');
    onChange({ country: 'India', state: selectedState, city: c });
  };

  const containerClass = layout === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
    : 'space-y-4';

  return (
    <div className={containerClass}>
      
      {/* 1. State / Union Territory Dropdown */}
      <div className="relative" ref={stateRef}>
        <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1.5 uppercase tracking-wider">
          {t('location.stateLabel', 'State / Union Territory (India)')}
        </label>
        
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setStateOpen(!stateOpen);
              setCityOpen(false);
            }
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-eco-200 dark:border-dark-border bg-white dark:bg-dark-card text-stone-900 dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-eco-500 shadow-sm transition-all disabled:opacity-50"
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-4 h-4 text-eco-700 dark:text-eco-400 shrink-0" />
            <span className={selectedState ? 'font-medium' : 'text-stone-400 dark:text-stone-500'}>
              {selectedState || t('location.selectStatePrompt', 'Select State or UT')}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 shrink-0 ${stateOpen ? 'rotate-180' : ''}`} />
        </button>

        {stateOpen && (
          <div className="absolute left-0 mt-1.5 w-full rounded-2xl shadow-xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 pb-2 pt-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  placeholder={t('location.searchState', 'Search 28 States & 8 UTs...')}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50 dark:bg-dark-bg text-stone-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto px-1 space-y-0.5">
              {filteredStates.length > 0 ? (
                filteredStates.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSelectState(s)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors text-left ${
                      selectedState === s
                        ? 'bg-eco-100 dark:bg-eco-950/60 text-eco-950 dark:text-eco-200 font-bold'
                        : 'text-stone-700 dark:text-dark-muted hover:bg-eco-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span>{s}</span>
                    {selectedState === s && <Check className="w-3.5 h-3.5 text-eco-800 dark:text-eco-300" />}
                  </button>
                ))
              ) : (
                <p className="text-xs text-center text-stone-400 py-3">
                  {t('location.noStateFound', 'No state or UT found')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. City Dropdown (Dependent & Searchable) */}
      <div className="relative" ref={cityRef}>
        <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1.5 uppercase tracking-wider">
          {t('location.cityLabel', 'City / District / Town')}
        </label>
        
        <button
          type="button"
          disabled={disabled || !selectedState}
          onClick={() => {
            if (!disabled && selectedState) {
              setCityOpen(!cityOpen);
              setStateOpen(false);
            }
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-eco-200 dark:border-dark-border bg-white dark:bg-dark-card text-stone-900 dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-eco-500 shadow-sm transition-all disabled:opacity-50"
        >
          <div className="flex items-center gap-2 truncate">
            <span className={selectedCity ? 'font-medium' : 'text-stone-400 dark:text-stone-500'}>
              {selectedCity || (!selectedState ? t('location.selectStateFirst', 'Select State first') : t('location.selectCityPrompt', 'Select City'))}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 shrink-0 ${cityOpen ? 'rotate-180' : ''}`} />
        </button>

        {cityOpen && selectedState && (
          <div className="absolute left-0 mt-1.5 w-full rounded-2xl shadow-xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 pb-2 pt-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder={t('location.searchCity', 'Search cities in ' + selectedState + '...')}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50 dark:bg-dark-bg text-stone-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto px-1 space-y-0.5">
              {filteredCities.length > 0 ? (
                filteredCities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelectCity(c)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors text-left ${
                      selectedCity === c
                        ? 'bg-eco-100 dark:bg-eco-950/60 text-eco-950 dark:text-eco-200 font-bold'
                        : 'text-stone-700 dark:text-dark-muted hover:bg-eco-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span>{c}</span>
                    {selectedCity === c && <Check className="w-3.5 h-3.5 text-eco-800 dark:text-eco-300" />}
                  </button>
                ))
              ) : (
                <p className="text-xs text-center text-stone-400 py-3">
                  {t('location.noCityFound', 'No city found matching')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
