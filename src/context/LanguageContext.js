import React, { createContext, useState, useContext } from 'react';
import translations from '../utils/translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('hindi');

  const t = (key) => {
    return translations[language]?.[key] || translations['hindi'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};