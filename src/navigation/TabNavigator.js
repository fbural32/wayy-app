import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MapScreen from '../screens/MapScreen';
import ListScreen from '../screens/ListScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS } from '../config/theme';
import { useLanguage } from '../context/LanguageContext';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      initialRouteName="Harita"
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COLORS.secondary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: { borderTopWidth: 0, elevation: 10, shadowOpacity: 0.1 },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Harita: 'map-outline',
            Keşfet: 'compass-outline',
            Favoriler: 'heart-outline',
            Profil: 'person-circle-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Harita" component={MapScreen} options={{ title: 'Wayy!', headerShown: false, tabBarLabel: t.map }} />
      <Tab.Screen name="Keşfet" component={ListScreen} options={{ title: t.nearby, tabBarLabel: t.nearby }} />
      <Tab.Screen name="Favoriler" component={FavoritesScreen} options={{ title: t.favorites, tabBarLabel: t.favorites }} />
      <Tab.Screen name="Profil" component={ProfileScreen} options={{ title: t.profile, tabBarLabel: t.profile }} />
    </Tab.Navigator>
  );
}
