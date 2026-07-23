import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import TabNavigator from './src/navigation/TabNavigator';
import DetailScreen from './src/screens/DetailScreen';
import AuthScreen from './src/screens/AuthScreen';
import AgreementScreen from './src/screens/AgreementScreen';
import LanguageScreen from './src/screens/LanguageScreen';
import OrganizerScreen from './src/screens/OrganizerScreen';
import ProScreen from './src/screens/ProScreen';
import { COLORS } from './src/config/theme';
import { requestNotificationPermission, startBackgroundLocationTracking } from './src/utils/notificationService';

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true }),
});

function AppContent() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [agreedToTerms, setAgreedToTerms] = useState(null);
  const [langSelected, setLangSelected] = useState(null);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('@yol_sozlesme'),
      AsyncStorage.getItem('@wayy_lang_selected'),
    ]).then(([agreement, lang]) => {
      setAgreedToTerms(agreement === 'accepted');
      setLangSelected(lang === 'yes');
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        await requestNotificationPermission();
        await startBackgroundLocationTracking();
      } catch (e) { console.log('Bildirim kurulum:', e.message); }
    })();
  }, [user]);

  if (loading || agreedToTerms === null || langSelected === null) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.secondary }}><ActivityIndicator size="large" color={COLORS.white} /></View>;
  }

  if (!langSelected) return <LanguageScreen onDone={() => setLangSelected(true)} />;
  if (!agreedToTerms) return <AgreementScreen onAccept={() => setAgreedToTerms(true)} />;
  if (!user) return <AuthScreen />;

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={({ route }) => ({
            title: route.params?.place?.name ?? 'Detay',
            headerStyle: { backgroundColor: COLORS.secondary },
            headerTintColor: COLORS.white,
            headerTitleStyle: { fontWeight: '800' },
            headerBackTitle: 'Geri',
          })}
        />
        <Stack.Screen
          name="Organizer"
          component={OrganizerScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Pro"
          component={ProScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <LocationProvider>
          <AppContent />
        </LocationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
