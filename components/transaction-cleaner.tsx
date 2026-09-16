"use client"

import { useState } from "react"
import { Trash2, AlertTriangle, RefreshCw, Shield, Search } from "lucide-react"

const fakePatterns = [/test/i, /fake/i, /demo/i, /sample/i, /example/i, /dummy/i, /trial/i, /temp/i, /debug/i]

export default function TransactionCleaner() {
  const [isClearing, setIsClearing] = useState(false)
  const [transactionId, setTransactionId] = useState("")

  const getAllTransactionKeys = () => {
    return [
      "transactions",
      "savingsTransactions",
      "budgetTransactions",
      "remittanceTransaction",
      "financialHelpRequests",
      "activeLoan",
      "loanHistory",
      "loanApplication",
      "monthlyBudget",
      "debenturePurchases",
      "airTicketBookings",
      "educationFeePayments",
      "billPayments",
      "rechargeHistory",
      "cashoutHistory",
      "addMoneyHistory",
      "transferHistory",
      "paymentHistory",
      "cardTransactions",
      "bankTransfers",
      "mobileRecharges",
      "utilityBills",
      "insurancePayments",
      "investmentTransactions",
      "cryptoTransactions",
      "foreignExchangeTransactions",
      "tempTransactionData",
      "pendingTransactions",
      "failedTransactions",
      "testTransactions",
      "demoTransactions",
      "sampleTransactions",
    ]
  }

  const isFakeTransaction = (transaction: any) => {
    // Check for suspicious amounts (like 1, 10, 100, 1000 - common test amounts)
    const suspiciousAmounts = [1, 10, 100, 500, 1000, 5000, 10000]

    // Check for specific fake transactions like "New Sheba" with Tk500
    if (
      (transaction.storeName === "New Sheba" || transaction.to === "New Sheba") &&
      Math.abs(transaction.amount) === 500
    ) {
      return true
    }

    // Check for fake phone numbers (like 01111111111, 01234567890)
    const fakePhonePatterns = [
      /^01{10}$/, // 01111111111
      /^0123456789\d$/, // 01234567890
      /^0987654321\d$/, // 09876543210
      /^01{9}\d$/, // 011111111X
    ]

    const transactionText = JSON.stringify(transaction).toLowerCase()

    // Check for fake patterns in transaction data
    if (fakePatterns.some((pattern) => pattern.test(transactionText))) {
      return true
    }

    // Check for suspicious amounts
    if (transaction.amount && suspiciousAmounts.includes(Number.parseFloat(transaction.amount))) {
      return true
    }

    // Check for fake phone numbers
    if (transaction.phoneNumber && fakePhonePatterns.some((pattern) => pattern.test(transaction.phoneNumber))) {
      return true
    }

    if (transaction.recipientPhone && fakePhonePatterns.some((pattern) => pattern.test(transaction.recipientPhone))) {
      return true
    }

    // Check for transactions without proper timestamps or IDs
    if (!transaction.timestamp || !transaction.id) {
      return true
    }

    return false
  }

  const handleKeepOnlyReal = async () => {
    if (confirm("Keep only real transactions? All fake/test transactions will be removed!")) {
      setIsClearing(true)

      const allKeys = getAllTransactionKeys()
      let totalRemoved = 0

      allKeys.forEach((key) => {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            const parsedData = JSON.parse(data)
            if (Array.isArray(parsedData)) {
              const realData = parsedData.filter((item: any) => !isFakeTransaction(item))
              localStorage.setItem(key, JSON.stringify(realData))
              totalRemoved += parsedData.length - realData.length
            } else if (typeof parsedData === "object" && parsedData !== null) {
              // For single transaction objects, check if fake and remove entirely
              if (isFakeTransaction(parsedData)) {
                localStorage.removeItem(key)
                totalRemoved += 1
              }
            }
          } catch (e) {
            // If it's not JSON, check if it looks like fake data and remove
            if (fakePatterns.some((pattern) => pattern.test(data.toLowerCase()))) {
              localStorage.removeItem(key)
              totalRemoved += 1
            }
          }
        }
      })

      // Trigger storage event to update UI
      window.dispatchEvent(new Event("storage"))

      setTimeout(() => {
        setIsClearing(false)
        if (totalRemoved > 0) {
          alert(`${totalRemoved} fake/test transactions removed!`)
          window.location.reload()
        } else {
          alert("All transactions are real!")
        }
      }, 1000)
    }
  }

  const handleClearAll = async () => {
    if (confirm("Do you want to delete all transactions? This cannot be undone!")) {
      setIsClearing(true)

      const allKeys = getAllTransactionKeys()
      let clearedCount = 0

      allKeys.forEach((key) => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key)
          clearedCount++
        }
      })

      // Trigger storage event to update UI
      window.dispatchEvent(new Event("storage"))

      setTimeout(() => {
        setIsClearing(false)
        alert(`All transactions deleted! ${clearedCount} data cleared!`)
        window.location.reload()
      }, 1000)
    }
  }

  const handleClearSuspicious = async () => {
    setIsClearing(true)

    const allKeys = getAllTransactionKeys()
    let totalRemoved = 0

    // Keep only valid transaction types
    const validTypes = ["Send Money", "Receive", "Payment", "Recharge", "Cash Out", "Add Money", "Bill Payment"]
    const validSavingsTypes = ["deposit", "withdrawal", "interest", "goal_creation", "maturity"]

    allKeys.forEach((key) => {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          const parsedData = JSON.parse(data)
          if (Array.isArray(parsedData)) {
            let cleanData
            if (key === "savingsTransactions") {
              cleanData = parsedData.filter((t: any) => validSavingsTypes.includes(t.type))
            } else {
              cleanData = parsedData.filter(
                (t: any) => validTypes.includes(t.type) || validSavingsTypes.includes(t.type),
              )
            }
            localStorage.setItem(key, JSON.stringify(cleanData))
            totalRemoved += parsedData.length - cleanData.length
          }
        } catch (e) {
          // If parsing fails, it might be suspicious data
          localStorage.removeItem(key)
          totalRemoved += 1
        }
      }
    })

    // Trigger storage event to update UI
    window.dispatchEvent(new Event("storage"))

    setTimeout(() => {
      setIsClearing(false)
      if (totalRemoved > 0) {
        alert(`${totalRemoved} suspicious transactions removed!`)
        window.location.reload()
      } else {
        alert("No suspicious transactions found!")
      }
    }, 1000)
  }

  const handleRemoveSpecificTransaction = async () => {
    if (!transactionId.trim()) {
      alert("Please enter a Transaction ID!")
      return
    }

    if (confirm(`Remove Transaction ID: ${transactionId}?`)) {
      setIsClearing(true)

      const allKeys = getAllTransactionKeys()
      let found = false

      allKeys.forEach((key) => {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            const parsedData = JSON.parse(data)
            if (Array.isArray(parsedData)) {
              const filteredData = parsedData.filter(
                (item: any) => item.transactionId !== transactionId && item.id !== transactionId,
              )
              if (filteredData.length !== parsedData.length) {
                localStorage.setItem(key, JSON.stringify(filteredData))
                found = true
              }
            } else if (typeof parsedData === "object" && parsedData !== null) {
              if (parsedData.transactionId === transactionId || parsedData.id === transactionId) {
                localStorage.removeItem(key)
                found = true
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      })

      // Trigger storage event to update UI
      window.dispatchEvent(new Event("storage"))

      setTimeout(() => {
        setIsClearing(false)
        if (found) {
          alert(`Transaction ID: ${transactionId} removed!`)
          setTransactionId("")
          window.location.reload()
        } else {
          alert(`Transaction ID: ${transactionId} not found!`)
        }
      }, 1000)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="text-orange-500" size={20} />
        <h3 className="font-semibold text-gray-800">Clean Transactions</h3>
      </div>

      <div className="space-y-3">
        <div className="border rounded-lg p-3 bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">Remove Specific Transaction ID</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="TXN1756016735232XXDFNP"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleRemoveSpecificTransaction}
              disabled={isClearing}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              {isClearing ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
              Remove
            </button>
          </div>
        </div>

        <button
          onClick={handleKeepOnlyReal}
          disabled={isClearing}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {isClearing ? <RefreshCw className="animate-spin" size={16} /> : <Shield size={16} />}
          Keep Only Real Transactions
        </button>

        <button
          onClick={handleClearSuspicious}
          disabled={isClearing}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {isClearing ? <RefreshCw className="animate-spin" size={16} /> : <Trash2 size={16} />}
          Remove Suspicious Transactions
        </button>

        <button
          onClick={handleClearAll}
          disabled={isClearing}
          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {isClearing ? <RefreshCw className="animate-spin" size={16} /> : <Trash2 size={16} />}
          Clear All Transactions
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3">Warning: These actions cannot be undone!</p>
    </div>
  )
}
