import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator, Image, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../config/theme';

const EVENT_CATEGORIES = [
  { id: 'muzik', label: '🎵 Müzik / Konser' },
  { id: 'festival', label: '🎪 Festival' },
  { id: 'sergi', label: '🎨 Sergi / Sanat' },
  { id: 'spor', label: '⚽ Spor' },
  { id: 'yemek', label: '🍽️ Yemek / Gastronomi' },
  { id: 'kultur', label: '🏛️ Kültür / Tiyatro' },
  { id: 'diger', label: '📌 Diğer' },
];

export default function OrganizerScreen({ navigation }) {
  const { profile } = useAuth();
  const [tab, setTab] = useState('panel'); // panel | add | myEvents
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [eventName, setEventName] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventCity, setEventCity] = useState('');
  const [eventAddress, setEventAddress] = useState('');
  const [eventLat, setEventLat] = useState('');
  const [eventLon, setEventLon] = useState('');
  const [eventCategory, setEventCategory] = useState('festival');
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState(new Date());
  const [isFree, setIsFree] = useState(true);
  const [eventPrice, setEventPrice] = useState('');
  const [eventUrl, setEventUrl] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (tab === 'myEvents') loadMyEvents();
  }, [tab]);

  async function loadMyEvents() {
    setLoading(true);
    try {
      const q = query(collection(db, 'organizer_events'), where('organizerId', '==', profile.uid));
      const snap = await getDocs(q);
      setMyEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {}
    setLoading(false);
  }

  async function submitEvent() {
    if (!eventName.trim()) return Alert.alert('Hata', 'Etkinlik adı zorunludur.');
    if (!eventCity.trim()) return Alert.alert('Hata', 'Şehir zorunludur.');
    if (!eventAddress.trim()) return Alert.alert('Hata', 'Adres zorunludur.');

    setSubmitting(true);
    try {
      const dateStr = eventDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      const timeStr = eventTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

      await addDoc(collection(db, 'organizer_events'), {
        name: eventName.trim(),
        description: eventDesc.trim(),
        city: eventCity.trim(),
        address: eventAddress.trim(),
        latitude: parseFloat(eventLat) || 0,
        longitude: parseFloat(eventLon) || 0,
        eventCategory,
        eventDate: dateStr,
        eventTime: timeStr,
        isFree,
        price: isFree ? 'Ücretsiz' : eventPrice,
        eventUrl: eventUrl.trim(),
        organizerId: profile.uid,
        organizerName: profile.username,
        status: 'pending', // pending | approved | rejected
        category: 'etkinlik',
        rating: 4.2,
        reviewCount: 0,
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=70',
        isEvent: true,
        isOrganizerEvent: true,
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        '✅ Etkinlik Gönderildi!',
        'Etkinliğiniz inceleme için gönderildi. Onaylandıktan sonra haritada görünecek.'
      );

      // Formu sıfırla
      setEventName(''); setEventDesc(''); setEventCity('');
      setEventAddress(''); setEventLat(''); setEventLon('');
      setEventUrl(''); setIsFree(true); setEventPrice('');
      setTab('myEvents');
    } catch (e) {
      Alert.alert('Hata', 'Etkinlik gönderilemedi: ' + e.message);
    }
    setSubmitting(false);
  }

  async function deleteEvent(id) {
    Alert.alert('Sil', 'Etkinliği silmek istiyor musunuz?', [
      { text: 'İptal' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          await deleteDoc(doc(db, 'organizer_events', id));
          setMyEvents(prev => prev.filter(e => e.id !== id));
        } catch {}
      }}
    ]);
  }

  const statusLabel = (s) => ({ pending: '⏳ İncelemede', approved: '✅ Yayında', rejected: '❌ Reddedildi' }[s] || s);
  const statusColor = (s) => ({ pending: COLORS.star, approved: COLORS.green, rejected: COLORS.primary }[s] || COLORS.muted);

  return (
    <View style={styles.container}>
      {/* Başlık */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Organizatör Paneli</Text>
      </View>

      {/* Sekmeler */}
      <View style={styles.tabRow}>
        {[
          { id: 'panel', label: '🏠 Panel' },
          { id: 'add', label: '➕ Etkinlik Ekle' },
          { id: 'myEvents', label: '📋 Etkinliklerim' },
        ].map(t => (
          <TouchableOpacity key={t.id} style={[styles.tab, tab === t.id && styles.tabActive]} onPress={() => setTab(t.id)}>
            <Text style={[styles.tabTxt, tab === t.id && styles.tabTxtActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* PANEL */}
      {tab === 'panel' && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>👋 Merhaba, @{profile?.username}!</Text>
            <Text style={styles.infoText}>
              Organizatör paneline hoş geldiniz. Buradan etkinliklerinizi Wayy! haritasına ekleyebilirsiniz.
            </Text>
          </View>
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>Nasıl çalışır?</Text>
            <View style={styles.step}><Text style={styles.stepNum}>1</Text><Text style={styles.stepTxt}>Etkinlik bilgilerini girin</Text></View>
            <View style={styles.step}><Text style={styles.stepNum}>2</Text><Text style={styles.stepTxt}>Wayy! ekibi inceler (1-2 gün)</Text></View>
            <View style={styles.step}><Text style={styles.stepNum}>3</Text><Text style={styles.stepTxt}>Onaylanınca haritada görünür</Text></View>
            <View style={styles.step}><Text style={styles.stepNum}>4</Text><Text style={styles.stepTxt}>Kullanıcılar etkinliğinizi keşfeder</Text></View>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setTab('add')}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
            <Text style={styles.primaryBtnTxt}>Etkinlik Ekle</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ETKİNLİK EKLE */}
      {tab === 'add' && (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.formLabel}>Etkinlik Adı *</Text>
          <TextInput style={styles.input} placeholder="örn. Ege Müzik Festivali" value={eventName} onChangeText={setEventName} />

          <Text style={styles.formLabel}>Kategori</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {EVENT_CATEGORIES.map(c => (
              <TouchableOpacity key={c.id} style={[styles.catChip, eventCategory === c.id && styles.catChipActive]} onPress={() => setEventCategory(c.id)}>
                <Text style={[styles.catChipTxt, eventCategory === c.id && { color: COLORS.white }]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.formLabel}>Açıklama</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Etkinlik hakkında bilgi verin..." value={eventDesc} onChangeText={setEventDesc} multiline numberOfLines={4} />

          <Text style={styles.formLabel}>Şehir *</Text>
          <TextInput style={styles.input} placeholder="örn. İzmir" value={eventCity} onChangeText={setEventCity} />

          <Text style={styles.formLabel}>Adres / Mekan *</Text>
          <TextInput style={styles.input} placeholder="örn. Kültürpark, Konak" value={eventAddress} onChangeText={setEventAddress} />

          <Text style={styles.formLabel}>Konum (Enlem / Boylam)</Text>
          <Text style={styles.formHint}>Google Maps'ten sağ tıklayıp koordinat kopyalayabilirsiniz</Text>
          <View style={styles.rowInputs}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Enlem (38.42)" value={eventLat} onChangeText={setEventLat} keyboardType="numeric" />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Boylam (27.14)" value={eventLon} onChangeText={setEventLon} keyboardType="numeric" />
          </View>

          <Text style={styles.formLabel}>Tarih</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.secondary} />
            <Text style={styles.dateBtnTxt}>{eventDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker value={eventDate} mode="date" onChange={(e, d) => { setShowDatePicker(false); if (d) setEventDate(d); }} minimumDate={new Date()} />
          )}

          <Text style={styles.formLabel}>Saat</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowTimePicker(true)}>
            <Ionicons name="time-outline" size={18} color={COLORS.secondary} />
            <Text style={styles.dateBtnTxt}>{eventTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker value={eventTime} mode="time" onChange={(e, t) => { setShowTimePicker(false); if (t) setEventTime(t); }} />
          )}

          <Text style={styles.formLabel}>Ücret</Text>
          <View style={styles.rowInputs}>
            <TouchableOpacity style={[styles.freeBtn, isFree && styles.freeBtnActive]} onPress={() => setIsFree(true)}>
              <Text style={[styles.freeBtnTxt, isFree && { color: COLORS.white }]}>🎟️ Ücretsiz</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.freeBtn, !isFree && styles.freeBtnActive]} onPress={() => setIsFree(false)}>
              <Text style={[styles.freeBtnTxt, !isFree && { color: COLORS.white }]}>💳 Ücretli</Text>
            </TouchableOpacity>
          </View>
          {!isFree && (
            <TextInput style={styles.input} placeholder="Bilet fiyatı (örn. 150 TL)" value={eventPrice} onChangeText={setEventPrice} />
          )}

          <Text style={styles.formLabel}>Website / Bilet Linki (opsiyonel)</Text>
          <TextInput style={styles.input} placeholder="https://..." value={eventUrl} onChangeText={setEventUrl} keyboardType="url" autoCapitalize="none" />

          <TouchableOpacity style={styles.submitBtn} onPress={submitEvent} disabled={submitting}>
            {submitting ? <ActivityIndicator color={COLORS.white} /> : (
              <><Ionicons name="send-outline" size={18} color={COLORS.white} /><Text style={styles.submitBtnTxt}>Onaya Gönder</Text></>
            )}
          </TouchableOpacity>
          <Text style={styles.formNote}>* Etkinliğiniz Wayy! ekibi tarafından incelendikten sonra yayınlanır.</Text>
        </ScrollView>
      )}

      {/* ETKİNLİKLERİM */}
      {tab === 'myEvents' && (
        <ScrollView contentContainerStyle={styles.content}>
          {loading ? <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} /> :
          myEvents.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.muted} />
              <Text style={styles.emptyTxt}>Henüz etkinlik eklemediniz.</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setTab('add')}>
                <Text style={styles.primaryBtnTxt}>İlk Etkinliği Ekle</Text>
              </TouchableOpacity>
            </View>
          ) : myEvents.map(e => (
            <View key={e.id} style={styles.eventCard}>
              <View style={styles.eventCardTop}>
                <Text style={styles.eventCardName} numberOfLines={1}>{e.name}</Text>
                <TouchableOpacity onPress={() => deleteEvent(e.id)}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.eventCardInfo}>📅 {e.eventDate} · {e.eventTime}</Text>
              <Text style={styles.eventCardInfo}>📍 {e.address}, {e.city}</Text>
              <View style={styles.statusBadge}>
                <Text style={[styles.statusTxt, { color: statusColor(e.status) }]}>{statusLabel(e.status)}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Text style={styles.powered}>Powered by fbural</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, paddingTop: 54, paddingBottom: 14, paddingHorizontal: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: COLORS.primary },
  tabTxt: { fontSize: 11, fontWeight: '600', color: COLORS.muted },
  tabTxtActive: { color: COLORS.primary, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 32 },
  infoCard: { backgroundColor: COLORS.secondary, borderRadius: 16, padding: 20, marginBottom: 16 },
  infoTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white, marginBottom: 8 },
  infoText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
  stepCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginBottom: 16 },
  stepTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 14 },
  step: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, color: COLORS.white, textAlign: 'center', lineHeight: 28, fontWeight: '800', fontSize: 14 },
  stepTxt: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, marginTop: 8 },
  primaryBtnTxt: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  formLabel: { fontSize: 13, fontWeight: '700', color: COLORS.muted, marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  formHint: { fontSize: 11, color: COLORS.muted, marginBottom: 6 },
  input: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 4 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  rowInputs: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  catScroll: { marginBottom: 8 },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white, marginRight: 8 },
  catChipActive: { backgroundColor: '#E91E8C', borderColor: '#E91E8C' },
  catChipTxt: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 4 },
  dateBtnTxt: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  freeBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  freeBtnActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  freeBtnTxt: { fontWeight: '700', fontSize: 14, color: COLORS.text },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.secondary, borderRadius: 14, paddingVertical: 16, marginTop: 20 },
  submitBtnTxt: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  formNote: { fontSize: 12, color: COLORS.muted, textAlign: 'center', marginTop: 10, lineHeight: 18 },
  emptyBox: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyTxt: { fontSize: 15, color: COLORS.muted, marginBottom: 8 },
  eventCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  eventCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  eventCardName: { fontSize: 15, fontWeight: '800', color: COLORS.text, flex: 1 },
  eventCardInfo: { fontSize: 13, color: COLORS.muted, marginBottom: 4 },
  statusBadge: { marginTop: 8 },
  statusTxt: { fontSize: 13, fontWeight: '700' },
  powered: { textAlign: 'center', fontSize: 11, color: COLORS.muted, paddingBottom: 12 },
});
