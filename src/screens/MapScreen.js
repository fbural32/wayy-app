import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Dimensions, TouchableWithoutFeedback, ScrollView } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useUserLocation } from '../context/LocationContext';
import { PLACES } from '../data/places';
import { fetchNearbyPlaces } from '../utils/osmService';
import { fetchNearbyEvents } from '../utils/eventbriteService';
import { fetchTicketmasterEvents } from '../utils/ticketmasterService';
import { CATEGORIES, COLORS, TRAVEL_MODES, CATEGORY_ORDER } from '../config/theme';
import { getDistanceKm, formatDistance } from '../utils/distance';

const ALERT_RADIUS_KM = 1;
const travelMode = TRAVEL_MODES[0];
const SIDEBAR_WIDTH = 240;

const CATEGORY_SOUND_URLS = {
  tarihi: 'https://cdn.freesound.org/previews/411/411642_5121236-lq.mp3',
  doga: 'https://cdn.freesound.org/previews/17/17218_2064-lq.mp3',
  unlu_kisi: 'https://cdn.freesound.org/previews/415/415510_6051007-lq.mp3',
  restoran: 'https://cdn.freesound.org/previews/353/353085_5121236-lq.mp3',
  muze: 'https://cdn.freesound.org/previews/612/612095_1648170-lq.mp3',
  etkinlik: 'https://cdn.freesound.org/previews/264/264560_4921277-lq.mp3',
};

const ALERT_ICONS = {
  tarihi: '⚔️', doga: '🌿', unlu_kisi: '🗿', restoran: '🍖', muze: '🎵', etkinlik: '🎪',
};

export default function MapScreen({ navigation }) {
  const { location } = useUserLocation();
  const mapRef = useRef(null);
  const [selectedCats, setSelectedCats] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const alertedPlaces = useRef(new Set());
  const nearestAnim = useRef(new Animated.Value(0)).current;
  const [alertPlace, setAlertPlace] = useState(null);
  const soundRef = useRef(null);
  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const lastFetchLocation = useRef(null);

  const [osmPlaces, setOsmPlaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingOSM, setLoadingOSM] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const allPlaces = useMemo(() => [...PLACES, ...osmPlaces, ...events], [osmPlaces, events]);

  async function loadData(lat, lon) {
    if (lastFetchLocation.current) {
      const dist = getDistanceKm(lat, lon, lastFetchLocation.current.lat, lastFetchLocation.current.lon);
      if (dist < 3) return;
    }
    lastFetchLocation.current = { lat, lon };

    setLoadingOSM(true);
    const osm = await fetchNearbyPlaces(lat, lon, 15000);
    setOsmPlaces(osm);
    setLoadingOSM(false);

    setLoadingEvents(true);
    const [evs, tmEvs] = await Promise.all([
      fetchNearbyEvents(lat, lon, 30),
      fetchTicketmasterEvents(lat, lon, 50),
    ]);
    // Duplicate isimleri temizle
    const allEvs = [...evs, ...tmEvs].filter((e, i, arr) =>
      arr.findIndex(x => x.name.toLowerCase() === e.name.toLowerCase()) === i
    );
    setEvents(allEvs);
    setLoadingEvents(false);
  }

  function openSidebar() {
    setSidebarOpen(true);
    Animated.parallel([
      Animated.spring(sidebarAnim, { toValue: 0, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0.5, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  function closeSidebar() {
    Animated.parallel([
      Animated.spring(sidebarAnim, { toValue: -SIDEBAR_WIDTH, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setSidebarOpen(false));
  }

  function toggleCat(k) {
    setSelectedCats(p => p.includes(k) ? p.filter(c => c !== k) : [...p, k]);
  }

  async function playSound(category) {
    try {
      let soundSource;
      try {
        const assetMap = {
          tarihi: require('../../assets/tarihi.mp3'),
          doga: require('../../assets/doga.mp3'),
          unlu_kisi: require('../../assets/anit.mp3'),
          restoran: require('../../assets/restoran.mp3'),
          muze: require('../../assets/muze.mp3'),
        };
        soundSource = assetMap[category];
      } catch {
        soundSource = { uri: CATEGORY_SOUND_URLS[category] || CATEGORY_SOUND_URLS.tarihi };
      }
      const { Audio } = await import('expo-audio');
      if (soundRef.current) { try { await soundRef.current.unloadAsync(); } catch {} }
      const { sound } = await Audio.Sound.createAsync(soundSource, { shouldPlay: true, volume: 0.8 });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(s => { if (s.didJustFinish) sound.unloadAsync(); });
    } catch (e) { console.log('Ses hatası:', e.message); }
  }

  useEffect(() => {
    if (!location) return;
    mapRef.current?.animateToRegion({ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.3, longitudeDelta: 0.3 }, 600);
    loadData(location.latitude, location.longitude);

    const withDist = allPlaces.map(p => ({ ...p, distKm: getDistanceKm(location.latitude, location.longitude, p.latitude, p.longitude) })).sort((a, b) => a.distKm - b.distKm);
    withDist.forEach(p => {
      if (p.distKm <= ALERT_RADIUS_KM && !alertedPlaces.current.has(p.id)) {
        alertedPlaces.current.add(p.id);
        setAlertPlace(p);
        playSound(p.category);
        Animated.sequence([
          Animated.spring(nearestAnim, { toValue: 1, useNativeDriver: true }),
          Animated.delay(5000),
          Animated.timing(nearestAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
      }
    });
  }, [location?.latitude, location?.longitude]);

  useEffect(() => {
    return () => { if (soundRef.current) { try { soundRef.current.unloadAsync(); } catch {} } };
  }, []);

  const visiblePlaces = useMemo(() => {
    if (!location) return [];
    return allPlaces
      .filter(p => selectedCats.length === 0 || selectedCats.includes(p.category))
      .map(p => ({ ...p, distKm: getDistanceKm(location.latitude, location.longitude, p.latitude, p.longitude) }))
      .sort((a, b) => a.distKm - b.distKm);
  }, [location, selectedCats, allPlaces]);

  const nearest = visiblePlaces[0];
  const isLoading = loadingOSM || loadingEvents;

  if (!location) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadText}>Konum alınıyor...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.3, longitudeDelta: 0.3 }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {visiblePlaces.map(place => {
          const cat = CATEGORIES[place.category];
          if (!cat) return null;
          return (
            <Marker key={place.id} coordinate={{ latitude: place.latitude, longitude: place.longitude }} pinColor={cat.color}>
              <Callout tooltip={false} onPress={() => navigation.navigate('Detail', { place, travelMode })}>
                <View style={styles.callout}>
                  <Text style={styles.calloutName} numberOfLines={1}>{place.name}</Text>
                  <Text style={[styles.calloutCat, { color: cat.color }]}>{cat.shortLabel}{place.isEvent ? ` · ${place.eventDate}` : ` · ${place.city || ''}`}</Text>
                  {place.isEvent && place.isFree && <Text style={styles.calloutFree}>🎟️ Ücretsiz</Text>}
                  <View style={styles.calloutRow}>
                    <Ionicons name="star" size={12} color={COLORS.star} />
                    <Text style={styles.calloutRating}>{place.rating?.toFixed(1)}</Text>
                    <Text style={styles.calloutDist}> · {formatDistance(place.distKm)}</Text>
                  </View>
                  <Text style={styles.calloutTap}>Detay için dokun →</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Üst bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.filterBtn} onPress={openSidebar}>
          <Ionicons name="options-outline" size={18} color={COLORS.white} />
          <Text style={styles.filterBtnText}>Filtrele</Text>
          {selectedCats.length > 0 && <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{selectedCats.length}</Text></View>}
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          {isLoading && <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 6 }} />}
          <Text style={styles.topBarInfo}>{isLoading ? 'Yükleniyor...' : `${visiblePlaces.length} yer`}</Text>
          {events.length > 0 && !isLoading && <Text style={styles.eventCount}> · 🎪 {events.length} etkinlik</Text>}
        </View>
        <TouchableOpacity style={styles.locBtn} onPress={() => mapRef.current?.animateToRegion({ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.1, longitudeDelta: 0.1 }, 500)}>
          <Ionicons name="locate" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* En Yakın kart */}
      {nearest && (
        <TouchableOpacity style={styles.nearestCard} onPress={() => navigation.navigate('Detail', { place: nearest, travelMode })} activeOpacity={0.9}>
          <View style={styles.nearestLeft}>
            <Text style={styles.nearestLabel}>📍 En Yakın</Text>
            <Text style={styles.nearestName} numberOfLines={1}>{nearest.name}</Text>
            <Text style={[styles.nearestCat, { color: CATEGORIES[nearest.category]?.color }]}>
              {CATEGORIES[nearest.category]?.shortLabel}{nearest.isEvent ? ` · ${nearest.eventDate}` : ` · ${nearest.city}`}
            </Text>
          </View>
          <View style={styles.nearestRight}>
            <Text style={styles.nearestDist}>{formatDistance(nearest.distKm)}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
          </View>
        </TouchableOpacity>
      )}

      {/* Bildirim banner */}
      <Animated.View style={[styles.alertBanner, {
        opacity: nearestAnim,
        transform: [{ translateY: nearestAnim.interpolate({ inputRange: [0, 1], outputRange: [-80, 0] }) }]
      }]}>
        {alertPlace && (
          <>
            <Text style={styles.alertIcon}>{ALERT_ICONS[alertPlace.category] || '📍'}</Text>
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>Çevrende: {alertPlace.name}</Text>
              <Text style={styles.alertSub}>{CATEGORIES[alertPlace.category]?.shortLabel} · {formatDistance(alertPlace.distKm)}</Text>
            </View>
            <TouchableOpacity onPress={() => { nearestAnim.setValue(0); navigation.navigate('Detail', { place: alertPlace, travelMode }); }}>
              <Text style={styles.alertAction}>Gör →</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>

      {sidebarOpen && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
        </TouchableWithoutFeedback>
      )}

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Kategori Filtrele</Text>
          <TouchableOpacity onPress={closeSidebar}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.sidebarScroll}>
          <TouchableOpacity style={[styles.sidebarOption, selectedCats.length === 0 && styles.sidebarOptionActive]} onPress={() => { setSelectedCats([]); closeSidebar(); }}>
            <Ionicons name="apps-outline" size={20} color={selectedCats.length === 0 ? COLORS.white : COLORS.secondary} />
            <View style={styles.sidebarOptionInfo}>
              <Text style={[styles.sidebarOptionText, selectedCats.length === 0 && { color: COLORS.white }]}>Tümünü Göster</Text>
              <Text style={[styles.sidebarOptionCount, selectedCats.length === 0 && { color: 'rgba(255,255,255,0.7)' }]}>{allPlaces.length} yer</Text>
            </View>
            {selectedCats.length === 0 && <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />}
          </TouchableOpacity>

          <Text style={styles.sidebarLabel}>Kategoriler</Text>
          {CATEGORY_ORDER.map(k => {
            const cat = CATEGORIES[k];
            const active = selectedCats.includes(k);
            const count = allPlaces.filter(p => p.category === k).length;
            return (
              <TouchableOpacity key={k} style={[styles.sidebarOption, active && { backgroundColor: cat.color }]} onPress={() => toggleCat(k)}>
                <Ionicons name={cat.icon} size={20} color={active ? COLORS.white : cat.color} />
                <View style={styles.sidebarOptionInfo}>
                  <Text style={[styles.sidebarOptionText, active && { color: COLORS.white }]}>{cat.label}</Text>
                  <Text style={[styles.sidebarOptionCount, active && { color: 'rgba(255,255,255,0.7)' }]}>{count} yer{k === 'etkinlik' ? ' 🔴 Canlı' : ''}</Text>
                </View>
                {active && <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.applyBtn} onPress={closeSidebar}>
            <Text style={styles.applyBtnText}>{selectedCats.length === 0 ? 'Tümünü Göster' : `${visiblePlaces.length} Yeri Göster`}</Text>
          </TouchableOpacity>
          {selectedCats.length > 0 && (
            <TouchableOpacity style={styles.resetBtn} onPress={() => { setSelectedCats([]); closeSidebar(); }}>
              <Ionicons name="refresh-outline" size={16} color={COLORS.primary} />
              <Text style={styles.resetBtnText}>Filtreyi Temizle</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </Animated.View>

      <Text style={styles.powered}>Powered by fbural</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  loadText: { marginTop: 12, color: COLORS.muted },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, paddingTop: 52, paddingBottom: 10, paddingHorizontal: 14, gap: 10 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, position: 'relative' },
  filterBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.primary, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  topBarCenter: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  topBarInfo: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  eventCount: { color: '#FF69B4', fontSize: 12, fontWeight: '700' },
  locBtn: { backgroundColor: 'rgba(255,255,255,0.18)', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  nearestCard: { position: 'absolute', bottom: 70, left: 14, right: 14, backgroundColor: COLORS.white, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, elevation: 6 },
  nearestLeft: { flex: 1 },
  nearestLabel: { fontSize: 11, fontWeight: '700', color: COLORS.primary, marginBottom: 2 },
  nearestName: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  nearestCat: { fontSize: 12, fontWeight: '600' },
  nearestRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nearestDist: { fontSize: 14, fontWeight: '800', color: COLORS.secondary },
  alertBanner: { position: 'absolute', top: 106, left: 14, right: 14, backgroundColor: COLORS.secondary, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  alertIcon: { fontSize: 28 },
  alertInfo: { flex: 1 },
  alertTitle: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  alertSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  alertAction: { color: COLORS.white, fontWeight: '800', fontSize: 13, backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' },
  sidebar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: SIDEBAR_WIDTH, backgroundColor: COLORS.white, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, elevation: 10 },
  sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.secondary, paddingHorizontal: 16, paddingTop: 54, paddingBottom: 16 },
  sidebarTitle: { fontSize: 16, fontWeight: '800', color: COLORS.white },
  sidebarScroll: { flex: 1, padding: 14 },
  sidebarLabel: { fontSize: 11, fontWeight: '800', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 16, marginBottom: 8 },
  sidebarOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, marginBottom: 8, backgroundColor: '#F5F6FA' },
  sidebarOptionActive: { backgroundColor: COLORS.secondary },
  sidebarOptionInfo: { flex: 1 },
  sidebarOptionText: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  sidebarOptionCount: { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  applyBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 16, marginBottom: 10 },
  applyBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.primary, marginBottom: 12 },
  resetBtnText: { color: COLORS.primary, fontWeight: '700' },
  callout: { width: 190, padding: 6 },
  calloutName: { fontWeight: '800', fontSize: 14, color: COLORS.text, marginBottom: 2 },
  calloutCat: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  calloutFree: { fontSize: 11, color: COLORS.green, fontWeight: '700', marginBottom: 4 },
  calloutRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  calloutRating: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginLeft: 3 },
  calloutDist: { fontSize: 12, color: COLORS.muted },
  calloutTap: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  powered: { position: 'absolute', bottom: 8, alignSelf: 'center', fontSize: 10, color: COLORS.muted },
});
