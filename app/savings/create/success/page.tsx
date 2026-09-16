"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import Confetti from "react-confetti"
import { CheckCircle } from "lucide-react"
import { addSavingsGoal, getSavingsTransactions, saveSavingsTransactions } from "@/lib/savings-maturity-system"

export default function SuccessPage() {
  const router = useRouter()
  const [windowSize, setWindowSize] = React.useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    // Get the savings goal data from localStorage
    const name = localStorage.getItem("savingsGoalName")
    const amount = localStorage.getItem("savingsGoalAmount")
    const months = localStorage.getItem("savingsGoalDuration")

    console.log("Creating goal with data:", { name, amount, months }) // Debug log

    if (name && amount && months) {
      try {
        // Create the savings goal
        const newGoal = addSavingsGoal({
          name: name,
          targetAmount: Number(amount),
          duration: Number(months),
          monthlyPayment: Math.ceil(Number(amount) / Number(months)),
        })

        console.log("Goal created successfully:", newGoal) // Debug log

        // Add creation transaction to history
        const transactions = getSavingsTransactions()
        const newTransaction = {
          id: `CREATE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          goalId: newGoal.id,
          goalName: name,
          amount: 0,
          type: "deposit" as const,
          date: new Date().toISOString(),
          description: `Savings Page "${name}" - Tk${Number(amount).toLocaleString()} moved to savings`,
        }

        transactions.push(newTransaction)
        saveSavingsTransactions(transactions)

        console.log("Transaction saved successfully:", newTransaction) // Debug log

        // Verify data was saved
        const savedGoals = localStorage.getItem("savingsGoals")
        const savedTransactions = localStorage.getItem("savingsTransactions")
        console.log("Verification - Saved goals:", savedGoals)
        console.log("Verification - Saved transactions:", savedTransactions)

        // Clear the temporary data
        localStorage.removeItem("savingsGoalName")
        localStorage.removeItem("savingsGoalAmount")
        localStorage.removeItem("savingsGoalDuration")

        console.log("Success page completed successfully")
      } catch (error) {
        console.error("Error creating savings goal:", error)
      }
    } else {
      console.error("Missing savings goal data:", { name, amount, months })
    }

    // Redirect after 3 seconds
    setTimeout(() => {
      router.push("/savings")
    }, 3000)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <Confetti width={windowSize.width} height={windowSize.height} recycle={false} />
      <div className="text-center">
        <div className="bg-blue-100 rounded-full p-6 mb-6 inline-flex">
          <CheckCircle size={64} className="text-[#29a9eb]" />
        </div>
        <h1 className="text-3xl font-bold text-[#29a9eb] mb-4">Success!</h1>
        <p className="text-gray-600 mb-2">Your savings goal has been created successfully.</p>
        <p className="text-gray-500 text-sm">Redirecting to savings page...</p>
      </div>
    </div>
  )
}
