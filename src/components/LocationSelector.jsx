import React, { useState, useEffect } from 'react';
import { countries, getStates, getCities } from '../data/locations';
import { MapPin, ChevronDown } from 'lucide-react';

export default function LocationSelector({
  country = 'India',
  state = '',
  city = '',
  onChange = () => {},
  disabled = false,
  layout = 'grid' // 'grid' (horizontal 3 cols) or 'stacked' (vertical)
}) {
  const [selectedCountry, setSelectedCountry] = useState(country || 'India');
  const [selectedState, setSelectedState] = useState(state || '');
  const [selectedCity, setSelectedCity] = useState(city || '');

  // Keep in sync with parent props if changed externally
  useEffect(() => {
    setSelectedCountry(country || 'India');
  }, [country]);

  useEffect(() => {
    setSelectedState(state || '');
  }, [state]);

  useEffect(() => {
    setSelectedCity(city || '');
  }, [city]);

  const availableStates = getStates(selectedCountry);
  const availableCities = getCities(selectedCountry, selectedState);

  const handleCountryChange = (newCountry) => {
    setSelectedCountry(newCountry);
    const newStates = getStates(newCountry);
    const firstState = newStates[0] || '';
    const newCities = getCities(newCountry, firstState);
    const firstCity = newCities[0] || '';

    setSelectedState(firstState);
    setSelectedCity(firstCity);
    onChange({ country: newCountry, state: firstState, city: firstCity });
  };

  const handleStateChange = (newState) => {
    setSelectedState(newState);
    const newCities = getCities(selectedCountry, newState);
    const firstCity = newCities[0] || '';

    setSelectedCity(firstCity);
    onChange({ country: selectedCountry, state: newState, city: firstCity });
  };

  const handleCityChange = (newCity) => {
    setSelectedCity(newCity);
    onChange({ country: selectedCountry, state: selectedState, city: newCity });
  };

  const containerClass = layout === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-3 gap-3'
    : 'space-y-3';

  return (
    <div className={containerClass}>
      {/* Country */}
      <div>
        <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1 uppercase tracking-wider">
          Country
        </label>
        <div className="relative">
          <select
            value={selectedCountry}
            disabled={disabled}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm rounded-xl border border-eco-200 dark:border-dark-border bg-white dark:bg-dark-card text-stone-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500 shadow-sm appearance-none disabled:opacity-50"
          >
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>
      </div>

      {/* State */}
      <div>
        <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1 uppercase tracking-wider">
          State / Province
        </label>
        <div className="relative">
          <select
            value={selectedState}
            disabled={disabled || availableStates.length === 0}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm rounded-xl border border-eco-200 dark:border-dark-border bg-white dark:bg-dark-card text-stone-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500 shadow-sm appearance-none disabled:opacity-50"
          >
            <option value="">Select State</option>
            {availableStates.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1 uppercase tracking-wider">
          City / District
        </label>
        <div className="relative">
          <select
            value={selectedCity}
            disabled={disabled || !selectedState}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm rounded-xl border border-eco-200 dark:border-dark-border bg-white dark:bg-dark-card text-stone-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500 shadow-sm appearance-none disabled:opacity-50"
          >
            <option value="">Select City</option>
            {availableCities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
