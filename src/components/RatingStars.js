import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/theme';

export default function RatingStars({ rating, reviewCount, size = 14 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    let name = 'star-outline';
    if (rating >= i) name = 'star';
    else if (rating >= i - 0.5) name = 'star-half';
    stars.push(<Ionicons key={i} name={name} size={size} color={COLORS.star} />);
  }
  return (
    <View style={styles.row}>
      <View style={styles.stars}>{stars}</View>
      <Text style={[styles.rating, { fontSize: size }]}>{rating.toFixed(1)}</Text>
      {typeof reviewCount === 'number' && (
        <Text style={[styles.count, { fontSize: size - 1 }]}> ({reviewCount.toLocaleString('tr-TR')})</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  stars: { flexDirection: 'row', marginRight: 4 },
  rating: { fontWeight: '600', color: COLORS.text },
  count: { color: COLORS.muted },
});
