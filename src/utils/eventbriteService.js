const EVENTBRITE_TOKEN = 'FFBHDECOQUL6Z3GMVM';
const BASE_URL = 'https://www.eventbriteapi.com/v3';

const CATEGORY_MAP = {
  '103': 'muzik',      // Music
  '104': 'film',       // Film & Media
  '105': 'sahne',      // Performing & Visual Arts
  '108': 'spor',       // Sports & Fitness
  '110': 'yemek',      // Food & Drink
  '113': 'festival',   // Community & Culture
  '116': 'festival',   // Fashion
};

function getEventCategory(categoryId) {
  return CATEGORY_MAP[categoryId] || 'etkinlik';
}

function getEventImage(category) {
  const images = {
    muzik: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=70',
    festival: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=70',
    sahne: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&q=70',
    spor: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=70',
    yemek: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=70',
    etkinlik: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=70',
  };
  return images[category] || images.etkinlik;
}

export async function fetchNearbyEvents(latitude, longitude, radiusKm = 30) {
  try {
    const url = `${BASE_URL}/events/search/?` +
      `token=${EVENTBRITE_TOKEN}` +
      `&location.latitude=${latitude}` +
      `&location.longitude=${longitude}` +
      `&location.within=${radiusKm}km` +
      `&expand=venue,category` +
      `&sort_by=date` +
      `&status=live` +
      `&page_size=30`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Eventbrite API hatası: ' + response.status);
    const data = await response.json();

    if (!data.events) return [];

    return data.events
      .filter(e => e.venue?.latitude && e.venue?.longitude && e.name?.text)
      .map(e => {
        const category = getEventCategory(e.category_id);
        const startDate = new Date(e.start?.local);
        const dateStr = startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        const timeStr = startDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        return {
          id: `eb-${e.id}`,
          name: e.name.text,
          city: e.venue?.address?.city || e.venue?.address?.region || '',
          category: 'etkinlik',
          eventCategory: category,
          latitude: parseFloat(e.venue.latitude),
          longitude: parseFloat(e.venue.longitude),
          rating: 4.0 + Math.random() * 0.9,
          reviewCount: Math.floor(Math.random() * 200) + 10,
          description: e.description?.text?.slice(0, 200) || `${e.name.text} — ${dateStr} saat ${timeStr}`,
          image: e.logo?.url || getEventImage(category),
          isEvent: true,
          eventDate: dateStr,
          eventTime: timeStr,
          eventUrl: e.url,
          isFree: e.is_free,
          venueName: e.venue?.name || '',
        };
      });
  } catch (e) {
    console.log('Eventbrite hata:', e.message);
    return [];
  }
}
