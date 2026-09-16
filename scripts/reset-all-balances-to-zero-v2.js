// Admin users: 01709783145 and 01930314459

console.log("[v0] 🔄 Starting balance reset process...")
console.log("[v0] This will reset all user balances to 0 except admin users")

const adminPhones = ["01709783145", "01930314459"]
const adminBalance = 99979997979999

// Reset localStorage balances
if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
  console.log("[v0] Resetting localStorage balances...")

  // Get all keys
  const allKeys = Object.keys(localStorage)

  // Reset all userBalance_* keys
  const balanceKeys = allKeys.filter((key) => key.startsWith("userBalance_"))

  for (const key of balanceKeys) {
    const phone = key.replace("userBalance_", "")
    if (adminPhones.includes(phone)) {
      localStorage.setItem(key, adminBalance.toString())
      console.log(`[v0] ✅ Admin balance kept: ${phone} = ${adminBalance}`)
    } else {
      localStorage.setItem(key, "0")
      console.log(`[v0] ✅ Reset balance: ${phone} = 0`)
    }
  }

  // Reset global userBalance
  const currentPhone = localStorage.getItem("phoneNumber")
  if (currentPhone && adminPhones.includes(currentPhone)) {
    localStorage.setItem("userBalance", adminBalance.toString())
    console.log(`[v0] ✅ Current user is admin, balance = ${adminBalance}`)
  } else {
    localStorage.setItem("userBalance", "0")
    console.log(`[v0] ✅ Current user balance reset to 0`)
  }

  // Update userData
  const userData = localStorage.getItem("userData")
  if (userData) {
    try {
      const user = JSON.parse(userData)
      if (adminPhones.includes(user.phoneNumber)) {
        user.balance = adminBalance
        console.log(`[v0] ✅ Admin userData balance = ${adminBalance}`)
      } else {
        user.balance = 0
        console.log(`[v0] ✅ User ${user.phoneNumber} balance reset to 0`)
      }
      localStorage.setItem("userData", JSON.stringify(user))
    } catch (e) {
      console.error("[v0] Error updating userData:", e)
    }
  }

  console.log("[v0] ✅ Balance reset completed!")
  console.log(`[v0] Admin users (${adminPhones.join(", ")}) balance: ${adminBalance}`)
  console.log("[v0] All other users balance: 0")
  console.log("[v0] Please refresh the page to see changes")
} else {
  console.error("[v0] ❌ localStorage not available")
}
