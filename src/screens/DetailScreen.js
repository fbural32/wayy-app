import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, increment, arrayUnion, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useUserLocation } from '../context/LocationContext';
import RatingStars from '../components/RatingStars';
import { CATEGORIES, COLORS, BADGES } from '../config/theme';
import { getDistanceKm, estimateMinutes, formatDistance, formatDuration, containsBadWord } from '../utils/distance';

export default function DetailScreen({ route, navigation }) {
  const { place, travelMode } = route.params;
  const { location } = useUserLocation();
  const { user, profile, refreshProfile } = useAuth();
  const cat = CATEGORIES[place.category];

  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  let distanceKm = null, durationMin = null;
  if (location && travelMode) {
    distanceKm = getDistanceKm(location.latitude, location.longitude, place.latitude, place.longitude);
    durationMin = estimateMinutes(distanceKm, travelMode.speedKmh);
  }

  useEffect(() => {
    loadReviews();
    checkFavorite();
  }, []);

  async function loadReviews() {
    setLoadingReviews(true);
    try {
      // orderBy olmadan çek - index sorunu olmasın
      const q = query(
        collection(db, 'reviews'),
        where('placeId', '==', place.id)
      );
      const snap = await getDocs(q);
      const revs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Tarihe göre sırala - client tarafında
      revs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Kullanıcı adlarını çek
      const userIds = [...new Set(revs.map(r => r.userId))];
      const usernames = {};
      await Promise.all(userIds.map(async uid => {
        try {
          const snap = await getDoc(doc(db, 'users', uid));
          if (snap.exists()) usernames[uid] = snap.data().username || 'Gezgin';
        } catch { usernames[uid] = 'Gezgin'; }
      }));

      setReviews(revs.map(r => ({ ...r, username: usernames[r.userId] || 'Gezgin' })));
    } catch (e) {
      console.log('Yorum yükleme hatası:', e);
    }
    setLoadingReviews(false);
  }

  async function checkFavorite() {
    const favs = JSON.parse(await AsyncStorage.getItem('@favs') || '[]');
    setFavorited(favs.includes(place.id));
  }

  async function toggleFavorite() {
    const favs = JSON.parse(await AsyncStorage.getItem('@favs') || '[]');
    const newFavs = favs.includes(place.id) ? favs.filter(f => f !== place.id) : [...favs, place.id];
    await AsyncStorage.setItem('@favs', JSON.stringify(newFavs));
    setFavorited(!favorited);
  }

  async function submitReview() {
    if (!reviewText.trim()) return Alert.alert('Hata', 'Yorum boş olamaz.');
    if (!user) return Alert.alert('Hata', 'Yorum yapmak için giriş yapın.');
    if (containsBadWord(reviewText)) {
      await updateDoc(doc(db, 'users', user.uid), { banned: true });
      Alert.alert('Hesabınız askıya alındı', 'Uygunsuz içerik tespit edildi.');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        userId: user.uid,
        placeId: place.id,
        placeCategory: place.category,
        rating: reviewRating,
        text: reviewText.trim(),
        createdAt: new Date().toISOString(),
      });

      // 20 puan ekle
      const catKey = 'categoryScores.' + place.category;
      await updateDoc(doc(db, 'users', user.uid), {
        score: increment(1),
        [catKey]: increment(1),
      });

      // Rozet kontrolü
      const usnap = await getDoc(doc(db, 'users', user.uid));
      const udata = usnap.data();
      const newBadges = [];
      for (const badge of BADGES) {
        if (udata.badges?.includes(badge.id)) continue;
        if (badge.category) {
          const cs = udata.categoryScores?.[badge.category] || 0;
          if (cs >= badge.minScore) newBadges.push(badge.id);
        } else {
          if ((udata.score || 0) >= badge.minScore) newBadges.push(badge.id);
        }
      }
      if (newBadges.length > 0) {
        await updateDoc(doc(db, 'users', user.uid), { badges: arrayUnion(...newBadges) });
        const names = newBadges.map(id => BADGES.find(b => b.id === id)?.label).join(', ');
        Alert.alert('🏆 Rozet Kazandın!', `"${names}" rozeti kazandınız!`);
      } else {
        Alert.alert('Teşekkürler!', '1 puan kazandınız! 🎉');
      }

      setReviewText('');
      setReviewRating(5);
      await loadReviews();
      await refreshProfile();
    } catch (e) {
      Alert.alert('Hata', 'Yorum gönderilemedi: ' + e.message);
    }
    setSubmitting(false);
  }

  function openDirections() {
    const { latitude, longitude } = place;
    const label = encodeURIComponent(place.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`)
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Kapak fotoğrafı */}
      {place.image ? (
        <Image source={{ uri: place.image }} style={styles.coverImage} resizeMode="cover" />
      ) : (
        <View style={[styles.coverPlaceholder, { backgroundColor: cat.color + '30' }]}>
          <Ionicons name={cat.icon} size={60} color={cat.color} />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.name}>{place.name}</Text>
            <Text style={[styles.category, { color: cat.color }]}>{cat.label} · {place.city}</Text>
          </View>
          <TouchableOpacity onPress={toggleFavorite} style={styles.favBtn}>
            <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={28} color={favorited ? COLORS.primary : COLORS.muted} />
          </TouchableOpacity>
        </View>

        <RatingStars rating={place.rating} reviewCount={place.reviewCount} size={16} />

        {distanceKm !== null && (
          <View style={styles.distBox}>
            <Ionicons name={travelMode?.icon || 'navigate-outline'} size={16} color={COLORS.secondary} />
            <Text style={styles.distText}>{formatDistance(distanceKm)} · ~{formatDuration(durationMin)}</Text>
          </View>
        )}

        <Text style={styles.desc}>{place.description}</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={openDirections}>
          <Ionicons name="navigate" size={18} color={COLORS.white} />
          <Text style={styles.primaryBtnText}>Yol Tarifi Al</Text>
        </TouchableOpacity>

        {/* YORUM YAZ */}
        <Text style={styles.sectionTitle}>Yorum Yaz</Text>
        <View style={styles.starSelect}>
          {[1,2,3,4,5].map(s => (
            <TouchableOpacity key={s} onPress={() => setReviewRating(s)}>
              <Ionicons name={s <= reviewRating ? 'star' : 'star-outline'} size={32} color={COLORS.star} />
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.reviewInput}
          placeholder="Deneyimlerinizi paylaşın... (+1 puan)"
          value={reviewText}
          onChangeText={setReviewText}
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity style={styles.submitBtn} onPress={submitReview} disabled={submitting}>
          {submitting ? <ActivityIndicator color={COLORS.white} /> : (
            <><Ionicons name="send-outline" size={16} color={COLORS.white} /><Text style={styles.submitText}> Gönder (+1 puan)</Text></>
          )}
        </TouchableOpacity>

        {/* YORUMLAR */}
        <Text style={styles.sectionTitle}>
          Yorumlar {loadingReviews ? '' : `(${reviews.length})`}
        </Text>
        {loadingReviews ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
        ) : reviews.length === 0 ? (
          <View style={styles.noReviewBox}>
            <Ionicons name="chatbubble-outline" size={32} color={COLORS.muted} />
            <Text style={styles.noReview}>Henüz yorum yok. İlk yorumu sen yap!</Text>
          </View>
        ) : reviews.map(r => (
          <View key={r.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewUserRow}>
                <View style={styles.reviewAvatar}>
                  <Ionicons name="person" size={14} color={COLORS.white} />
                </View>
                <Text style={styles.reviewUser}>@{r.username}</Text>
              </View>
              <View style={styles.reviewStars}>
                {[1,2,3,4,5].map(s => (
                  <Ionicons key={s} name={s <= r.rating ? 'star' : 'star-outline'} size={12} color={COLORS.star} />
                ))}
              </View>
            </View>
            <Text style={styles.reviewText}>{r.text}</Text>
            <Text style={styles.reviewDate}>
              {new Date(r.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        ))}

        <Text style={styles.powered}>Powered by fbural</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  coverImage: { width: '100%', height: 220 },
  coverPlaceholder: { width: '100%', height: 220, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  headerText: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  category: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8 },
  favBtn: { padding: 4 },
  distBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginTop: 10, marginBottom: 14 },
  distText: { marginLeft: 8, color: COLORS.secondary, fontWeight: '600', fontSize: 13 },
  desc: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: 20 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, gap: 8, marginBottom: 28 },
  primaryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 12, marginTop: 8 },
  starSelect: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  reviewInput: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, minHeight: 90, textAlignVertical: 'top', marginBottom: 10 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.secondary, borderRadius: 12, paddingVertical: 14, marginBottom: 28 },
  submitText: { color: COLORS.white, fontWeight: '700' },
  noReviewBox: { alignItems: 'center', padding: 24 },
  noReview: { color: COLORS.muted, fontSize: 14, marginTop: 8, fontStyle: 'italic' },
  reviewCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewUserRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  reviewUser: { fontWeight: '700', fontSize: 13, color: COLORS.secondary },
  reviewStars: { flexDirection: 'row', gap: 1 },
  reviewText: { fontSize: 14, color: COLORS.text, lineHeight: 20, marginBottom: 6 },
  reviewDate: { fontSize: 11, color: COLORS.muted },
  powered: { fontSize: 11, color: COLORS.muted, textAlign: 'center', marginTop: 24, marginBottom: 8 },
});
