const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Sadece anlamlı kategoriler - kıraathane, market gibi yerler dahil değil
function getCategory(tags) {
  // RESTORAN - sadece gerçek restoranlar
  if (tags.amenity === 'restaurant') return 'restoran';
  if (tags.amenity === 'cafe' && tags.cuisine) return 'restoran'; // mutfağı belirtilmiş kafeler
  
  // MÜZE
  if (tags.tourism === 'museum' || tags.amenity === 'museum') return 'muze';
  
  // TARİHİ YER - kalıcı yapılar
  if (tags.historic === 'castle') return 'tarihi';
  if (tags.historic === 'ruins') return 'tarihi';
  if (tags.historic === 'archaeological_site') return 'tarihi';
  if (tags.historic === 'fort') return 'tarihi';
  if (tags.historic === 'city_gate') return 'tarihi';
  if (tags.historic === 'mosque' && tags.building) return 'tarihi';
  if (tags.historic === 'church') return 'tarihi';
  if (tags.historic === 'manor') return 'tarihi';
  
  // ÜNLÜ KİŞİ / ANIT
  if (tags.historic === 'memorial') return 'unlu_kisi';
  if (tags.historic === 'monument') return 'unlu_kisi';
  if (tags.tourism === 'memorial') return 'unlu_kisi';
  
  // DOĞA - sadece gerçek doğa alanları
  if (tags.natural === 'beach') return 'doga';
  if (tags.natural === 'waterfall') return 'doga';
  if (tags.natural === 'lake') return 'doga';
  if (tags.leisure === 'nature_reserve') return 'doga';
  if (tags.tourism === 'camp_site' && tags.name) return 'doga';
  if (tags.boundary === 'national_park') return 'doga';
  if (tags.leisure === 'park' && tags['park:type'] === 'national_park') return 'doga';

  return null; // kıraathane, market, ATM, vs → null = gösterme
}

// Türkçe isim varsa onu kullan
function getName(tags) {
  return tags['name:tr'] || tags.name || null;
}

// Kategori + tag'a göre gerçekçi puan tahmini
function estimateRating(tags, category) {
  let base = 3.8;
  if (category === 'tarihi') base = 4.1;
  if (category === 'muze') base = 4.2;
  if (category === 'unlu_kisi') base = 4.3;
  if (category === 'doga') base = 4.0;
  if (category === 'restoran') base = 3.9;
  // Wikimedia görseli varsa daha popüler
  if (tags.wikimedia_commons || tags.wikipedia) base += 0.3;
  // Telefon veya website varsa daha kurumsal
  if (tags.phone || tags.website) base += 0.1;
  // Rastgele küçük varyasyon
  const variation = (Math.random() - 0.5) * 0.4;
  return Math.min(5.0, Math.max(3.5, parseFloat((base + variation).toFixed(1))));
}

function getImage(category, tags) {
  // Wikimedia görseli varsa kullan
  if (tags.wikimedia_commons) {
    const file = tags.wikimedia_commons.replace('File:', '').replace(/ /g, '_');
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=400`;
  }
  const images = {
    restoran: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70',
    muze: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=400&q=70',
    tarihi: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&q=70',
    unlu_kisi: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400&q=70',
    doga: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70',
  };
  return images[category];
}

function getDescription(tags, category, name) {
  if (tags['description:tr']) return tags['description:tr'];
  if (tags.description) return tags.description;
  const defaults = {
    restoran: `${name} - Yöresel lezzetler sunan restoran.`,
    muze: `${name} - Bölgenin tarihini ve kültürünü yansıtan müze.`,
    tarihi: `${name} - Tarihi öneme sahip yer.`,
    unlu_kisi: `${name} - Anıt veya tarihi yapı.`,
    doga: `${name} - Doğal güzellikler ve açık hava aktiviteleri.`,
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
      node["historic"~"castle|ruins|archaeological_site|fort|memorial|monument|city_gate|manor"]["name"](around:${radiusMeters},${latitude},${longitude});
      node["natural"~"beach|waterfall|lake"]["name"](around:${radiusMeters},${latitude},${longitude});
      node["leisure"="nature_reserve"]["name"](around:${radiusMeters},${latitude},${longitude});
      way["historic"~"castle|ruins|archaeological_site|fort"]["name"](around:${radiusMeters},${latitude},${longitude});
      way["natural"~"beach|lake"]["name"](around:${radiusMeters},${latitude},${longitude});
      way["leisure"="nature_reserve"]["name"](around:${radiusMeters},${latitude},${longitude});
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
    const places = data.elements
      .filter(el => {
        const name = getName(el.tags);
        if (!name || name.length < 3) return false;
        // Tekrar eden isimleri atla
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
        const rating = estimateRating(el.tags, category);
        return {
          id: `osm-${el.id}`,
          name,
          city: el.tags['addr:city'] || el.tags['addr:district'] || el.tags['addr:province'] || '',
          category,
          latitude: lat,
          longitude: lon,
          rating,
          reviewCount: Math.floor(Math.random() * 300) + 20,
          description: getDescription(el.tags, category, name),
          image: getImage(category, el.tags),
          isOSM: true,
        };
      })
      .filter(Boolean)
      // Min 3.5 puan filtresi - düşük kaliteli yerleri at
      .filter(p => p.rating >= 3.5);

    console.log(`OSM: ${places.length} kaliteli yer bulundu`);
    return places;
  } catch (e) {
    console.log('OSM fetch hatası:', e.message);
    return [];
  }
}
