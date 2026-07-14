import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDUMuVEa9w3e8ZFdG-feWAroVkbvBD3b-Q",
  authDomain: "yolarkadasims.firebaseapp.com",
  projectId: "yolarkadasims",
  storageBucket: "yolarkadasims.firebasestorage.app",
  messagingSenderId: "628374781316",
  appId: "1:628374781316:web:5a0528651928ef47b4f1d1",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
