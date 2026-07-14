import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { getDistanceKm } from './distance';
import { PLACES } from '../data/places';

const BACKGROUND_LOCATION_TASK = 'background-location-task';
const ALERT_RADIUS_KM = 1;

// Bildirim davranışı - uygulama açıkken de göster
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Arka plan konum görevi
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) return;
  if (!data) return;
  const { locations } = data;
  if (!locations || locations.length === 0) return;

  const { latitude, longitude } = locations[0].coords;

  // 1 km içindeki yerleri bul
  const nearby = PLACES
    .map(p => ({ ...p, distKm: getDistanceKm(latitude, longitude, p.latitude, p.longitude) }))
    .filter(p => p.distKm <= ALERT_RADIUS_KM)
    .sort((a, b) => a.distKm - b.distKm);

  if (nearby.length === 0) return;

  const place = nearby[0];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `📍 Yakınında: ${place.name}`,
      body: `${place.city} — Görmek ister misin?`,
      data: { placeId: place.id },
      sound: true,
    },
    trigger: null, // anında gönder
  });
});

// İzin al
export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Arka plan konum iznini al ve görevi başlat
export async function startBackgroundLocationTracking() {
  try {
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== 'granted') return false;

    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    if (bg !== 'granted') return false;

    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
    if (!isRegistered) {
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60000,      // 1 dakikada bir kontrol
        distanceInterval: 500,    // veya 500 metre hareket edince
        foregroundService: {
          notificationTitle: 'Wayy! aktif',
          notificationBody: 'Yakınındaki yerleri takip ediyor...',
          notificationColor: '#1D3557',
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      });
    }
    return true;
  } catch (e) {
    console.log('Arka plan konum hatası:', e.message);
    return false;
  }
}

// Arka plan görevini durdur
export async function stopBackgroundLocationTracking() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
  } catch (e) {
    console.log('Durdurma hatası:', e.message);
  }
}

// Expo push token al (sunucu tarafı bildirim için)
export async function getExpoPushToken() {
  try {
    const { data } = await Notifications.getExpoPushTokenAsync();
    return data;
  } catch (e) {
    return null;
  }
}
