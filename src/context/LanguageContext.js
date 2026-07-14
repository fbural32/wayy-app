import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STRINGS } from '../config/i18n';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('tr');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@wayy_lang').then(v => {
      if (v) setLang(v);
      setIsLoaded(true);
    });
  }, []);

  async function changeLanguage(code) {
    setLang(code);
    await AsyncStorage.setItem('@wayy_lang', code);
  }

  const t = STRINGS[lang] || STRINGS.tr;

  if (!isLoaded) return null;

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
