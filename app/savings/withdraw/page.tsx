"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function WithdrawFromSavingsPage() {
  const [balance, setBalance] = useState(0)
  const [savingsBalance, setSavingsBalance] = useState(0)
  const [amount, setAmount] = useState("")
  const [pin, setPin] = useState("")
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const userBalance = localStorage.getItem("userBalance")
    const savedSavings = localStorage.getItem("savingsBalance")

    if (userBalance) {
      setBalance(Number(userBalance))
    }
    if (savedSavings) {
      setSavingsBalance(Number(savedSavings))
    }
  }, [])

  useEffect(() => {
    setError("")
  }, [amount, pin])

  const handleNextStep = () => {
    if (step === 1) {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setError("Please enter a valid amount")
        return
      }
      if (Number(amount) > savingsBalance) {
        setError("Insufficient Savings Balance!")
        return
      }
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleWithdraw = () => {
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError("Please enter a valid 6-digit PIN")
      return
    }

    const correctPin = localStorage.getItem("userPIN") || "123456"
    if (pin !== correctPin) {
      setError("Incorrect PIN")
      return
    }

    const withdrawAmount = Number(amount)
    const newBalance = balance + withdrawAmount
    const newSavings = savingsBalance - withdrawAmount

    setBalance(newBalance)
    setSavingsBalance(newSavings)

    localStorage.setItem("userBalance", newBalance.toString())
    localStorage.setItem("savingsBalance", newSavings.toString())

    // Add transaction record
    const transactions = JSON.parse(localStorage.getItem("savingsTransactions") || "[]")
    transactions.unshift({
      id: Date.now(),
      type: "withdrawal",
      amount: withdrawAmount,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      description: "Money withdrawn from savings",
    })
    localStorage.setItem("savingsTransactions", JSON.stringify(transactions))

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "userBalance",
        newValue: newBalance.toString(),
        oldValue: balance.toString(),
      }),
    )

    setSuccess(true)
  }

  const quickAmounts = [500, 1000, 2000, 5000].filter((amt) => amt <= savingsBalance)

  if (success) {
    return (
      <div className="flex flex-col h-screen bg-white max-w-sm mx-auto">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <Link href="/savings" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <div className="text-xl font-medium">Withdraw from Savings</div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2">Success!</h2>
          <p className="text-gray-600 mb-4">Money withdrawn successfully</p>

          <div className="bg-gray-100 w-full rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Amount Withdrawn:</span>
              <span className="font-bold">Tk{amount}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">New Main Balance:</span>
              <span className="font-bold text-[#29a9eb]">Tk{balance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Remaining Savings:</span>
              <span className="font-bold text-green-600">Tk{savingsBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Interest:</span>
              <span className="font-bold text-green-600">Tk{Math.floor(savingsBalance / 1000) * 7}</span>
            </div>
          </div>

          <Link href="/savings" className="bg-[#29a9eb] text-white py-3 px-6 rounded-md w-full text-center">
            Done
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white max-w-sm mx-auto">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/savings" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Withdraw from Savings</div>
      </div>

      {step === 1 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">Withdraw from Savings</div>
          <div className="text-gray-600 mb-8">Transfer to main balance</div>

          <div className="mb-4">
            <div className="text-sm text-green-600 mb-2">Savings Balance: Tk{savingsBalance.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mb-4">Main Balance: Tk{balance.toLocaleString()}</div>
          </div>

          <div className="mb-2 flex items-center">
            <div className="mr-2">💸</div>
            <div>Amount to Withdraw (Tk)</div>
          </div>

          <input
            type="text"
            className="border rounded-md p-4 mb-4 text-center text-2xl"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />

          {quickAmounts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Amount</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="p-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50"
                  >
                    Tk{quickAmount}
                  </button>
                ))}
              </div>
            </div>
          )}

          {amount && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-yellow-800">
                <div>New Monthly Interest: Tk{Math.floor((savingsBalance - Number(amount)) / 1000) * 7}</div>
                <div>Interest Reduction: Tk{Math.floor(Number(amount) / 1000) * 7}</div>
              </div>
            </div>
          )}

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <button
            className="bg-[#29a9eb] text-white p-4 rounded-md mt-auto"
            onClick={handleNextStep}
            disabled={savingsBalance === 0}
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">Confirm Withdrawal</div>
          <div className="text-gray-600 mb-8">Please review your withdrawal</div>

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Amount to Withdraw:</span>
              <span className="font-bold text-lg">Tk{Number(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Current Savings:</span>
              <span className="font-bold text-green-600">Tk{savingsBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Current Main Balance:</span>
              <span className="font-bold">Tk{balance.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">New Savings Balance:</span>
                <span className="font-bold text-green-600">Tk{(savingsBalance - Number(amount)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Main Balance:</span>
                <span className="font-bold">Tk{(balance + Number(amount)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex mt-auto">
            <button className="flex-1 border border-gray-300 p-4 rounded-md mr-2" onClick={handleBackStep}>
              Back
            </button>
            <button className="flex-1 bg-[#29a9eb] text-white p-4 rounded-md ml-2" onClick={handleNextStep}>
              Confirm
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">Enter PIN</div>
          <div className="text-gray-600 mb-1">Amount: Tk{amount}</div>
          <div className="text-gray-600 mb-8">Withdrawing from Savings</div>

          <div className="mb-2 flex items-center">
            <div className="mr-2">🔒</div>
            <div>6-Digit PIN</div>
          </div>

          <input
            type="password"
            className="border rounded-md p-4 mb-2 text-center"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={6}
            placeholder="••••••"
          />

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="flex mt-auto">
            <button className="flex-1 border border-gray-300 p-4 rounded-md mr-2" onClick={handleBackStep}>
              Back
            </button>
            <button className="flex-1 bg-[#29a9eb] text-white p-4 rounded-md ml-2" onClick={handleWithdraw}>
              Withdraw
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
