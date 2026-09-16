console.log("[v0] Starting complete system reset...")

// Clear all localStorage data
localStorage.clear()

console.log("[v0] Cleared all localStorage data")

// Reset to clean state
const cleanState = {
  message: "System has been completely reset. All balances and transactions cleared.",
  timestamp: new Date().toISOString(),
  adminBalance: 99979997979999,
  regularUserBalance: 0,
}

console.log("[v0] System reset complete:", cleanState)

// Force page reload to apply changes
if (typeof window !== "undefined") {
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}
