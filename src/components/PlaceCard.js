import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingStars from './RatingStars';
import { CATEGORIES, COLORS } from '../config/theme';
import { formatDistance, formatDuration } from '../utils/distance';

export default function PlaceCard({ place, distanceKm, durationMin, isFavorite, onPress, onToggleFavorite }) {
  const cat = CATEGORIES[place.category];
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.iconWrap, { backgroundColor: `${cat.color}20` }]}>
        <Ionicons name={cat.icon} size={26} color={cat.color} />
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
          <TouchableOpacity onPress={onToggleFavorite} hitSlop={8}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? COLORS.primary : COLORS.muted} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.category, { color: cat.color }]}>{cat.shortLabel} · {place.city}</Text>
        <RatingStars rating={place.rating} reviewCount={place.reviewCount} size={13} />
        {typeof distanceKm === 'number' && (
          <View style={styles.distRow}>
            <Ionicons name="navigate-outline" size={12} color={COLORS.muted} />
            <Text style={styles.distText}>{formatDistance(distanceKm)}{typeof durationMin === 'number' ? ` · ~${formatDuration(durationMin)}` : ''}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 14, padding: 12, marginHorizontal: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  iconWrap: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.text, marginRight: 8 },
  category: { fontSize: 12, fontWeight: '600', marginTop: 2, marginBottom: 4 },
  distRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  distText: { fontSize: 12, color: COLORS.muted, marginLeft: 4 },
});
