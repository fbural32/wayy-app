import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS } from '../config/theme';

export default function AuthScreen() {
  const { register, login } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleForgotPassword() {
    if (!email.trim()) return Alert.alert('Hata', t.forgotDesc);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('✓', email + ' adresine link gönderildi. Spam klasörünü kontrol edin.');
      setIsForgot(false);
    } catch (e) {
      Alert.alert('Hata', e.code === 'auth/user-not-found' ? 'Kullanıcı bulunamadı.' : 'Bir hata oluştu.');
    }
    setLoading(false);
  }

  async function handleSubmit() {
    if (!email || !password) return Alert.alert('Hata', 'Email ve şifre zorunludur.');
    if (!isLogin && !username) return Alert.alert('Hata', 'Kullanıcı adı zorunludur.');
    if (!isLogin && username.length < 3) return Alert.alert('Hata', 'Kullanıcı adı en az 3 karakter.');
    if (password.length < 6) return Alert.alert('Hata', 'Şifre en az 6 karakter.');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, username.trim(), null);
      }
    } catch (e) {
      let msg = 'Bir hata oluştu.';
      if (e.code === 'auth/email-already-in-use') msg = 'Bu email zaten kullanımda.';
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') msg = 'Email veya şifre hatalı.';
      if (e.code === 'auth/user-not-found') msg = 'Kullanıcı bulunamadı.';
      if (e.code === 'auth/invalid-email') msg = 'Geçersiz email.';
      if (e.code === 'auth/weak-password') msg = 'Şifre en az 6 karakter.';
      Alert.alert('Hata', msg);
    }
    setLoading(false);
  }

  if (isForgot) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🔑</Text>
        <Text style={styles.title}>{t.forgotTitle}</Text>
        <Text style={styles.forgotDesc}>{t.forgotDesc}</Text>
        <Text style={styles.label}>{t.email}</Text>
        <TextInput style={styles.input} placeholder={t.emailPlaceholder} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TouchableOpacity style={styles.button} onPress={handleForgotPassword} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>{t.sendLink}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => setIsForgot(false)}>
          <Text style={styles.backBtnText}>{t.backToLogin}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>{t.appName}</Text>
      <Text style={styles.subtitle}>{t.poweredBy}</Text>

      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, isLogin && styles.tabActive]} onPress={() => setIsLogin(true)}>
          <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>{t.login}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, !isLogin && styles.tabActive]} onPress={() => setIsLogin(false)}>
          <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>{t.register}</Text>
        </TouchableOpacity>
      </View>

      {!isLogin && (
        <>
          <Text style={styles.label}>{t.username}</Text>
          <TextInput style={styles.input} placeholder={t.usernamePlaceholder} value={username} onChangeText={setUsername} autoCapitalize="none" />
        </>
      )}

      <Text style={styles.label}>{t.email}</Text>
      <TextInput style={styles.input} placeholder={t.emailPlaceholder} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

      <Text style={styles.label}>{t.password}</Text>
      <TextInput style={styles.input} placeholder={t.passwordPlaceholder} value={password} onChangeText={setPassword} secureTextEntry />

      {isLogin && (
        <TouchableOpacity style={styles.forgotBtn} onPress={() => setIsForgot(true)}>
          <Text style={styles.forgotBtnText}>{t.forgotPassword}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>{isLogin ? t.login : t.register}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24, paddingTop: 70 },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 8 },
  title: { fontSize: 36, fontWeight: '900', color: COLORS.secondary, textAlign: 'center', marginTop: 8 },
  subtitle: { fontSize: 12, color: COLORS.muted, textAlign: 'center', marginBottom: 36 },
  forgotDesc: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.border, borderRadius: 14, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.white, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontWeight: '600', color: COLORS.muted, fontSize: 15 },
  tabTextActive: { color: COLORS.primary, fontWeight: '800' },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.muted, marginBottom: 6, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, fontSize: 15, borderWidth: 1, borderColor: COLORS.border },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 10 },
  forgotBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  button: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 24, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  buttonText: { color: COLORS.white, fontWeight: '900', fontSize: 17 },
  backBtn: { alignItems: 'center', marginTop: 20 },
  backBtnText: { color: COLORS.secondary, fontWeight: '600', fontSize: 14 },
});
