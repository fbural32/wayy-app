// Konum izni verilmediğinde veya ilk açılışta gösterilecek varsayılan nokta (İzmir - Konak)
export const DEFAULT_LOCATION = {
  latitude: 38.4237,
  longitude: 27.1428,
};

// "1 saat mesafe" gibi zaman bazlı filtreleri km'ye çevirmek için
// kullanılan ortalama seyahat hızı (şehir dışı/otoyol tahmini)
export const AVG_SPEED_KMH = 75;

// Kullanıcının seçebileceği zaman bazlı mesafe filtreleri.
// "minutes: Infinity" -> mesafe sınırı yok, tüm yerler listelenir.
export const RADIUS_OPTIONS = [
  { id: '15dk', label: '15 dk', minutes: 15 },
  { id: '30dk', label: '30 dk', minutes: 30 },
  { id: '1sa', label: '1 saat', minutes: 60 },
  { id: '2sa', label: '2 saat', minutes: 120 },
  { id: 'tum', label: 'Tümü', minutes: Infinity },
];

export const DEFAULT_RADIUS_ID = '1sa';

// Konum güncelleme ayarları (yolda giderken takip için)
export const LOCATION_TRACKING_OPTIONS = {
  timeInterval: 15000, // 15 saniyede bir kontrol et
  distanceInterval: 200, // veya 200 metre hareket edince güncelle
};
