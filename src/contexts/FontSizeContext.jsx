import React, { createContext, useContext, useEffect, useState } from 'react';

const FontSizeContext = createContext();

export function FontSizeProvider({ children }) {
  // Font sizes: 'sm' | 'md' | 'lg' | 'xl'
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('ecocity_fontsize') || 'md';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem('ecocity_fontsize', fontSize);
  }, [fontSize]);

  const updateFontSize = (size) => {
    if (['sm', 'md', 'lg', 'xl'].includes(size)) {
      setFontSize(size);
    }
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, updateFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
}
