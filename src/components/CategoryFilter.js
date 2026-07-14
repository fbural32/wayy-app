import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, CATEGORY_ORDER, COLORS } from '../theme';

// selected: seçili kategori id'lerinin dizisi. Boş dizi = "Tümü"
export default function CategoryFilter({ selected, onToggle }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORY_ORDER.map((key) => {
        const cat = CATEGORIES[key];
        const isActive = selected.includes(key);
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.chip,
              { borderColor: cat.color },
              isActive && { backgroundColor: cat.color },
            ]}
            onPress={() => onToggle(key)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={cat.icon}
              size={15}
              color={isActive ? COLORS.white : cat.color}
              style={styles.icon}
            />
            <Text style={[styles.label, { color: isActive ? COLORS.white : cat.color }]}>
              {cat.shortLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: COLORS.white,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
