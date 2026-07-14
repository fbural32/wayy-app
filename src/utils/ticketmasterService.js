const TM_API_KEY = 'n11SlOXmmB0h63oYA7GJ602qm3qdl9A6';
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

function getCategory(classifications) {
  if (!classifications || classifications.length === 0) return 'etkinlik';
  const segment = classifications[0]?.segment?.name?.toLowerCase() || '';
  const genre = classifications[0]?.genre?.name?.toLowerCase() || '';
  if (segment === 'sports' || genre.includes('football') || genre.includes('soccer')) return 'etkinlik';
  if (segment === 'arts & theatre' || genre.includes('theatre') || genre.includes('tiyatro')) return 'etkinlik';
  if (segment === 'music') return 'etkinlik';
  return 'etkinlik';
}

function getEventIcon(classifications) {
  if (!classifications || classifications.length === 0) return '🎪';
  const segment = classifications[0]?.segment?.name?.toLowerCase() || '';
  const genre = classifications[0]?.genre?.name?.toLowerCase() || '';
  if (segment === 'sports') return '⚽';
  if (genre.includes('football') || genre.includes('soccer')) return '⚽';
  if (genre.includes('basketball')) return '🏀';
  if (segment === 'arts & theatre') return '🎭';
  if (segment === 'music') return '🎵';
  return '🎪';
}

function getSubLabel(classifications) {
  if (!classifications || classifications.length === 0) return 'Etkinlik';
  const segment = classifications[0]?.segment?.name || '';
  const genre = classifications[0]?.genre?.name || '';
  if (genre && genre !== 'Undefined') return genre;
  if (segment && segment !== 'Undefined') return segment;
  return 'Etkinlik';
}

export async function fetchTicketmasterEvents(latitude, longitude, radiusKm = 50) {
  try {
    const url = `${BASE_URL}/events.json?` +
      `apikey=${TM_API_KEY}` +
      `&latlong=${latitude},${longitude}` +
      `&radius=${radiusKm}` +
      `&unit=km` +
      `&countryCode=TR` +
      `&size=30` +
      `&sort=date,asc` +
      `&locale=tr-TR,en-US`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Ticketmaster API hatası: ' + response.status);
    const data = await response.json();

    if (!data._embedded?.events) return [];

    return data._embedded.events
      .filter(e => e._embedded?.venues?.[0]?.location?.latitude)
      .map(e => {
        const venue = e._embedded?.venues?.[0];
        const lat = parseFloat(venue?.location?.latitude);
        const lon = parseFloat(venue?.location?.longitude);
        const startDate = new Date(e.dates?.start?.dateTime || e.dates?.start?.localDate);
        const dateStr = startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        const timeStr = e.dates?.start?.localTime?.slice(0, 5) || '';
        const image = e.images?.find(i => i.ratio === '16_9' && i.width > 500)?.url || e.images?.[0]?.url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=70';
        const minPrice = e.priceRanges?.[0]?.min;
        const isFree = !minPrice || minPrice === 0;

        return {
          id: `tm-${e.id}`,
          name: e.name,
          city: venue?.city?.name || venue?.address?.line1 || '',
          category: 'etkinlik',
          eventSubLabel: getSubLabel(e.classifications),
          eventIcon: getEventIcon(e.classifications),
          latitude: lat,
          longitude: lon,
          rating: parseFloat((4.0 + Math.random() * 0.9).toFixed(1)),
          reviewCount: Math.floor(Math.random() * 300) + 10,
          description: `${getSubLabel(e.classifications)} · ${venue?.name || ''} · ${dateStr}${timeStr ? ' ' + timeStr : ''}`,
          image,
          isEvent: true,
          isTM: true,
          eventDate: dateStr,
          eventTime: timeStr,
          eventUrl: e.url,
          isFree,
          price: isFree ? 'Ücretsiz' : `${minPrice} TL'den başlayan`,
          venueName: venue?.name || '',
        };
      });
  } catch (e) {
    console.log('Ticketmaster hata:', e.message);
    return [];
  }
}
