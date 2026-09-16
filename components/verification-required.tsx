"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, AlertTriangle, User, CreditCard } from "lucide-react"
import Link from "next/link"

interface VerificationRequiredProps {
  title: string
  backUrl?: string
}

export default function VerificationRequired({ title, backUrl = "/" }: VerificationRequiredProps) {
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check verification status
    const userData = localStorage.getItem("userData")
    const storedVerified = localStorage.getItem("isVerified")
    const storedPhone = localStorage.getItem("phoneNumber")

    let verified = false
    if (userData) {
      const user = JSON.parse(userData)
      verified = user.isVerified || false
    } else if (storedVerified) {
      verified = storedVerified === "true"
    }

    // For testing purposes, all accounts are now verified by default
    verified = true
    localStorage.setItem("isVerified", "true")

    // Special check for admin user - ALWAYS verified with admin privileges
    if (storedPhone === "01930314459") {
      verified = true
      // Force update localStorage for admin
      localStorage.setItem("isVerified", "true")
    }

    setIsVerified(verified)
    setIsLoading(false)
  }, [])

  // If verified, return empty div (let the parent component render normally)
  if (isVerified) {
    return <div></div>
  }

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-white items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#29a9eb]"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    )
  }

  // Show verification required screen for unverified users
  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href={backUrl} className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">{title}</div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 p-6">
        <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={40} className="text-white" />
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center">Verification Required</h2>
        <p className="text-gray-600 mb-6 text-center">
          You need to verify your account to access <strong>{title}</strong>
        </p>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6 w-full max-w-md">
          <h3 className="font-bold text-orange-800 mb-3">🔒 Why Verification?</h3>
          <ul className="text-orange-700 text-sm space-y-2">
            <li>• Secure your account and transactions</li>
            <li>• Unlock all Sheba features</li>
            <li>• Get Tk 30 verification bonus</li>
            <li>• Increase transaction limits</li>
            <li>• Access premium services</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 w-full max-w-md">
          <h3 className="font-bold text-blue-800 mb-2">📋 What You Need:</h3>
          <div className="space-y-2 text-blue-700 text-sm">
            <div className="flex items-center">
              <CreditCard size={16} className="mr-2" />
              <span>National ID (NID) or Birth Certificate</span>
            </div>
            <div className="flex items-center">
              <User size={16} className="mr-2" />
              <span>Personal information</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 w-full max-w-md">
          <Link
            href="/verification"
            className="bg-[#29a9eb] text-white py-3 px-6 rounded-md w-full text-center block font-medium"
          >
            Start Verification Now
          </Link>

          <Link
            href={backUrl}
            className="border border-gray-300 text-gray-700 py-3 px-6 rounded-md w-full text-center block"
          >
            Go Back
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Verification is quick and secure. Your data is protected and encrypted.
          </p>
        </div>
      </div>
    </div>
  )
}
