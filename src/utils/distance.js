const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function estimateMinutes(km, speedKmh) {
  return (km / speedKmh) * 60;
}

export function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return '';
  if (minutes < 1) return '1 dk\'dan az';
  if (minutes < 60) return `${Math.round(minutes)} dk`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours} sa ${mins} dk` : `${hours} sa`;
}

// Küfür filtresi - basit Türkçe küfür listesi
const BAD_WORDS = ['sik', 'orospu', 'göt', 'amk', 'bok', 'piç', 'oç', 'kahpe', 'ibne', 'sürtük'];

export function containsBadWord(text) {
  const lower = text.toLowerCase();
  return BAD_WORDS.some(word => lower.includes(word));
}
