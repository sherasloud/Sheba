"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RemittancePinPage() {
  const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [amount, setAmount] = useState("")
  const router = useRouter()

  useEffect(() => {
    const savedAmount = localStorage.getItem("remittanceAmount")
    if (savedAmount) {
      setAmount(savedAmount)
    } else {
      router.push("/remittance")
    }
  }, [router])

  const handlePinChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...pin]
      newPin[index] = value
      setPin(newPin)
      setError("")

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`pin-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = () => {
    const pinString = pin.join("")

    if (pinString.length !== 6) {
      setError("Please enter complete 6-digit PIN")
      return
    }

    if (pinString !== "123456") {
      setError("Invalid PIN. Please try again.")
      return
    }

    setIsLoading(true)

    // Save transaction data
    const transactionData = {
      id: `RMT${Date.now()}`,
      date: new Date().toISOString(),
      amount: amount,
      fee: 299,
      total: Number.parseInt(amount) + 299,
      status: "completed",
    }

    localStorage.setItem("remittanceTransaction", JSON.stringify(transactionData))

    setTimeout(() => {
      router.push("/remittance/success")
    }, 2000)
  }

  const fee = 299
  const total = Number.parseInt(amount) + fee

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/remittance/review" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Enter PIN</div>
      </div>

      <div className="flex-1 flex flex-col justify-between px-4 py-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">🔐</span>
          </div>
          <h2 className="text-lg font-bold mb-1">Secure Your Transfer</h2>
          <p className="text-gray-600 text-xs mb-4">Enter your 6-digit PIN to confirm</p>
          <p className="text-xs text-gray-600 mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-blue-600">Tk{total}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter Your PIN</label>
          <div className="flex justify-center gap-2 mb-3">
            {pin.map((digit, index) => (
              <input
                key={index}
                id={`pin-${index}`}
                type="password"
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-11 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                maxLength={1}
              />
            ))}
          </div>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading || pin.join("").length !== 6}
          className="w-full bg-[#29a9eb] text-white py-4 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing Transfer..." : "Confirm Transfer"}
        </button>
      </div>
    </div>
  )
}
