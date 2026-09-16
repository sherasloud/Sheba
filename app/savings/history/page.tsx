"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { getSavingsTransactions } from "@/lib/savings-maturity-system"

interface Transaction {
  id: number | string
  type: "deposit" | "withdrawal" | "interest" | "goal_creation"
  amount: number
  date: string
  description: string
}

export default function SavingsHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    // Load both regular savings transactions and goal transactions
    const savedTransactions = localStorage.getItem("savingsTransactions")
    const goalTransactions = getSavingsTransactions()

    let allTransactions = []

    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions)
      allTransactions = [...parsedTransactions]
    }

    if (goalTransactions.length > 0) {
      // Convert goal transactions to the expected format
      const convertedTransactions = goalTransactions.map((txn, index) => ({
        id: txn.id || index + 1000, // Use existing ID or generate one
        type: txn.type === "maturity" ? "interest" : txn.type,
        amount: txn.amount,
        date: txn.date,
        description: txn.description,
      }))
      allTransactions = [...allTransactions, ...convertedTransactions]
    }

    // Remove duplicates based on ID and description
    const uniqueTransactions = allTransactions.filter(
      (transaction, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.id === transaction.id ||
            (t.description === transaction.description &&
              t.amount === transaction.amount &&
              t.date === transaction.date),
        ),
    )

    // Sort by date (newest first) - handle both ISO strings and regular dates
    uniqueTransactions.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })

    setTransactions(uniqueTransactions)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const formattedDate = date.toLocaleDateString("en-GB")
    const formattedTime = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
    return `${formattedDate} ${formattedTime}`
  }

  return (
    <div className="flex flex-col h-screen bg-white max-w-sm mx-auto">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/savings" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Savings History</div>
      </div>

      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold mb-6">Transaction History</h1>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No transactions yet</div>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <div key={`${transaction.id}-${index}`} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {transaction.type === "deposit" || transaction.type === "goal_creation" ? (
                      <TrendingUp className="text-green-500" size={20} />
                    ) : transaction.type === "withdrawal" ? (
                      <TrendingDown className="text-red-500" size={20} />
                    ) : (
                      <TrendingUp className="text-blue-500" size={20} />
                    )}
                    <span className="font-medium">
                      {transaction.type === "deposit"
                        ? "Money Added"
                        : transaction.type === "goal_creation"
                          ? "Savings Goal Created"
                          : transaction.type === "withdrawal"
                            ? "Money Withdrawn"
                            : transaction.type === "interest"
                              ? "Goal Matured"
                              : "Interest Earned"}
                    </span>
                  </div>
                  <span
                    className={`font-bold ${transaction.type === "withdrawal" ? "text-red-500" : "text-green-500"}`}
                  >
                    {transaction.type === "withdrawal" ? "-" : "+"}Tk{transaction.amount.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-1">{transaction.description}</div>
                <div className="text-xs text-gray-400">{formatDate(transaction.date)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
