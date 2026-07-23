// Wikipedia/Wikimedia API - Ücretsiz gerçek fotoğraflar
const WIKI_API = 'https://tr.wikipedia.org/w/api.php';
const WIKI_EN_API = 'https://en.wikipedia.org/w/api.php';

// Yer adına göre Wikipedia'dan fotoğraf çek
export async function getWikipediaPhoto(placeName, city = '') {
  try {
    const searchTerm = city ? `${placeName} ${city}` : placeName;
    
    // Önce Türkçe Wikipedia'da ara
    const trUrl = `${WIKI_API}?action=query&titles=${encodeURIComponent(searchTerm)}&prop=pageimages&format=json&pithumbsize=640&origin=*`;
    const trRes = await fetch(trUrl);
    const trData = await trRes.json();
    const trPages = Object.values(trData.query?.pages || {});
    if (trPages[0]?.thumbnail?.source) {
      return trPages[0].thumbnail.source;
    }

    // Türkçe'de bulamazsa İngilizce'de ara
    const enUrl = `${WIKI_EN_API}?action=query&titles=${encodeURIComponent(placeName)}&prop=pageimages&format=json&pithumbsize=640&origin=*`;
    const enRes = await fetch(enUrl);
    const enData = await enRes.json();
    const enPages = Object.values(enData.query?.pages || {});
    if (enPages[0]?.thumbnail?.source) {
      return enPages[0].thumbnail.source;
    }

    return null;
  } catch (e) {
    return null;
  }
}

// Kategori bazlı yedek fotoğraflar (Unsplash - yüksek kalite)
export const FALLBACK_IMAGES = {
  restoran: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=640&q=80',
  muze: 'https://images.unsplash.com/photo-1544967919-44c1ef2f9e4a?w=640&q=80',
  tarihi: 'https://images.unsplash.com/photo-1563804447971-6e113ab80713?w=640&q=80',
  unlu_kisi: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&q=80',
  doga: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=640&q=80',
  etkinlik: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=640&q=80',
};
