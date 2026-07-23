const WIKI_API = 'https://tr.wikipedia.org/w/api.php';
const WIKI_EN = 'https://en.wikipedia.org/w/api.php';

const cache = {};

export async function getWikiPhoto(placeName, city = '') {
  const key = placeName.slice(0, 20);
  if (cache[key]) return cache[key];

  const searches = [
    placeName,
    `${placeName} ${city}`,
    placeName.split('(')[0].trim(),
  ];

  for (const term of searches) {
    try {
      // Türkçe Wikipedia'da ara
      const trUrl = `${WIKI_API}?action=query&titles=${encodeURIComponent(term)}&prop=pageimages&format=json&pithumbsize=800&origin=*`;
      const trRes = await fetch(trUrl);
      const trData = await trRes.json();
      const trPages = Object.values(trData?.query?.pages || {});
      if (trPages[0]?.thumbnail?.source) {
        cache[key] = trPages[0].thumbnail.source;
        return cache[key];
      }

      // İngilizce Wikipedia'da ara
      const enUrl = `${WIKI_EN}?action=query&titles=${encodeURIComponent(term)}&prop=pageimages&format=json&pithumbsize=800&origin=*`;
      const enRes = await fetch(enUrl);
      const enData = await enRes.json();
      const enPages = Object.values(enData?.query?.pages || {});
      if (enPages[0]?.thumbnail?.source) {
        cache[key] = enPages[0].thumbnail.source;
        return cache[key];
      }
    } catch {}
  }
  return null;
}
