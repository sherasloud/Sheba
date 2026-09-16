"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import VerificationRequired from "@/components/verification-required"

export default function FinancialHelpReasonPage() {
  const [isVerified, setIsVerified] = useState(false)
  const [reason, setReason] = useState("")
  const [amount, setAmount] = useState("")
  const [isValid, setIsValid] = useState(false)
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
  }, [])

  useEffect(() => {
    // Validate form
    setIsValid(reason.trim().length > 10 && Number(amount) >= 500)
  }, [reason, amount])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Save data to localStorage
    localStorage.setItem("financialHelpReason", reason)
    localStorage.setItem("financialHelpAmount", amount)

    // Navigate to PIN page
    router.push("/financial-help/pin")
  }

  // Show verification required screen for unverified users
  if (!isVerified) {
    return <VerificationRequired title="Financial Help" />
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/financial-help" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Request Details</div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Financial Help</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded-md p-3 text-sm"
              rows={5}
              required
              placeholder="Please explain your situation in detail..."
            />
            {reason && reason.length < 10 && (
              <p className="text-xs text-red-500 mt-1">Please provide more details about your situation</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount Needed (Tk)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">Tk</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border rounded-md p-3 pl-10 text-sm"
                required
                placeholder="Enter amount in Taka"
                min="500"
              />
            </div>
            {amount && Number(amount) < 500 && (
              <p className="text-xs text-red-500 mt-1">Minimum request amount is Tk500</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-3 px-4 rounded-md font-medium ${
              isValid ? "bg-[#29a9eb] text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
