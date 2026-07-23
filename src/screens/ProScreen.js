import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';
import { COLORS } from '../config/theme';

const PRO_FEATURES = [
  { icon: 'heart-outline', text: 'Sınırsız favori', textEn: 'Unlimited favorites' },
  { icon: 'chatbubble-outline', text: 'Sınırsız yorum', textEn: 'Unlimited reviews' },
  { icon: 'notifications-outline', text: 'Öncelikli bildirimler', textEn: 'Priority notifications' },
  { icon: 'ban-outline', text: 'Reklamsız deneyim', textEn: 'Ad-free experience' },
  { icon: 'star-outline', text: 'Pro rozeti', textEn: 'Pro badge' },
];

export default function ProScreen({ navigation }) {
  const { lang } = useLanguage();
  const [isPro, setIsPro] = useState(false);
  const [proTimeLeft, setProTimeLeft] = useState(0);
  const [loadingAd, setLoadingAd] = useState(false);

  useEffect(() => { checkProStatus(); }, []);

  async function checkProStatus() {
    const expiry = await AsyncStorage.getItem('@wayy_pro_expiry');
    if (expiry && parseInt(expiry) > Date.now()) {
      setIsPro(true);
      setProTimeLeft(Math.floor((parseInt(expiry) - Date.now()) / 60000));
    } else {
      await AsyncStorage.removeItem('@wayy_pro_expiry');
    }
  }

  async function watchAdForPro() {
    setLoadingAd(true);
    try {
      // Reklam simülasyonu - gerçek AdMob sonraki versiyonda
      await new Promise(r => setTimeout(r, 2000));
      const expiryTime = Date.now() + (60 * 60 * 1000);
      await AsyncStorage.setItem('@wayy_pro_expiry', expiryTime.toString());
      setIsPro(true);
      setProTimeLeft(60);
      Alert.alert('🎉 Pro aktif!', lang === 'en' ? '1 hour Pro unlocked!' : '1 saat Pro açıldı!');
    } catch {
      Alert.alert('Hata', 'Tekrar dene.');
    }
    setLoadingAd(false);
  }

  const formatTime = (m) => m >= 60 ? `${Math.floor(m/60)} sa ${m%60} dk` : `${m} dk`;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wayy! Pro</Text>
      </View>

      {isPro ? (
        <View style={styles.proActive}>
          <Ionicons name="shield-checkmark" size={56} color={COLORS.star} />
          <Text style={styles.proActiveTitle}>⭐ {lang === 'en' ? 'Pro Active!' : 'Pro Aktif!'}</Text>
          <Text style={styles.proActiveTime}>{formatTime(proTimeLeft)} {lang === 'en' ? 'remaining' : 'kaldı'}</Text>
          <TouchableOpacity style={styles.extendBtn} onPress={watchAdForPro} disabled={loadingAd}>
            {loadingAd ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.extendBtnText}>{lang === 'en' ? '+ Extend 1 hour' : '+ 1 saat uzat'}</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>⭐</Text>
          <Text style={styles.heroTitle}>Wayy! Pro</Text>
          <Text style={styles.heroSub}>{lang === 'en' ? 'Watch 1 ad → 1 hour free Pro!' : 'Reklam izle → 1 saat ücretsiz Pro!'}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⭐ {lang === 'en' ? 'Pro Features' : 'Pro Özellikleri'}</Text>
        {PRO_FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name={f.icon} size={20} color={COLORS.star} />
            <Text style={styles.featureText}>{lang === 'en' ? f.textEn : f.text}</Text>
          </View>
        ))}
      </View>

      {!isPro && (
        <TouchableOpacity style={styles.watchBtn} onPress={watchAdForPro} disabled={loadingAd}>
          {loadingAd ? <ActivityIndicator color={COLORS.white} size="large" /> : (
            <>
              <Ionicons name="play-circle" size={28} color={COLORS.white} />
              <Text style={styles.watchBtnText}>{lang === 'en' ? 'Watch Ad → 1 Hour Pro FREE' : 'Reklam İzle → 1 Saat Pro BEDAVA'}</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <Text style={styles.note}>{lang === 'en' ? 'Wayy! is free. Watch ads to unlock Pro features.' : 'Wayy! ücretsizdir. Reklam izleyerek Pro özelliklerini aç.'}</Text>
      <Text style={styles.powered}>Powered by fbural</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, paddingTop: 54, paddingBottom: 14, paddingHorizontal: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  hero: { alignItems: 'center', backgroundColor: COLORS.secondary, paddingVertical: 32, paddingHorizontal: 24 },
  heroEmoji: { fontSize: 56, marginBottom: 8 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: COLORS.white, marginBottom: 8 },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  proActive: { alignItems: 'center', backgroundColor: '#1A1A2E', paddingVertical: 28 },
  proActiveTitle: { fontSize: 24, fontWeight: '900', color: COLORS.star, marginTop: 12 },
  proActiveTime: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 4, marginBottom: 16 },
  extendBtn: { backgroundColor: COLORS.star, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  extendBtnText: { color: '#1A1A2E', fontWeight: '800', fontSize: 14 },
  section: { backgroundColor: COLORS.white, margin: 14, borderRadius: 16, padding: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  featureText: { fontSize: 14, color: COLORS.text },
  watchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.primary, marginHorizontal: 14, borderRadius: 16, paddingVertical: 18 },
  watchBtnText: { color: COLORS.white, fontWeight: '900', fontSize: 15 },
  note: { fontSize: 12, color: COLORS.muted, textAlign: 'center', marginHorizontal: 24, marginTop: 14, lineHeight: 18 },
  powered: { fontSize: 11, color: COLORS.muted, textAlign: 'center', marginTop: 16, paddingBottom: 24 },
});
