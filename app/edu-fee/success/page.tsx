"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Home, Download, Share2 } from "lucide-react"
import Link from "next/link"

export default function EduFeeSuccessPage() {
  const [transactionDetails, setTransactionDetails] = useState<any>(null)

  useEffect(() => {
    // Get transaction details
    const transactionId = localStorage.getItem("eduFeeTransactionId")
    const timestamp = localStorage.getItem("eduFeeTimestamp")
    const rawInstitution = localStorage.getItem("selectedInstitution")
    const studentId = localStorage.getItem("studentId")
    const amount = localStorage.getItem("eduFeeAmount")

    let institutionName = ""
    let institutionType = ""

    if (rawInstitution) {
      try {
        const institutionData = JSON.parse(rawInstitution)
        institutionName = institutionData.name || rawInstitution
        institutionType = institutionData.type || ""
      } catch {
        institutionName = rawInstitution
        institutionType = ""
      }
    }

    let billType = "Education Fee"
    if (institutionType === "schools") {
      billType = "School Fee"
    } else if (institutionType === "colleges") {
      billType = "College Fee"
    } else if (institutionType === "universities") {
      billType = "University Fee"
    }

    setTransactionDetails({
      transactionId: transactionId || "N/A",
      timestamp: timestamp ? new Date(timestamp).toLocaleString() : "N/A",
      institutionName: institutionName || "N/A",
      studentId: studentId || "N/A",
      billType: billType,
      amount: amount ? Number.parseInt(amount) : 0,
    })
  }, [])

  if (!transactionDetails) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#29a9eb]"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-4 text-center">
        <div className="text-xl font-medium">Payment Successful</div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          {/* Success icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">Your education fee has been paid successfully</p>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-[#29a9eb] mb-3">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Institution:</span>
                <span className="font-medium text-gray-800 text-right flex-1 ml-4">
                  {transactionDetails.institutionName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Student ID:</span>
                <span className="font-medium text-gray-800">{transactionDetails.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bill Type:</span>
                <span className="font-medium text-gray-800">{transactionDetails.billType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-bold text-[#29a9eb] text-lg">Tk{transactionDetails.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium text-gray-800">{transactionDetails.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium text-gray-800 text-right flex-1 ml-4">{transactionDetails.timestamp}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Download className="w-5 h-5 mr-2" />
              Download Receipt
            </button>
            <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Share2 className="w-5 h-5 mr-2" />
              Share Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="bg-white border-t p-4">
        <Link
          href="/home"
          className="w-full bg-[#29a9eb] text-white py-3 rounded-lg font-medium flex items-center justify-center hover:bg-[#2196d3] transition-colors"
        >
          <Home className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
