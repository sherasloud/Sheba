"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function PaymentAmountPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [orderId, setOrderId] = useState("")
  const [selectedStore, setSelectedStore] = useState<any>(null)

  useEffect(() => {
    const storeData = localStorage.getItem("selectedStore")
    if (storeData) {
      try {
        const store = JSON.parse(storeData)
        console.log("Selected store loaded:", store)
        setSelectedStore(store)
      } catch (error) {
        console.error("Error parsing store data:", error)
        router.push("/payment")
      }
    } else {
      console.log("No store selected, redirecting...")
      router.push("/payment")
    }
  }, [router])

  const handleAmountChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, "")

    // Ensure only one decimal point
    const parts = numericValue.split(".")
    if (parts.length > 2) {
      return
    }

    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return
    }

    setAmount(numericValue)
  }

  const handleContinue = () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    if (!orderId.trim()) {
      alert("Please enter an Order ID")
      return
    }

    const finalAmount = Number.parseFloat(amount)

    console.log("💰 SAVING EXACT AMOUNT:", finalAmount)

    // Store the EXACT amount the user entered
    localStorage.setItem("paymentAmount", finalAmount.toString())
    localStorage.setItem("paymentOrderId", orderId.trim())

    // Also store in a backup location
    localStorage.setItem("currentPaymentAmount", finalAmount.toString())

    console.log("✅ Amount saved to localStorage:", {
      paymentAmount: localStorage.getItem("paymentAmount"),
      currentPaymentAmount: localStorage.getItem("currentPaymentAmount"),
    })

    // Navigate to PIN page
    router.push("/payment/pin")
  }

  if (!selectedStore) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <button onClick={() => router.push("/payment")} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-medium">Payment Amount</div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#29a9eb]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <button onClick={() => router.push("/payment")} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div className="text-xl font-medium">Payment Details</div>
      </div>

      <div className="flex-1 p-6">
        {/* Store Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-lg overflow-hidden mr-4 bg-white p-2 shadow-sm">
              <Image
                src={selectedStore.logo || "/placeholder.svg"}
                alt={selectedStore.name}
                width={64}
                height={64}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=64&width=64"
                }}
              />
            </div>
            <div>
              <div className="font-semibold text-lg">{selectedStore.name}</div>
              <div className="text-sm text-gray-600">{selectedStore.category}</div>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">Tk</span>
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Enter amount"
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-[#29a9eb] focus:border-transparent"
            />
          </div>
          {amount && (
            <div className="text-sm text-gray-600 mt-2">
              Amount: Tk{Number.parseFloat(amount || "0").toLocaleString()}
            </div>
          )}
        </div>

        {/* Order ID Input */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">Order ID</label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter order ID"
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#29a9eb] focus:border-transparent"
          />
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!amount || !orderId.trim()}
          className="w-full bg-[#29a9eb] text-white py-4 rounded-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
