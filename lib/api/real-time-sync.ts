// Real-time synchronization service
export class RealTimeSync {
  private static instance: RealTimeSync
  private syncInterval: NodeJS.Timeout | null = null
  private phoneNumber: string | null = null

  static getInstance(): RealTimeSync {
    if (!RealTimeSync.instance) {
      RealTimeSync.instance = new RealTimeSync()
    }
    return RealTimeSync.instance
  }

  startSync(phoneNumber: string) {
    this.phoneNumber = phoneNumber
    this.stopSync() // Clear any existing sync

    // Sync every 10 seconds
    this.syncInterval = setInterval(async () => {
      await this.syncUserData()
    }, 10000)

    // Initial sync
    this.syncUserData()
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  private async syncUserData() {
    if (!this.phoneNumber) return

    try {
      const response = await fetch(`/api/users?phoneNumber=${this.phoneNumber}`)
      const result = await response.json()

      if (result.success && result.user) {
        const currentBalance = localStorage.getItem("userBalance")
        const newBalance = result.user.balance.toString()

        // Only update if balance changed
        if (currentBalance !== newBalance) {
          localStorage.setItem("userData", JSON.stringify(result.user))
          localStorage.setItem("userBalance", newBalance)
          localStorage.setItem("isVerified", result.user.isVerified.toString())
          localStorage.setItem("userName", result.user.fullName)

          // Trigger storage event for UI updates
          window.dispatchEvent(
            new StorageEvent("storage", {
              key: "userBalance",
              newValue: newBalance,
              oldValue: currentBalance,
            }),
          )

          // Show notification if money received
          if (currentBalance && Number(newBalance) > Number(currentBalance)) {
            const difference = Number(newBalance) - Number(currentBalance)
            this.showMoneyReceivedNotification(difference)
          }
        }
      }
    } catch (error) {
      console.error("Sync error:", error)
    }
  }

  private showMoneyReceivedNotification(amount: number) {
    // Show browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Money Received!", {
        body: `You received Tk ${amount.toLocaleString()}`,
        icon: "/images/droplet-logo.png",
      })
    }

    // Show in-app notification
    const event = new CustomEvent("moneyReceived", {
      detail: { amount },
    })
    window.dispatchEvent(event)
  }
}

export const realTimeSync = RealTimeSync.getInstance()
