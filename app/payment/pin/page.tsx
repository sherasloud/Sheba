"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PaymentPinPage() {
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentData, setPaymentData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    console.log("🔍 Loading payment data in PIN page...")

    // Get the EXACT amount from amount page
    const amount = localStorage.getItem("paymentAmount") || localStorage.getItem("currentPaymentAmount")
    const store = localStorage.getItem("selectedStore")
    const orderId = localStorage.getItem("paymentOrderId")

    console.log("📊 Raw data from localStorage:", {
      amount,
      store,
      orderId,
    })

    if (!amount || !store) {
      console.log("❌ Missing payment data, redirecting...")
      router.push("/payment")
      return
    }

    try {
      const storeData = JSON.parse(store)
      const finalAmount = Number.parseFloat(amount)

      console.log("✅ Parsed payment data:", {
        amount: finalAmount,
        storeName: storeData.name || storeData,
        orderId,
      })

      setPaymentData({
        amount: finalAmount,
        storeName: storeData.name || storeData,
        orderId: orderId || "N/A",
      })
    } catch {
      const finalAmount = Number.parseFloat(amount)
      console.log("✅ Using fallback parsing:", {
        amount: finalAmount,
        storeName: store,
      })

      setPaymentData({
        amount: finalAmount,
        storeName: store,
        orderId: orderId || "N/A",
      })
    }
  }, [router])

  const handlePinSubmit = async () => {
    if (pin.length !== 6) {
      setError("Please enter a 6-digit PIN")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Simulate PIN verification
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const storedPin = localStorage.getItem("userPIN") || "123456"
      if (pin !== storedPin) {
        setError("Incorrect PIN. Please try again.")
        setIsLoading(false)
        return
      }

      console.log("💰 Creating success data with EXACT amount:", paymentData.amount)

      // Save payment data for success page - ONLY ONCE HERE with EXACT amount
      const successData = {
        storeName: paymentData.storeName,
        amount: paymentData.amount, // Use the EXACT amount from amount page
        orderId: paymentData.orderId,
        transactionId: `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: "Completed",
      }

      console.log("💾 Saving success data:", successData)

      // Save to localStorage for success page
      localStorage.setItem("paymentSuccessData", JSON.stringify(successData))

      // Clean up temporary data
      localStorage.removeItem("paymentAmount")
      localStorage.removeItem("currentPaymentAmount")
      localStorage.removeItem("paymentOrderId")
      localStorage.removeItem("selectedStore")

      // Redirect to success page
      router.push("/payment/success")
    } catch (error) {
      setError("Payment failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handlePinChange = (value: string) => {
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setPin(value)
      setError("")
    }
  }

  if (!paymentData) {
    return (
      <div className="flex flex-col h-screen bg-white items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#29a9eb]"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/payment/amount" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Enter PIN</div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between px-4 py-6">
        {/* Payment Summary - Top Section */}
        <div className="text-center">
          <div className="text-gray-600 text-sm mb-1">Payment to</div>
          <div className="text-lg font-semibold text-gray-900 mb-1">{paymentData.storeName}</div>
          <div className="text-xs text-gray-500 mb-3">Order ID: {paymentData.orderId}</div>
          <div className="text-4xl font-bold text-[#29a9eb]">Tk{paymentData.amount.toLocaleString()}</div>
        </div>

        {/* PIN Input - Middle Section */}
        <div className="w-full">
          <div className="text-center mb-4">
            <div className="text-base font-medium text-gray-900 mb-1">Enter your PIN</div>
            <div className="text-sm text-gray-600">6-digit security PIN</div>
          </div>

          <input
            type="password"
            value={pin}
            onChange={(e) => handlePinChange(e.target.value)}
            className="w-full text-center text-3xl tracking-[0.5em] py-4 border-2 border-gray-300 rounded-lg focus:border-[#29a9eb] focus:outline-none"
            placeholder="••••••"
            maxLength={6}
            autoFocus
          />

          {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
        </div>

        {/* Submit Button - Bottom Section */}
        <button
          onClick={handlePinSubmit}
          disabled={pin.length !== 6 || isLoading}
          className="w-full bg-[#29a9eb] text-white py-4 rounded-lg font-medium text-base disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            "Confirm Payment"
          )}
        </button>
      </div>
    </div>
  )
}
