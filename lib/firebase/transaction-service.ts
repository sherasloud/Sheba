// Firebase Transaction Service - Global Send Money sync across all devices

import { 
  doc, 
  setDoc, 
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  addDoc,
  Timestamp
} from "firebase/firestore"
import { getFirestoreDb } from "./config"
import { updateUserBalanceInFirebase, getUserFromFirebase, syncUserToFirebase } from "./user-service"

export interface FirebaseTransaction {
  id?: string
  transactionId: string
  senderPhone: string
  senderName: string
  receiverPhone: string
  receiverName: string
  amount: number
  type: "send-money" | "cash-out" | "add-money" | "payment" | "recharge"
  status: "pending" | "completed" | "failed"
  reference?: string
  fee: number
  createdAt: string
  updatedAt: string
}

const TRANSACTIONS_COLLECTION = "transactions"

// Process Send Money transaction with global sync
export async function processSendMoney(
  senderPhone: string,
  receiverPhone: string,
  amount: number,
  pin: string
): Promise<{ success: boolean; message: string; transactionId?: string }> {
  try {
    console.log(`[v0] Processing send money: ${senderPhone} -> ${receiverPhone}, amount: ${amount}`)
    
    // Get sender info
    const sender = await getUserFromFirebase(senderPhone)
    if (!sender) {
      return { success: false, message: "Sender account not found" }
    }
    
    // Validate PIN
    if (sender.pin !== pin) {
      return { success: false, message: "Invalid PIN" }
    }
    
    // Check balance
    if (sender.balance < amount) {
      return { success: false, message: "Insufficient balance" }
    }
    
    // Get or create receiver
    let receiver = await getUserFromFirebase(receiverPhone)
    if (!receiver) {
      // Auto-create receiver account
      receiver = {
        phoneNumber: receiverPhone,
        fullName: `User ${receiverPhone.slice(-4)}`,
        balance: 0,
        pin: "123456",
        isVerified: true,
        accountNumber: `ACC${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        accountType: "regular",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      await syncUserToFirebase(receiver)
      console.log(`[v0] Auto-created receiver account: ${receiverPhone}`)
    }
    
    // Calculate new balances
    const newSenderBalance = sender.balance - amount
    const newReceiverBalance = receiver.balance + amount
    
    // Update both balances
    await updateUserBalanceInFirebase(senderPhone, newSenderBalance)
    await updateUserBalanceInFirebase(receiverPhone, newReceiverBalance)
    
    // Create transaction record
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`
    const transaction: FirebaseTransaction = {
      transactionId,
      senderPhone,
      senderName: sender.fullName,
      receiverPhone,
      receiverName: receiver.fullName,
      amount,
      type: "send-money",
      status: "completed",
      fee: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Save transaction to Firebase
    await saveTransaction(transaction)
    
    // Also save to localStorage for offline access
    saveTransactionToLocalStorage(transaction)
    
    console.log(`[v0] Send money completed: ${transactionId}`)
    return { 
      success: true, 
      message: "Money sent successfully", 
      transactionId 
    }
  } catch (error) {
    console.log("[v0] Send money error:", error)
    return { success: false, message: "Transaction failed. Please try again." }
  }
}

// Save transaction to Firebase
async function saveTransaction(transaction: FirebaseTransaction): Promise<void> {
  try {
    const db = getFirestoreDb()
    if (!db) {
      saveTransactionToLocalStorage(transaction)
      return
    }
    
    const transactionsRef = collection(db, TRANSACTIONS_COLLECTION)
    await addDoc(transactionsRef, transaction)
    console.log(`[v0] Transaction saved to Firebase: ${transaction.transactionId}`)
  } catch (error) {
    console.log("[v0] Firebase transaction save failed:", error)
    saveTransactionToLocalStorage(transaction)
  }
}

// Get transactions for a user
export async function getUserTransactions(phoneNumber: string): Promise<FirebaseTransaction[]> {
  try {
    const db = getFirestoreDb()
    if (!db) {
      return getTransactionsFromLocalStorage(phoneNumber)
    }
    
    const transactionsRef = collection(db, TRANSACTIONS_COLLECTION)
    
    // Get transactions where user is sender or receiver
    const senderQuery = query(
      transactionsRef,
      where("senderPhone", "==", phoneNumber),
      orderBy("createdAt", "desc")
    )
    
    const receiverQuery = query(
      transactionsRef,
      where("receiverPhone", "==", phoneNumber),
      orderBy("createdAt", "desc")
    )
    
    const [senderDocs, receiverDocs] = await Promise.all([
      getDocs(senderQuery),
      getDocs(receiverQuery)
    ])
    
    const transactions: FirebaseTransaction[] = []
    
    senderDocs.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() } as FirebaseTransaction)
    })
    
    receiverDocs.forEach(doc => {
      const tx = { id: doc.id, ...doc.data() } as FirebaseTransaction
      // Avoid duplicates
      if (!transactions.find(t => t.transactionId === tx.transactionId)) {
        transactions.push(tx)
      }
    })
    
    // Sort by date
    transactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    return transactions
  } catch (error) {
    console.log("[v0] Firebase transactions fetch failed:", error)
    return getTransactionsFromLocalStorage(phoneNumber)
  }
}

// Subscribe to real-time transaction updates
export function subscribeToTransactions(
  phoneNumber: string,
  callback: (transactions: FirebaseTransaction[]) => void
): () => void {
  try {
    const db = getFirestoreDb()
    if (!db) {
      callback(getTransactionsFromLocalStorage(phoneNumber))
      return () => {}
    }
    
    const transactionsRef = collection(db, TRANSACTIONS_COLLECTION)
    const q = query(
      transactionsRef,
      where("receiverPhone", "==", phoneNumber),
      orderBy("createdAt", "desc")
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactions: FirebaseTransaction[] = []
      snapshot.forEach(doc => {
        transactions.push({ id: doc.id, ...doc.data() } as FirebaseTransaction)
      })
      callback(transactions)
    }, (error) => {
      console.log("[v0] Transaction snapshot error:", error)
      callback(getTransactionsFromLocalStorage(phoneNumber))
    })
    
    return unsubscribe
  } catch (error) {
    console.log("[v0] Subscribe to transactions failed:", error)
    return () => {}
  }
}

// LocalStorage helpers
function saveTransactionToLocalStorage(transaction: FirebaseTransaction): void {
  if (typeof window === "undefined") return
  
  try {
    const key = "firebase_transactions"
    const existing = localStorage.getItem(key)
    const transactions: FirebaseTransaction[] = existing ? JSON.parse(existing) : []
    
    // Add new transaction at the beginning
    transactions.unshift(transaction)
    
    // Keep only last 100 transactions
    if (transactions.length > 100) {
      transactions.splice(100)
    }
    
    localStorage.setItem(key, JSON.stringify(transactions))
  } catch (error) {
    console.log("[v0] localStorage transaction save error:", error)
  }
}

function getTransactionsFromLocalStorage(phoneNumber: string): FirebaseTransaction[] {
  if (typeof window === "undefined") return []
  
  try {
    const key = "firebase_transactions"
    const data = localStorage.getItem(key)
    if (!data) return []
    
    const transactions: FirebaseTransaction[] = JSON.parse(data)
    return transactions.filter(
      t => t.senderPhone === phoneNumber || t.receiverPhone === phoneNumber
    )
  } catch (error) {
    console.log("[v0] localStorage transactions read error:", error)
    return []
  }
}
