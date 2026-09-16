"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EduFeePinPage() {
  const router = useRouter()
  const [pin, setPin] = useState("")
  const [institutionName, setInstitutionName] = useState("")
  const [institutionType, setInstitutionType] = useState("")
  const [studentId, setStudentId] = useState("")
  const [amount, setAmount] = useState(0)
  const [billType, setBillType] = useState("")

  useEffect(() => {
    const rawInstitution = localStorage.getItem("selectedInstitution")
    let parsedInstitutionName = ""
    let parsedInstitutionType = ""

    if (rawInstitution) {
      try {
        const institutionData = JSON.parse(rawInstitution)
        parsedInstitutionName = institutionData.name || rawInstitution
        parsedInstitutionType = institutionData.type || ""
      } catch {
        parsedInstitutionName = rawInstitution
        parsedInstitutionType = ""
      }
    }

    const id = localStorage.getItem("studentId") || ""
    const storedAmount = localStorage.getItem("eduFeeAmount")

    setInstitutionName(parsedInstitutionName)
    setInstitutionType(parsedInstitutionType)
    setStudentId(id)
    setAmount(storedAmount ? Number.parseInt(storedAmount) : 0)

    // Set bill type based on institution type
    if (parsedInstitutionType === "schools") {
      setBillType("School Fee")
    } else if (parsedInstitutionType === "colleges") {
      setBillType("College Fee")
    } else if (parsedInstitutionType === "universities") {
      setBillType("University Fee")
    } else {
      setBillType("Education Fee")
    }
  }, [])

  const handlePinChange = (value: string) => {
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setPin(value)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (pin.length !== 6) {
      alert("Please enter a 6-digit PIN")
      return
    }

    if (pin !== "123456") {
      alert("Invalid PIN. Please try again.")
      setPin("")
      return
    }

    // Store transaction details and navigate immediately
    const transactionId = `EDU${Date.now()}`
    const timestamp = new Date().toISOString()

    localStorage.setItem("eduFeeTransactionId", transactionId)
    localStorage.setItem("eduFeeTimestamp", timestamp)
    localStorage.setItem(
      "selectedBill",
      JSON.stringify({
        title: billType,
        amount: amount,
      }),
    )

    // Update balance
    const currentBalance = Number.parseFloat(localStorage.getItem("userBalance") || "25000")
    const newBalance = currentBalance - amount
    localStorage.setItem("userBalance", newBalance.toString())

    router.push("/edu-fee/success")
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <button onClick={() => router.push("/edu-fee/amount")} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div className="text-xl font-medium">Enter PIN</div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        {/* Payment Summary */}
        <div className="bg-blue-50 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-[#29a9eb] mb-3">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Institution:</span>
              <span className="font-medium text-gray-800 text-right flex-1 ml-4">{institutionName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Student ID:</span>
              <span className="font-medium text-gray-800">{studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bill Type:</span>
              <span className="font-medium text-gray-800">{billType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-[#29a9eb] text-lg">Tk{amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* PIN Input */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Enter your PIN to confirm</h3>
            <p className="text-gray-600 text-sm mb-6">Please enter your 6-digit PIN to complete the payment</p>

            <div className="flex justify-center mb-6">
              <input
                type="password"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                placeholder="••••••"
                maxLength={6}
                className="w-48 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#29a9eb] focus:border-transparent tracking-widest"
                autoFocus
              />
            </div>

            <div className="flex justify-center space-x-2 mb-8">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full ${index < pin.length ? "bg-[#29a9eb]" : "bg-gray-300"}`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={pin.length !== 6}
            className="w-full bg-[#29a9eb] text-white py-4 rounded-lg font-medium text-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#2196d3] transition-colors"
          >
            Confirm Payment
          </button>
        </form>

        {/* Demo PIN info */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-center text-yellow-800 text-sm">
            <strong>Demo PIN:</strong> 123456
          </p>
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Your PIN is encrypted and secure. Never share your PIN with anyone.
        </p>
      </div>
    </div>
  )
}
