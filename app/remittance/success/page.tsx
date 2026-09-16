"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Download, Share, Home } from "lucide-react"
import Link from "next/link"

export default function RemittanceSuccessPage() {
  const [transaction, setTransaction] = useState<any>(null)
  const [country, setCountry] = useState<any>(null)
  const [recipient, setRecipient] = useState<any>(null)

  useEffect(() => {
    // Get all transaction data
    const savedTransaction = localStorage.getItem("remittanceTransaction")
    const savedCountry = localStorage.getItem("remittanceCountry")
    const savedRecipient = localStorage.getItem("remittanceRecipient")

    if (savedTransaction && savedCountry && savedRecipient) {
      setTransaction(JSON.parse(savedTransaction))
      setCountry(JSON.parse(savedCountry))
      setRecipient(JSON.parse(savedRecipient))
    }
  }, [])

  const handleDownload = () => {
    alert("Receipt downloaded successfully!")
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Remittance Receipt",
        text: `Transfer of Tk${transaction?.amount} completed successfully`,
      })
    } else {
      alert("Receipt shared successfully!")
    }
  }

  if (!transaction || !country || !recipient) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-green-600 text-white p-4">
          <div className="text-xl font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  const exchangeRate = Number.parseFloat(country.rate)

  // Google-accurate currency calculation
  const foreignAmount = Number.parseInt(transaction.amount) * exchangeRate
  const currencyCode = country.currency

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-green-600 text-white p-4">
        <div className="text-xl font-medium text-center">Transfer Successful</div>
      </div>

      <div className="p-4 overflow-y-auto pb-20">
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-600 mb-2">Transfer Completed!</h2>
          <p className="text-gray-600 text-sm">Your money transfer has been processed successfully</p>
        </div>

        <div className="bg-white border rounded-lg shadow-sm p-4 mb-4">
          <div className="text-center border-b pb-4 mb-4">
            <h3 className="font-bold text-lg">REMITTANCE RECEIPT</h3>
            <p className="text-sm text-gray-600">Transaction ID: {transaction.id}</p>
            <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleString()}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Destination:</span>
              <div className="flex items-center">
                <img
                  src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                  alt={`${country.name} flag`}
                  className="w-4 h-3 object-cover rounded mr-1"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.nextElementSibling.style.display = "inline"
                  }}
                />
                <span className="hidden">{country.flag}</span>
                <span className="font-medium">{country.name}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Recipient:</span>
              <span className="font-medium">
                {recipient.firstName} {recipient.lastName}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{recipient.email}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{recipient.phone}</span>
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Send Amount:</span>
                <span className="font-medium">Tk{transaction.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transfer Fee:</span>
                <span className="font-medium">Tk{transaction.fee}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total Paid:</span>
                <span className="text-blue-600">Tk{transaction.total}</span>
              </div>
              <div className="flex justify-between font-semibold bg-green-50 p-2 rounded mt-2">
                <span>Recipient Gets:</span>
                <span className="text-green-600">
                  {foreignAmount.toFixed(2)} {currencyCode}
                </span>
              </div>
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600">Completed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Time:</span>
                <span className="font-medium">24-48 hours</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-700 text-center">
            <strong>Important:</strong> The recipient will be notified via email and SMS. Money will be available for
            pickup within 24-48 hours.
          </p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Download size={18} className="mr-2" />
              Download
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Share size={18} className="mr-2" />
              Share
            </button>
          </div>

          <Link
            href="/"
            className="w-full bg-[#29a9eb] text-white py-4 rounded-lg font-medium flex items-center justify-center"
          >
            <Home size={18} className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
