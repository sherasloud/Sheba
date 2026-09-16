"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function CashbackOfferPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="mobile-page items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#29a9eb]"></div>
        <p className="mt-4 text-gray-600 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/" className="mr-4 touch-manipulation">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-semibold">Special Offer</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4">
        {/* Hero image */}
        <div className="w-full h-48 rounded-xl overflow-hidden mb-6">
          <img src="/images/promo-banner.png" alt="Cashback offer - 1 Taka" className="w-full h-full object-cover" />
        </div>

        {/* Offer details */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h2 className="text-xl font-bold mb-2">Cashback Offer - 1 Taka per 1000!</h2>
          <p className="text-gray-700 mb-4">
            Join our special offer and get 1 Taka cashback for every 1000 Taka transaction. Limited time offer.
          </p>

          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <h3 className="font-semibold text-blue-800 mb-1">Offer Details:</h3>
            <ul className="list-disc pl-5 text-blue-700">
              <li>1 Taka cashback per 1000 Taka transaction</li>
              <li>Maximum cashback: 100 Taka</li>
              <li>Offer valid until: June 30, 2025</li>
            </ul>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="font-semibold mb-2">How to participate:</h3>
            <ol className="list-decimal pl-5 text-gray-700">
              <li className="mb-2">Login to your Sheba account</li>
              <li className="mb-2">Make any transaction (minimum 1000 Taka)</li>
              <li className="mb-2">Cashback will be automatically added to your account</li>
            </ol>
          </div>
        </div>

        {/* Terms and conditions */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Terms and Conditions:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• This offer is only applicable for verified accounts</li>
            <li>• Maximum cashback per user is 100 Taka</li>
            <li>• Sheba reserves the right to change the terms and conditions at any time</li>
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-4 border-t border-gray-200">
        <Link href="/" className="block w-full bg-[#29a9eb] text-white text-center py-4 rounded-lg font-medium">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
