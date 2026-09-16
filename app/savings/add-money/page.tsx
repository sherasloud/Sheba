"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  getSavingsGoals,
  saveSavingsGoals,
  getSavingsTransactions,
  saveSavingsTransactions,
} from "@/lib/savings-maturity-system"

export default function AddMoneyToGoalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const goalId = searchParams.get("goalId")

  const [balance, setBalance] = useState(0)
  const [goal, setGoal] = useState(null)
  const [amount, setAmount] = useState("")
  const [pin, setPin] = useState("")
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const userBalance = localStorage.getItem("userBalance")
    if (userBalance) {
      setBalance(Number(userBalance))
    }

    // Find the specific goal
    const goals = getSavingsGoals()
    const foundGoal = goals.find((g) => g.id === goalId)
    if (foundGoal) {
      setGoal(foundGoal)
    } else {
      router.push("/savings")
    }
  }, [goalId, router])

  useEffect(() => {
    setError("")
  }, [amount, pin])

  const handleNextStep = () => {
    if (step === 1) {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setError("Please enter a valid amount")
        return
      }
      if (Number(amount) > balance) {
        setError("Insufficient Balance!")
        return
      }

      const remainingAmount = goal.targetAmount - goal.currentAmount
      if (Number(amount) > remainingAmount) {
        setError(`Cannot add more than Tk${remainingAmount.toLocaleString()}. Goal will be complete.`)
        return
      }

      setStep(2)
    }
  }

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleAddMoney = () => {
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError("Please enter a valid 6-digit PIN")
      return
    }

    const correctPin = localStorage.getItem("userPIN") || "123456"
    if (pin !== correctPin) {
      setError("Incorrect PIN")
      return
    }

    const addAmount = Number(amount)
    const newMainBalance = balance - addAmount

    // Update main balance
    setBalance(newMainBalance)
    localStorage.setItem("userBalance", newMainBalance.toString())

    // Update user data
    const userData = localStorage.getItem("userData")
    if (userData) {
      const user = JSON.parse(userData)
      user.balance = newMainBalance
      localStorage.setItem("userData", JSON.stringify(user))
    }

    // Update the specific goal
    const goals = getSavingsGoals()
    const goalIndex = goals.findIndex((g) => g.id === goalId)
    if (goalIndex !== -1) {
      goals[goalIndex].currentAmount += addAmount
      saveSavingsGoals(goals)
      setGoal(goals[goalIndex])
    }

    // Add transaction record
    const transactions = getSavingsTransactions()
    const newTransaction = {
      id: `ADD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      goalId: goalId,
      goalName: goal.name,
      amount: addAmount,
      type: "deposit",
      date: new Date().toISOString(),
      description: `Added Tk${addAmount.toLocaleString()} to "${goal.name}" savings goal`,
    }

    transactions.unshift(newTransaction)
    saveSavingsTransactions(transactions)

    // Trigger storage events
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "userBalance",
        newValue: newMainBalance.toString(),
        oldValue: balance.toString(),
      }),
    )

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "savingsGoals",
        newValue: JSON.stringify(goals),
      }),
    )

    setSuccess(true)
  }

  const quickAmounts = [500, 1000, 2000, 5000]

  if (!goal) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (success) {
    return (
      <div className="flex flex-col h-screen bg-white max-w-sm mx-auto">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <Link href="/savings" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <div className="text-xl font-medium">Add Money</div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2">Money Added!</h2>
          <p className="text-gray-600 mb-4">Successfully added to {goal.name}</p>

          <div className="bg-gray-100 w-full rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Amount Added:</span>
              <span className="font-bold">Tk{amount}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Goal Progress:</span>
              <span className="font-bold text-green-600">Tk{goal.currentAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Target Amount:</span>
              <span className="font-bold">Tk{goal.targetAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Remaining Balance:</span>
              <span className="font-bold">Tk{balance.toLocaleString()}</span>
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
        <div className="text-xl font-medium">Add Money to {goal.name}</div>
      </div>

      {step === 1 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">Add More Money</div>
          <div className="text-gray-600 mb-8">Top up your "{goal.name}" savings goal</div>

          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Your Balance: Tk{balance.toLocaleString()}</div>
            <div className="text-sm text-blue-600 mb-2">
              Current: Tk{goal.currentAmount.toLocaleString()} / Tk{goal.targetAmount.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 mb-4 font-bold">
              Can Add Maximum: Tk{(goal.targetAmount - goal.currentAmount).toLocaleString()}
            </div>
          </div>

          <div className="mb-2 flex items-center">
            <div className="mr-2">💰</div>
            <div>Amount to Add (Tk)</div>
          </div>

          <input
            type="text"
            className="border rounded-md p-4 mb-4 text-center text-2xl"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />

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

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <button className="bg-[#29a9eb] text-white p-4 rounded-md mt-auto" onClick={handleNextStep}>
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="p-6 flex flex-col flex-1">
          <div className="text-2xl font-bold mb-2">Enter PIN</div>
          <div className="text-gray-600 mb-1">Amount: Tk{amount}</div>
          <div className="text-gray-600 mb-8">Adding to "{goal.name}"</div>

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
            <button className="flex-1 bg-[#29a9eb] text-white p-4 rounded-md ml-2" onClick={handleAddMoney}>
              Add Money
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
