"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Download, Share2, Home } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DonateSuccessPage() {
  const router = useRouter()
  const [transaction, setTransaction] = useState<any>(null)

  useEffect(() => {
    const txn = localStorage.getItem("donationTransaction")
    if (txn) {
      setTransaction(JSON.parse(txn))
    }
  }, [])

  const handleDownloadReceipt = () => {
    alert("Receipt downloaded successfully!")
  }

  const handleShare = () => {
    if (navigator.share && transaction) {
      navigator.share({
        title: "Donation Receipt",
        text: `Donation of Tk${transaction.amount.toLocaleString()} to ${transaction.charity.name} completed successfully. Transaction ID: ${transaction.transactionId}`,
      })
    } else {
      const text = `Donation of Tk${transaction.amount.toLocaleString()} to ${transaction.charity.name} completed successfully. Transaction ID: ${transaction.transactionId}`
      navigator.clipboard.writeText(text)
      alert("Donation details copied to clipboard!")
    }
  }

  const handleHome = () => {
    // Instant navigation to home
    router.push("/")
  }

  if (!transaction) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4">
          <div className="text-xl font-medium text-center">Donation Status</div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Transaction Not Found</h2>
            <button onClick={() => router.push("/donate")} className="text-[#29a9eb]">
              Go back to Donate
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4">
        <div className="text-xl font-medium text-center">Donation Successful</div>
      </div>

      <div className="flex-1 flex flex-col justify-center p-6">
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Donation Successful!</h1>
          <p className="text-gray-600">Your donation has been processed successfully</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <img
                src={transaction.charity.logo || "/placeholder.svg"}
                alt={transaction.charity.name}
                className="w-10 h-10 rounded-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{transaction.charity.name}</h3>
              <p className="text-sm text-gray-600">{transaction.charity.category}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Donation Amount</span>
              <span className="font-bold text-[#29a9eb]">Tk{transaction.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-medium">{transaction.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time</span>
              <span className="font-medium">{new Date(transaction.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="font-medium text-green-600 capitalize">{transaction.status}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDownloadReceipt}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center"
          >
            <Download className="mr-2" size={20} />
            Download Receipt
          </button>

          <button
            onClick={handleShare}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center"
          >
            <Share2 className="mr-2" size={20} />
            Share Receipt
          </button>

          <button
            onClick={handleHome}
            className="w-full bg-[#29a9eb] text-white py-3 rounded-lg font-medium flex items-center justify-center"
          >
            <Home className="mr-2" size={20} />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
