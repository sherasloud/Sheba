export class EnhancedRealTimeBalance {
  private static instance: EnhancedRealTimeBalance
  private balanceListeners: ((balance: number) => void)[] = []
  private syncInterval: NodeJS.Timeout | null = null
  private currentPhoneNumber: string | null = null

  static getInstance(): EnhancedRealTimeBalance {
    if (!EnhancedRealTimeBalance.instance) {
      EnhancedRealTimeBalance.instance = new EnhancedRealTimeBalance()
    }
    return EnhancedRealTimeBalance.instance
  }

  // Start real-time balance monitoring
  startRealTimeSync(phoneNumber: string) {
    console.log("[v0] Starting real-time balance sync for:", phoneNumber)
    this.currentPhoneNumber = phoneNumber
    this.stopSync()

    // Immediate sync from Supabase
    this.syncBalance(phoneNumber)

    // Sync every 3 seconds from Supabase (primary source)
    this.syncInterval = setInterval(() => {
      this.syncBalance(phoneNumber)
    }, 3000)

    // Listen for storage events from other tabs/windows
    window.addEventListener("storage", this.handleStorageChange.bind(this))
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    window.removeEventListener("storage", this.handleStorageChange.bind(this))
  }

  // Subscribe to balance updates
  subscribe(callback: (balance: number) => void) {
    this.balanceListeners.push(callback)

    // Immediately call with current balance
    const currentBalance = this.getCurrentBalance()
    callback(currentBalance)
  }

  unsubscribe(callback: (balance: number) => void) {
    this.balanceListeners = this.balanceListeners.filter((listener) => listener !== callback)
  }

  // Get current balance from localStorage (cache only)
  getCurrentBalance(): number {
    const phoneNumber = this.currentPhoneNumber || localStorage.getItem("phoneNumber")
    if (!phoneNumber) return 0

    const balance = localStorage.getItem(`userBalance_${phoneNumber}`)
    return balance ? Number(balance) : 0
  }

  // Update balance in both Supabase and localStorage
  async updateBalance(phoneNumber: string, newBalance: number): Promise<boolean> {
    console.log("[v0] Updating balance:", { phoneNumber, newBalance })

    try {
      // Update Supabase first (source of truth)
      const response = await fetch("/api/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, balance: newBalance }),
      })

      if (!response.ok) {
        console.error("[v0] Failed to update balance in Supabase")
        return false
      }

      // Update localStorage cache
      localStorage.setItem(`userBalance_${phoneNumber}`, newBalance.toString())

      // Update userData
      const userData = localStorage.getItem("userData")
      if (userData) {
        try {
          const user = JSON.parse(userData)
          user.balance = newBalance
          localStorage.setItem("userData", JSON.stringify(user))
        } catch (e) {
          console.error("[v0] Error updating userData:", e)
        }
      }

      // Notify all listeners
      this.notifyListeners(newBalance)

      console.log("[v0] Balance updated successfully:", newBalance)
      return true
    } catch (error) {
      console.error("[v0] Balance update error:", error)
      return false
    }
  }

  // Sync balance from Supabase (source of truth)
  private async syncBalance(phoneNumber: string) {
    try {
      console.log("[v0] Syncing balance from Supabase for:", phoneNumber)

      const response = await fetch(`/api/balance?phone=${phoneNumber}`)
      const data = await response.json()

      if (data.balance !== undefined) {
        const currentBalance = this.getCurrentBalance()

        // Update localStorage cache if different
        if (data.balance !== currentBalance) {
          console.log("[v0] Balance changed:", { old: currentBalance, new: data.balance })
          localStorage.setItem(`userBalance_${phoneNumber}`, data.balance.toString())

          // Update userData
          const userData = localStorage.getItem("userData")
          if (userData) {
            try {
              const user = JSON.parse(userData)
              user.balance = data.balance
              localStorage.setItem("userData", JSON.stringify(user))
            } catch (e) {
              console.error("[v0] Error updating userData:", e)
            }
          }

          this.notifyListeners(data.balance)
        }
      }
    } catch (error) {
      console.error("[v0] Balance sync error:", error)
    }
  }

  // Handle storage changes from other tabs
  private handleStorageChange(e: StorageEvent) {
    const phoneNumber = this.currentPhoneNumber || localStorage.getItem("phoneNumber")
    if (e.key === `userBalance_${phoneNumber}` && e.newValue) {
      const newBalance = Number(e.newValue)
      this.notifyListeners(newBalance)
    }
  }

  // Notify all balance listeners
  private notifyListeners(balance: number) {
    this.balanceListeners.forEach((listener) => {
      try {
        listener(balance)
      } catch (error) {
        console.error("[v0] Balance listener error:", error)
      }
    })
  }

  // Process transfer with Supabase update
  async processTransfer(senderPhone: string, receiverPhone: string, amount: number): Promise<boolean> {
    const currentBalance = this.getCurrentBalance()

    if (currentBalance < amount) {
      console.error("[v0] Insufficient balance for transfer")
      return false
    }

    // Update sender balance in Supabase
    const newSenderBalance = currentBalance - amount
    const success = await this.updateBalance(senderPhone, newSenderBalance)

    if (!success) {
      console.error("[v0] Failed to update sender balance")
      return false
    }

    console.log("[v0] Transfer processed successfully")
    return true
  }
}

export const enhancedRealTimeBalance = EnhancedRealTimeBalance.getInstance()
