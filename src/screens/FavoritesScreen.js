import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useUserLocation } from '../context/LocationContext';
import { PLACES } from '../data/places';
import { CATEGORIES, COLORS, TRAVEL_MODES } from '../config/theme';
import { getDistanceKm, estimateMinutes, formatDistance, formatDuration } from '../utils/distance';

export default function FavoritesScreen({ navigation }) {
  const { location } = useUserLocation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const travelMode = TRAVEL_MODES[0]; // araba varsayılan

  useFocusEffect(useCallback(() => {
    loadFavorites();
  }, []));

  async function loadFavorites() {
    setLoading(true);
    const favs = JSON.parse(await AsyncStorage.getItem('@favs') || '[]');
    setFavorites(favs);
    setLoading(false);
  }

  async function removeFavorite(id) {
    const newFavs = favorites.filter(f => f !== id);
    setFavorites(newFavs);
    await AsyncStorage.setItem('@favs', JSON.stringify(newFavs));
  }

  const favPlaces = PLACES.filter(p => favorites.includes(p.id)).map(p => {
    if (!location) return p;
    const distanceKm = getDistanceKm(location.latitude, location.longitude, p.latitude, p.longitude);
    const durationMin = estimateMinutes(distanceKm, travelMode.speedKmh);
    return { ...p, distanceKm, durationMin };
  });

  if (loading) return <View style={styles.centered}><ActivityIndicator color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={favPlaces}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const cat = CATEGORIES[item.category];
          return (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Detail', { place: item, travelMode })} activeOpacity={0.9}>
              <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.cardInfo}>
                <View style={styles.cardTop}>
                  <View style={[styles.catBadge, { backgroundColor: cat.color }]}>
                    <Ionicons name={cat.icon} size={11} color={COLORS.white} />
                    <Text style={styles.catText}>{cat.shortLabel}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeFavorite(item.id)} hitSlop={8}>
                    <Ionicons name="heart" size={22} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardCity}>{item.city}</Text>
                <View style={styles.starsRow}>
                  {[1,2,3,4,5].map(s => <Ionicons key={s} name={item.rating >= s ? 'star' : item.rating >= s - 0.5 ? 'star-half' : 'star-outline'} size={12} color={COLORS.star} />)}
                  <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                </View>
                {item.distanceKm != null && (
                  <Text style={styles.distText}>{formatDistance(item.distanceKm)} · ~{formatDuration(item.durationMin)}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={56} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>Henüz favori yok</Text>
            <Text style={styles.emptySub}>Bir yerin detayına girip ❤️ ikonuna basarak favorilere ekleyebilirsin.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 14, paddingBottom: 32 },
  card: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  cardImage: { width: 100, height: 100 },
  cardInfo: { flex: 1, padding: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  catText: { fontSize: 10, color: COLORS.white, fontWeight: '700' },
  cardName: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  cardCity: { fontSize: 12, color: COLORS.muted, marginBottom: 6 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 1, marginBottom: 4 },
  ratingText: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginLeft: 4 },
  distText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
});
