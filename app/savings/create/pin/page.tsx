"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SavingsPinPage() {
  const router = useRouter()
  const [pin, setPin] = useState("")
  const [savingsName, setSavingsName] = useState("")
  const [savingsAmount, setSavingsAmount] = useState("")
  const [savingsMonths, setSavingsMonths] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [paymentOption, setPaymentOption] = useState<"full" | "monthly">("full")

  useEffect(() => {
    const name = localStorage.getItem("savingsName")
    const amount = localStorage.getItem("savingsAmount")
    const months = localStorage.getItem("savingsMonths")

    if (!name || !amount || !months) {
      router.push("/savings/create/name")
      return
    }

    setSavingsName(name)
    setSavingsAmount(amount)
    setSavingsMonths(months)
  }, [router])

  const handleConfirm = async () => {
    const pinString = pin
    if (pinString.length === 6) {
      setIsLoading(true)

      const currentBalance = Number(localStorage.getItem("userBalance") || "0")
      const targetAmount = Number.parseFloat(savingsAmount)
      const monthlyAmount = Math.ceil(targetAmount / Number.parseInt(savingsMonths))

      // Check balance based on payment option
      const requiredAmount = paymentOption === "full" ? targetAmount : monthlyAmount

      if (currentBalance < requiredAmount) {
        alert(
          `Insufficient balance. You need Tk${requiredAmount.toLocaleString()} but only have Tk${currentBalance.toLocaleString()}`,
        )
        setIsLoading(false)
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create unique goal ID
      const goalId = `GOAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create the savings goal
      const now = new Date()
      const maturityDate = new Date(now)
      maturityDate.setMonth(maturityDate.getMonth() + Number.parseInt(savingsMonths))

      const newGoal = {
        id: goalId,
        name: savingsName,
        targetAmount: targetAmount,
        currentAmount: paymentOption === "full" ? targetAmount : monthlyAmount, // Full amount or first month
        duration: Number.parseInt(savingsMonths),
        monthlyAmount: monthlyAmount,
        createdAt: now.toISOString(),
        maturityDate: maturityDate.toISOString(),
        status: "active",
        paymentType: paymentOption, // Track payment type
      }

      // Deduct from main balance
      const newBalance = currentBalance - requiredAmount
      localStorage.setItem("userBalance", newBalance.toString())

      // Update user data
      const userData = localStorage.getItem("userData")
      if (userData) {
        const user = JSON.parse(userData)
        user.balance = newBalance
        localStorage.setItem("userData", JSON.stringify(user))
      }

      // Save goal to localStorage
      const existingGoals = JSON.parse(localStorage.getItem("savingsGoals") || "[]")
      existingGoals.push(newGoal)
      localStorage.setItem("savingsGoals", JSON.stringify(existingGoals))

      // Create transaction record
      const transactions = JSON.parse(localStorage.getItem("savingsTransactions") || "[]")

      // Check if transaction already exists to prevent duplicates
      const existingTransaction = transactions.find((t) => t.goalId === goalId && t.type === "goal_creation")

      if (!existingTransaction) {
        const description =
          paymentOption === "full"
            ? `Created savings goal "${newGoal.name}" - Tk${targetAmount.toLocaleString()} moved to savings`
            : `Created savings goal "${newGoal.name}" - First payment Tk${monthlyAmount.toLocaleString()}`

        const newTransaction = {
          id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          goalId: goalId,
          goalName: newGoal.name,
          amount: requiredAmount,
          type: "goal_creation",
          date: new Date().toISOString(),
          description: description,
        }

        transactions.unshift(newTransaction) // Add to beginning
        localStorage.setItem("savingsTransactions", JSON.stringify(transactions))
      }

      // Clear the temporary data
      localStorage.removeItem("savingsName")
      localStorage.removeItem("savingsAmount")
      localStorage.removeItem("savingsMonths")

      // Store data for success page
      localStorage.setItem("lastCreatedGoal", JSON.stringify(newGoal))

      router.push("/savings/create/success")
    }
  }

  const monthlyAmount = Math.ceil(Number.parseFloat(savingsAmount) / Number.parseInt(savingsMonths))
  const targetAmount = Number.parseFloat(savingsAmount)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pt-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/50 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Create Savings Goal</h1>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step 4 of 4</span>
            <span>100%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#29a9eb] h-2 rounded-full w-full transition-all duration-300"></div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#29a9eb]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Confirm with PIN</h2>
            <p className="text-gray-600">Choose payment option and enter PIN</p>
          </div>

          {/* Payment Options */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-3">Payment Options</h3>
            <div className="space-y-3">
              {/* Full Payment Option */}
              <button
                onClick={() => setPaymentOption("full")}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  paymentOption === "full" ? "border-[#29a9eb] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div className="font-medium text-gray-800">Pay Full Amount</div>
                    <div className="text-sm text-gray-500">Deduct entire amount now</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[#29a9eb]">Tk{targetAmount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">One-time payment</div>
                  </div>
                </div>
              </button>

              {/* Monthly Payment Option */}
              <button
                onClick={() => setPaymentOption("monthly")}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  paymentOption === "monthly" ? "border-[#29a9eb] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div className="font-medium text-gray-800">Monthly Savings</div>
                    <div className="text-sm text-gray-500">Pay monthly installments</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[#29a9eb]">Tk{monthlyAmount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Per month</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Savings Summary */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-medium text-gray-800 mb-3">Savings Goal Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Goal Name:</span>
                <span className="font-medium">{savingsName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Target Amount:</span>
                <span className="font-medium">Tk{targetAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">
                  {savingsMonths} month{Number.parseInt(savingsMonths) > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Type:</span>
                <span className="font-medium text-[#29a9eb]">
                  {paymentOption === "full" ? "Full Payment" : "Monthly Savings"}
                </span>
              </div>
            </div>
          </div>

          {/* PIN Input */}
          <div className="space-y-4">
            <div className="mb-2 flex items-center">
              <div className="mr-2">🔒</div>
              <div className="text-sm font-medium">6-Digit PIN</div>
            </div>

            <input
              type="password"
              className="w-full text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#29a9eb] focus:border-transparent tracking-widest py-3"
              value={pin}
              onChange={(e) => {
                const value = e.target.value
                if (value.length <= 6 && /^\d*$/.test(value)) {
                  setPin(value)
                }
              }}
              maxLength={6}
              placeholder="••••••"
              autoFocus
            />
          </div>
        </div>

        {/* Confirm Button */}
        <div className="mt-8">
          <Button
            onClick={handleConfirm}
            disabled={pin.length !== 6 || isLoading}
            className="w-full bg-[#29a9eb] hover:bg-[#2490d1] text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Savings Goal...
              </div>
            ) : (
              "Create Savings Goal"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
