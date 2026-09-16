// Clear unknown transactions and unwanted data permanently
const clearUnwantedData = (options = {}) => {
  console.log("🧹 Clearing unwanted data permanently...")

  // Remove any unwanted transaction types
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
  const savingsTransactions = JSON.parse(localStorage.getItem("savingsTransactions") || "[]")

  if (options.clearAll) {
    // Clear all transactions if requested
    localStorage.removeItem("transactions")
    localStorage.removeItem("savingsTransactions")
    console.log("🗑️ Cleared all transactions")
  } else {
    // Keep only valid transaction types
    const validTypes = ["Send Money", "Receive", "Payment", "Recharge", "Cash Out", "Add Money", "Bill Payment"]
    const cleanTransactions = transactions.filter((transaction) => {
      return validTypes.includes(transaction.type)
    })

    // Filter savings transactions to remove any suspicious ones
    const cleanSavingsTransactions = savingsTransactions.filter((transaction) => {
      const validSavingsTypes = ["deposit", "withdrawal", "interest", "goal_creation", "maturity"]
      return validSavingsTypes.includes(transaction.type)
    })

    localStorage.setItem("transactions", JSON.stringify(cleanTransactions))
    localStorage.setItem("savingsTransactions", JSON.stringify(cleanSavingsTransactions))

    console.log(`🧹 Cleaned ${transactions.length - cleanTransactions.length} unwanted transactions`)
    console.log(
      `🧹 Cleaned ${savingsTransactions.length - cleanSavingsTransactions.length} unwanted savings transactions`,
    )
  }

  // Remove any unwanted localStorage keys
  const unwantedKeys = ["unwantedData", "tempData", "debugData", "testData", "unknownTransactions"]

  unwantedKeys.forEach((key) => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      console.log(`🗑️ Removed unwanted key: ${key}`)
    }
  })

  // Trigger storage event to update UI
  window.dispatchEvent(new Event("storage"))

  console.log("✅ Cleanup completed successfully!")
  return true
}

const clearAllTransactions = () => {
  if (confirm("Do you want to delete all transactions?")) {
    clearUnwantedData({ clearAll: true })
    alert("All transactions have been deleted!")
    window.location.reload()
  }
}

const clearSuspiciousTransactions = () => {
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
  const savingsTransactions = JSON.parse(localStorage.getItem("savingsTransactions") || "[]")

  const beforeCount = transactions.length + savingsTransactions.length
  clearUnwantedData()
  const afterTransactions = JSON.parse(localStorage.getItem("transactions") || "[]")
  const afterSavingsTransactions = JSON.parse(localStorage.getItem("savingsTransactions") || "[]")
  const afterCount = afterTransactions.length + afterSavingsTransactions.length

  const removedCount = beforeCount - afterCount
  if (removedCount > 0) {
    alert(`${removedCount} suspicious transactions removed!`)
    window.location.reload()
  } else {
    alert("No suspicious transactions found!")
  }
}

// Make functions globally available
if (typeof window !== "undefined") {
  window.clearAllTransactions = clearAllTransactions
  window.clearSuspiciousTransactions = clearSuspiciousTransactions
  window.clearUnwantedData = clearUnwantedData

  // Run cleanup on page load
  clearUnwantedData()
}

export { clearUnwantedData, clearAllTransactions, clearSuspiciousTransactions }
