import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserLocation } from '../context/LocationContext';
import { PLACES } from '../data/places';
import { COLORS, CATEGORIES, CATEGORY_ORDER, RADIUS_OPTIONS, TRAVEL_MODES } from '../config/theme';
import { getDistanceKm, estimateMinutes, formatDistance, formatDuration } from '../utils/distance';
import { getPexelsPhoto } from '../utils/pexelsService';
import { getWikiPhoto } from '../utils/wikiPhotoService';
import BannerAd from '../components/BannerAd';

const FALLBACK_IMAGES = {
  restoran: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=640&q=80',
  muze: 'https://images.unsplash.com/photo-1544967919-44c1ef2f9e4a?w=640&q=80',
  tarihi: 'https://images.unsplash.com/photo-1563804447971-6e113ab80713?w=640&q=80',
  unlu_kisi: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&q=80',
  doga: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=640&q=80',
  etkinlik: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=640&q=80',
};

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = 240;

function PlaceCard({ place, distanceKm, durationMin, isFavorite, onPress, onToggleFavorite, travelMode }) {
  const cat = CATEGORIES[place.category];
  const [imgUri, setImgUri] = React.useState(FALLBACK_IMAGES[place.category]);

  React.useEffect(() => {
    // Önce Wikipedia'dan yere özel fotoğraf dene
    getWikiPhoto(place.name, place.city).then(wikiUrl => {
      if (wikiUrl) {
        setImgUri(wikiUrl);
      } else {
        // Wikipedia'da yoksa Pexels'ten kategori fotoğrafı al
        getPexelsPhoto(place.category, place.name).then(url => {
          if (url) setImgUri(url);
        });
      }
    });
  }, [place.id]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image 
        source={{ uri: imgUri }} 
        style={styles.cardImage} 
        resizeMode="cover"
        onError={() => setImgUri(FALLBACK_IMAGES[place.category])}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <View style={[styles.catBadge, { backgroundColor: cat.color }]}>
            <Ionicons name={cat.icon} size={11} color={COLORS.white} />
            <Text style={styles.catBadgeText}>{cat.shortLabel}</Text>
          </View>
          <TouchableOpacity onPress={onToggleFavorite} hitSlop={8}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? COLORS.primary : COLORS.muted} />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardName} numberOfLines={1}>{place.name}</Text>
        <Text style={styles.cardCity}>{place.city}</Text>
        <View style={styles.cardBottom}>
          <View style={styles.starsRow}>
            {[1,2,3,4,5].map(s => <Ionicons key={s} name={place.rating>=s?'star':place.rating>=s-0.5?'star-half':'star-outline'} size={11} color={COLORS.star} />)}
            <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
          </View>
          {typeof distanceKm === 'number' && (
            <View style={styles.distRow}>
              <Ionicons name={travelMode?.icon||'navigate-outline'} size={11} color={COLORS.muted} />
              <Text style={styles.distText}>{formatDistance(distanceKm)}</Text>
            </View>
          )}
        </View>
        {typeof durationMin === 'number' && <Text style={styles.durationText}>~{formatDuration(durationMin)}</Text>}
      </View>
    </TouchableOpacity>
  );
}

export default function ListScreen({ navigation }) {
  const { location } = useUserLocation();
  const [selectedCats, setSelectedCats] = useState([]);
  const [radiusId, setRadiusId] = useState('1sa');
  const [travelModeId, setTravelModeId] = useState('araba');
  const [favorites, setFavorites] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const travelMode = TRAVEL_MODES.find(m => m.id === travelModeId);
  const radius = RADIUS_OPTIONS.find(r => r.id === radiusId);

  useEffect(() => {
    AsyncStorage.getItem('@favs').then(v => setFavorites(JSON.parse(v || '[]')));
  }, []);

  function openSidebar() {
    setSidebarOpen(true);
    Animated.parallel([
      Animated.spring(sidebarAnim, { toValue: 0, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0.5, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  function closeSidebar() {
    Animated.parallel([
      Animated.spring(sidebarAnim, { toValue: -SIDEBAR_WIDTH, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setSidebarOpen(false));
  }

  function toggleCat(k) {
    setSelectedCats(p => p.includes(k) ? p.filter(c => c !== k) : [...p, k]);
  }

  async function toggleFav(id) {
    const newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    await AsyncStorage.setItem('@favs', JSON.stringify(newFavs));
  }

  const activeFilterCount = selectedCats.length + (radiusId !== '1sa' ? 1 : 0) + (travelModeId !== 'araba' ? 1 : 0);

  const items = useMemo(() => {
    if (!location) return [];
    return PLACES.map(p => {
      const distanceKm = getDistanceKm(location.latitude, location.longitude, p.latitude, p.longitude);
      const durationMin = estimateMinutes(distanceKm, travelMode.speedKmh);
      return { ...p, distanceKm, durationMin };
    })
    .filter(p => {
      if (selectedCats.length > 0 && !selectedCats.includes(p.category)) return false;
      if (radius.minutes !== Infinity && p.durationMin > radius.minutes) return false;
      return true;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [location, selectedCats, radius, travelMode]);

  if (!location) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadText}>Konum alınıyor...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Üst bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.filterBtn} onPress={openSidebar}>
          <Ionicons name="options-outline" size={20} color={COLORS.white} />
          <Text style={styles.filterBtnText}>Filtreler</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.topBarInfo}>{items.length} yer · {travelMode.label} · {radius.label}</Text>
      </View>

      {/* Liste */}
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PlaceCard
            place={item}
            distanceKm={item.distanceKm}
            durationMin={item.durationMin}
            isFavorite={favorites.includes(item.id)}
            travelMode={travelMode}
            onPress={() => navigation.navigate('Detail', { place: item, travelMode })}
            onToggleFavorite={() => toggleFav(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="search-outline" size={40} color={COLORS.muted} />
            <Text style={styles.emptyText}>Bu filtrede yer bulunamadı.</Text>
            <Text style={styles.emptySub}>Filtreleri değiştirin.</Text>
          </View>
        }
      />

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
        </TouchableWithoutFeedback>
      )}

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Filtreler</Text>
          <TouchableOpacity onPress={closeSidebar}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.sidebarContent}>
          {/* Ulaşım */}
          <Text style={styles.sidebarLabel}>Ulaşım Modu</Text>
          {TRAVEL_MODES.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.sidebarOption, travelModeId === m.id && styles.sidebarOptionActive]}
              onPress={() => setTravelModeId(m.id)}
            >
              <Ionicons name={m.icon} size={18} color={travelModeId === m.id ? COLORS.white : COLORS.secondary} />
              <Text style={[styles.sidebarOptionText, travelModeId === m.id && { color: COLORS.white }]}>{m.label}</Text>
              {travelModeId === m.id && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
            </TouchableOpacity>
          ))}

          {/* Mesafe */}
          <Text style={styles.sidebarLabel}>Mesafe</Text>
          {RADIUS_OPTIONS.map(r => (
            <TouchableOpacity
              key={r.id}
              style={[styles.sidebarOption, radiusId === r.id && styles.sidebarOptionActive]}
              onPress={() => setRadiusId(r.id)}
            >
              <Ionicons name="time-outline" size={18} color={radiusId === r.id ? COLORS.white : COLORS.secondary} />
              <Text style={[styles.sidebarOptionText, radiusId === r.id && { color: COLORS.white }]}>{r.label}</Text>
              {radiusId === r.id && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
            </TouchableOpacity>
          ))}

          {/* Kategori */}
          <Text style={styles.sidebarLabel}>Kategori</Text>
          <TouchableOpacity
            style={[styles.sidebarOption, selectedCats.length === 0 && styles.sidebarOptionActive]}
            onPress={() => setSelectedCats([])}
          >
            <Ionicons name="apps-outline" size={18} color={selectedCats.length === 0 ? COLORS.white : COLORS.secondary} />
            <Text style={[styles.sidebarOptionText, selectedCats.length === 0 && { color: COLORS.white }]}>Tümü</Text>
            {selectedCats.length === 0 && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
          </TouchableOpacity>
          {CATEGORY_ORDER.map(k => {
            const cat = CATEGORIES[k];
            const active = selectedCats.includes(k);
            return (
              <TouchableOpacity
                key={k}
                style={[styles.sidebarOption, active && { backgroundColor: cat.color }]}
                onPress={() => toggleCat(k)}
              >
                <Ionicons name={cat.icon} size={18} color={active ? COLORS.white : cat.color} />
                <Text style={[styles.sidebarOptionText, active && { color: COLORS.white }]}>{cat.label}</Text>
                {active && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
              </TouchableOpacity>
            );
          })}

          {/* Filtreleri sıfırla */}
          {activeFilterCount > 0 && (
            <TouchableOpacity style={styles.resetBtn} onPress={() => { setSelectedCats([]); setRadiusId('1sa'); setTravelModeId('araba'); }}>
              <Ionicons name="refresh-outline" size={16} color={COLORS.primary} />
              <Text style={styles.resetBtnText}>Filtreleri Sıfırla</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <Text style={styles.powered}>Powered by fbural</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadText: { marginTop: 12, color: COLORS.muted },
  topBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, paddingHorizontal: 14, paddingVertical: 10, gap: 12 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, position: 'relative' },
  filterBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.primary, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  topBarInfo: { flex: 1, color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  listContent: { padding: 12, paddingBottom: 32 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: { width: '47%', backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardImage: { width: '100%', height: 110 },
  cardContent: { padding: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  catBadgeText: { fontSize: 10, color: COLORS.white, fontWeight: '700' },
  cardName: { fontSize: 13, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  cardCity: { fontSize: 11, color: COLORS.muted, marginBottom: 6 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  ratingText: { fontSize: 11, fontWeight: '700', color: COLORS.text, marginLeft: 3 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  distText: { fontSize: 11, color: COLORS.muted, fontWeight: '600' },
  durationText: { fontSize: 10, color: COLORS.primary, fontWeight: '600', marginTop: 3 },
  emptyText: { fontWeight: '700', color: COLORS.text, textAlign: 'center', marginTop: 12 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center', marginTop: 6 },
  powered: { textAlign: 'center', fontSize: 11, color: COLORS.muted, paddingBottom: 8 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' },
  sidebar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: SIDEBAR_WIDTH, backgroundColor: COLORS.white, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, elevation: 10 },
  sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.secondary, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16 },
  sidebarTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  sidebarContent: { flex: 1, padding: 16 },
  sidebarLabel: { fontSize: 11, fontWeight: '800', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 16, marginBottom: 8 },
  sidebarOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, marginBottom: 6, backgroundColor: '#F5F6FA' },
  sidebarOptionActive: { backgroundColor: COLORS.secondary },
  sidebarOptionText: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.primary },
  resetBtnText: { color: COLORS.primary, fontWeight: '700' },
});
