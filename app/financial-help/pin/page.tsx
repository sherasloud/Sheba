"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import VerificationRequired from "@/components/verification-required"

export default function FinancialHelpPinPage() {
  const [isVerified, setIsVerified] = useState(false)
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check verification status
    const userData = localStorage.getItem("userData")
    const storedVerified = localStorage.getItem("isVerified")

    if (userData) {
      const user = JSON.parse(userData)
      setIsVerified(user.isVerified || false)
    } else if (storedVerified) {
      setIsVerified(storedVerified === "true")
    }

    // Check if we have the required data
    const reason = localStorage.getItem("financialHelpReason")
    const amount = localStorage.getItem("financialHelpAmount")

    if (!reason || !amount) {
      router.push("/financial-help/reason")
    }
  }, [router])

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPin(value)
      setError("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // For demo purposes, accept any 6-digit PIN
    if (pin.length === 6) {
      // Create a new request
      const newRequest = {
        id: Date.now().toString(),
        phone: localStorage.getItem("phone") || "Unknown",
        reason: localStorage.getItem("financialHelpReason") || "",
        amount: localStorage.getItem("financialHelpAmount") || "",
        status: "pending",
        date: new Date().toISOString(),
      }

      // Get existing requests or initialize empty array
      const existingRequests = JSON.parse(localStorage.getItem("financialHelpRequests") || "[]")

      // Add new request
      const updatedRequests = [...existingRequests, newRequest]

      // Save to localStorage
      localStorage.setItem("financialHelpRequests", JSON.stringify(updatedRequests))

      // Navigate to pending page
      router.push("/financial-help/pending")
    } else {
      setError("Please enter a valid 6-digit PIN")
    }
  }

  // Show verification required screen for unverified users
  if (!isVerified) {
    return <VerificationRequired title="Financial Help" />
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/financial-help/reason" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Confirm with PIN</div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold mb-2">Enter Your PIN</h1>
          <p className="text-gray-600">Please enter your 6-digit PIN to confirm your request</p>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center mb-4">
              <div className="w-48">
                <input
                  type="password"
                  value={pin}
                  onChange={handlePinChange}
                  className="w-full text-center text-2xl tracking-widest border-b-2 border-gray-300 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="• • • • • •"
                  inputMode="numeric"
                  autoFocus
                />
                {error && <p className="text-red-500 text-xs mt-1 text-center">{error}</p>}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={pin.length !== 6}
                className={`w-full max-w-xs py-3 px-4 rounded-md font-medium ${
                  pin.length === 6 ? "bg-[#29a9eb] text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                Confirm Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
