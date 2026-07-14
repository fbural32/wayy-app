import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';
import { COLORS } from '../config/theme';

const AGREEMENT_TR = `WAYY! KULLANICI SÖZLEŞMESİ

Madde 1 - Genel Hükümler
Bu uygulama, kullanıcıların yolculukları sırasında yakınlarındaki tarihi, kültürel ve doğal alanları keşfetmelerine yardımcı olur.

Madde 2 - Kullanıcı Yükümlülükleri
• Küfür, hakaret ve uygunsuz içerik paylaşmamak
• Başkalarına ait içerikleri izinsiz kullanmamak
• Gerçek ve doğru bilgi paylaşmak
• Diğer kullanıcılara saygılı davranmak

Madde 3 - İçerik Kuralları
Küfür veya hakaret içeren yorumlar tespit edildiğinde kullanıcı hesabı askıya alınır.

Madde 4 - Gizlilik
Kullanıcı bilgileri Firebase altyapısında güvenli şekilde saklanır. Konum bilgisi yalnızca yakındaki yerleri göstermek için kullanılır.

Madde 5 - Rozetler ve Puanlar
Puanlar yorum yapıldıkça kazanılır. Uygulama sahibi sistemi değiştirme hakkını saklı tutar.

© 2024 Wayy! — Powered by fbural`;

const AGREEMENT_EN = `WAYY! TERMS OF SERVICE

Article 1 - General
This app helps users discover nearby historical, cultural and natural places during their journeys.

Article 2 - User Obligations
• No profanity, harassment or inappropriate content
• No unauthorized use of others' content
• Share accurate and truthful information
• Treat other users with respect

Article 3 - Content Rules
Accounts with detected inappropriate content will be suspended.

Article 4 - Privacy
User data is securely stored on Firebase. Location is only used to show nearby places.

Article 5 - Scores and Badges
Points are earned by writing reviews. The app owner reserves the right to modify the system.

© 2024 Wayy! — Powered by fbural`;

export default function AgreementScreen({ onAccept }) {
  const { t, lang } = useLanguage();
  const [checked, setChecked] = useState(false);

  async function accept() {
    if (!checked) return;
    await AsyncStorage.setItem('@yol_sozlesme', 'accepted');
    onAccept();
  }

  const agreementText = lang === 'en' ? AGREEMENT_EN : AGREEMENT_TR;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.agreement}</Text>
      <Text style={styles.powered}>{t.poweredBy}</Text>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.content}>{agreementText}</Text>
      </ScrollView>
      <TouchableOpacity style={styles.checkRow} onPress={() => setChecked(!checked)}>
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkLabel}>{t.agree}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, !checked && styles.buttonDisabled]} onPress={accept} disabled={!checked}>
        <Text style={styles.buttonText}>{t.continue}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginTop: 54 },
  powered: { fontSize: 12, color: COLORS.muted, textAlign: 'center', marginBottom: 16 },
  scroll: { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 16 },
  content: { fontSize: 13, lineHeight: 22, color: COLORS.text },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  checkboxChecked: { backgroundColor: COLORS.primary },
  checkmark: { color: COLORS.white, fontWeight: '700' },
  checkLabel: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
  button: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { backgroundColor: COLORS.muted },
  buttonText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
});
