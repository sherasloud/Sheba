"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Share2 } from "lucide-react"
import Link from "next/link"

export default function LoanSuccessPage() {
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    // Get updated balance
    const currentBalance = localStorage.getItem("userBalance")
    if (currentBalance) {
      setBalance(Number(currentBalance))
    }
  }, [])

  const handleShare = async () => {
    const shareData = {
      title: "Sheba Loan Approved",
      text: "I just got approved for a Tk1,000 loan from Sheba! Quick and easy process.",
      url: window.location.origin,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const text = `${shareData.text} ${shareData.url}`
      navigator.clipboard.writeText(text)
      alert("Loan details copied to clipboard!")
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-green-500 text-white p-4 flex items-center justify-between">
        <div className="text-xl font-medium">Loan Approved</div>
        <button onClick={handleShare} className="p-2">
          <Share2 size={20} />
        </button>
      </div>

      <div className="p-6 flex-1 flex flex-col items-center justify-center">
        <div className="text-center space-y-6">
          <CheckCircle className="mx-auto h-24 w-24 text-green-500" />

          <div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Loan Approved!</h1>
            <p className="text-gray-600">Your loan has been processed successfully</p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-800 mb-4">Loan Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-700">Loan Amount:</span>
                <span className="font-bold text-green-800">Tk1,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Monthly Service Charge:</span>
                <span className="font-medium text-green-800">Tk29</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Current Balance:</span>
                <span className="font-bold text-green-800">Tk{balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Next Payment Due:</span>
                <span className="font-medium text-green-800">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Important Reminders</h4>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• Pay Tk29 monthly service charge on time</li>
              <li>• You can repay the full amount anytime</li>
              <li>• Late payments may incur additional charges</li>
              <li>• Check your loan status in the Loan section</li>
            </ul>
          </div>

          <div className="space-y-3 w-full">
            <Link
              href="/loan"
              className="block w-full bg-green-500 text-white py-3 px-4 rounded-md font-medium text-center"
            >
              View Loan Details
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-md font-medium text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
