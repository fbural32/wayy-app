const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const FALLBACK_IMAGES = {
  restoran: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=640&q=80',
  muze: 'https://images.unsplash.com/photo-1544967919-44c1ef2f9e4a?w=640&q=80',
  tarihi: 'https://images.unsplash.com/photo-1563804447971-6e113ab80713?w=640&q=80',
  unlu_kisi: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&q=80',
  doga: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=640&q=80',
  etkinlik: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=640&q=80',
};

function getCategory(tags) {
  if (tags.amenity === 'restaurant') return 'restoran';
  if (tags.amenity === 'cafe' && tags.cuisine) return 'restoran';
  if (tags.tourism === 'museum' || tags.amenity === 'museum') return 'muze';
  if (tags.historic === 'castle') return 'tarihi';
  if (tags.historic === 'ruins') return 'tarihi';
  if (tags.historic === 'archaeological_site') return 'tarihi';
  if (tags.historic === 'fort') return 'tarihi';
  if (tags.historic === 'city_gate') return 'tarihi';
  if (tags.historic === 'memorial') return 'unlu_kisi';
  if (tags.historic === 'monument') return 'unlu_kisi';
  if (tags.tourism === 'memorial') return 'unlu_kisi';
  if (tags.natural === 'beach') return 'doga';
  if (tags.natural === 'waterfall') return 'doga';
  if (tags.natural === 'lake') return 'doga';
  if (tags.leisure === 'nature_reserve') return 'doga';
  if (tags.boundary === 'national_park') return 'doga';
  return null;
}

function getName(tags) {
  return tags['name:tr'] || tags.name || null;
}

function estimateRating(tags, category) {
  let base = 3.8;
  if (category === 'tarihi') base = 4.1;
  if (category === 'muze') base = 4.2;
  if (category === 'unlu_kisi') base = 4.3;
  if (category === 'doga') base = 4.0;
  if (category === 'restoran') base = 3.9;
  if (tags.wikimedia_commons || tags.wikipedia) base += 0.3;
  if (tags.phone || tags.website) base += 0.1;
  const variation = (Math.random() - 0.5) * 0.4;
  return Math.min(5.0, Math.max(3.5, parseFloat((base + variation).toFixed(1))));
}

function getImage(category, tags) {
  if (tags.wikimedia_commons) {
    const file = tags.wikimedia_commons.replace('File:', '').replace(/ /g, '_');
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=640`;
  }
  if (tags.image && tags.image.startsWith('http')) {
    return tags.image;
  }
  return FALLBACK_IMAGES[category] || FALLBACK_IMAGES.tarihi;
}

function getDescription(tags, category, name) {
  if (tags['description:tr']) return tags['description:tr'];
  if (tags.description) return tags.description;
  const defaults = {
    restoran: `${name} - Yöresel lezzetler sunan restoran.`,
    muze: `${name} - Bölgenin tarihini yansıtan müze.`,
    tarihi: `${name} - Tarihi öneme sahip yer.`,
    unlu_kisi: `${name} - Anıt veya tarihi yapı.`,
    doga: `${name} - Doğal güzellikler ve açık hava.`,
  };
  return defaults[category] || name;
}

export async function fetchNearbyPlaces(latitude, longitude, radiusMeters = 15000) {
  const query = `
    [out:json][timeout:30];
    (
      node["amenity"="restaurant"]["name"](around:${radiusMeters},${latitude},${longitude});
      node["amenity"="cafe"]["cuisine"]["name"](around:${radiusMeters},${latitude},${longitude});
      node["tourism"="museum"]["name"](around:${radiusMeters},${latitude},${longitude});
      node["historic"~"castle|ruins|archaeological_site|fort|memorial|monument|city_gate"]["name"](around:${radiusMeters},${latitude},${longitude});
      node["natural"~"beach|waterfall|lake"]["name"](around:${radiusMeters},${latitude},${longitude});
      node["leisure"="nature_reserve"]["name"](around:${radiusMeters},${latitude},${longitude});
      way["historic"~"castle|ruins|archaeological_site|fort"]["name"](around:${radiusMeters},${latitude},${longitude});
      way["natural"~"beach|lake"]["name"](around:${radiusMeters},${latitude},${longitude});
    );
    out center 80;
  `;

  try {
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) throw new Error('OSM API hatası: ' + response.status);
    const data = await response.json();

    const seen = new Set();
    return data.elements
      .filter(el => {
        const name = getName(el.tags);
        if (!name || name.length < 3) return false;
        if (seen.has(name.toLowerCase())) return false;
        seen.add(name.toLowerCase());
        return true;
      })
      .map(el => {
        const category = getCategory(el.tags);
        if (!category) return null;
        const name = getName(el.tags);
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;
        if (!lat || !lon) return null;
        return {
          id: `osm-${el.id}`,
          name,
          city: el.tags['addr:city'] || el.tags['addr:district'] || '',
          category,
          latitude: lat,
          longitude: lon,
          rating: estimateRating(el.tags, category),
          reviewCount: Math.floor(Math.random() * 300) + 20,
          description: getDescription(el.tags, category, name),
          image: getImage(category, el.tags),
          isOSM: true,
        };
      })
      .filter(Boolean)
      .filter(p => p.rating >= 3.5);
  } catch (e) {
    console.log('OSM fetch hatası:', e.message);
    return [];
  }
}
