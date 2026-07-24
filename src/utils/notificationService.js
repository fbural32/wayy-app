import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { getDistanceKm } from './distance';
import { PLACES } from '../data/places';

const BACKGROUND_LOCATION_TASK = 'background-location-task';
const ALERT_RADIUS_KM = 1;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Arka plan görev tanımı - uygulama başlamadan önce çağrılmalı
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error || !data) return;
  const { locations } = data;
  if (!locations?.length) return;

  const { latitude, longitude } = locations[0].coords;

  const nearby = PLACES
    .map(p => ({ ...p, distKm: getDistanceKm(latitude, longitude, p.latitude, p.longitude) }))
    .filter(p => p.distKm <= ALERT_RADIUS_KM)
    .sort((a, b) => a.distKm - b.distKm);

  if (!nearby.length) return;
  const place = nearby[0];

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `📍 Yakınında: ${place.name}`,
        body: `${place.city} — Görmek ister misin?`,
        data: { placeId: place.id },
        sound: true,
      },
      trigger: null,
    });
  } catch (e) {
    console.log('Bildirim hatası:', e.message);
  }
});

export async function requestNotificationPermission() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    return false;
  }
}

export async function startBackgroundLocationTracking() {
  try {
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== 'granted') return false;

    // Arka plan iznini ayrıca iste
    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    if (bg !== 'granted') {
      console.log('Arka plan konum izni verilmedi');
      return false;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
    if (!isRegistered) {
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60000,
        distanceInterval: 300,
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

export async function getExpoPushToken() {
  try {
    const { data } = await Notifications.getExpoPushTokenAsync();
    return data;
  } catch (e) {
    return null;
  }
}
