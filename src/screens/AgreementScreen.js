import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';
import { COLORS } from '../config/theme';

const AGREEMENT_TR = `WAYY! KULLANICI SÖZLEŞMESİ VE GİZLİLİK POLİTİKASI

Madde 1 - Genel Hükümler
Bu uygulama, kullanıcıların yolculukları sırasında yakınlarındaki tarihi, kültürel ve doğal alanları keşfetmelerine yardımcı olmak amacıyla geliştirilmiştir. Uygulamayı kullanarak bu sözleşmedeki tüm koşulları kabul etmiş sayılırsınız.

Madde 2 - Kullanıcı Yükümlülükleri
Kullanıcı, uygulama içinde aşağıdaki kurallara uymayı kabul eder:
• Küfür, hakaret ve uygunsuz içerik paylaşmamak
• Başkalarına ait fotoğraf ve içerikleri izinsiz kullanmamak
• Gerçek ve doğru bilgi paylaşmak
• Diğer kullanıcılara saygılı davranmak

Madde 3 - İçerik Kuralları
Küfür veya hakaret içeren yorumlar otomatik olarak tespit edilecek ve kullanıcı hesabı derhal askıya alınacaktır. Tekrarlayan ihlallerde hesap kalıcı olarak kapatılır.

Madde 4 - Veri Doğruluğu ve Sorumluluk Reddi
Wayy! uygulaması YALNIZCA ÖNERİ AMAÇLIDIR. Sunulan tüm bilgiler (konum, etkinlik, mekan, puan, fotoğraf) üçüncü taraf kaynaklardan (OpenStreetMap, Eventbrite, Ticketmaster, Wikimedia Commons vb.) otomatik olarak derlenmekte olup doğruluğu garanti edilemez.

• Uygulama kesin hüküm içermez; tüm kararlar kullanıcıya aittir.
• Yanlış, eksik veya güncel olmayan veri durumunda son kontrol ve teyit etme sorumluluğu KULLANICIYA AİTTİR.
• Harita, yol tarifi ve navigasyon özellikleri yardımcı nitelikte olup sürüş güvenliğinden ve trafik kurallarına uymaktan KULLANICI SORUMLUDUR.
• Uygulama sürüş sırasında kullanılmamalıdır. Yolda iken uygulamayı yolcu kullanmalıdır.
• Etkinlik bilgileri (tarih, saat, mekan, fiyat) değişmiş olabilir; etkinliğe gitmeden önce resmi kaynaklardan doğrulayınız.

Madde 5 - Zarar ve Tazminat
• Wayy! uygulaması kullanımından kaynaklanabilecek her türlü maddi zarar, manevi zarar, kayıp, kaza, yaralanma veya ölüm dahil her türlü olumsuz sonucun sorumluluğu TAMAMEN KULLANICIYA AİTTİR.
• Wayy! ve geliştiricisi (fbural) HİÇBİR DURUMDA tazminat yükümlülüğü altında değildir.
• Kullanıcı, bu uygulamayı kullanmaktan doğabilecek tüm hukuki sorumluluğu peşinen kabul eder.
• Üçüncü taraf API'lerinden (Eventbrite, Ticketmaster, OpenStreetMap vb.) kaynaklanan yanlış bilgiler nedeniyle Wayy! sorumlu tutulamaz.

Madde 6 - Üçüncü Taraf Kaynaklar
Uygulama içeriği aşağıdaki kaynaklardan derlenmektedir:
• OpenStreetMap (© OpenStreetMap contributors, ODbL Lisansı)
• Eventbrite API
• Ticketmaster Discovery API
• Wikimedia Commons (CC Lisansı)
• Firebase (Google)

Bu kaynakların doğruluğundan, güncelliğinden ve içeriğinden Wayy! sorumlu tutulamaz.

Madde 7 - Gizlilik ve Kişisel Veriler
• Kullanıcı bilgileri Firebase (Google) altyapısında güvenli şekilde saklanır.
• Konum bilgisi YALNIZCA yakındaki yerleri göstermek için kullanılır; üçüncü taraflarla paylaşılmaz veya satılmaz.
• Kullanıcı yorumları ve puanları uygulama içinde herkese açık olarak gösterilir.
• KVKK kapsamında kişisel verilerinizin silinmesini talep etmek için iletişime geçebilirsiniz.

Madde 8 - Fikri Mülkiyet
Wayy! uygulaması, logosu, tasarımı ve yazılımı fbural'a aittir. İzinsiz kopyalanması, çoğaltılması veya dağıtılması yasaktır. Türk Patent ve Marka Kurumu (TÜRKPATENT) nezdinde tescil sürecindedir.

Madde 9 - Rozetler ve Puanlar
Puanlar ve rozetler yorum yapıldıkça kazanılır. Uygulama sahibi, sistemi değiştirme, puanları sıfırlama veya rozetleri güncelleme hakkını saklı tutar.

Madde 10 - Değişiklik Hakkı
Wayy! bu sözleşmeyi önceden bildirmeksizin değiştirme hakkını saklı tutar. Güncel sözleşme her zaman uygulama içinde erişilebilir olacaktır.

© 2024 Wayy! — Powered by fbural
Tüm hakları saklıdır.`;

const AGREEMENT_EN = `WAYY! TERMS OF SERVICE AND PRIVACY POLICY

Article 1 - General
This application is designed to help users discover nearby historical, cultural and natural places during their journeys. By using the app, you agree to all terms in this agreement.

Article 2 - User Obligations
• No profanity, harassment or inappropriate content
• No unauthorized use of others' content
• Share accurate and truthful information
• Treat other users with respect

Article 3 - Content Rules
Accounts with detected inappropriate content will be immediately suspended. Repeated violations result in permanent account closure.

Article 4 - Data Accuracy and Disclaimer
Wayy! is FOR RECOMMENDATION PURPOSES ONLY. All information (location, events, venues, ratings, photos) is automatically compiled from third-party sources (OpenStreetMap, Eventbrite, Ticketmaster, Wikimedia Commons, etc.) and accuracy cannot be guaranteed.

• The app does not contain definitive judgments; all decisions belong to the USER.
• In case of incorrect, incomplete or outdated data, the responsibility for final verification belongs to the USER.
• Map, directions and navigation features are auxiliary; the USER is responsible for driving safety and traffic law compliance.
• The app should not be used while driving. A passenger should operate the app while traveling.
• Event information (date, time, venue, price) may have changed; verify with official sources before attending.

Article 5 - Damages and Liability
• The USER bears FULL responsibility for any material damage, moral damage, loss, accident, injury or death arising from the use of Wayy!
• Wayy! and its developer (fbural) are NOT liable for compensation under ANY circumstances.
• The user accepts in advance all legal responsibility that may arise from using this application.
• Wayy! cannot be held responsible for incorrect information from third-party APIs (Eventbrite, Ticketmaster, OpenStreetMap, etc.).

Article 6 - Third Party Sources
App content is compiled from:
• OpenStreetMap (© OpenStreetMap contributors, ODbL License)
• Eventbrite API
• Ticketmaster Discovery API
• Wikimedia Commons (CC License)
• Firebase (Google)

Wayy! cannot be held responsible for the accuracy, currency or content of these sources.

Article 7 - Privacy and Personal Data
• User information is securely stored on Firebase (Google) infrastructure.
• Location data is used ONLY to show nearby places; it is not shared with or sold to third parties.
• User reviews and ratings are displayed publicly within the app.
• You may contact us to request deletion of your personal data.

Article 8 - Intellectual Property
The Wayy! app, logo, design and software belong to fbural. Unauthorized copying, reproduction or distribution is prohibited. Trademark registration is in process at the Turkish Patent and Trademark Office (TÜRKPATENT).

Article 9 - Badges and Scores
Points and badges are earned by writing reviews. The app owner reserves the right to modify the system, reset points or update badges.

Article 10 - Right to Change
Wayy! reserves the right to modify this agreement without prior notice. The current agreement will always be accessible within the app.

© 2024 Wayy! — Powered by fbural
All rights reserved.`;

export default function AgreementScreen({ onAccept }) {
  const { t, lang } = useLanguage();
  const [checked, setChecked] = useState(false);

  async function accept() {
    if (!checked) return;
    await AsyncStorage.setItem('@yol_sozlesme', 'accepted');
    // Sözleşme kabul tarihini Firebase'e kaydet (KVKK kanıtı için)
    try {
      const { getAuth } = await import('firebase/auth');
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      const user = getAuth().currentUser;
      if (user) {
        await setDoc(doc(db, 'agreements', user.uid), {
          accepted: true,
          acceptedAt: new Date().toISOString(),
          version: '1.0',
          lang: lang,
        }, { merge: true });
      }
    } catch (e) {
      // Sessizce yoksay - local kayıt yeterli
    }
    onAccept();
  }

  const agreementText = lang === 'en' ? AGREEMENT_EN : AGREEMENT_TR;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.agreement}</Text>
      <Text style={styles.version}>v1.0 — Powered by fbural</Text>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={true}>
        <Text style={styles.content}>{agreementText}</Text>
      </ScrollView>
      <TouchableOpacity style={styles.checkRow} onPress={() => setChecked(!checked)}>
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkLabel}>{t.agree}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, !checked && styles.buttonDisabled]}
        onPress={accept}
        disabled={!checked}
      >
        <Text style={styles.buttonText}>{t.continue}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginTop: 54 },
  version: { fontSize: 11, color: COLORS.muted, textAlign: 'center', marginBottom: 14 },
  scroll: { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 14 },
  content: { fontSize: 13, lineHeight: 22, color: COLORS.text },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  checkboxChecked: { backgroundColor: COLORS.primary },
  checkmark: { color: COLORS.white, fontWeight: '700' },
  checkLabel: { fontSize: 14, color: COLORS.text, fontWeight: '600', flex: 1 },
  button: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { backgroundColor: COLORS.muted },
  buttonText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
});
