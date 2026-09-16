"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import VerificationRequired from "@/components/verification-required"
import { checkMaturedSavings, getActiveSavingsGoals, getCompletedSavingsGoals } from "@/lib/savings-maturity-system"

export default function SavingsPage() {
  const router = useRouter()
  const [isVerified, setIsVerified] = useState(false)
  const [balance, setBalance] = useState(0)
  const [totalSavings, setTotalSavings] = useState(0)

  const calculateTotalSavings = () => {
    const activeGoals = getActiveSavingsGoals()
    const completedGoals = getCompletedSavingsGoals()

    const activeSavingsTotal = activeGoals.reduce((sum, goal) => {
      return sum + goal.currentAmount
    }, 0)

    setTotalSavings(activeSavingsTotal)
  }

  useEffect(() => {
    const userData = localStorage.getItem("userData")
    const storedVerified = localStorage.getItem("isVerified")
    const userBalance = localStorage.getItem("userBalance")

    if (userData) {
      const user = JSON.parse(userData)
      setIsVerified(user.isVerified || false)
    } else if (storedVerified) {
      setIsVerified(storedVerified === "true")
    }

    if (userBalance) {
      setBalance(Number(userBalance))
    }

    const { maturedGoals, transactions } = checkMaturedSavings()
    if (maturedGoals.length > 0) {
      maturedGoals.forEach((goal) => {
        alert(
          `🎉 Your "${goal.name}" savings goal has matured! Tk${goal.currentAmount} has been added to your balance.`,
        )
      })

      const updatedBalance = Number(localStorage.getItem("userBalance") || "0")
      setBalance(updatedBalance)
    }

    calculateTotalSavings()
  }, [])

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "savingsGoals" || e.key === "userBalance") {
        calculateTotalSavings()

        if (e.key === "userBalance") {
          setBalance(Number(e.newValue || "0"))
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const activeGoals = getActiveSavingsGoals()
  const completedGoals = getCompletedSavingsGoals()

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#29a9eb] to-[#1e8bc3]">
      {/* Coin Stack Icon */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="mb-8">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Blue%20Black%20Formal%20Minimalist%20Company%20Letterhead%20%2813%29-dKfdzBXHBluBx6iJ8ERpyNaRQHlHGt.png"
            alt="Coin Stack"
            className="w-40 h-40 object-contain"
          />
        </div>

        {/* Main Text */}
        <h1
          className="text-white text-5xl font-bold text-center mb-8 leading-tight"
          style={{ fontFamily: "Noto Sans Bengali, sans-serif" }}
        >
          ১০০ টাকায়
          <br />
          সেভিংস খুলুন,
          <br />
          আজই!
        </h1>

        {/* Total Savings Display */}
        {totalSavings > 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 mb-8">
            <p className="text-white/80 text-sm mb-1" style={{ fontFamily: "Noto Sans Bengali, sans-serif" }}>
              মোট সেভিংস
            </p>
            <p className="text-white text-3xl font-bold">৳{totalSavings.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="px-6 pb-8">
        <Link
          href="/savings/create/name"
          className="block w-full bg-white text-gray-900 py-5 rounded-full text-center text-2xl font-semibold shadow-lg"
          style={{ fontFamily: "Noto Sans Bengali, sans-serif" }}
        >
          সেভিংস করুন
        </Link>
      </div>

      {/* Active Goals Section - Scrollable */}
      {activeGoals.length > 0 && (
        <div className="absolute bottom-32 left-0 right-0 max-h-48 overflow-y-auto px-6">
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-all"
                onClick={() => router.push(`/savings/add-money?goalId=${goal.id}`)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-white">{goal.name}</h4>
                  <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                    {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm text-white/80">
                  <span>৳{goal.currentAmount.toLocaleString()}</span>
                  <span>লক্ষ্য: ৳{goal.targetAmount.toLocaleString()}</span>
                </div>
                <div className="bg-white/20 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
