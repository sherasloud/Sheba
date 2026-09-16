console.log("🧹 Clearing all transactions from localStorage...")

// Clear all transaction-related localStorage items
localStorage.removeItem("transactions")
localStorage.removeItem("globalTransactions")
localStorage.removeItem("userTransactions")

// Clear any other transaction-related data
const keys = Object.keys(localStorage)
keys.forEach((key) => {
  if (key.includes("transaction") || key.includes("Transaction")) {
    localStorage.removeItem(key)
    console.log(`🗑️ Removed: ${key}`)
  }
})

console.log("✅ All transactions cleared successfully!")
console.log("🔄 Please refresh the page to see the changes.")
