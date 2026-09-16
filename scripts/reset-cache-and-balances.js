// Script to reset all localStorage data and balances
// This will fix caching issues and reset all non-admin balances to 0

console.log("🔄 Starting cache and balance reset...")

// Admin phone numbers
const adminPhones = ["01709783145", "01930314459"]
const adminBalance = 99979997979999

// Clear all localStorage except admin balances
const keysToRemove = []
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  if (key) {
    keysToRemove.push(key)
  }
}

console.log(`📦 Found ${keysToRemove.length} localStorage keys`)

// Remove all keys
keysToRemove.forEach((key) => {
  localStorage.removeItem(key)
  console.log(`🗑️ Removed: ${key}`)
})

console.log("✅ All localStorage cleared!")

// Set admin balances
adminPhones.forEach((phone) => {
  localStorage.setItem(`userBalance_${phone}`, adminBalance.toString())
  localStorage.setItem(`balance_${phone}`, adminBalance.toString())
  console.log(`💰 Set admin balance for ${phone}: Tk${adminBalance.toLocaleString()}`)
})

console.log("✅ Admin balances restored!")
console.log("🎉 Cache and balance reset complete!")
console.log("📱 Please refresh the page to see changes")
