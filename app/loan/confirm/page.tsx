"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import VerificationRequired from "@/components/verification-required"

export default function LoanConfirmPage() {
  const [isVerified, setIsVerified] = useState(false)
  const [applicationData, setApplicationData] = useState<any>(null)
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

    // Get application data
    const appData = localStorage.getItem("loanApplication")
    if (appData) {
      setApplicationData(JSON.parse(appData))
    } else {
      router.push("/loan/apply")
    }
  }, [router])

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPin(value)
      setError("")
    }
  }

  const handleConfirm = () => {
    if (pin.length === 6) {
      // Create loan record
      const loanData = {
        amount: 1000,
        serviceCharge: 29,
        date: new Date().toLocaleDateString(),
        status: "active",
        applicationData,
      }

      // Save active loan
      localStorage.setItem("activeLoan", JSON.stringify(loanData))

      // Add loan amount to balance
      const currentBalance = Number(localStorage.getItem("userBalance") || 0)
      const newBalance = currentBalance + 1000
      localStorage.setItem("userBalance", newBalance.toString())

      // Clear application data
      localStorage.removeItem("loanApplication")

      // Navigate to success page
      router.push("/loan/success")
    } else {
      setError("Please enter a valid 6-digit PIN")
    }
  }

  // Show verification required screen for unverified users
  if (!isVerified) {
    return <VerificationRequired title="Loan Confirmation" />
  }

  if (!applicationData) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/loan/apply" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Confirm Loan</div>
      </div>

      <div className="p-6 flex-1">
        <div className="space-y-6">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-xl font-bold mb-2">Confirm Your Loan</h1>
            <p className="text-gray-600">Review your loan details</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-3">Loan Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Loan Amount:</span>
                <span className="font-medium text-blue-800">Tk1,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Monthly Service Charge:</span>
                <span className="font-medium text-blue-800">Tk29</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Processing Fee:</span>
                <span className="font-medium text-blue-800">Tk0</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">You will receive:</span>
                <span className="font-bold text-blue-800">Tk1,000</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Application Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span>{applicationData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span>{applicationData.phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Occupation:</span>
                <span className="capitalize">{applicationData.occupation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Purpose:</span>
                <span className="capitalize">{applicationData.purpose}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Enter Your PIN to Confirm</h3>
            <div className="flex justify-center">
              <input
                type="password"
                value={pin}
                onChange={handlePinChange}
                className="w-48 text-center text-2xl tracking-widest border-b-2 border-gray-300 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="• • • • • •"
                inputMode="numeric"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          </div>

          <button
            onClick={handleConfirm}
            disabled={pin.length !== 6}
            className={`w-full py-3 px-4 rounded-md font-medium ${
              pin.length === 6 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            Confirm Loan
          </button>
        </div>
      </div>
    </div>
  )
}
