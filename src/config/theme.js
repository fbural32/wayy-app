export const COLORS = {
  primary: '#E63946',
  secondary: '#1D3557',
  background: '#F0F2F5',
  card: '#FFFFFF',
  text: '#1D1D1F',
  muted: '#6B7280',
  border: '#E5E7EB',
  star: '#F4B400',
  white: '#FFFFFF',
  green: '#2A9D8F',
  purple: '#8E44AD',
  orange: '#E76F51',
  dark: '#264653',
};

export const CATEGORIES = {
  restoran: { label: 'Restoranlar', shortLabel: 'Restoran', icon: 'restaurant-outline', color: '#E76F51' },
  muze: { label: 'Müzeler', shortLabel: 'Müze', icon: 'library-outline', color: '#2A9D8F' },
  tarihi: { label: 'Tarihi & Savaş Alanları', shortLabel: 'Tarihi', icon: 'shield-outline', color: '#264653' },
  unlu_kisi: { label: 'Ünlü Kişiler & Anıtlar', shortLabel: 'Anıt', icon: 'person-circle-outline', color: '#8E44AD' },
  doga: { label: 'Doğa & Piknik', shortLabel: 'Doğa', icon: 'leaf-outline', color: '#27AE60' },
  etkinlik: { label: 'Etkinlikler', shortLabel: 'Etkinlik', icon: 'musical-notes-outline', color: '#E91E8C' },
};

export const CATEGORY_ORDER = ['restoran', 'muze', 'tarihi', 'unlu_kisi', 'doga', 'etkinlik'];

export const BADGES = [
  {
    id: 'doga_savasci', label: 'Doğa Savaşçısı', labelEn: 'Nature Warrior',
    icon: 'https://img.icons8.com/color/96/forest.png', category: 'doga', minScore: 5,
    description: 'Doğa alanlarına (plaj, park, orman, göl) yorum yaparak 5 puan kazan.',
    descriptionEn: 'Earn 5 points by reviewing nature places.',
  },
  {
    id: 'savas_gazisi', label: 'Savaş Gazisi', labelEn: 'War Veteran',
    icon: 'https://img.icons8.com/color/96/memorial.png', category: 'tarihi', minScore: 5,
    description: 'Tarihi ve savaş alanlarına yorum yaparak 5 puan kazan.',
    descriptionEn: 'Earn 5 points by reviewing historical places.',
  },
  {
    id: 'kultur_elcisi', label: 'Kültür Elçisi', labelEn: 'Culture Ambassador',
    icon: 'https://img.icons8.com/color/96/museum.png', category: 'muze', minScore: 5,
    description: 'Müzelere yorum yaparak 5 puan kazan.',
    descriptionEn: 'Earn 5 points by reviewing museums.',
  },
  {
    id: 'lezzet_avcisi', label: 'Lezzet Avcısı', labelEn: 'Taste Hunter',
    icon: 'https://img.icons8.com/color/96/restaurant.png', category: 'restoran', minScore: 5,
    description: 'Restoranlara yorum yaparak 5 puan kazan.',
    descriptionEn: 'Earn 5 points by reviewing restaurants.',
  },
  {
    id: 'anit_bekci', label: 'Anıt Bekçisi', labelEn: 'Monument Guardian',
    icon: 'https://img.icons8.com/color/96/ancient-column.png', category: 'unlu_kisi', minScore: 5,
    description: 'Anıt ve ünlü yerlere yorum yaparak 5 puan kazan.',
    descriptionEn: 'Earn 5 points by reviewing monuments.',
  },
  {
    id: 'ritim_avcisi', label: 'Ritim Avcısı', labelEn: 'Rhythm Hunter',
    icon: 'https://img.icons8.com/color/96/musical-notes.png', category: 'etkinlik', minScore: 5,
    description: 'Konser, festival ve etkinliklere yorum yaparak 5 puan kazan.',
    descriptionEn: 'Earn 5 points by reviewing concerts and festivals.',
    reward: 'Özel Ritim Avcısı rozeti profilinde görünür!',
    rewardEn: 'Special Rhythm Hunter badge on your profile!',
  },
  {
    id: 'gezgin', label: 'Gezgin', labelEn: 'Traveler',
    icon: 'https://img.icons8.com/color/96/compass.png', minScore: 10,
    description: 'Tüm kategorilerde toplam 10 puan kazan. Her yorum 1 puan.',
    descriptionEn: 'Earn 10 total points across all categories.',
    reward: 'Gezgin rozeti profilinde herkese görünür!',
    rewardEn: 'Traveler badge visible to everyone on your profile!',
  },
  {
    id: 'kahraman_gezgin', label: 'Kahraman Gezgin', labelEn: 'Hero Traveler',
    icon: 'https://img.icons8.com/color/96/trophy.png', minScore: 25,
    description: 'Tüm kategorilerde toplam 25 puan kazan.',
    descriptionEn: 'Earn 25 total points across all categories.',
    reward: 'Altın Kahraman rozeti + özel profil çerçevesi!',
    rewardEn: 'Gold Hero badge + special profile frame!',
  },
];

export const TRAVEL_MODES = [
  { id: 'araba', label: 'Araba', labelEn: 'Car', icon: 'car-outline', speedKmh: 75 },
  { id: 'yuruyus', label: 'Yürüyüş', labelEn: 'Walk', icon: 'walk-outline', speedKmh: 5 },
  { id: 'bisiklet', label: 'Bisiklet', labelEn: 'Bike', icon: 'bicycle-outline', speedKmh: 15 },
];

export const RADIUS_OPTIONS = [
  { id: '15dk', label: '15 dk', labelEn: '15 min', minutes: 15 },
  { id: '30dk', label: '30 dk', labelEn: '30 min', minutes: 30 },
  { id: '1sa', label: '1 saat', labelEn: '1 hour', minutes: 60 },
  { id: '2sa', label: '2 saat', labelEn: '2 hours', minutes: 120 },
  { id: 'tum', label: 'Tümü', labelEn: 'All', minutes: Infinity },
];

export const DEFAULT_LOCATION = { latitude: 38.4237, longitude: 27.1428 };

export const AVATARS = [
  { id: 'av1', image: 'https://api.dicebear.com/7.x/adventurer/png?seed=Felix&backgroundColor=b6e3f4', label: 'Kaşif' },
  { id: 'av2', image: 'https://api.dicebear.com/7.x/adventurer/png?seed=Aneka&backgroundColor=ffdfbf', label: 'Maceracı' },
  { id: 'av3', image: 'https://api.dicebear.com/7.x/adventurer/png?seed=Zara&backgroundColor=c0aede', label: 'Gezgin' },
  { id: 'av4', image: 'https://api.dicebear.com/7.x/adventurer/png?seed=Leo&backgroundColor=d1f4d0', label: 'Rehber' },
  { id: 'av5', image: 'https://api.dicebear.com/7.x/adventurer/png?seed=Maya&backgroundColor=ffd5dc', label: 'Meraklı' },
];
