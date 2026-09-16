"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard } from "lucide-react"

export default function RailPaymentPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<any>(null)
  const [pin, setPin] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem("railBookingData")
    if (data) {
      setBookingData(JSON.parse(data))
    } else {
      router.push("/rail-tickets")
    }
  }, [router])

  const handlePayment = async () => {
    if (!pin || pin.length !== 4) {
      alert("Please enter your 4-digit PIN")
      return
    }

    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      // Generate ticket number
      const ticketNumber = `MRT${Date.now().toString().slice(-8)}`

      // Store ticket data
      const ticketData = {
        ...bookingData,
        ticketNumber,
        bookingTime: new Date().toISOString(),
        status: "confirmed",
      }

      localStorage.setItem("railTicketData", JSON.stringify(ticketData))
      localStorage.removeItem("railBookingData")

      // Deduct amount from balance
      const currentBalance = Number(localStorage.getItem("userBalance") || "0")
      const newBalance = currentBalance - bookingData.totalPrice
      localStorage.setItem("userBalance", newBalance.toString())

      setIsProcessing(false)
      router.push("/rail-tickets/success")
    }, 3000)
  }

  if (!bookingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-sm mx-auto relative">
      {/* Header */}
      <div className="bg-sky-500 text-white p-4">
        <div className="flex items-center space-x-3">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">Payment</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Payment Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3">💰 Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">Metro Rail Ticket</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Route:</span>
              <span className="font-medium">
                {bookingData.from} → {bookingData.to}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Passengers:</span>
              <span className="font-medium">{bookingData.passengers}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Amount:</span>
                <span className="text-sky-500">Tk{bookingData.totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PIN Entry */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">🔒 Enter PIN</h2>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.slice(0, 4))}
            placeholder="Enter 4-digit PIN"
            maxLength={4}
            className="w-full p-4 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={pin.length !== 4 || isProcessing}
          className="w-full bg-sky-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-sky-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <CreditCard size={20} />
              <span>Pay Tk{bookingData.totalPrice}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
