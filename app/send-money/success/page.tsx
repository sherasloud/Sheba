"use client"

import { useEffect, useState } from "react"
import { CheckCircle, ArrowLeft, Home, Share2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { realNotificationSystem } from "@/lib/real-notification-system"

export default function SendMoneySuccessPage() {
  const searchParams = useSearchParams()
  const [transactionData, setTransactionData] = useState<any>(null)

  useEffect(() => {
    // Get transaction data from URL params or localStorage
    const amount = searchParams.get("amount")
    const phoneNumber = searchParams.get("phone")
    const reference = searchParams.get("reference")

    if (amount && phoneNumber) {
      const data = {
        amount: Number.parseInt(amount),
        phoneNumber,
        reference: reference || `TXN${Date.now()}`,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      }
      setTransactionData(data)

      // Trigger real notification for send money
      realNotificationSystem.triggerTransactionNotification("sent", Number.parseInt(amount), phoneNumber)

      // Add to transaction history
      const newTransaction = {
        id: Date.now(),
        type: "Send Money",
        amount: -Number.parseInt(amount),
        to: phoneNumber,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }

      // Update localStorage transactions
      const existingTransactions = JSON.parse(localStorage.getItem("transactions") || "[]")
      const updatedTransactions = [newTransaction, ...existingTransactions]
      localStorage.setItem("transactions", JSON.stringify(updatedTransactions))

      // Dispatch custom event for real-time updates
      window.dispatchEvent(
        new CustomEvent("newTransaction", {
          detail: newTransaction,
        }),
      )
    }
  }, [searchParams])

  if (!transactionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <ArrowLeft size={24} className="mr-2" />
          <span>Back to Home</span>
        </Link>
        <div className="text-lg font-medium">Transaction Complete</div>
      </div>

      {/* Success Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-green-100 rounded-full p-6 mb-6">
          <CheckCircle size={64} className="text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Money Sent Successfully!</h1>
        <p className="text-gray-600 text-center mb-8">Your transaction has been completed successfully</p>

        {/* Transaction Details */}
        <div className="w-full max-w-md bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Transaction Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Sent:</span>
              <span className="font-semibold text-green-600">Tk{transactionData.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To:</span>
              <span className="font-semibold">{transactionData.phoneNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-semibold">{transactionData.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time:</span>
              <span className="font-semibold">
                {transactionData.date} at {transactionData.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-green-600">Completed</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-4">
          <Link
            href="/"
            className="w-full bg-[#29a9eb] text-white py-3 px-6 rounded-lg flex items-center justify-center font-medium"
          >
            <Home size={20} className="mr-2" />
            Back to Home
          </Link>

          <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg flex items-center justify-center font-medium">
            <Share2 size={20} className="mr-2" />
            Share Receipt
          </button>

          <Link
            href="/send-money"
            className="w-full border border-[#29a9eb] text-[#29a9eb] py-3 px-6 rounded-lg flex items-center justify-center font-medium"
          >
            Send Money Again
          </Link>
        </div>
      </div>
    </div>
  )
}
