import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
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
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    return false;
  }
}

export async function stopBackgroundLocationTracking() {
  // Şimdilik boş
}

export async function getExpoPushToken() {
  try {
    const { data } = await Notifications.getExpoPushTokenAsync();
    return data;
  } catch (e) {
    return null;
  }
}
