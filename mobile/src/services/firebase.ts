import { initializeApp } from 'firebase/app'
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

console.log('[v0] Firebase config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
})

const app = initializeApp(firebaseConfig)

// Initialize Firebase Auth with React Native persistence
let auth
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  })
  console.log('[v0] Firebase Auth initialized with persistence')
} catch (error: any) {
  console.log('[v0] Using default auth (web):', error.message)
  auth = getAuth(app)
}

export { app, auth }
