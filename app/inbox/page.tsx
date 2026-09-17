"use client"

import { useState, useEffect } from "react"
import {
  Settings,
  Bell,
  ClipboardList,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Smartphone,
  Search,
  ArrowDown,
  ArrowUp,
  Clock,
  Lock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Trash2,
  User,
  Upload,
} from "lucide-react"
import Link from "next/link"
import { realNotificationSystem, type Notification } from "@/lib/real-notification-system"
import { getTransactions, getSentTransactions, getReceivedTransactions, subscribeToTransactions, type Transaction } from "@/lib/supabase/data-service"
import {
  DollarSign,
  GraduationCap,
  Handshake,
  Heart,
  Landmark,
  Plane,
  PiggyBank,
  Receipt,
  Scan,
  Store,
  Train,
  Phone,
  Globe,
} from "lucide-react"

import { getDisplayName, getDisplayPhone } from "@/lib/utils/phone-masking"

type TransactionType =
  | "send-money"
  | "cash-out"
  | "mobile-recharge"
  | "pay-bill"
  | "bank-transfer"
  | "add-money"
  | "remittance"
  | "savings"
  | "loan"
  | "education-fee"
  | "donation"
  | "air-ticket"
  | "rail-ticket"
  | "merchant-pay"
  | "scan-qr"
  | "Payment" // Added Payment type for existing transactions

const getTransactionIconType = (type: string) => {
  switch (type) {
    case "send":
      return <ArrowUp className="h-4 w-4 text-red-500" />
    case "receive":
      return <ArrowDown className="h-4 w-4 text-green-500" />
    case "bill_payment":
    case "recharge":
    case "Payment": // Handle Payment type
    case "loan_repayment":
    case "remittance":
    case "savings_deposit":
    case "air_ticket":
    case "donation":
    case "edu_fee":
      return <ArrowUp className="h-4 w-4 text-red-500" />
    case "cashback":
      return <ArrowDown className="h-4 w-4 text-green-500" />
    default:
      return null
  }
}

const getTransactionIcon = (type: TransactionType | string) => {
  switch (type) {
    case "send-money":
      return <ArrowUpRight className="h-5 w-5 text-red-500" />
    case "cash-out":
      return <ArrowDownLeft className="h-5 w-5 text-green-500" />
    case "mobile-recharge":
      return <Phone className="h-5 w-5 text-blue-500" />
    case "pay-bill":
      return <Receipt className="h-5 w-5 text-purple-500" />
    case "bank-transfer":
      return <Landmark className="h-5 w-5 text-yellow-500" />
    case "add-money":
      return <CreditCard className="h-5 w-5 text-indigo-500" />
    case "remittance":
      return <Globe className="h-5 w-5 text-teal-500" />
    case "savings":
      return <PiggyBank className="h-5 w-5 text-pink-500" />
    case "loan":
      return <Handshake className="h-5 w-5 text-orange-500" />
    case "education-fee":
      return <GraduationCap className="h-5 w-5 text-cyan-500" />
    case "donation":
      return <Heart className="h-5 w-5 text-rose-500" />
    case "air-ticket":
      return <Plane className="h-5 w-5 text-lime-500" />
    case "rail-ticket":
      return <Train className="h-5 w-5 text-amber-500" />
    case "merchant-pay":
      return <Store className="h-5 w-5 text-emerald-500" />
    case "scan-qr":
      return <Scan className="h-5 w-5 text-violet-500" />
    case "Payment": // Handle Payment type
      return <CreditCard className="h-5 w-5 text-blue-500" />
    default:
      return <DollarSign className="h-5 w-5 text-gray-500" />
  }
}

const getPaymentLogo = (storeName: string) => {
  const logos: { [key: string]: string } = {
    "Sheba Business": "/images/seba-logo-splash.png",
    "New Sheba": "/images/seba-logo-splash.png", // Added for "New Sheba"
    Grameenphone: "/images/grameenphone-logo.png",
    DESCO: "/images/desco-logo.png",
    Visa: "/images/visa-logo.png",
    RemitGlobal: "/placeholder.svg", // Placeholder if no specific logo
    "Dhaka University": "/images/dhaka-university-official-logo.jpeg",
    "Save the Children": "/images/charity-logos/save-the-children-official-logo.png",
    "Biman Bangladesh": "/images/biman-logo.png",
    Daraz: "/images/stores/daraz-real-logo.jpeg",
    Robi: "/images/robi-logo.jpeg",
    "Titas Gas": "/images/droplet-logo.png",
    Mastercard: "/images/mastercard-logo.webp",
    RemitNow: "/placeholder.svg",
    BUET: "/images/buet-logo.png",
    BRAC: "/images/charity-logos/brac-real-logo.jpeg",
    "Novo Air": "/images/novo-air-logo.png",
    KFC: "/images/stores/kfc-logo.png",
    Airtel: "/images/airtel-logo.png",
    WASA: "/images/water-droplet-icon.png",
    Discover: "/images/discover-logo.jpeg",
    "World Vision": "/images/charity-logos/world-vision-official-logo.jpeg",
    "US-Bangla Airlines": "/images/us-bangla-logo.png",
    "Pizza Hut": "/images/stores/pizza-hut-real-logo.png",
    Banglalink: "/images/banglalink-logo.png",
    DPDC: "/images/dpdc-logo.webp",
    FastRemit: "/placeholder.svg",
    CUET: "/images/cuet-new-logo.jpeg",
    ActionAid: "/images/charity-logos/actionaid-real-logo.jpeg",
    "Qatar Airways": "/images/qatar-logo.png",
    Samsung: "/images/stores/samsung-logo.png",
    Teletalk: "/images/teletalk-logo.webp",
    BTCL: "/images/phone-entry-design.png",
    Amex: "/images/amex-logo.png",
    WorldSend: "/placeholder.svg",
    "Islamic University": "/images/islamic-university-logo.jpeg",
    "Islamic Relief": "/images/charity-logos/islamic-relief-real-logo.jpeg",
    "Air Astra": "/images/air-astra-logo.png",
    Chaldal: "/images/stores/chaldal-real-logo.webp",
    "Jahangirnagar University": "/images/jahangirnagar-logo.webp",
    "Plan International": "/images/charity-logos/plan-international-real-logo.jpeg",
    "Thai Airways": "/images/thai-airways-logo.png",
    Shwapno: "/images/stores/shwapno-real-logo.jpeg",
    "East West University": "/images/east-west-university-logo.png",
    WaterAid: "/images/charity-logos/wateraid-real-logo.jpeg",
    Agora: "/images/stores/agora-real-logo.png",
    "Burger King": "/images/stores/burger-king-logo.jpeg",
    Skitto: "/images/skitto-official-logo.png",
    "Bakhrabad Gas": "/images/droplet-logo.png",
    "Loan Provider": "/placeholder.svg", // Generic logo for loan provider
    "Savings Account": "/placeholder.svg", // Generic logo for savings
    "ABC Bank": "/placeholder.svg", // Generic bank logo
    "XYZ Bank": "/placeholder.svg", // Generic bank logo
    "DEF Bank": "/placeholder.svg", // Generic bank logo
    "GHI Bank": "/placeholder.svg", // Generic bank logo
    "JKL Bank": "/placeholder.svg", // Generic bank logo
    "MNO Bank": "/placeholder.svg", // Generic bank logo
    "PQR Bank": "/placeholder.svg", // Generic bank logo
    "STU Bank": "/placeholder.svg", // Generic bank logo
    "Bank Transfer": "/placeholder.svg", // Generic bank transfer logo
  }
  return logos[storeName] || "/placeholder.svg" // Default placeholder
}

export default function InboxPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("All")
  const [activeTab, setActiveTab] = useState("transactions")
  const [transactionTab, setTransactionTab] = useState("sent")
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  })
  const [realNotifications, setRealNotifications] = useState<Notification[]>([])
  const [showPinChange, setShowPinChange] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [showNameChange, setShowNameChange] = useState(false)
  const [oldPin, setOldPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [currentName, setCurrentName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userName") || "Guest User"
    }
    return "Guest User"
  })
  const [newName, setNewName] = useState("")
  const [isVerified, setIsVerified] = useState(false)

  // Function to add a sample "New Sheba" transaction
  const addSampleShebaTransaction = () => {
    const storedTransactions = localStorage.getItem("transactions")
    let currentTransactions: Transaction[] = []
    if (storedTransactions) {
      try {
        currentTransactions = JSON.parse(storedTransactions)
      } catch (e) {
        console.error("Error parsing transactions from localStorage:", e)
      }
    }

    const shebaTransactionExists = currentTransactions.some((t) => t.storeName === "New Sheba" || t.to === "New Sheba")

    if (!shebaTransactionExists) {
      const now = new Date()
      const date = now.toISOString().split("T")[0]
      const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })

      const newShebaTransaction: Transaction = {
        id: `PAY${Date.now()}`,
        type: "Payment",
        amount: -500,
        date: date,
        time: time,
        status: "completed",
        storeName: "New Sheba",
        description: "Payment to New Sheba",
      }

      const updatedTransactions = [newShebaTransaction, ...currentTransactions]
      // </CHANGE> Fixed JSON.JSON.stringify to JSON.stringify
      localStorage.setItem("transactions", JSON.stringify(updatedTransactions))
      console.log("Added sample 'New Sheba' transaction.")
      setSuccess("Added a sample 'New Sheba' transaction to your history!")
      setTimeout(() => setSuccess(""), 3000)
      // Trigger a custom event to notify other parts of the app that transactions have changed
      window.dispatchEvent(new CustomEvent("newTransaction"))
    }
  }

  // Enhanced function to remove duplicate transactions with multiple criteria
  const removeDuplicateTransactions = (transactionsList: Transaction[]) => {
    const seen = new Set()
    const uniqueTransactions: Transaction[] = []

    console.log("🔄 Starting duplicate removal process...")
    console.log("📊 Total transactions before cleanup:", transactionsList.length)

    for (const transaction of transactionsList) {
      // Create multiple unique keys to catch different types of duplicates
      const keys = [
        // Primary key with transaction ID
        `${transaction.transactionId}-${transaction.type}-${transaction.amount}`,
        // Secondary key with timestamp
        `${transaction.type}-${transaction.amount}-${transaction.date}-${transaction.time}`,
        // Tertiary key with recipient/store info
        `${transaction.type}-${transaction.amount}-${transaction.to || transaction.storeName || transaction.recipient}-${transaction.date}`,
        // Quaternary key for exact matches
        `${transaction.type}-${transaction.amount}-${transaction.to || transaction.storeName || transaction.recipient}-${transaction.transactionId}`,
      ]

      let isDuplicate = false

      // Check if any of the keys already exist
      for (const key of keys) {
        if (seen.has(key)) {
          console.log("🗑️ Removing duplicate transaction:", {
            id: transaction.transactionId,
            type: transaction.type,
            amount: transaction.amount,
            to: transaction.to || transaction.storeName || transaction.recipient,
            matchedKey: key,
          })
          isDuplicate = true
          break
        }
      }

      if (!isDuplicate) {
        // Add all keys to the seen set
        keys.forEach((key) => seen.add(key))
        uniqueTransactions.push(transaction)
      }
    }

    console.log("✅ Duplicate removal completed")
    console.log("📊 Unique transactions after cleanup:", uniqueTransactions.length)
    console.log("🗑️ Duplicates removed:", transactionsList.length - uniqueTransactions.length)

    return uniqueTransactions
  }

  // Function to clean unknown store transactions
  const cleanUnknownTransactions = (transactionsList: Transaction[]) => {
    console.log("🧹 Cleaning unknown store transactions...")

    const cleanedTransactions = transactionsList.filter((transaction) => {
      const isUnknownStore =
        transaction.to === "Unknown Store" ||
        transaction.storeName === "Unknown Store" ||
        transaction.description?.includes("Unknown Store") ||
        transaction.transactionId === "PAY1752070839427" ||
        transaction.to === "" ||
        transaction.storeName === "" ||
        (!transaction.to && !transaction.storeName && !transaction.recipient && transaction.type === "Payment")

      if (isUnknownStore) {
        console.log("🗑️ Removing unknown store transaction:", transaction.transactionId)
      }

      return !isUnknownStore
    })

    console.log("✅ Unknown store cleanup completed")
    console.log("📊 Transactions after unknown store cleanup:", cleanedTransactions.length)

    return cleanedTransactions
  }

  // Function to clean up transactions by similarity (same amount, type, time within 1 minute)
  const removeSimilarTransactions = (transactionsList: Transaction[]) => {
    console.log("🔍 Removing similar transactions...")

    const uniqueTransactions: Transaction[] = []
    const processedTransactions = new Set<number>()

    for (let i = 0; i < transactionsList.length; i++) {
      if (processedTransactions.has(i)) continue

      const currentTransaction = transactionsList[i]
      const shouldKeep = true

      // Check for similar transactions
      for (let j = i + 1; j < transactionsList.length; j++) {
        if (processedTransactions.has(j)) continue

        const compareTransaction = transactionsList[j]

        // Check if transactions are similar
        const sameAmount = Math.abs(currentTransaction.amount) === Math.abs(compareTransaction.amount)
        const sameType = currentTransaction.type === compareTransaction.type
        const sameTo =
          (currentTransaction.to || currentTransaction.storeName || currentTransaction.recipient) ===
          (compareTransaction.to || compareTransaction.storeName || compareTransaction.recipient)

        const currentTime = new Date(`${currentTransaction.date} ${currentTransaction.time || "00:00:00"}`)
        const compareTime = new Date(`${compareTransaction.date} ${compareTransaction.time || "00:00:00"}`)
        const timeDifference = Math.abs(currentTime.getTime() - compareTime.getTime())
        const withinFiveSeconds = timeDifference <= 5000 // 5 seconds in milliseconds (only system duplicates)

        const differentIds = currentTransaction.transactionId !== compareTransaction.transactionId

        if (sameAmount && sameType && sameTo && withinFiveSeconds && !differentIds) {
          console.log("🗑️ Removing similar transaction:", {
            current: currentTransaction.transactionId,
            similar: compareTransaction.transactionId,
            timeDiff: timeDifference / 1000 + " seconds",
          })

          // Mark the later transaction for removal
          processedTransactions.add(j)
        }
      }

      if (shouldKeep) {
        uniqueTransactions.push(currentTransaction)
      }
      processedTransactions.add(i)
    }

    console.log("✅ Similar transaction removal completed")
    console.log("📊 Transactions after similarity cleanup:", uniqueTransactions.length)

    return uniqueTransactions
  }

  // Comprehensive cleanup function
  const performComprehensiveCleanup = (transactionsList: Transaction[]) => {
    console.log("🚀 Starting comprehensive transaction cleanup...")

    let cleanedTransactions = [...transactionsList]

    // Step 1: Remove exact duplicates
    cleanedTransactions = removeDuplicateTransactions(cleanedTransactions)

    // Step 2: Remove unknown store transactions
    cleanedTransactions = cleanUnknownTransactions(cleanedTransactions)

    // Step 3: Remove similar transactions
    cleanedTransactions = removeSimilarTransactions(cleanedTransactions)

    // Step 4: Sort by timestamp (newest first)
    cleanedTransactions.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time || "00:00:00"}`)
      const dateB = new Date(`${b.date} ${b.time || "00:00:00"}`)
      return dateB.getTime() - dateA.getTime()
    })

    console.log("🎉 Comprehensive cleanup completed!")
    console.log("📊 Final transaction count:", cleanedTransactions.length)
    console.log("🗑️ Total transactions removed:", transactionsList.length - cleanedTransactions.length)

    return cleanedTransactions
  }

  const loadTransactions = async (type: "sent" | "received" = "sent") => {
    let currentUser = localStorage.getItem("phoneNumber")
    console.log("[v0] loadTransactions called for user from localStorage:", currentUser, "type:", type)

    // If no phone in localStorage, try to get from URL or session
    if (!currentUser) {
      // Try from session storage as backup
      currentUser = sessionStorage.getItem("phoneNumber") || ""
      console.log("[v0] No phone in localStorage, trying sessionStorage:", currentUser)
    }

    if (!currentUser) {
      console.log("[v0] No user logged in, cannot load transactions - checking for active session")
      setTransactions([])
      setFilteredTransactions([])
      return
    }

    try {
      // Load transactions from Supabase based on type
      console.log("[v0] Fetching", type, "transactions from Supabase for:", currentUser)
      const supabaseTransactions = type === "sent" 
        ? await getSentTransactions(currentUser)
        : await getReceivedTransactions(currentUser)
      console.log("[v0] Raw", type, "transactions from Supabase:", supabaseTransactions)
      console.log("[v0]", type, "Transactions loaded from Supabase, count:", supabaseTransactions.length)

      if (supabaseTransactions && supabaseTransactions.length > 0) {
        // Convert Supabase format to display format
        const formattedTransactions: Transaction[] = supabaseTransactions.map((txn: any) => {
          console.log("[v0] Formatting transaction:", txn)
          return {
            id: txn.id,
            type: txn.transaction_type === "send_money" ? "send-money" : txn.transaction_type === "cashout" ? "cash-out" : "payment",
            amount: txn.amount,
            date: new Date(txn.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            status: "completed",
            transactionId: txn.reference,
            from: txn.sender_phone,
            to: txn.receiver_phone,
            description: `${txn.transaction_type.replace("_", " ")} transaction`,
            time: new Date(txn.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          }
        })

        console.log("[v0] Formatted transactions:", formattedTransactions)
        setTransactions(formattedTransactions)
        setFilteredTransactions(formattedTransactions)
        console.log("[v0]", type, "transactions loaded and formatted successfully")
      } else {
        console.log("[v0] No", type, "transactions found for user:", currentUser)
        setTransactions([])
        setFilteredTransactions([])
      }
    } catch (error) {
      console.error("[v0] Error loading transactions:", error)
      setTransactions([])
      setFilteredTransactions([])
    }
  }

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    // Start real-time notification system
    realNotificationSystem.startRealTimeSync()

    // Subscribe to real-time notifications
    const handleNotificationUpdate = (notifications: Notification[]) => {
      setRealNotifications(notifications)
    }

    realNotificationSystem.subscribe(handleNotificationUpdate)

    return () => {
      realNotificationSystem.unsubscribe(handleNotificationUpdate)
      realNotificationSystem.stopSync()
    }
  }, [])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let currentUser = localStorage.getItem("phoneNumber")
    
    // Fallback to sessionStorage if needed
    if (!currentUser) {
      currentUser = sessionStorage.getItem("phoneNumber") || ""
    }

    if (currentUser) {
      unsubscribe = subscribeToTransactions(currentUser, (supabaseTransactions: any[]) => {
        // Convert and update transactions
        const formattedTransactions: Transaction[] = supabaseTransactions.map((txn: any) => ({
          id: txn.id,
          type: txn.transaction_type === "send_money" ? "send-money" : txn.transaction_type === "cashout" ? "cash-out" : "payment",
          amount: txn.amount,
          date: new Date(txn.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          status: "completed",
          transactionId: txn.reference,
          from: txn.sender_phone,
          to: txn.receiver_phone,
          description: `${txn.transaction_type.replace("_", " ")} transaction`,
          time: new Date(txn.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        }))
        setTransactions(formattedTransactions)
        setFilteredTransactions(formattedTransactions)
      })
    }

    // Listen for custom transaction events
    const handleNewTransaction = (event: CustomEvent) => {
      console.log("🆕 New transaction event detected")
      loadTransactions(transactionTab)
    }

    window.addEventListener("newTransaction", handleNewTransaction as EventListener)

    // Load transactions when tab changes
    loadTransactions(transactionTab)

    // Reduced interval to avoid too frequent updates
    const interval = setInterval(() => {
      loadTransactions(transactionTab)
    }, 10000) // Changed to 10 seconds to reduce frequency

    return () => {
      window.removeEventListener("newTransaction", handleNewTransaction as EventListener)
      clearInterval(interval)
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [transactionTab])

  useEffect(() => {
    // Load saved photo and name
    const savedPhoto = localStorage.getItem("userPhoto")
    if (savedPhoto) {
      setSelectedPhoto(savedPhoto)
    }

    const savedName = localStorage.getItem("userName")
    if (savedName) {
      setCurrentName(savedName)
    }

    // Check verification status
    const userData = localStorage.getItem("userData")
    const storedVerified = localStorage.getItem("isVerified")

    if (userData) {
      const user = JSON.parse(userData)
      setIsVerified(user.isVerified || false)
    } else if (storedVerified) {
      setIsVerified(storedVerified === "true")
    }
  }, [])

  useEffect(() => {
    let filtered = transactions

    // Filter by type
    if (filterType !== "All") {
      filtered = filtered.filter((transaction) => transaction.type === filterType)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((transaction) => {
        const description = formatTransactionDescription(transaction)?.toLowerCase() || ""
        const transactionId = transaction.transactionId?.toLowerCase() || ""
        const storeName = (transaction.to || transaction.storeName || transaction.recipient || "").toLowerCase()

        return (
          description.includes(searchTerm.toLowerCase()) ||
          transactionId.includes(searchTerm.toLowerCase()) ||
          storeName.includes(searchTerm.toLowerCase())
        )
      })
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, filterType])

  const deleteNotification = (id: string) => {
    realNotificationSystem.deleteNotification(id)
  }

  const markAsRead = (id: string) => {
    realNotificationSystem.markAsRead(id)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "money_received":
        return "💰"
      case "money_sent":
        return "📤"
      case "recharge_success":
        return "📱"
      case "bill_paid":
        return "💡"
      case "system_alert":
        return "🔔"
      case "promo":
        return "🎁"
      case "security":
        return "🔒"
      default:
        return "📢"
    }
  }

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50"
      case "medium":
        return "border-blue-200 bg-blue-50"
      case "low":
        return "border-gray-200 bg-gray-50"
      default:
        return "border-gray-200"
    }
  }

  const handlePinChange = () => {
    if (!oldPin || !newPin || !confirmPin) {
      setError("Please fill all PIN fields")
      return
    }

    const currentPin = localStorage.getItem("userPIN") || "123456"

    if (oldPin !== currentPin) {
      setError("Incorrect old PIN")
      return
    }

    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      setError("New PIN must be 6 digits")
      return
    }

    if (newPin !== confirmPin) {
      setError("New PIN and confirm PIN don't match")
      return
    }

    localStorage.setItem("userPIN", newPin)

    realNotificationSystem.triggerSecurityNotification("PIN Changed", "Your PIN was successfully updated")

    setSuccess("PIN changed successfully!")
    setShowPinChange(false)
    setOldPin("")
    setNewPin("")
    setConfirmPin("")
    setError("")
  }

  const handlePhotoUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setSelectedPhoto(result)
          const phoneNumber = localStorage.getItem("phoneNumber")
          if (phoneNumber) {
            localStorage.setItem(`userPhoto_${phoneNumber}`, result)
          }
          // Also keep the old key for backward compatibility
          localStorage.setItem("userPhoto", result)
          setShowPhotoUpload(false)
          setSuccess("Profile photo updated successfully!")

          realNotificationSystem.triggerSecurityNotification("Profile Updated", "Your profile photo was changed")
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleNameChange = async () => {
    if (!newName.trim()) {
      setError("Please enter a new name")
      return
    }

    if (newName.trim().length < 2) {
      setError("Name must be at least 2 characters")
      return
    }

    if (newName.trim().length > 50) {
      setError("Name must be less than 50 characters")
      return
    }

    try {
      console.log("[v0] Starting name change process:", { currentName, newName: newName.trim() })

      localStorage.setItem("userName", newName.trim())
      setCurrentName(newName.trim())

      window.dispatchEvent(
        new CustomEvent("nameChanged", {
          detail: { oldName: currentName, newName: newName.trim() },
        }),
      )

      // Update real user service if phone number exists
      const phoneNumber = localStorage.getItem("phoneNumber")
      console.log("[v0] Phone number for API call:", phoneNumber)

      if (phoneNumber) {
        const response = await fetch("/api/user/update-name", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber,
            newName: newName.trim(),
          }),
        })

        const result = await response.json()
        console.log("[v0] API response:", result)

        if (!response.ok) {
          throw new Error(result.error || "Failed to update name in database")
        }
      }

      window.dispatchEvent(new Event("userNameUpdated"))
      window.dispatchEvent(
        new CustomEvent("storage", {
          detail: { key: "userName", newValue: newName.trim() },
        }),
      )

      // Trigger security notification
      realNotificationSystem.triggerSecurityNotification("Name Updated", `Your name was changed to ${newName.trim()}`)

      setSuccess("Name updated successfully!")
      setShowNameChange(false)
      setNewName("")
      setError("")

      window.dispatchEvent(
        new CustomEvent("nameChanged", {
          detail: { oldName: currentName, newName: newName.trim() },
        }),
      )

      console.log("[v0] Name change completed successfully")

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("[v0] Name update error:", error)
      const originalName = currentName
      localStorage.setItem("userName", originalName)
      setCurrentName(originalName)
      setError("Failed to update name. Please try again.")
    }
  }

  const renderMonthOptions = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const months = []

    for (let i = 0; i < 6; i++) {
      const year = currentYear - (currentMonth - i < 0 ? 1 : 0)
      const month = (currentMonth - i + 12) % 12
      const monthString = String(month + 1).padStart(2, "0")
      const monthName = new Date(year, month).toLocaleString("en-US", { month: "long" })
      const value = `${year}-${monthString}`
      const label = `${monthName} ${year}${i === 0 ? " (Current)" : ""}`
      months.push({ value, label })
    }

    return months.map((month) => (
      <option key={month.value} value={month.value}>
        {month.label}
      </option>
    ))
  }

  const getTransactionIconOld = (type: string) => {
    switch (type) {
      case "Send Money":
        return <ArrowUpRight size={20} className="text-red-500" />
      case "Receive":
        return <ArrowDownLeft size={20} className="text-green-500" />
      case "Payment":
        return <CreditCard size={20} className="text-blue-500" />
      case "Recharge":
        return <Smartphone size={20} className="text-purple-500" />
      case "Cash Out":
        return <ArrowUpRight size={20} className="text-orange-500" />
      default:
        return <CreditCard size={20} className="text-gray-500" />
    }
  }

  const formatTransactionDescription = (transaction: Transaction) => {
    // Skip transactions with "Unknown Store"
    if (transaction.to === "Unknown Store" || transaction.storeName === "Unknown Store") {
      return null
    }

    if (transaction.type === "Payment" && transaction.to) {
      return `Payment to ${transaction.to}`
    }
    if (transaction.type === "Payment" && transaction.storeName) {
      return `Payment to ${transaction.storeName}`
    }
    if (transaction.description) {
      return transaction.description
    }
    if (transaction.to) {
      return `${transaction.type} to ${transaction.to}`
    }
    return transaction.type
  }

  // Enhanced function to get ALL payment logos with better matching - UPDATED WITH OFFICIAL PANKOURI LOGO
  const getPaymentLogoOld = (storeName: string) => {
    if (!storeName) return null

    const allLogos: { [key: string]: string } = {
      // Food & Restaurants
      "McDonald's": "/images/stores/mcdonalds-real-logo.jpeg",
      mcdonalds: "/images/stores/mcdonalds-real-logo.jpeg",
      mcdonald: "/images/stores/mcdonalds-real-logo.jpeg",
      "Pizza Hut": "/images/stores/pizza-hut-real-logo.png",
      "pizza hut": "/images/stores/pizza-hut-real-logo.png",
      pizzahut: "/images/stores/pizza-hut-real-logo.png",
      KFC: "/images/stores/kfc-logo.png",
      kfc: "/images/stores/kfc-logo.png",
      "Burger King": "/images/stores/burger-king-logo.jpeg",
      "burger king": "/images/stores/burger-king-logo.jpeg",
      burgerking: "/images/stores/burger-king-logo.jpeg",
      "Domino's": "/images/stores/dominos-real-logo.png",
      dominos: "/images/stores/dominos-real-logo.png",
      domino: "/images/stores/dominos-real-logo.png",
      Foodpanda: "/images/stores/foodpanda-real-logo.png",
      foodpanda: "/images/stores/foodpanda-real-logo.png",
      "food panda": "/images/stores/foodpanda-real-logo.png",
      Subway: "/images/stores/subway-real-logo.png",
      subway: "/images/stores/subway-real-logo.png",
      Hungrynaki: "/images/stores/hungrynaki-real-logo.jpeg",
      hungrynaki: "/images/stores/hungrynaki-real-logo.jpeg",
      "hungry naki": "/images/stores/hungrynaki-real-logo.jpeg",
      "Pizza Inn": "/images/stores/pizza-inn-real-logo.png",
      "pizza inn": "/images/stores/pizza-inn-real-logo.png",
      pizzainn: "/images/stores/pizza-inn-real-logo.png",
      "Food Maama": "/images/stores/food-maama-real-logo.png",
      "food maama": "/images/stores/food-maama-real-logo.png",
      foodmaama: "/images/stores/food-maama-real-logo.png",
      Chillox: "/images/stores/chillox-real-logo.png",
      chillox: "/images/stores/chillox-real-logo.png",
      "Star Kabab": "/images/stores/star-kabab-real-logo.png",
      "star kabab": "/images/stores/star-kabab-real-logo.png",
      starkabab: "/images/stores/star-kabab-real-logo.png",
      Coopers: "/images/stores/coopers-real-logo.jpeg",
      coopers: "/images/stores/coopers-real-logo.jpeg",
      cooper: "/images/stores/coopers-real-logo.jpeg",
      Takeout: "/images/stores/takeout-real-logo.jpeg",
      takeout: "/images/stores/takeout-real-logo.jpeg",
      "take out": "/images/stores/takeout-real-logo.jpeg",
      "Kacchi Bhai": "/images/stores/kacchi-bhai-real-logo.jpeg",
      "kacchi bhai": "/images/stores/kacchi-bhai-real-logo.jpeg",
      kacchibhai: "/images/stores/kacchi-bhai-real-logo.jpeg",
      "Kacchi Dining": "/images/stores/kacchi-dining-real-logo.jpeg",
      "kacchi dining": "/images/stores/kacchi-dining-real-logo.jpeg",
      kacchidining: "/images/stores/kacchi-dining-real-logo.jpeg",
      "Sultans Dine": "/images/stores/sultans-dine-real-logo.png",
      "sultans dine": "/images/stores/sultans-dine-real-logo.png",
      sultansdine: "/images/stores/sultans-dine-real-logo.png",
      Foodi: "/images/stores/foodi-real-logo.png",
      foodi: "/images/stores/foodi-real-logo.png",
      BFC: "/images/stores/bfc-real-logo.jpeg",
      bfc: "/images/stores/bfc-real-logo.jpeg",
      "Pathao Food": "/images/stores/pathao-food-real-logo.jpeg",
      "pathao food": "/images/stores/pathao-food-real-logo.jpeg",
      pathaofood: "/images/stores/pathao-food-real-logo.jpeg",
      pathao: "/images/stores/pathao-food-real-logo.jpeg",
      "Uber Eats": "/images/stores/uber-eats-real-logo.avif",
      "uber eats": "/images/stores/uber-eats-real-logo.avif",
      ubereats: "/images/stores/uber-eats-real-logo.avif",
      uber: "/images/stores/uber-eats-real-logo.avif",
      "New Sheba": "/images/seba-logo-splash.png", // Added New Sheba logo
      "new sheba": "/images/seba-logo-splash.png", // Added New Sheba logo

      // E-commerce & Shopping
      Daraz: "/images/stores/daraz-real-logo.jpeg",
      daraz: "/images/stores/daraz-real-logo.jpeg",
      Chaldal: "/images/stores/chaldal-real-logo.webp",
      chaldal: "/images/stores/chaldal-real-logo.webp",
      Agora: "/images/stores/agora-real-logo.png",
      agora: "/images/stores/agora-real-logo.png",
      Shwapno: "/images/stores/shwapno-real-logo.jpeg",
      shwapno: "/images/stores/shwapno-real-logo.jpeg",
      Aarong: "/images/stores/aarong-real-logo.png",
      aarong: "/images/stores/aarong-real-logo.png",
      Pickaboo: "/images/stores/pickaboo-real-logo.jpeg",
      pickaboo: "/images/stores/pickaboo-real-logo.jpeg",
      Bagdoom: "/images/stores/bagdoom-real-logo.jpeg",
      bagdoom: "/images/stores/bagdoom-real-logo.jpeg",
      Ajkerdeal: "/images/stores/ajkerdeal-real-logo.png",
      ajkerdeal: "/images/stores/ajkerdeal-real-logo.png",
      "ajker deal": "/images/stores/ajkerdeal-real-logo.png",
      Rokomari: "/images/stores/rokomari-real-logo.jpeg",
      rokomari: "/images/stores/rokomari-real-logo.jpeg",
      Othoba: "/images/stores/othoba-real-logo.jpeg",
      othoba: "/images/stores/othoba-real-logo.jpeg",
      Evaly: "/images/stores/evaly-real-logo.png",
      evaly: "/images/stores/evaly-real-logo.png",
      Bikroy: "/images/stores/bikroy-real-logo.png",
      bikroy: "/images/stores/bikroy-real-logo.png",
      Shohoz: "/images/stores/shohoz-real-logo.jpeg",
      shohoz: "/images/stores/shohoz-real-logo.jpeg",
      Priyoshop: "/images/stores/priyoshop-real-logo.png",
      priyoshop: "/images/stores/priyoshop-real-logo.png",
      "priyo shop": "/images/stores/priyoshop-real-logo.png",
      "Meena Bazar": "/images/stores/meena-bazar-real-logo.png",
      "meena bazar": "/images/stores/meena-bazar-real-logo.png",
      meenabazar: "/images/stores/meena-bazar-real-logo.png",
      Unimart: "/images/stores/unimart-real-logo.png",
      unimart: "/images/stores/unimart-real-logo.png",
      "Prince Bazar": "/images/stores/prince-bazar-real-logo.jpeg",
      "prince bazar": "/images/stores/prince-bazar-real-logo.jpeg",
      princebazar: "/images/stores/prince-bazar-real-logo.jpeg",

      // Fashion & Clothing - Enhanced with multiple variations
      Nike: "/images/stores/nike-real-logo.jpeg",
      nike: "/images/stores/nike-real-logo.jpeg",
      NIKE: "/images/stores/nike-real-logo.jpeg",
      "Nike Bangladesh": "/images/stores/nike-real-logo.jpeg",
      "nike bangladesh": "/images/stores/nike-real-logo.jpeg",
      nikebangladesh: "/images/stores/nike-real-logo.jpeg",
      "Levi's": "/images/stores/levis-real-logo.png",
      levis: "/images/stores/levis-real-logo.png",
      levi: "/images/stores/levis-real-logo.png",
      LEVIS: "/images/stores/levis-real-logo.png",
      "Levi's Bangladesh": "/images/stores/levis-real-logo.png",
      "levis bangladesh": "/images/stores/levis-real-logo.png",
      "Le Reve": "/images/stores/le-reve-real-logo.jpeg",
      "le reve": "/images/stores/le-reve-real-logo.jpeg",
      lereve: "/images/stores/le-reve-real-logo.jpeg",
      "Cats Eye": "/images/stores/cats-eye-real-logo.jpeg",
      "cats eye": "/images/stores/cats-eye-real-logo.jpeg",
      catseye: "/images/stores/cats-eye-real-logo.jpeg",
      Ecstasy: "/images/stores/ecstasy-real-logo.jpeg",
      ecstasy: "/images/stores/ecstasy-real-logo.jpeg",
      Yellow: "/images/stores/yellow-real-logo.jpeg",
      yellow: "/images/stores/yellow-real-logo.jpeg",
      Artisan: "/images/stores/artisan-real-logo.jpeg",
      artisan: "/images/stores/artisan-real-logo.jpeg",
      "Gentle Park": "/images/stores/gentle-park-real-logo.png",
      "gentle park": "/images/stores/gentle-park-real-logo.png",
      gentlepark: "/images/stores/gentle-park-real-logo.png",
      Richman: "/images/stores/richman-real-logo.png",
      richman: "/images/stores/richman-logo.png",
      "rich man": "/images/stores/richman-logo.png",
      Sailor: "/images/stores/sailor-real-logo.png",
      sailor: "/images/stores/sailor-logo.png",

      // Electronics & Tech
      Apple: "/images/stores/apple-bangladesh-real-logo.jpeg",
      apple: "/images/stores/apple-bangladesh-real-logo.jpeg",
      APPLE: "/images/stores/apple-bangladesh-real-logo.jpeg",
      "Apple Bangladesh": "/images/stores/apple-bangladesh-real-logo.jpeg",
      "apple bangladesh": "/images/stores/apple-bangladesh-real-logo.jpeg",
      applebangladesh: "/images/stores/apple-bangladesh-real-logo.jpeg",
      Samsung: "/images/stores/samsung-logo.png",
      samsung: "/images/stores/samsung-logo.png",
      SAMSUNG: "/images/stores/samsung-logo.png",
      Walton: "/images/stores/walton-logo.png",
      walton: "/images/stores/walton-logo.png",
      "Star Tech": "/images/stores/star-tech-logo.png",
      "star tech": "/images/stores/star-tech-logo.png",
      startech: "/images/stores/star-tech-logo.png",
      Ryans: "/images/stores/ryans-logo.png",
      ryans: "/images/stores/ryans-logo.png",
      ryan: "/images/stores/ryans-logo.png",
      "Computer Source": "/images/stores/computer-source-logo.png",
      "computer source": "/images/stores/computer-source-logo.png",
      computersource: "/images/stores/computer-source-logo.png",
      Transcom: "/images/stores/transcom-logo.png",
      transcom: "/images/stores/transcom-logo.png",
      Singer: "/images/stores/singer-logo.png",
      singer: "/images/stores/singer-logo.png",
      Appleians: "/images/stores/appleians-logo.png",
      appleians: "/images/stores/appleians-logo.png",
      iCenter: "/images/stores/icenter-logo.jpeg",
      icenter: "/images/stores/icenter-logo.jpeg",
      "i center": "/images/stores/icenter-logo.jpeg",

      // Pharmacy & Health
      "Lazz Pharma": "/images/stores/lazz-pharma-logo.png",
      "lazz pharma": "/images/stores/lazz-pharma-logo.png",
      lazzpharma: "/images/stores/lazz-pharma-logo.png",
      "Square Pharma": "/images/stores/square-pharma-logo.png",
      "square pharma": "/images/stores/square-pharma-logo.png",
      squarepharma: "/images/stores/square-pharma-logo.png",

      // Furniture & Home
      Hatil: "/images/stores/hatil-logo.png",
      hatil: "/images/stores/hatil-logo.png",
      Otobi: "/images/stores/otobi-logo.png",
      otobi: "/images/stores/otobi-logo.png",
      Partex: "/images/stores/partex-logo.png",
      partex: "/images/stores/partex-logo.png",

      // Malls & Shopping Centers
      "Bashundhara City": "/images/stores/bashundhara-city-logo.png",
      "bashundhara city": "/images/stores/bashundhara-city-logo.png",
      bashundhara: "/images/stores/bashundhara-city-logo.png",
      "Jamuna Future Park": "/images/stores/jamuna-future-park-logo.png",
      "jamuna future park": "/images/stores/jamuna-future-park-logo.png",
      jamuna: "/images/stores/jamuna-future-park-logo.png",
      "Pink City": "/images/stores/pink-city-logo.png",
      "pink city": "/images/stores/pink-city-logo.png",
      pinkcity: "/images/stores/pink-city-logo.png",
      "Police Plaza": "/images/stores/police-plaza-logo.png",
      "police plaza": "/images/stores/police-plaza-logo.png",
      policeplaza: "/images/stores/police-plaza-logo.png",
      "Eastern Plaza": "/images/stores/eastern-plaza-logo.png",
      "eastern plaza": "/images/stores/eastern-plaza-logo.png",
      easternplaza: "/images/stores/eastern-plaza-logo.png",
      "Walton Plaza": "/images/stores/walton-plaza-logo.png",
      "walton plaza": "/images/stores/walton-plaza-logo.png",
      waltonplaza: "/images/stores/walton-plaza-logo.png",

      // OFFICIAL PANKOURI LOGO - ONE & ONLY LOGO FOR ALL VARIATIONS
      Pankouri: "/images/stores/pankouri-official-logo.jpeg",
      pankouri: "/images/stores/pankouri-official-logo.jpeg",
      PANKOURI: "/images/stores/pankouri-official-logo.jpeg",
      "Pankouri Restaurant": "/images/stores/pankouri-official-logo.jpeg",
      "pankouri restaurant": "/images/stores/pankouri-official-logo.jpeg",
      "PANKOURI RESTAURANT": "/images/stores/pankouri-official-logo.jpeg",
      Manakouri: "/images/stores/pankouri-official-logo.jpeg",
      manakouri: "/images/stores/pankouri-official-logo.jpeg",
      MANAKOURI: "/images/stores/pankouri-official-logo.jpeg",
      "Manakouri Restaurant": "/images/stores/pankouri-official-logo.jpeg",
      "manakouri restaurant": "/images/stores/pankouri-official-logo.jpeg",
      "MANAKOURI RESTAURANT": "/images/stores/pankouri-official-logo.jpeg",
      Mankouri: "/images/stores/pankouri-official-logo.jpeg",
      mankouri: "/images/stores/pankouri-official-logo.jpeg",
      MANKOURI: "/images/stores/pankouri-official-logo.jpeg",
    }

    // Clean the store name
    const cleanStoreName = storeName.trim()

    // Try exact match first
    if (allLogos[cleanStoreName]) {
      return allLogos[cleanStoreName]
    }

    // Try case-insensitive match
    const lowerStoreName = cleanStoreName.toLowerCase()
    if (allLogos[lowerStoreName]) {
      return allLogos[lowerStoreName]
    }

    // Try partial matches for Pankouri/Manakouri - ALWAYS RETURN OFFICIAL LOGO
    if (
      lowerStoreName.includes("pankouri") ||
      lowerStoreName.includes("manakouri") ||
      lowerStoreName.includes("mankouri")
    ) {
      return "/images/stores/pankouri-official-logo.jpeg"
    }

    // Try partial matches for popular brands
    const partialMatches = [
      { keywords: ["nike"], logo: "/images/stores/nike-real-logo.jpeg" },
      { keywords: ["levi", "levis"], logo: "/images/stores/levis-real-logo.png" },
      { keywords: ["apple"], logo: "/images/stores/apple-bangladesh-real-logo.jpeg" },
      { keywords: ["samsung"], logo: "/images/stores/samsung-logo.png" },
      { keywords: ["mcdonald"], logo: "/images/stores/mcdonalds-real-logo.jpeg" },
      { keywords: ["pizza hut", "pizzahut"], logo: "/images/stores/pizza-hut-real-logo.png" },
      { keywords: ["kfc"], logo: "/images/stores/kfc-logo.png" },
      { keywords: ["burger king", "burgerking"], logo: "/images/stores/burger-king-logo.jpeg" },
      { keywords: ["domino"], logo: "/images/stores/dominos-real-logo.png" },
      { keywords: ["foodpanda", "food panda"], logo: "/images/stores/foodpanda-real-logo.png" },
      { keywords: ["daraz"], logo: "/images/stores/daraz-real-logo.jpeg" },
      { keywords: ["chaldal"], logo: "/images/stores/chaldal-real-logo.webp" },
      { keywords: ["agora"], logo: "/images/stores/agora-real-logo.png" },
      { keywords: ["shwapno"], logo: "/images/stores/shwapno-real-logo.jpeg" },
      { keywords: ["aarong"], logo: "/images/stores/aarong-real-logo.png" },
      { keywords: ["sheba"], logo: "/images/seba-logo-splash.png" }, // Added Sheba keyword match
    ]

    for (const match of partialMatches) {
      for (const keyword of match.keywords) {
        if (lowerStoreName.includes(keyword)) {
          return match.logo
        }
      }
    }

    return null
  }

  // Function to get operator logo
  const getOperatorLogo = (operator: string) => {
    if (!operator) return null

    const operatorLogos: { [key: string]: string } = {
      Grameenphone: "/images/grameenphone-logo.png",
      grameenphone: "/images/grameenphone-logo.png",
      GP: "/images/grameenphone-logo.png",
      gp: "/images/grameenphone-logo.png",
      Robi: "/images/robi-logo.jpeg",
      robi: "/images/robi-logo.jpeg",
      ROBI: "/images/robi-logo.jpeg",
      Airtel: "/images/airtel-logo.png",
      airtel: "/images/airtel-logo.png",
      AIRTEL: "/images/airtel-logo.png",
      Banglalink: "/images/banglalink-logo.png",
      banglalink: "/images/banglalink-logo.png",
      BL: "/images/banglalink-logo.png", // Added BL variation
      bl: "/images/banglalink-logo.png", // Added bl variation
      BANGLALINK: "/images/banglalink-logo.png",
      Teletalk: "/images/teletalk-logo.webp",
      teletalk: "/images/teletalk-logo.webp",
      TT: "/images/teletalk-logo.webp", // Added TT variation
      tt: "/images/teletalk-logo.webp", // Added tt variation
      TELETALK: "/images/teletalk-logo.webp",
      Skitto: "/images/skitto-official-logo.png",
      skitto: "/images/skitto-official-logo.png",
      SKITTO: "/images/skitto-official-logo.png",
    }

    return operatorLogos[operator] || operatorLogos[operator.toLowerCase()] || null
  }

  // Function to get utility company logo
  const getUtilityLogo = (company: string) => {
    if (!company) return null

    const utilityLogos: { [key: string]: string } = {
      DESCO: "/images/desco-logo.png",
      desco: "/images/desco-logo.png",
      DPDC: "/images/dpdc-logo.webp",
      dpdc: "/images/dpdc-logo.webp",
      REB: "/images/reb-logo.jpeg",
      reb: "/images/reb-logo.jpeg",
      BPDB: "/images/bpdb-logo.jpeg",
      bpdb: "/images/bpdb-logo.jpeg",
    }

    return utilityLogos[company] || utilityLogos[company.toLowerCase()] || null
  }

  // Function to get institution logo
  const getInstitutionLogo = (institution: string) => {
    if (!institution) return null

    const institutionLogos: { [key: string]: string } = {
      BUET: "/images/buet-logo.png",
      buet: "/images/buet-logo.png",
      "Dhaka University": "/images/dhaka-university-official-logo.jpeg",
      "dhaka university": "/images/dhaka-university-official-logo.jpeg",
      DU: "/images/dhaka-university-official-logo.jpeg",
      du: "/images/dhaka-university-official-logo.jpeg",
      RUET: "/images/ruet-new-logo.png",
      ruet: "/images/ruet-new-logo.png",
      CUET: "/images/cuet-new-logo.jpeg",
      cuet: "/images/cuet-new-logo.jpeg",
      KUET: "/images/kuet-logo.jpeg",
      kuet: "/images/kuet-logo.jpeg",
      DUET: "/images/duet-new-logo.jpeg",
      duet: "/images/duet-new-logo.jpeg",
      "East West University": "/images/east-west-university-logo.png",
      "east west university": "/images/east-west-university-logo.png",
      "Daffodil University": "/images/daffodil-logo.png",
      "daffodil university": "/images/daffodil-logo.png",
      "Northern University": "/images/northern-university-logo.png",
      "northern university": "/images/northern-university-logo.png",
      "Notre Dame College": "/images/notre-dame-college-logo.avif",
      "notre dame college": "/images/notre-dame-college-logo.avif",
      "Dhaka College": "/images/dhaka-college-logo.png",
      "dhaka college": "/images/dhaka-college-logo.png",
      "Rajshahi University": "/images/university-of-rajshahi-logo.png",
      "rajshahi university": "/images/university-of-rajshahi-logo.png",
      "Jahangirnagar University": "/images/jahangirnagar-logo.webp",
      "jahangirnagar university": "/images/jahangirnagar-logo.webp",
      "Islamic University": "/images/islamic-university-logo.jpeg",
      "islamic university": "/images/islamic-university-logo.jpeg",
      BSMMU: "/images/bsmmu-logo.jpeg",
      bsmmu: "/images/bsmmu-logo.jpeg",
    }

    return institutionLogos[institution] || institutionLogos[institution.toLowerCase()] || null
  }

  const transactionTypes = ["All", "Send Money", "Payment", "Recharge", "Cash Out", "Receive"]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <div className="text-xl font-medium">Inbox</div>
        </div>
        <div className="flex items-center">
          {realNotifications.filter((n) => !n.read).length > 0 && (
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">
              {realNotifications.filter((n) => !n.read).length}
            </div>
          )}
          <Settings size={24} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex-1 py-3 px-4 text-center ${
            activeTab === "transactions" ? "border-b-2 border-[#29a9eb] text-[#29a9eb]" : "text-gray-600"
          }`}
        >
          <ClipboardList size={20} className="mx-auto mb-1" />
          <div className="text-sm">Transactions</div>
          {transactions.length > 0 && (
            <div className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs absolute top-1 right-1/3">
              {transactions.length}
            </div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex-1 py-3 px-4 text-center relative ${
            activeTab === "notifications" ? "border-b-2 border-[#29a9eb] text-[#29a9eb]" : "text-gray-600"
          }`}
        >
          <Bell size={20} className="mx-auto mb-1" />
          <div className="text-sm">Notifications</div>
          {realNotifications.filter((n) => !n.read).length > 0 && (
            <div className="absolute top-1 right-1/2 transform translate-x-1/2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
              {realNotifications.filter((n) => !n.read).length}
            </div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-3 px-4 text-center ${
            activeTab === "settings" ? "border-b-2 border-[#29a9eb] text-[#29a9eb]" : "text-gray-600"
          }`}
        >
          <Settings size={20} className="mx-auto mb-1" />
          <div className="text-sm">Settings</div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "transactions" ? (
          <div className="p-4">
            {/* Success/Error Messages */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800">{success}</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Sent/Received Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setTransactionTab("sent")}
                className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                  transactionTab === "sent"
                    ? "border-[#29a9eb] text-[#29a9eb]"
                    : "border-transparent text-gray-600"
                }`}
              >
                Sent Money
              </button>
              <button
                onClick={() => setTransactionTab("received")}
                className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                  transactionTab === "received"
                    ? "border-[#29a9eb] text-[#29a9eb]"
                    : "border-transparent text-gray-600"
                }`}
              >
                Received Money
              </button>
            </div>

            {/* Search and Filter */}
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <div className="relative mb-4">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#29a9eb]"
                />
              </div>

              <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
                {transactionTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                      filterType === type ? "bg-[#29a9eb] text-white" : "bg-white text-gray-600 border border-gray-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Month Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                {renderMonthOptions()}
              </select>
            </div>

            {/* Transaction List */}
            {filteredTransactions.length > 0 ? (
              <div className="space-y-3">
                {filteredTransactions.map((transaction, index) => {
                  // Skip rendering transactions with "Unknown Store", "New Sheba", or specific fake transaction IDs
                  if (
                    transaction.to === "Unknown Store" ||
                    transaction.storeName === "Unknown Store" ||
                    transaction.to === "New Sheba" ||
                    transaction.storeName === "New Sheba" ||
                    transaction.transactionId === "PAY1752070839427" ||
                    (transaction.storeName === "New Sheba" && Math.abs(transaction.amount) === 500)
                  ) {
                    return null
                  }

                  return (
                    <div
                      key={`${transaction.transactionId}-${index}`}
                      className="border rounded-lg p-4 bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start flex-1">
                          {/* Transaction Logo/Icon */}
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                            {/* For Payment - show ALL store/service logos */}
                            {transaction.type === "Payment" && (
                              <>
                                {(() => {
                                  const storeName = transaction.to || transaction.storeName
                                  const logoPath = getPaymentLogoOld(storeName)

                                  if (logoPath) {
                                    return (
                                      <img
                                        src={logoPath || "/placeholder.svg"}
                                        alt={storeName}
                                        className="w-10 h-10 object-contain rounded-lg"
                                        onLoad={() => {
                                          console.log(`✅ Logo loaded successfully for: ${storeName}`)
                                        }}
                                        onError={(e) => {
                                          console.log(`❌ Logo failed to load for: ${storeName} (${logoPath})`)
                                          const target = e.target as HTMLImageElement
                                          target.style.display = "none"
                                          const fallback = target.parentElement?.querySelector(
                                            ".fallback-icon",
                                          ) as HTMLElement
                                          if (fallback) {
                                            fallback.style.display = "flex"
                                          }
                                        }}
                                      />
                                    )
                                  }

                                  return (
                                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-lg">🛒</span>
                                    </div>
                                  )
                                })()}
                                <div
                                  className="fallback-icon w-10 h-10 bg-purple-500 rounded-full items-center justify-center"
                                  style={{ display: "none" }}
                                >
                                  <span className="text-white text-lg">🛒</span>
                                </div>
                              </>
                            )}

                            {/* For Mobile Recharge - show operator logo */}
                            {(transaction.type === "Mobile Recharge" || transaction.type === "Recharge") && (
                              <>
                                {(() => {
                                  const operator = transaction.operator || transaction.to
                                  const logoPath = getOperatorLogo(operator)

                                  if (logoPath) {
                                    return (
                                      <img
                                        src={logoPath || "/placeholder.svg"}
                                        alt={operator}
                                        className="w-10 h-10 object-contain"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement
                                          target.style.display = "none"
                                          const fallback = target.parentElement?.querySelector(
                                            ".fallback-icon",
                                          ) as HTMLElement
                                          if (fallback) {
                                            fallback.style.display = "flex"
                                          }
                                        }}
                                      />
                                    )
                                  }

                                  return (
                                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-lg">📱</span>
                                    </div>
                                  )
                                })()}
                                <div
                                  className="fallback-icon w-10 h-10 bg-purple-500 rounded-full items-center justify-center"
                                  style={{ display: "none" }}
                                >
                                  <span className="text-white text-lg">📱</span>
                                </div>
                              </>
                            )}

                  {/* For Send Money - show recipient's profile or phone number initial */}
                  {transaction.type === "Send Money" && (
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {transaction.to
                                    ? transaction.to.charAt(0).toUpperCase()
                                    : transaction.recipient
                                      ? transaction.recipient.charAt(0).toUpperCase()
                                      : "S"}
                                </span>
                              </div>
                            )}

                            {/* For Bill Payment - show utility company logo */}
                            {transaction.type === "Bill Payment" && (
                              <>
                                {(() => {
                                  const company = transaction.to || transaction.company
                                  const logoPath = getUtilityLogo(company)

                                  if (logoPath) {
                                    return (
                                      <img
                                        src={logoPath || "/placeholder.svg"}
                                        alt={company}
                                        className="w-10 h-10 object-contain"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement
                                          target.style.display = "none"
                                          const fallback = target.parentElement?.querySelector(
                                            ".fallback-icon",
                                          ) as HTMLElement
                                          if (fallback) {
                                            fallback.style.display = "flex"
                                          }
                                        }}
                                      />
                                    )
                                  }

                                  return (
                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-lg">💡</span>
                                    </div>
                                  )
                                })()}
                                <div
                                  className="fallback-icon w-10 h-10 bg-blue-500 rounded-full items-center justify-center"
                                  style={{ display: "none" }}
                                >
                                  <span className="text-white text-lg">💡</span>
                                </div>
                              </>
                            )}

                            {/* For Education Fee - show institution logo */}
                            {transaction.type === "Education Fee" && (
                              <>
                                {(() => {
                                  const institution = transaction.to || transaction.institution
                                  const logoPath = getInstitutionLogo(institution)

                                  if (logoPath) {
                                    return (
                                      <img
                                        src={logoPath || "/placeholder.svg"}
                                        alt={institution}
                                        className="w-10 h-10 object-contain"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement
                                          target.style.display = "none"
                                          const fallback = target.parentElement?.querySelector(
                                            ".fallback-icon",
                                          ) as HTMLElement
                                          if (fallback) {
                                            fallback.style.display = "flex"
                                          }
                                        }}
                                      />
                                    )
                                  }

                                  return (
                                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-lg">🎓</span>
                                    </div>
                                  )
                                })()}
                                <div
                                  className="fallback-icon w-10 h-10 bg-purple-500 rounded-full items-center justify-center"
                                  style={{ display: "none" }}
                                >
                                  <span className="text-white text-lg">🎓</span>
                                </div>
                              </>
                            )}

                            {/* For Cashout - show agent initial */}
                            {(transaction.type === "Cashout" || transaction.type === "Cash Out") && (
                              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {transaction.to ? transaction.to.charAt(0).toUpperCase() : "A"}
                                </span>
                              </div>
                            )}

                            {/* For Money Received - show sender initial */}
                            {(transaction.type === "Money Received" || transaction.type === "Receive") && (
                              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {transaction.from ? transaction.from.charAt(0).toUpperCase() : "R"}
                                </span>
                              </div>
                            )}

                            {/* For Donation - show charity logo */}
                            {transaction.type === "Donation" && (
                              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-lg">❤️</span>
                              </div>
                            )}

                            {/* For Air Tickets - show airline logo */}
                            {transaction.type === "Air Tickets" && (
                              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-lg">✈️</span>
                              </div>
                            )}

                            {/* Default fallback for unknown transaction types */}
                            {![
                              "Payment",
                              "Mobile Recharge",
                              "Recharge",
                              "Send Money",
                              "Bill Payment",
                              "Education Fee",
                              "Cashout",
                              "Cash Out",
                              "Money Received",
                              "Receive",
                              "Donation",
                              "Air Tickets",
                            ].includes(transaction.type) && (
                              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                                <span className="text-white text-lg">💳</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {transactionTab === "received" ? "Received Money" : "Send Money"}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {transactionTab === "received"
                                ? `From: ${getDisplayName(transaction)}`
                                : `To: ${getDisplayName(transaction)}`}
                            </div>
                            {(transaction.type === "Money Received" ||
                              transaction.type === "Receive Money" ||
                              transaction.type === "Receive" ||
                              transaction.type === "Send Money" ||
                              transactionTab === "sent" ||
                              transactionTab === "received") && (
                              <div className="text-xs text-gray-500 mt-1">
                                {transactionTab === "received" ? "From: " : "To: "}
                                {getDisplayPhone(transaction)}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              {transaction.date} {transaction.time && `at ${transaction.time}`}
                            </div>
                            {transaction.transactionId && (
                              <div className="text-xs text-gray-400 mt-1">ID: {transaction.transactionId}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-bold text-lg ${
                              transaction.type === "Send Money" || transaction.type === "Payment" || transaction.to
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                          >
                            {/* Replaced Taka symbol with Tk to fix btoa error */}
                            {transaction.type === "Send Money" || transaction.type === "Payment" || transaction.to ? "-" : "+"}Tk{Math.abs(transaction.amount).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{transaction.status || "Completed"}</div>
                          <div className="flex items-center justify-end mt-1 gap-1 text-gray-400">
                            <Lock size={14} />
                            <span className="text-xs">Protected</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-gray-500 font-medium">No transactions found</div>
                <div className="text-sm text-gray-400 mt-2">Your transaction history will appear here</div>
                <button
                  onClick={loadTransactions}
                  className="mt-4 px-4 py-2 bg-[#29a9eb] text-white rounded-md text-sm"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        ) : activeTab === "notifications" ? (
          <div className="p-4">
            <div className="space-y-3">
              {realNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 ${!notification.read ? getNotificationColor(notification.priority) : ""}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start flex-1">
                      <div className="text-2xl mr-3">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="font-medium flex items-center">
                          {notification.title}
                          {notification.priority === "high" && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded">HIGH</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          {notification.date} at {notification.time}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-4 right-4"></div>
                  )}
                </div>
              ))}
            </div>

            {realNotifications.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500">No notifications</div>
                <div className="text-sm text-gray-400 mt-2">
                  Notifications will appear when you perform transactions
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Verification Status */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3">
                      {isVerified ? (
                        <CheckCircle size={24} className="text-blue-500" />
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium flex items-center">
                        {isVerified ? "Account Verified" : "Verify Account"}
                        {isVerified && <CheckCircle size={16} className="text-blue-500 ml-2" />}
                      </div>
                      <div className="text-sm text-gray-500">
                        {isVerified
                          ? "Your account is verified and all features are unlocked"
                          : "Get verified and unlock all features + earn 30 Tk bonus"}
                      </div>
                    </div>
                  </div>
                  {!isVerified && (
                    <Link href="/settings" className="bg-[#29a9eb] text-white px-4 py-2 rounded-md text-sm">
                      Verify Now
                    </Link>
                  )}
                </div>
              </div>

              {/* Change PIN */}
              <button
                onClick={() => setShowPinChange(true)}
                className="w-full border rounded-lg p-4 text-left hover:bg-gray-50"
              >
                <div className="font-medium">Change PIN</div>
                <div className="text-sm text-gray-500">Update your security PIN</div>
              </button>

              {/* Profile Photo */}
              <button
                onClick={() => setShowPhotoUpload(true)}
                className="w-full border rounded-lg p-4 text-left hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                    {selectedPhoto ? (
                      <img
                        src={selectedPhoto || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">Change Profile Photo</div>
                    <div className="text-sm text-gray-500">Upload from gallery</div>
                  </div>
                </div>
              </button>

              {/* Change Name */}
              <button
                onClick={() => setShowNameChange(true)}
                className="w-full border rounded-lg p-4 text-left hover:bg-gray-50"
              >
                <div className="font-medium flex items-center">
                  Change Name
                  {isVerified && <CheckCircle size={16} className="text-blue-500 ml-2" />}
                </div>
                <div className="text-sm text-gray-500">Update your display name</div>
              </button>

              {/* Country */}
              <div className="border rounded-lg p-4">
                <div className="font-medium">Country</div>
                <div className="text-sm text-gray-500 mt-1">Bangladesh (Auto-detected)</div>
                <div className="text-xs text-gray-400 mt-2">Country changes automatically based on your location</div>
              </div>

              {/* App Info */}
              <div className="border rounded-lg p-4">
                <div className="font-medium">App Version</div>
                <div className="text-sm text-gray-500 mt-1">Sheba v2.1.0</div>
                <div className="text-xs text-gray-400 mt-2">Latest version installed</div>
              </div>
            </div>

            {/* PIN Change Modal */}
            {showPinChange && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-80 mx-4">
                  <h3 className="text-lg font-medium mb-4">Change PIN</h3>
                  {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current PIN</label>
                      <input
                        type="password"
                        maxLength={6}
                        value={oldPin}
                        onChange={(e) => setOldPin(e.target.value)}
                        className="w-full border rounded-md p-3 text-center text-lg tracking-widest"
                        placeholder="••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">New PIN</label>
                      <input
                        type="password"
                        maxLength={6}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        className="w-full border rounded-md p-3 text-center text-lg tracking-widest"
                        placeholder="••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm New PIN</label>
                      <input
                        type="password"
                        maxLength={6}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        className="w-full border rounded-md p-3 text-center text-lg tracking-widest"
                        placeholder="••••••"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowPinChange(false)
                        setError("")
                        setOldPin("")
                        setNewPin("")
                        setConfirmPin("")
                      }}
                      className="flex-1 border border-gray-300 rounded-md py-2 text-gray-700"
                    >
                      Cancel
                    </button>
                    <button onClick={handlePinChange} className="flex-1 bg-[#29a9eb] text-white rounded-md py-2">
                      Update PIN
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Photo Upload Modal */}
            {showPhotoUpload && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-80 mx-4">
                  <h3 className="text-lg font-medium mb-4">Change Profile Photo</h3>
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                      {selectedPhoto ? (
                        <img
                          src={selectedPhoto || "/placeholder.svg"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={32} className="text-gray-400" />
                      )}
                    </div>
                    <button
                      onClick={handlePhotoUpload}
                      className="bg-[#29a9eb] text-white px-6 py-2 rounded-md mb-4 flex items-center mx-auto"
                    >
                      <Upload size={16} className="mr-2" />
                      Choose Photo
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowPhotoUpload(false)}
                      className="flex-1 border border-gray-300 rounded-md py-2 text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Name Change Modal */}
            {showNameChange && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-80 mx-4">
                  <h3 className="text-lg font-medium mb-4">Change Name</h3>
                  {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Name</label>
                      <div className="w-full border rounded-md p-3 bg-gray-50 text-gray-600">{currentName}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">New Name</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full border rounded-md p-3"
                        placeholder="Enter new name"
                        maxLength={50}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowNameChange(false)
                        setError("")
                        setNewName("")
                      }}
                      className="flex-1 border border-gray-300 rounded-md py-2 text-gray-700"
                    >
                      Cancel
                    </button>
                    <button onClick={handleNameChange} className="flex-1 bg-[#29a9eb] text-white rounded-md py-2">
                      Update Name
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
