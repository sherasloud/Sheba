// Real-time transaction synchronization service
export class RealTimeTransactionSync {
  private static instance: RealTimeTransactionSync
  private syncInterval: NodeJS.Timeout | null = null
  private lastSyncTime = 0

  static getInstance(): RealTimeTransactionSync {
    if (!RealTimeTransactionSync.instance) {
      RealTimeTransactionSync.instance = new RealTimeTransactionSync()
    }
    return RealTimeTransactionSync.instance
  }

  startSync() {
    this.stopSync()

    // Sync every 3 seconds for real-time updates
    this.syncInterval = setInterval(async () => {
      await this.syncGlobalTransactions()
    }, 3000)

    // Initial sync
    this.syncGlobalTransactions()
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  async addTransaction(transaction: any) {
    try {
      // Add to global sync
      const response = await fetch("/api/transactions/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      })

      const result = await response.json()

      if (result.success) {
        // Update local storage
        const stored = localStorage.getItem("transactions")
        const transactions = stored ? JSON.parse(stored) : []
        transactions.unshift(result.transaction)
        localStorage.setItem("transactions", JSON.stringify(transactions))

        // Trigger real-time update event
        window.dispatchEvent(
          new CustomEvent("newTransaction", {
            detail: result.transaction,
          }),
        )

        return result.transaction
      }
    } catch (error) {
      console.error("Failed to sync transaction:", error)
    }
  }

  private async syncGlobalTransactions() {
    try {
      const currentUser = localStorage.getItem("phoneNumber")
      if (!currentUser) {
        console.log("No user logged in, skipping sync")
        return
      }

      const response = await fetch(`/api/transactions/sync?userPhone=${encodeURIComponent(currentUser)}`)
      const result = await response.json()

      if (result.success && result.transactions) {
        const currentTime = Date.now()

        // Only update if there are new transactions
        if (currentTime > this.lastSyncTime) {
          const stored = localStorage.getItem("transactions")
          const localTransactions = stored ? JSON.parse(stored) : []

          // Merge with global transactions (avoid duplicates)
          const mergedTransactions = this.mergeTransactions(localTransactions, result.transactions)

          if (mergedTransactions.length !== localTransactions.length) {
            localStorage.setItem("transactions", JSON.stringify(mergedTransactions))

            // Trigger storage event for UI updates
            window.dispatchEvent(
              new StorageEvent("storage", {
                key: "transactions",
                newValue: JSON.stringify(mergedTransactions),
                oldValue: stored,
              }),
            )
          }

          this.lastSyncTime = currentTime
        }
      }
    } catch (error) {
      console.error("Global transaction sync failed:", error)
    }
  }

  private mergeTransactions(local: any[], global: any[]): any[] {
    const merged = [...local]

    global.forEach((globalTxn) => {
      const exists = merged.find(
        (localTxn) =>
          localTxn.id === globalTxn.id || (localTxn.date === globalTxn.date && localTxn.amount === globalTxn.amount),
      )

      if (!exists) {
        merged.push(globalTxn)
      }
    })

    // Sort by newest first
    return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
}

export const realTimeTransactionSync = RealTimeTransactionSync.getInstance()
