"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TransferPage() {
  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Transfer Funds</div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <p className="mb-4">Choose a transfer method:</p>

        <div className="grid grid-cols-1 gap-4">
          {/* Sheba to Card Option */}
          <Link
            href="/transfer/card"
            className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300"
          >
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">💰➡️💳</div>
              <div className="text-lg font-semibold">Sheba to Card</div>
            </div>
          </Link>

          {/* Bank Transfer Option */}
          <Link
            href="/transfer/bank"
            className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300"
          >
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">🏦</div>
              <div className="text-lg font-semibold">Bank Transfer</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
