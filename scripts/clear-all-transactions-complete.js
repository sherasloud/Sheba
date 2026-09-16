console.log("[v0] Starting complete transaction cleanup...")

// Clear all localStorage transaction data
const transactionKeys = [
  "transactions",
  "userTransactions",
  "globalTransactions",
  "transactionHistory",
  "recentTransactions",
  "savingsTransactions",
  "budgetTransactions",
  "remittanceTransaction",
  "donationTransaction",
  "eduFeeTransactionId",
  "billPayments",
  "rechargeHistory",
  "cashoutHistory",
  "addMoneyHistory",
  "transferHistory",
  "paymentHistory",
]

transactionKeys.forEach((key) => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key)
    console.log(`[v0] Cleared localStorage key: ${key}`)
  }
})

// Clear user-specific transaction keys (for all possible phone numbers)
const allKeys = Object.keys(localStorage)
allKeys.forEach((key) => {
  if (key.includes("transactions") || key.includes("Transaction") || key.includes("History")) {
    localStorage.removeItem(key)
    console.log(`[v0] Cleared transaction key: ${key}`)
  }
})

// Reset global transaction arrays
if (typeof window !== "undefined") {
  window.globalTransactions = []
  window.userTransactions = []
}

// Clear any remaining transaction data from memory
try {
  // Reset any cached transaction data
  sessionStorage.clear()
  console.log("[v0] Cleared sessionStorage")
} catch (e) {
  console.log("[v0] SessionStorage not available")
}

console.log("[v0] All transactions cleared successfully!")
console.log("[v0] Page will reload to reflect changes...")

// Force page reload to ensure clean state
setTimeout(() => {
  window.location.reload()
}, 1000)
