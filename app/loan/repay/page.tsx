"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoanRepayPage() {
  const [loanData, setLoanData] = useState<any>(null)
  const [paymentType, setPaymentType] = useState("service") // 'service' or 'full'
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Get active loan data
    const activeLoan = localStorage.getItem("activeLoan")
    if (activeLoan) {
      setLoanData(JSON.parse(activeLoan))
    } else {
      router.push("/loan")
    }
  }, [router])

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPin(value)
      setError("")
    }
  }

  const handlePayment = () => {
    if (pin.length === 6) {
      const currentBalance = Number(localStorage.getItem("userBalance") || 0)
      const paymentAmount = paymentType === "service" ? 29 : 1029

      if (currentBalance >= paymentAmount) {
        // Deduct payment from balance
        const newBalance = currentBalance - paymentAmount
        localStorage.setItem("userBalance", newBalance.toString())

        if (paymentType === "full") {
          // Clear active loan
          localStorage.removeItem("activeLoan")
        }

        // Navigate to success page
        router.push(`/loan/payment-success?type=${paymentType}&amount=${paymentAmount}`)
      } else {
        setError("Insufficient balance for this payment")
      }
    } else {
      setError("Please enter a valid 6-digit PIN")
    }
  }

  if (!loanData) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/loan" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Loan Repayment</div>
      </div>

      <div className="p-6 flex-1">
        <div className="space-y-6">
          <div className="text-center">
            <CreditCard className="mx-auto h-16 w-16 text-[#29a9eb] mb-4" />
            <h1 className="text-xl font-bold mb-2">Make Payment</h1>
            <p className="text-gray-600">Choose your payment option</p>
          </div>

          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer ${
                paymentType === "service" ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
              onClick={() => setPaymentType("service")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Monthly Service Charge</h3>
                  <p className="text-sm text-gray-600">Pay this month's service charge</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">Tk29</div>
                  <div className="text-xs text-gray-500">Due today</div>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border-2 cursor-pointer ${
                paymentType === "full" ? "border-green-500 bg-green-50" : "border-gray-200"
              }`}
              onClick={() => setPaymentType("full")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Full Repayment</h3>
                  <p className="text-sm text-gray-600">Pay loan amount + service charge</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">Tk1,029</div>
                  <div className="text-xs text-gray-500">Close loan</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Payment Breakdown</h3>
            <div className="space-y-2 text-sm">
              {paymentType === "service" ? (
                <>
                  <div className="flex justify-between">
                    <span>Service Charge:</span>
                    <span>Tk29</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining Loan:</span>
                    <span>Tk1,000</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Loan Amount:</span>
                    <span>Tk1,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Charge:</span>
                    <span>Tk29</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total Payment:</span>
                    <span>Tk1,029</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Enter Your PIN</h3>
            <div className="flex justify-center">
              <input
                type="password"
                value={pin}
                onChange={handlePinChange}
                className="w-48 text-center text-2xl tracking-widest border-b-2 border-gray-300 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="• • • • • •"
                inputMode="numeric"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          </div>

          <button
            onClick={handlePayment}
            disabled={pin.length !== 6}
            className={`w-full py-3 px-4 rounded-md font-medium ${
              pin.length === 6
                ? paymentType === "service"
                  ? "bg-blue-500 text-white"
                  : "bg-green-500 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            Pay Tk{paymentType === "service" ? "29" : "1,029"}
          </button>
        </div>
      </div>
    </div>
  )
}
