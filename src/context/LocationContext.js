import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { DEFAULT_LOCATION } from '../config/theme';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (mounted) {
          setErrorMsg('Konum izni verilmedi. İzmir merkez gösteriliyor.');
          setLocation({ ...DEFAULT_LOCATION, isFallback: true });
        }
        return;
      }
      try {
        const cur = await Location.getCurrentPositionAsync({});
        if (mounted) setLocation({ latitude: cur.coords.latitude, longitude: cur.coords.longitude, isFallback: false });
      } catch {
        if (mounted) setLocation({ ...DEFAULT_LOCATION, isFallback: true });
      }
      subscriptionRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 15000, distanceInterval: 200 },
        (upd) => { if (mounted) setLocation({ latitude: upd.coords.latitude, longitude: upd.coords.longitude, isFallback: false }); }
      );
    })();
    return () => {
      mounted = false;
      subscriptionRef.current?.remove();
    };
  }, []);

  return (
    <LocationContext.Provider value={{ location, errorMsg }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useUserLocation() {
  return useContext(LocationContext);
}
