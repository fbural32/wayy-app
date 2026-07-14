import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, BADGES, CATEGORIES, TRAVEL_MODES } from '../config/theme';
import { PLACES } from '../data/places';

export default function ProfileScreen({ navigation }) {
  const { profile, logout, refreshProfile } = useAuth();
  const { t, lang, changeLanguage } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [saving, setSaving] = useState(false);
  const [visitedPlaces, setVisitedPlaces] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(true);
  const [activeTab, setActiveTab] = useState('rozetler');
  const [selectedBadge, setSelectedBadge] = useState(null); // rozet detay modal

  useEffect(() => { loadVisitedPlaces(); }, []);

  async function loadVisitedPlaces() {
    setLoadingVisits(true);
    try {
      const q = query(collection(db, 'reviews'), where('userId', '==', profile.uid));
      const snap = await getDocs(q);
      const placeIds = [...new Set(snap.docs.map(d => d.data().placeId))];
      setVisitedPlaces(PLACES.filter(p => placeIds.includes(p.id)));
    } catch {}
    setLoadingVisits(false);
  }

  if (!profile) return null;

  const earnedBadges = BADGES.filter(b => profile.badges?.includes(b.id));
  const totalScore = profile.score || 0;

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('İzin gerekli', 'Fotoğraf galerisine erişim izni verin.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled) Alert.alert('Yakında', 'Fotoğraf yükleme App Store versiyonunda aktif olacak.');
  }

  async function saveProfile() {
    if (!newUsername.trim() || newUsername.trim().length < 3) return Alert.alert('Hata', 'Kullanıcı adı en az 3 karakter.');
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), { username: newUsername.trim() });
      await refreshProfile();
      setEditing(false);
    } catch { Alert.alert('Hata', 'Profil güncellenemedi.'); }
    setSaving(false);
  }

  function getBadgeLabel(badge) {
    return lang === 'en' ? (badge.labelEn || badge.label) : badge.label;
  }
  function getBadgeDesc(badge) {
    return lang === 'en' ? (badge.descriptionEn || badge.description) : badge.description;
  }
  function getBadgeReward(badge) {
    if (!badge.reward) return null;
    return lang === 'en' ? (badge.rewardEn || badge.reward) : badge.reward;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Harita')}>
          <Ionicons name="home-outline" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Dil değiştir */}
        <TouchableOpacity style={styles.langBtn} onPress={() => changeLanguage(lang === 'tr' ? 'en' : 'tr')}>
          <Text style={styles.langBtnText}>{lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatarCircle} onPress={pickPhoto}>
          <Ionicons name="person" size={44} color="rgba(255,255,255,0.6)" />
          <View style={styles.cameraBtn}>
            <Ionicons name="camera" size={13} color={COLORS.white} />
          </View>
        </TouchableOpacity>

        {!editing ? (
          <>
            <Text style={styles.username}>@{profile.username}</Text>
            <Text style={styles.email}>{profile.email}</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Ionicons name="pencil-outline" size={14} color={COLORS.white} />
              <Text style={styles.editBtnText}>{t.editProfile}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.editInline}>
            <TextInput style={styles.editInput} value={newUsername} onChangeText={setNewUsername} autoCapitalize="none" placeholder={t.usernamePlaceholder} placeholderTextColor="rgba(255,255,255,0.5)" />
            <View style={styles.editBtns}>
              <TouchableOpacity style={styles.saveBtn} onPress={saveProfile} disabled={saving}>
                {saving ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.saveBtnTxt}>{t.save}</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelBtnTxt}>{t.cancel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Puan kartı */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreItem}><Text style={styles.scoreNum}>{totalScore}</Text><Text style={styles.scoreLabel}>{t.totalScore}</Text></View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreItem}><Text style={styles.scoreNum}>{earnedBadges.length}</Text><Text style={styles.scoreLabel}>{t.badges}</Text></View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreItem}><Text style={styles.scoreNum}>{visitedPlaces.length}</Text><Text style={styles.scoreLabel}>{t.visited}</Text></View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreItem}><Text style={styles.scoreNum}>{totalScore}</Text><Text style={styles.scoreLabel}>{t.comments}</Text></View>
      </View>

      {/* Sekmeler */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, activeTab === 'rozetler' && styles.tabActive]} onPress={() => setActiveTab('rozetler')}>
          <Text style={[styles.tabTxt, activeTab === 'rozetler' && styles.tabTxtActive]}>{t.myBadges}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'gezilen' && styles.tabActive]} onPress={() => setActiveTab('gezilen')}>
          <Text style={[styles.tabTxt, activeTab === 'gezilen' && styles.tabTxtActive]}>{t.visitedPlaces}</Text>
        </TouchableOpacity>
      </View>

      {/* Rozetler */}
      {activeTab === 'rozetler' && (
        <View style={styles.badgeGrid}>
          {BADGES.map(b => {
            const earned = profile.badges?.includes(b.id);
            const catScore = b.category ? (profile.categoryScores?.[b.category] || 0) : totalScore;
            const progress = Math.min(catScore, b.minScore);
            return (
              <TouchableOpacity key={b.id} style={[styles.badge, earned ? styles.badgeEarned : styles.badgeLocked]} onPress={() => setSelectedBadge(b)} activeOpacity={0.8}>
                <Image source={{ uri: b.icon }} style={[styles.badgeIcon, !earned && { opacity: 0.25 }]} />
                <Text style={[styles.badgeName, !earned && { color: COLORS.muted }]}>{getBadgeLabel(b)}</Text>
                {!earned && (
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${(progress / b.minScore) * 100}%` }]} />
                  </View>
                )}
                {!earned && <Text style={styles.progressText}>{progress}/{b.minScore}</Text>}
                {earned && <Ionicons name="checkmark-circle" size={16} color={COLORS.green} style={styles.earnedCheck} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Gezilen yerler */}
      {activeTab === 'gezilen' && (
        <View style={styles.visitedList}>
          {loadingVisits ? <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} /> :
          visitedPlaces.length === 0 ? (
            <View style={styles.emptyVisited}>
              <Ionicons name="map-outline" size={40} color={COLORS.muted} />
              <Text style={styles.emptyTxt}>{lang === 'en' ? 'No visited places yet.' : 'Henüz gezilen yer yok.'}</Text>
            </View>
          ) : visitedPlaces.map(p => {
            const cat = CATEGORIES[p.category];
            return (
              <TouchableOpacity key={p.id} style={styles.visitedCard} onPress={() => navigation.navigate('Detail', { place: p, travelMode: TRAVEL_MODES[0] })}>
                <Image source={{ uri: p.image }} style={styles.visitedImg} resizeMode="cover" />
                <View style={styles.visitedInfo}>
                  <Text style={styles.visitedName} numberOfLines={1}>{p.name}</Text>
                  <Text style={[styles.visitedCat, { color: cat?.color }]}>{cat?.shortLabel} · {p.city}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Çıkış yap */}
      <TouchableOpacity style={styles.organizerBtn} onPress={() => navigation.navigate("Organizer")}>
        <Ionicons name="business-outline" size={18} color={COLORS.secondary} />
        <Text style={styles.organizerTxt}>Organizatör Paneli</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert(
        lang === 'en' ? 'Log Out' : 'Çıkış',
        lang === 'en' ? 'Are you sure you want to log out?' : 'Çıkış yapmak istiyor musunuz?',
        [{ text: lang === 'en' ? 'Cancel' : 'İptal' }, { text: lang === 'en' ? 'Log Out' : 'Çıkış Yap', style: 'destructive', onPress: logout }]
      )}>
        <Ionicons name="log-out-outline" size={18} color={COLORS.primary} />
        <Text style={styles.logoutTxt}>{t.logout}</Text>
      </TouchableOpacity>

      <Text style={styles.powered}>{t.poweredBy}</Text>

      {/* Rozet detay modal */}
      <Modal visible={!!selectedBadge} transparent animationType="fade" onRequestClose={() => setSelectedBadge(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedBadge(null)}>
          {selectedBadge && (
            <View style={styles.modalCard}>
              <Image source={{ uri: selectedBadge.icon }} style={[styles.modalIcon, !profile.badges?.includes(selectedBadge.id) && { opacity: 0.3 }]} />
              <Text style={styles.modalTitle}>{getBadgeLabel(selectedBadge)}</Text>
              {profile.badges?.includes(selectedBadge.id) ? (
                <View style={styles.earnedTag}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                  <Text style={styles.earnedTagText}>{lang === 'en' ? 'Earned!' : 'Kazanıldı!'}</Text>
                </View>
              ) : (
                <Text style={styles.modalStatus}>{lang === 'en' ? 'Not earned yet' : 'Henüz kazanılmadı'}</Text>
              )}
              <Text style={styles.modalDesc}>{getBadgeDesc(selectedBadge)}</Text>
              {getBadgeReward(selectedBadge) && (
                <View style={styles.rewardBox}>
                  <Ionicons name="gift-outline" size={16} color={COLORS.star} />
                  <Text style={styles.rewardText}>{getBadgeReward(selectedBadge)}</Text>
                </View>
              )}
              <View style={styles.modalProgress}>
                <Text style={styles.modalProgressLabel}>
                  {lang === 'en' ? 'Progress' : 'İlerleme'}: {Math.min(selectedBadge.category ? (profile.categoryScores?.[selectedBadge.category] || 0) : totalScore, selectedBadge.minScore)}/{selectedBadge.minScore}
                </Text>
                <View style={styles.modalProgressBar}>
                  <View style={[styles.modalProgressFill, {
                    width: `${Math.min(100, ((selectedBadge.category ? (profile.categoryScores?.[selectedBadge.category] || 0) : totalScore) / selectedBadge.minScore) * 100)}%`
                  }]} />
                </View>
              </View>
              <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedBadge(null)}>
                <Text style={styles.modalCloseText}>{lang === 'en' ? 'Close' : 'Kapat'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: 'center', backgroundColor: COLORS.secondary, paddingTop: 54, paddingBottom: 24, paddingHorizontal: 20, position: 'relative' },
  homeBtn: { position: 'absolute', top: 54, left: 16, padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)' },
  langBtn: { position: 'absolute', top: 54, right: 16, padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)' },
  langBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, position: 'relative' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.white },
  username: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  email: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2, marginBottom: 12 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)' },
  editBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
  editInline: { width: '100%', marginTop: 8 },
  editInput: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12, fontSize: 15, color: COLORS.white, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', marginBottom: 10, textAlign: 'center' },
  editBtns: { flexDirection: 'row', gap: 10 },
  saveBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  saveBtnTxt: { color: COLORS.white, fontWeight: '700' },
  cancelBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)' },
  cancelBtnTxt: { color: COLORS.white, fontWeight: '600' },
  scoreCard: { flexDirection: 'row', backgroundColor: COLORS.white, margin: 14, borderRadius: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  scoreItem: { flex: 1, alignItems: 'center' },
  scoreNum: { fontSize: 24, fontWeight: '900', color: COLORS.secondary },
  scoreLabel: { fontSize: 10, color: COLORS.muted, marginTop: 2, fontWeight: '600' },
  scoreDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 4 },
  tabRow: { flexDirection: 'row', marginHorizontal: 14, marginBottom: 14, backgroundColor: COLORS.border, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.white, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabTxt: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  tabTxtActive: { color: COLORS.secondary, fontWeight: '800' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 20 },
  badge: { width: '30%', alignItems: 'center', borderRadius: 16, padding: 12, position: 'relative' },
  badgeEarned: { backgroundColor: COLORS.white, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  badgeLocked: { backgroundColor: '#F0F0F0' },
  badgeIcon: { width: 44, height: 44, marginBottom: 6 },
  badgeName: { fontSize: 10, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  progressBar: { width: '100%', height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  progressText: { fontSize: 9, color: COLORS.muted, marginTop: 2 },
  earnedCheck: { position: 'absolute', top: 8, right: 8 },
  visitedList: { paddingHorizontal: 14, marginBottom: 20 },
  visitedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  visitedImg: { width: 72, height: 72 },
  visitedInfo: { flex: 1, padding: 10 },
  visitedName: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  visitedCat: { fontSize: 11, fontWeight: '600' },
  emptyVisited: { alignItems: 'center', paddingTop: 40 },
  emptyTxt: { fontSize: 15, color: COLORS.muted, marginTop: 12 },
  organizerBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 14, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.secondary, marginBottom: 10, marginTop: 8 },
  organizerTxt: { color: COLORS.secondary, fontWeight: "700", fontSize: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 14, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.primary, marginBottom: 12, marginTop: 8 },
  logoutTxt: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  powered: { fontSize: 11, color: COLORS.muted, textAlign: 'center', paddingBottom: 16 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  modalCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 24, width: '100%', alignItems: 'center' },
  modalIcon: { width: 80, height: 80, marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  earnedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F8F0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 12 },
  earnedTagText: { color: COLORS.green, fontWeight: '700', fontSize: 13 },
  modalStatus: { fontSize: 13, color: COLORS.muted, marginBottom: 12 },
  modalDesc: { fontSize: 14, color: COLORS.text, textAlign: 'center', lineHeight: 20, marginBottom: 12 },
  rewardBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FFF9E6', padding: 12, borderRadius: 12, marginBottom: 16, width: '100%' },
  rewardText: { flex: 1, fontSize: 13, color: '#B7860B', fontWeight: '600', lineHeight: 18 },
  modalProgress: { width: '100%', marginBottom: 20 },
  modalProgressLabel: { fontSize: 12, color: COLORS.muted, fontWeight: '600', marginBottom: 6, textAlign: 'center' },
  modalProgressBar: { width: '100%', height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  modalProgressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  modalClose: { backgroundColor: COLORS.secondary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 },
  modalCloseText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
