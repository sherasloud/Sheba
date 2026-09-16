import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Your Firebase configuration (from Firebase Console)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDhJ5X8xK9mL2pQ3rS4tU5vW6xY7zA8bC9d',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'sheba-1fc71.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'sheba-1fc71',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'sheba-1fc71.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abc123def456ghi789',
}

console.log('[v0] Firebase config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
})

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication
const auth = getAuth(app)
auth.languageCode = 'en'

// Set recaptcha config for phone auth (Android specific)
if (typeof window !== 'undefined') {
  auth.settings.appVerificationDisabledForTesting = false
}

console.log('[v0] Firebase Auth initialized')

export { app, auth }
