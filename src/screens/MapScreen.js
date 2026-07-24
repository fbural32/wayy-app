import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useUserLocation } from '../context/LocationContext';
import { PLACES } from '../data/places';
import { fetchNearbyPlaces } from '../utils/osmService';
import { fetchTicketmasterEvents } from '../utils/ticketmasterService';
import { CATEGORIES, COLORS, TRAVEL_MODES, CATEGORY_ORDER } from '../config/theme';
import { getDistanceKm, formatDistance } from '../utils/distance';

const ALERT_RADIUS_KM = 1;
const travelMode = TRAVEL_MODES[0];
const SIDEBAR_WIDTH = 240;

const ALERT_ICONS = {
  tarihi: '⚔️', doga: '🌿', unlu_kisi: '🗿', restoran: '🍖', muze: '🎵', etkinlik: '🎪',
};

function getLeafletHTML(lat, lon, places) {
  const markers = places.map(p => {
    const cat = CATEGORIES[p.category];
    const color = cat?.color || '#E63946';
    return `L.circleMarker([${p.latitude}, ${p.longitude}], {
      radius: 8,
      fillColor: '${color}',
      color: 'white',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(map).bindPopup('<b>${p.name.replace(/'/g, "\'")}</b><br>${p.city || ''}');`;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  body { margin: 0; padding: 0; }
  #map { width: 100vw; height: 100vh; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map').setView([${lat}, ${lon}], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);
  
  // Kullanıcı konumu
  L.circleMarker([${lat}, ${lon}], {
    radius: 10,
    fillColor: '#1D3557',
    color: 'white',
    weight: 3,
    fillOpacity: 1
  }).addTo(map).bindPopup('Konumunuz');
  
  ${markers}
</script>
</body>
</html>`;
}

export default function MapScreen({ navigation }) {
  const { location } = useUserLocation();
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

  const allPlaces = useMemo(() => [...PLACES, ...osmPlaces, ...events], [osmPlaces, events]);

  async function loadData(lat, lon) {
    if (lastFetchLocation.current) {
      const dist = getDistanceKm(lat, lon, lastFetchLocation.current.lat, lastFetchLocation.current.lon);
      if (dist < 3) return;
    }
    lastFetchLocation.current = { lat, lon };
    setLoadingOSM(true);
    try {
      const [osm, tmEvs] = await Promise.all([
        fetchNearbyPlaces(lat, lon, 15000),
        fetchTicketmasterEvents(lat, lon, 50),
      ]);
      setOsmPlaces(osm);
      setEvents(tmEvs);
    } catch (e) {
      console.log('Veri yükleme hatası:', e.message);
    }
    setLoadingOSM(false);
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

  useEffect(() => {
    if (!location) return;
    loadData(location.latitude, location.longitude);

    const withDist = allPlaces
      .map(p => ({ ...p, distKm: getDistanceKm(location.latitude, location.longitude, p.latitude, p.longitude) }))
      .sort((a, b) => a.distKm - b.distKm);

    withDist.forEach(p => {
      if (p.distKm <= ALERT_RADIUS_KM && !alertedPlaces.current.has(p.id)) {
        alertedPlaces.current.add(p.id);
        setAlertPlace(p);
        Animated.sequence([
          Animated.spring(nearestAnim, { toValue: 1, useNativeDriver: true }),
          Animated.delay(5000),
          Animated.timing(nearestAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
      }
    });
  }, [location?.latitude, location?.longitude]);

  const visiblePlaces = useMemo(() => {
    if (!location) return [];
    return allPlaces
      .filter(p => selectedCats.length === 0 || selectedCats.includes(p.category))
      .map(p => ({ ...p, distKm: getDistanceKm(location.latitude, location.longitude, p.latitude, p.longitude) }))
      .sort((a, b) => a.distKm - b.distKm);
  }, [location, selectedCats, allPlaces]);

  const nearest = visiblePlaces[0];

  if (!location) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadText}>Konum alınıyor...</Text>
    </View>
  );

  const mapHTML = getLeafletHTML(location.latitude, location.longitude, visiblePlaces.slice(0, 50));

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: mapHTML }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
      />

      {/* Üst bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.filterBtn} onPress={openSidebar}>
          <Ionicons name="options-outline" size={18} color={COLORS.white} />
          <Text style={styles.filterBtnText}>Filtrele</Text>
          {selectedCats.length > 0 && (
            <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{selectedCats.length}</Text></View>
          )}
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          {loadingOSM && <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 6 }} />}
          <Text style={styles.topBarInfo}>
            {loadingOSM ? 'Yükleniyor...' : `${visiblePlaces.length} yer`}
          </Text>
        </View>
      </View>

      {/* En Yakın kart */}
      {nearest && (
        <TouchableOpacity style={styles.nearestCard} onPress={() => navigation.navigate('Detail', { place: nearest, travelMode })} activeOpacity={0.9}>
          <View style={styles.nearestLeft}>
            <Text style={styles.nearestLabel}>📍 En Yakın</Text>
            <Text style={styles.nearestName} numberOfLines={1}>{nearest.name}</Text>
            <Text style={[styles.nearestCat, { color: CATEGORIES[nearest.category]?.color }]}>
              {CATEGORIES[nearest.category]?.shortLabel} · {nearest.city}
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
          <TouchableOpacity
            style={[styles.sidebarOption, selectedCats.length === 0 && styles.sidebarOptionActive]}
            onPress={() => { setSelectedCats([]); closeSidebar(); }}
          >
            <Ionicons name="apps-outline" size={20} color={selectedCats.length === 0 ? COLORS.white : COLORS.secondary} />
            <View style={styles.sidebarOptionInfo}>
              <Text style={[styles.sidebarOptionText, selectedCats.length === 0 && { color: COLORS.white }]}>Tümünü Göster</Text>
            </View>
            {selectedCats.length === 0 && <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />}
          </TouchableOpacity>

          {CATEGORY_ORDER.map(k => {
            const cat = CATEGORIES[k];
            const active = selectedCats.includes(k);
            return (
              <TouchableOpacity key={k} style={[styles.sidebarOption, active && { backgroundColor: cat.color }]} onPress={() => toggleCat(k)}>
                <Ionicons name={cat.icon} size={20} color={active ? COLORS.white : cat.color} />
                <View style={styles.sidebarOptionInfo}>
                  <Text style={[styles.sidebarOptionText, active && { color: COLORS.white }]}>{cat.label}</Text>
                </View>
                {active && <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.applyBtn} onPress={closeSidebar}>
            <Text style={styles.applyBtnText}>{selectedCats.length === 0 ? 'Tümünü Göster' : `${visiblePlaces.length} Yeri Göster`}</Text>
          </TouchableOpacity>
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
  sidebarOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, marginBottom: 8, backgroundColor: '#F5F6FA' },
  sidebarOptionActive: { backgroundColor: COLORS.secondary },
  sidebarOptionInfo: { flex: 1 },
  sidebarOptionText: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  applyBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 16, marginBottom: 10 },
  applyBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
  powered: { position: 'absolute', bottom: 8, alignSelf: 'center', fontSize: 10, color: COLORS.muted },
});
