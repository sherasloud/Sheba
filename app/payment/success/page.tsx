"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface PaymentData {
  storeName: string
  amount: number
  transactionId: string
  date: string
  time: string
  orderId?: string
  status?: string
}

export default function PaymentSuccessPage() {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [transactionSaved, setTransactionSaved] = useState(false)

  useEffect(() => {
    console.log("🔍 Loading payment success data...")

    // Get REAL payment data from PIN page
    const getPaymentData = () => {
      // Get data from PIN page
      const successData = localStorage.getItem("paymentSuccessData")
      if (successData) {
        try {
          const parsed = JSON.parse(successData)
          console.log("✅ Found payment success data:", parsed)

          // Make sure amount is a number
          const finalAmount = Number.parseFloat(parsed.amount.toString())

          console.log("💰 EXACT AMOUNT for success page:", finalAmount)

          return {
            ...parsed,
            amount: finalAmount, // Ensure it's the exact amount
          }
        } catch (e) {
          console.log("❌ Failed to parse payment success data:", e)
        }
      }

      console.log("❌ No payment success data found")
      return null
    }

    const data = getPaymentData()

    if (!data) {
      console.log("❌ No payment data available")
      setIsLoading(false)
      return
    }

    setPaymentData(data)

    // Save transaction ONLY ONCE and ONLY if not already saved
    if (data.amount > 0 && !transactionSaved) {
      const transaction = {
        id: data.transactionId,
        type: "Payment",
        to: data.storeName,
        amount: -Math.abs(data.amount), // Negative for payments, use EXACT amount
        date: data.date,
        time: data.time,
        status: "Completed",
        transactionId: data.transactionId,
        orderId: data.orderId,
      }

      console.log("💾 Creating transaction with EXACT amount:", transaction)

      const existingTransactions = JSON.parse(localStorage.getItem("transactions") || "[]")

      // Check if this EXACT transaction already exists
      const exists = existingTransactions.some((t: any) => t.transactionId === transaction.transactionId)

      if (!exists) {
        existingTransactions.unshift(transaction)
        localStorage.setItem("transactions", JSON.stringify(existingTransactions))
        console.log("✅ Transaction saved with EXACT amount:", transaction)

        // Update balance
        const currentBalance = Number(localStorage.getItem("userBalance") || "50000")
        const newBalance = currentBalance + transaction.amount // amount is negative
        localStorage.setItem("userBalance", newBalance.toString())
        console.log(`💰 Balance updated: ${currentBalance} → ${newBalance}`)

        // Mark as saved to prevent duplicate saves
        setTransactionSaved(true)

        // Clean up success data after saving
        localStorage.removeItem("paymentSuccessData")

        // Trigger transaction event
        window.dispatchEvent(new CustomEvent("newTransaction", { detail: transaction }))
      } else {
        console.log("🔄 Transaction already exists, skipping save")
      }
    }

    setIsLoading(false)
  }, [transactionSaved])

  // Function to get store logo - UPDATED WITH OFFICIAL PANKOURI LOGO
  const getStoreLogo = (storeName: string) => {
    const storeLogos: { [key: string]: string } = {
      // Food & Restaurants
      "McDonald's": "/images/stores/mcdonalds-real-logo.jpeg",
      "Pizza Hut": "/images/stores/pizza-hut-real-logo.png",
      KFC: "/images/stores/kfc-logo.png",
      "Burger King": "/images/stores/burger-king-logo.jpeg",
      "Domino's": "/images/stores/dominos-real-logo.png",
      Foodpanda: "/images/stores/foodpanda-real-logo.png",
      Subway: "/images/stores/subway-real-logo.png",
      Hungrynaki: "/images/stores/hungrynaki-real-logo.jpeg",
      "Pizza Inn": "/images/stores/pizza-inn-real-logo.png",
      "Food Maama": "/images/stores/food-maama-real-logo.png",
      Chillox: "/images/stores/chillox-real-logo.png",
      "Star Kabab": "/images/stores/star-kabab-real-logo.png",
      Coopers: "/images/stores/coopers-real-logo.jpeg",
      Takeout: "/images/stores/takeout-real-logo.jpeg",
      "Kacchi Bhai": "/images/stores/kacchi-bhai-real-logo.jpeg",
      "Kacchi Dining": "/images/stores/kacchi-dining-real-logo.jpeg",
      "Sultan's Dine": "/images/stores/sultans-dine-real-logo.png",
      Foodi: "/images/stores/foodi-real-logo.png",
      BFC: "/images/stores/bfc-real-logo.jpeg",
      "Pathao Food": "/images/stores/pathao-food-real-logo.jpeg",
      "Uber Eats": "/images/stores/uber-eats-real-logo.avif",

      // E-commerce & Shopping
      Daraz: "/images/stores/daraz-real-logo.jpeg",
      Chaldal: "/images/stores/chaldal-real-logo.webp",
      Agora: "/images/stores/agora-real-logo.png",
      Shwapno: "/images/stores/shwapno-real-logo.jpeg",
      Aarong: "/images/stores/aarong-real-logo.png",
      Pickaboo: "/images/stores/pickaboo-real-logo.jpeg",
      Bagdoom: "/images/stores/bagdoom-real-logo.jpeg",
      AjkerDeal: "/images/stores/ajkerdeal-real-logo.png",
      Rokomari: "/images/stores/rokomari-real-logo.jpeg",
      Othoba: "/images/stores/othoba-real-logo.jpeg",
      Evaly: "/images/stores/evaly-real-logo.png",
      Bikroy: "/images/stores/bikroy-real-logo.png",
      Shohoz: "/images/stores/shohoz-real-logo.jpeg",
      PriyoShop: "/images/stores/priyoshop-real-logo.png",
      "Meena Bazar": "/images/stores/meena-bazar-real-logo.png",
      Unimart: "/images/stores/unimart-real-logo.png",
      "Prince Bazar": "/images/stores/prince-bazar-real-logo.jpeg",

      // Fashion & Clothing
      Nike: "/images/stores/nike-real-logo.jpeg",
      "Nike Bangladesh": "/images/stores/nike-real-logo.jpeg",
      NIKE: "/images/stores/nike-real-logo.jpeg",
      nike: "/images/stores/nike-real-logo.jpeg",
      "Levi's": "/images/stores/levis-real-logo.png",
      "Levi's Bangladesh": "/images/stores/levis-real-logo.png",
      "Le Reve": "/images/stores/le-reve-real-logo.jpeg",
      "Cats Eye": "/images/stores/cats-eye-real-logo.jpeg",
      Ecstasy: "/images/stores/ecstasy-real-logo.jpeg",
      Yellow: "/images/stores/yellow-real-logo.jpeg",
      Artisan: "/images/stores/artisan-real-logo.jpeg",
      "Gentle Park": "/images/stores/gentle-park-real-logo.png",
      Richman: "/images/stores/richman-real-logo.png",
      Sailor: "/images/stores/sailor-real-logo.png",

      // Electronics & Tech
      Apple: "/images/stores/apple-bangladesh-real-logo.jpeg",
      "Apple Bangladesh": "/images/stores/apple-bangladesh-real-logo.jpeg",
      Samsung: "/images/stores/samsung-logo.png",
      Walton: "/images/stores/walton-logo.png",
      "Star Tech": "/images/stores/star-tech-logo.png",
      Ryans: "/images/stores/ryans-logo.png",
      "Computer Source": "/images/stores/computer-source-logo.png",
      Transcom: "/images/stores/transcom-logo.png",
      Singer: "/images/stores/singer-logo.png",
      Appleians: "/images/stores/appleians-logo.png",
      iCenter: "/images/stores/icenter-logo.jpeg",

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

    console.log("🔍 Looking for logo for store:", storeName)

    // Try exact match first
    if (storeLogos[storeName]) {
      console.log("✅ Found exact match for:", storeName, "->", storeLogos[storeName])
      return storeLogos[storeName]
    }

    // Try case-insensitive match
    const lowerStoreName = storeName.toLowerCase()
    for (const [key, value] of Object.entries(storeLogos)) {
      if (key.toLowerCase() === lowerStoreName) {
        console.log("✅ Found case-insensitive match for:", storeName, "->", value)
        return value
      }
    }

    // Try partial match for Pankouri/Manakouri specifically - ALWAYS RETURN OFFICIAL LOGO
    if (
      lowerStoreName.includes("pankouri") ||
      lowerStoreName.includes("manakouri") ||
      lowerStoreName.includes("mankouri")
    ) {
      console.log("✅ Found partial match for Pankouri/Manakouri:", storeName, "-> OFFICIAL LOGO")
      return "/images/stores/pankouri-official-logo.jpeg"
    }

    // Try partial match for other common brands
    if (lowerStoreName.includes("nike")) {
      return "/images/stores/nike-real-logo.jpeg"
    }
    if (lowerStoreName.includes("apple")) {
      return "/images/stores/apple-bangladesh-real-logo.jpeg"
    }
    if (lowerStoreName.includes("samsung")) {
      return "/images/stores/samsung-logo.png"
    }

    console.log("❌ No logo found for:", storeName)
    return null
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-white items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#29a9eb] mb-4"></div>
        <div className="text-gray-600">Loading payment details...</div>
      </div>
    )
  }

  // If no payment data found, show error
  if (!paymentData) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <ArrowLeft size={20} className="mr-2" />
            <span className="text-lg font-medium">Payment Error</span>
          </Link>
          <Link href="/">
            <Home size={20} />
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-8">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Data Not Found</h1>
          <p className="text-gray-600 text-center mb-8">
            Unable to load payment information.
            <br />
            Please try making the payment again.
          </p>
          <Link href="/payment" className="bg-[#29a9eb] text-white py-3 px-6 rounded-lg font-medium">
            Try Again
          </Link>
        </div>
      </div>
    )
  }

  const storeLogo = getStoreLogo(paymentData.storeName)

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <ArrowLeft size={20} className="mr-2" />
          <span className="text-lg font-medium">Payment Success</span>
        </Link>
        <Link href="/">
          <Home size={20} />
        </Link>
      </div>

      {/* Success Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* MEDIUM Blue Circle with BIGGER White Tick */}
        <div className="w-20 h-20 bg-[#29a9eb] rounded-full flex items-center justify-center mb-8">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="text-white">
            <path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Success Message */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
          <p className="text-gray-600 text-base">
            Your payment has been processed
            <br />
            successfully
          </p>
        </div>

        {/* Store Info */}
        <div className="flex items-center mb-12">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
            {storeLogo ? (
              <Image
                src={storeLogo || "/placeholder.svg"}
                alt={paymentData.storeName}
                width={48}
                height={48}
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.log(`❌ Logo failed to load for: ${paymentData.storeName} (${storeLogo})`)
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = '<span class="text-2xl">🛒</span>'
                  }
                }}
              />
            ) : (
              <span className="text-2xl">🛒</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{paymentData.storeName}</h3>
            <p className="text-gray-500">Payment to store</p>
          </div>
        </div>

        {/* EXACT Amount Display */}
        <div className="text-center mb-12">
          <div className="text-4xl font-bold text-gray-900 mb-2">Tk{paymentData.amount.toLocaleString()}</div>
          <div className="text-gray-500">Amount Paid</div>
        </div>

        {/* Transaction Details */}
        <div className="w-full max-w-sm space-y-4 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Transaction ID</span>
            <span className="font-medium text-gray-900 text-sm">{paymentData.transactionId}</span>
          </div>
          {paymentData.orderId && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Order ID</span>
              <span className="font-medium text-gray-900 text-sm">{paymentData.orderId}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Date & Time</span>
            <span className="font-medium text-gray-900 text-sm">
              {paymentData.date} at {paymentData.time}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status</span>
            <span className="font-medium text-[#29a9eb]">{paymentData.status || "Completed"}</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Link href="/" className="flex flex-col items-center py-2">
            <Home size={20} className="text-[#29a9eb] mb-1" />
            <span className="text-xs text-[#29a9eb]">Home</span>
          </Link>
          <Link href="/scan-qr" className="flex flex-col items-center py-2">
            <div className="w-5 h-5 mb-1">
              <svg viewBox="0 0 24 24" className="w-full h-full text-gray-400">
                <path
                  fill="currentColor"
                  d="M3,3H11V11H3V3M5,5V9H9V5H5M13,3H21V11H13V3M15,5V9H19V5H15M3,13H11V21H3V13M5,15V19H9V15H5M19,13H21V15H19V13M19,19H21V21H19V19M17,15H19V17H17V15M15,17H17V19H15V17M17,19H19V21H17V19Z"
                />
              </svg>
            </div>
            <span className="text-xs text-gray-400">Scan QR</span>
          </Link>
          <Link href="/inbox" className="flex flex-col items-center py-2">
            <div className="w-5 h-5 mb-1">
              <svg viewBox="0 0 24 24" className="w-full h-full text-gray-400">
                <path
                  fill="currentColor"
                  d="M20,6L10,11L8,10L4,12V6H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"
                />
              </svg>
            </div>
            <span className="text-xs text-gray-400">Inbox</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
