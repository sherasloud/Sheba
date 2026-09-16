"use client"

import { useEffect, useState } from "react"
import { CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function SavingsSuccessPage() {
  const searchParams = useSearchParams()
  const [type, setType] = useState("")
  const [amount, setAmount] = useState("")

  useEffect(() => {
    setType(searchParams.get("type") || "")
    setAmount(searchParams.get("amount") || "")
  }, [searchParams])

  return (
    <div className="flex flex-col h-screen bg-white max-w-sm mx-auto">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/savings" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Transaction Successful</div>
      </div>

      <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
        <CheckCircle className="text-green-500 mb-6" size={80} />

        <h1 className="text-2xl font-bold mb-4">
          {type === "add" ? "Money Added Successfully!" : "Money Withdrawn Successfully!"}
        </h1>

        <div className="text-lg mb-2">Amount: Tk{Number(amount).toLocaleString()}</div>

        <p className="text-gray-600 mb-8">
          {type === "add"
            ? "Your money has been added to savings account"
            : "Your money has been withdrawn from savings account"}
        </p>

        <div className="w-full space-y-3">
          <Link
            href="/savings"
            className="block w-full bg-[#29a9eb] text-white py-3 rounded-lg text-center font-medium"
          >
            Back to Savings
          </Link>

          <Link
            href="/savings/history"
            className="block w-full border border-[#29a9eb] text-[#29a9eb] py-3 rounded-lg text-center font-medium"
          >
            View Transaction History
          </Link>
        </div>
      </div>
    </div>
  )
}
