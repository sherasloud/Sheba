// Firebase User Service - Global user sync across all devices

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore"
import { getFirestoreDb } from "./config"

export interface FirebaseUser {
  phoneNumber: string
  fullName: string
  balance: number
  pin: string
  isVerified: boolean
  accountNumber: string
  role?: string
  accountType?: "regular" | "business" | "state"
  createdAt: string
  updatedAt: string
}

const USERS_COLLECTION = "users"

// Create or update user in Firebase
export async function syncUserToFirebase(user: FirebaseUser): Promise<boolean> {
  try {
    const db = getFirestoreDb()
    if (!db) {
      console.log("[v0] Firebase not available, syncing to localStorage only")
      syncUserToLocalStorage(user)
      return true
    }

    const userRef = doc(db, USERS_COLLECTION, user.phoneNumber)
    await setDoc(userRef, {
      ...user,
      updatedAt: new Date().toISOString()
    }, { merge: true })
    
    console.log(`[v0] User ${user.phoneNumber} synced to Firebase`)
    syncUserToLocalStorage(user)
    return true
  } catch (error) {
    console.log("[v0] Firebase sync failed, using localStorage:", error)
    syncUserToLocalStorage(user)
    return true
  }
}

// Get user from Firebase
export async function getUserFromFirebase(phoneNumber: string): Promise<FirebaseUser | null> {
  try {
    const db = getFirestoreDb()
    if (!db) {
      return getUserFromLocalStorage(phoneNumber)
    }

    const userRef = doc(db, USERS_COLLECTION, phoneNumber)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const user = userSnap.data() as FirebaseUser
      syncUserToLocalStorage(user) // Keep local cache updated
      return user
    }
    
    // Fallback to localStorage
    return getUserFromLocalStorage(phoneNumber)
  } catch (error) {
    console.log("[v0] Firebase fetch failed, using localStorage:", error)
    return getUserFromLocalStorage(phoneNumber)
  }
}

// Update user balance in Firebase
export async function updateUserBalanceInFirebase(phoneNumber: string, newBalance: number): Promise<boolean> {
  try {
    const db = getFirestoreDb()
    if (!db) {
      updateBalanceInLocalStorage(phoneNumber, newBalance)
      return true
    }

    const userRef = doc(db, USERS_COLLECTION, phoneNumber)
    await updateDoc(userRef, {
      balance: newBalance,
      updatedAt: new Date().toISOString()
    })
    
    updateBalanceInLocalStorage(phoneNumber, newBalance)
    console.log(`[v0] Balance updated for ${phoneNumber}: ${newBalance}`)
    return true
  } catch (error) {
    console.log("[v0] Firebase balance update failed, using localStorage:", error)
    updateBalanceInLocalStorage(phoneNumber, newBalance)
    return true
  }
}

// Subscribe to user changes (real-time updates)
export function subscribeToUserUpdates(
  phoneNumber: string, 
  callback: (user: FirebaseUser | null) => void
): () => void {
  try {
    const db = getFirestoreDb()
    if (!db) {
      // Return dummy unsubscribe if Firebase not available
      const user = getUserFromLocalStorage(phoneNumber)
      callback(user)
      return () => {}
    }

    const userRef = doc(db, USERS_COLLECTION, phoneNumber)
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const user = doc.data() as FirebaseUser
        syncUserToLocalStorage(user)
        callback(user)
      } else {
        callback(null)
      }
    }, (error) => {
      console.log("[v0] Snapshot error, using localStorage:", error)
      callback(getUserFromLocalStorage(phoneNumber))
    })

    return unsubscribe
  } catch (error) {
    console.log("[v0] Subscribe failed:", error)
    return () => {}
  }
}

// LocalStorage helpers for offline support
function syncUserToLocalStorage(user: FirebaseUser): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(`user_${user.phoneNumber}`, JSON.stringify(user))
    localStorage.setItem(`userBalance_${user.phoneNumber}`, user.balance.toString())
    localStorage.setItem(`balance_${user.phoneNumber}`, user.balance.toString())
    
    // Also store for current session
    const currentPhone = localStorage.getItem("phoneNumber")
    if (currentPhone === user.phoneNumber) {
      localStorage.setItem("userBalance", user.balance.toString())
      localStorage.setItem("userData", JSON.stringify(user))
      localStorage.setItem("userName", user.fullName)
    }
  } catch (error) {
    console.log("[v0] localStorage sync error:", error)
  }
}

function getUserFromLocalStorage(phoneNumber: string): FirebaseUser | null {
  if (typeof window === "undefined") return null
  
  try {
    const userData = localStorage.getItem(`user_${phoneNumber}`)
    if (userData) {
      return JSON.parse(userData) as FirebaseUser
    }
    
    // Try to construct from individual fields
    const balance = localStorage.getItem(`userBalance_${phoneNumber}`) || 
                    localStorage.getItem(`balance_${phoneNumber}`) || "0"
    const name = localStorage.getItem("userName") || "User"
    
    return {
      phoneNumber,
      fullName: name,
      balance: Number(balance),
      pin: "123456", // Default PIN
      isVerified: true,
      accountNumber: `ACC${Date.now()}`,
      accountType: "regular",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  } catch (error) {
    console.log("[v0] localStorage read error:", error)
    return null
  }
}

function updateBalanceInLocalStorage(phoneNumber: string, newBalance: number): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(`userBalance_${phoneNumber}`, newBalance.toString())
    localStorage.setItem(`balance_${phoneNumber}`, newBalance.toString())
    
    const currentPhone = localStorage.getItem("phoneNumber")
    if (currentPhone === phoneNumber) {
      localStorage.setItem("userBalance", newBalance.toString())
    }
    
    // Update full user object
    const userData = localStorage.getItem(`user_${phoneNumber}`)
    if (userData) {
      const user = JSON.parse(userData) as FirebaseUser
      user.balance = newBalance
      user.updatedAt = new Date().toISOString()
      localStorage.setItem(`user_${phoneNumber}`, JSON.stringify(user))
    }
  } catch (error) {
    console.log("[v0] localStorage balance update error:", error)
  }
}
