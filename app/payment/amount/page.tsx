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

      <div className="flex-1 p-4 flex flex-col overflow-y-auto">
        {/* Store Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg overflow-hidden mr-3 bg-white p-2 shadow-sm">
              <Image
                src={selectedStore.logo || "/placeholder.svg"}
                alt={selectedStore.name}
                width={48}
                height={48}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=48&width=48"
                }}
              />
            </div>
            <div>
              <div className="font-semibold text-sm">{selectedStore.name}</div>
              <div className="text-xs text-gray-600">{selectedStore.category}</div>
            </div>
          </div>
        </div>

        {/* Order ID Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-xs font-medium mb-1">Order ID</label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter order ID"
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#29a9eb] focus:border-transparent"
          />
        </div>

        {/* Amount Display */}
        <div className="text-center mb-4 py-3 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-xs mb-1">Amount</p>
          <p className="text-3xl font-bold text-[#29a9eb]">৳ {amount ? Number(amount).toLocaleString() : '0'}</p>
        </div>

        {/* Number Keypad */}
        <div className="flex flex-col items-center justify-center gap-4 mb-6">
          <div className="grid grid-cols-3 gap-2 w-fit">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => setAmount(amount + num.toString())}
                className="w-14 h-14 rounded-lg text-2xl font-bold text-[#29a9eb] bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Row with 0 and Delete */}
          <div className="flex gap-2 justify-center mb-24">
            <button
              onClick={() => setAmount(amount + '0')}
              className="w-14 h-14 rounded-lg text-2xl font-bold text-[#29a9eb] bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all"
            >
              0
            </button>
            <button
              onClick={() => setAmount(amount.slice(0, -1))}
              className="w-14 h-14 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all flex items-center justify-center"
            >
              <ArrowLeft size={18} />
            </button>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!amount || !orderId.trim()}
          className="w-full bg-[#29a9eb] text-white py-3 rounded-lg font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
