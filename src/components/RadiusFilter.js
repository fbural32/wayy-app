import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { RADIUS_OPTIONS } from '../config';
import { COLORS as THEME_COLORS } from '../theme';

export default function RadiusFilter({ selectedId, onSelect }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Mesafe:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {RADIUS_OPTIONS.map((opt) => {
          const isActive = opt.id === selectedId;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(opt.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME_COLORS.muted,
    marginRight: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#EEF0F4',
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: THEME_COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME_COLORS.muted,
  },
  chipTextActive: {
    color: THEME_COLORS.white,
  },
});
