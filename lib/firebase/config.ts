// Firebase configuration for global sync
// This enables Send Money data to sync across all devices globally

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abc123",
}

let app: FirebaseApp | null = null
let db: Firestore | null = null

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null
  
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }
    return app
  } catch (error) {
    console.log("[v0] Firebase initialization skipped - using local storage fallback")
    return null
  }
}

export function getFirestoreDb(): Firestore | null {
  if (typeof window === "undefined") return null
  
  try {
    const firebaseApp = getFirebaseApp()
    if (!firebaseApp) return null
    
    if (!db) {
      db = getFirestore(firebaseApp)
    }
    return db
  } catch (error) {
    console.log("[v0] Firestore initialization skipped - using local storage fallback")
    return null
  }
}
