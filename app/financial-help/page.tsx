"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import VerificationRequired from "@/components/verification-required"

export default function FinancialHelpPage() {
  const [isVerified, setIsVerified] = useState(false)
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

  // Show verification required screen for unverified users
  if (!isVerified) {
    return <VerificationRequired title="Financial Help" />
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/help" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Financial Help</div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="text-center mb-8 mt-4">
          <h1 className="text-2xl font-bold mb-3">Request Financial Assistance</h1>
          <p className="text-gray-600">
            We're here to help during difficult times. Please provide details about your situation.
          </p>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="w-full max-w-md space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-2">How It Works</h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Explain your situation and the amount needed</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>Confirm your request with your PIN</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>Our team will review your request</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    4
                  </span>
                  <span>If approved, funds will be sent to your account</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => router.push("/financial-help/reason")}
              className="w-full bg-[#29a9eb] text-white py-3 px-4 rounded-md font-medium"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
