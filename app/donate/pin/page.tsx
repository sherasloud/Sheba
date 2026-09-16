"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DonatePinPage() {
  const router = useRouter()
  const [pin, setPin] = useState("")
  const [donationDetails, setDonationDetails] = useState<any>(null)

  useEffect(() => {
    const details = localStorage.getItem("donationDetails")
    if (details) {
      setDonationDetails(JSON.parse(details))
    }
  }, [])

  const handlePinInput = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit
      setPin(newPin)

      if (newPin.length === 6) {
        // Auto submit when 6 digits entered
        handleSubmit(newPin)
      }
    }
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
  }

  const handleSubmit = (pinToSubmit: string = pin) => {
    // Any PIN is valid for demo
    // Generate transaction
    const transaction = {
      ...donationDetails,
      transactionId: Math.random().toString(36).substring(2, 15).toUpperCase(),
      timestamp: new Date().toISOString(),
      status: "completed",
    }

    localStorage.setItem("donationTransaction", JSON.stringify(transaction))

    // Instant navigation to success
    router.push("/donate/success")
  }

  const handleBack = () => {
    // Instant back navigation
    router.push("/donate/amount")
  }

  if (!donationDetails) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <button onClick={() => router.push("/donate")} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-medium">Enter PIN</div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Donation Details Not Found</h2>
            <button onClick={() => router.push("/donate")} className="text-[#29a9eb]">
              Go back to Donate
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <button onClick={handleBack} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div className="text-xl font-medium">Enter PIN</div>
      </div>

      <div className="flex-1 flex flex-col justify-between px-4 py-4">
        <div className="text-center">
          <h2 className="text-lg font-bold mb-1">Confirm Donation</h2>
          <p className="text-gray-600 text-xs mb-4">Enter your 6-digit PIN</p>

          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <img
                  src={donationDetails.charity?.logo || "/placeholder.svg"}
                  alt={donationDetails.charity?.name}
                  className="w-8 h-8 rounded-full object-contain"
                />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold">{donationDetails.charity?.name}</h3>
                <p className="text-xs text-gray-600">{donationDetails.charity?.category}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-[#29a9eb]">Tk{donationDetails.amount?.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-center mb-3">
            <div className="flex gap-2">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full border-2 ${
                    index < pin.length ? "bg-[#29a9eb] border-[#29a9eb]" : "border-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handlePinInput(digit.toString())}
              className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold hover:bg-gray-200 transition-colors active:bg-gray-300"
            >
              {digit}
            </button>
          ))}
          <div></div>
          <button
            onClick={() => handlePinInput("0")}
            className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold hover:bg-gray-200 transition-colors active:bg-gray-300"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors active:bg-gray-300"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
