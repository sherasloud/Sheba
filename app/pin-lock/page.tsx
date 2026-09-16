"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PinLockPage() {
  const router = useRouter()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  // Check if already verified
  useEffect(() => {
    const pinVerified = localStorage.getItem("pinVerified")
    if (pinVerified === "true") {
      router.push("/")
    }
  }, [router])

  const handleVerifyPin = () => {
    setError("")
    
    if (pin.length !== 6) {
      setError("PIN must be 6 digits")
      return
    }

    setIsVerifying(true)

    // Simulate PIN verification (in real app, verify with backend)
    setTimeout(() => {
      // Default PIN is 111111 for testing, can be changed
      if (pin === "111111") {
        localStorage.setItem("pinVerified", "true")
        localStorage.setItem("pinVerifiedTime", Date.now().toString())
        router.push("/")
      } else {
        setError("Invalid PIN. Try 111111")
        setPin("")
        setIsVerifying(false)
      }
    }, 500)
  }

  const handleNumpadClick = (num: string) => {
    if (pin.length < 6) {
      setPin(pin + num)
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sky-500 mb-2">PIN দিন</h1>
          <div className="flex gap-4 justify-center mb-4">
            <div className="w-12 h-1 bg-sky-500 rounded"></div>
            <div className="w-12 h-1 bg-sky-500 rounded"></div>
          </div>
          <p className="text-gray-600 text-sm">আপনার অ্যাপ আনলক করুন</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold text-xl transition-all"
            >
              {pin[i] ? "•" : ""}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-center text-sm mb-4 p-2 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="flex flex-col items-center gap-2 mb-6">
          {/* Rows 1-3 (1-9) */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumpadClick(num.toString())}
                className="w-16 h-16 rounded-2xl text-2xl font-bold text-sky-500 bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all disabled:opacity-50"
                disabled={pin.length >= 6 || isVerifying}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Zero Button */}
          <button
            onClick={() => handleNumpadClick("0")}
            className="w-16 h-16 rounded-2xl text-2xl font-bold text-sky-500 bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all disabled:opacity-50"
            disabled={pin.length >= 6 || isVerifying}
          >
            0
          </button>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerifyPin}
          disabled={pin.length !== 6 || isVerifying}
          className="w-full py-4 bg-sky-500 text-white rounded-full font-bold text-lg hover:bg-sky-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {isVerifying ? "যাচাই করছে..." : "যাচাই করুন"}
        </button>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="w-full py-3 bg-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-400 active:scale-95 transition-all"
        >
          মুছে ফেলুন
        </button>

        {/* Test PIN Hint */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>Demo PIN: 111111</p>
        </div>
      </div>
    </div>
  )
}
