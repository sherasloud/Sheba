"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import VerificationRequired from "@/components/verification-required"

export default function FinancialHelpPendingPage() {
  const [isVerified, setIsVerified] = useState(false)
  const [amount, setAmount] = useState("")
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

    // Get amount from localStorage
    const storedAmount = localStorage.getItem("financialHelpAmount")
    if (storedAmount) {
      setAmount(storedAmount)
    } else {
      // If no amount, redirect back to reason page
      router.push("/financial-help/reason")
    }
  }, [router])

  // Show verification required screen for unverified users
  if (!isVerified) {
    return <VerificationRequired title="Financial Help" />
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Request Pending</div>
      </div>

      <div className="p-6 flex flex-col flex-1 items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="animate-pulse absolute inset-0 flex items-center justify-center">
              <Clock size={80} className="text-[#29a9eb]" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-3">Your request is being reviewed</h1>

          <p className="text-gray-600 mb-6">
            We've received your request for Tk{amount}. Our team is checking your information and will process it as
            soon as possible.
          </p>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
              className="bg-[#29a9eb] h-2.5 rounded-full animate-[progress_2s_ease-in-out_infinite]"
              style={{ width: "70%" }}
            ></div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-left mb-6">
            <h3 className="font-medium text-blue-800 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>Our team will review your request (typically within 24-48 hours)</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>You'll receive a notification when a decision is made</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>If approved, funds will be transferred to your account immediately</span>
              </li>
            </ul>
          </div>

          <Link href="/" className="block w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-md font-medium">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
