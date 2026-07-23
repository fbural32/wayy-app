const PEXELS_KEY = 'dFCt58jARoeepmeXlhxeGWvDXJeV51JkfN5oIXqZP5BLEwgry4oxkkvf';
const BASE_URL = 'https://api.pexels.com/v1';

// Güvenilir yedek fotoğraflar (Pexels CDN - doğrudan link)
const CATEGORY_PHOTOS = {
  restoran: [
    'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=640',
  ],
  muze: [
    'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/2372978/pexels-photo-2372978.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/1674049/pexels-photo-1674049.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/69903/pexels-photo-69903.jpeg?auto=compress&cs=tinysrgb&w=640',
  ],
  tarihi: [
    'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/161815/santorini-oia-greece-water-161815.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/3581364/pexels-photo-3581364.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=640',
  ],
  unlu_kisi: [
    'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/1820770/pexels-photo-1820770.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=640',
  ],
  doga: [
    'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=640',
  ],
  etkinlik: [
    'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=640',
    'https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?auto=compress&cs=tinysrgb&w=640',
  ],
};

// Önbellek
const photoCache = {};
let categoryPhotoIndex = {};

export async function getPexelsPhoto(category, placeName = '') {
  const cacheKey = `${category}_${placeName.slice(0, 15)}`;
  if (photoCache[cacheKey]) return photoCache[cacheKey];

  // Önce API'yi dene
  try {
    const query = placeName && placeName.length > 3
      ? `${placeName} turkey`
      : getDefaultQuery(category);

    const url = `${BASE_URL}/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`;
    const res = await fetch(url, {
      headers: { Authorization: PEXELS_KEY }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.photos?.length > 0) {
        const photo = data.photos[0];
        const imageUrl = photo.src.large || photo.src.medium;
        photoCache[cacheKey] = imageUrl;
        return imageUrl;
      }
    }
  } catch {}

  // API çalışmazsa yerel listeyi kullan
  const photos = CATEGORY_PHOTOS[category] || CATEGORY_PHOTOS.tarihi;
  const idx = (categoryPhotoIndex[category] || 0) % photos.length;
  categoryPhotoIndex[category] = idx + 1;
  const fallback = photos[idx];
  photoCache[cacheKey] = fallback;
  return fallback;
}

function getDefaultQuery(category) {
  const queries = {
    restoran: 'restaurant food dining',
    muze: 'museum interior exhibition',
    tarihi: 'ancient ruins historical architecture',
    unlu_kisi: 'monument memorial statue',
    doga: 'nature landscape turkey',
    etkinlik: 'concert festival crowd',
  };
  return queries[category] || 'travel turkey';
}
