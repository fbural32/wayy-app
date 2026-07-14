import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../config/i18n';
import { COLORS } from '../config/theme';

export default function LanguageScreen({ onDone }) {
  const { changeLanguage } = useLanguage();

  async function select(code) {
    await changeLanguage(code);
    await AsyncStorage.setItem('@wayy_lang_selected', 'yes');
    onDone();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wayy!</Text>
      <Text style={styles.subtitle}>Powered by fbural</Text>
      <Text style={styles.question}>Dil seçin / Select Language</Text>
      {LANGUAGES.map(l => (
        <TouchableOpacity key={l.code} style={styles.langBtn} onPress={() => select(l.code)} activeOpacity={0.85}>
          <Text style={styles.flag}>{l.flag}</Text>
          <Text style={styles.langLabel}>{l.label}</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 56, fontWeight: '900', color: COLORS.white, marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 52 },
  question: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 24 },
  langBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 18, marginBottom: 14, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  flag: { fontSize: 32, marginRight: 16 },
  langLabel: { flex: 1, fontSize: 20, fontWeight: '700', color: COLORS.white },
  arrow: { fontSize: 20, color: 'rgba(255,255,255,0.6)' },
});
