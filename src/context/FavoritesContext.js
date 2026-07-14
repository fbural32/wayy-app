import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@yol_arkadasim_favoriler';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Uygulama açılışında kayıtlı favorileri yükle
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setFavoriteIds(JSON.parse(stored));
        }
      } catch (e) {
        // Sessizce yoksay, favoriler boş başlar
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Değişiklikleri kaydet
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds)).catch(() => {});
  }, [favoriteIds, isLoaded]);

  function toggleFavorite(placeId) {
    setFavoriteIds((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  }

  function isFavorite(placeId) {
    return favoriteIds.includes(placeId);
  }

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites, FavoritesProvider içinde kullanılmalıdır');
  }
  return ctx;
}
