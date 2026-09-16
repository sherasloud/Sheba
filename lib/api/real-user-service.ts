// Enhanced real user service with account-to-account transfers
export interface UserData {
  phoneNumber: string
  fullName: string
  balance: number
  isVerified: boolean
  accountNumber: string
  createdAt: string
}

export interface TransferResult {
  success: boolean
  message: string
  transactionId?: string
  transaction?: {
    id: string
    amount: number
    fee: number
    receiverName: string
    receiverPhone: string
    senderNewBalance: number
    receiverNewBalance?: number
    timestamp: string
    reference: string
  }
  localStorage?: {
    updateSenderBalance?: { phone: string; newBalance: number }
    updateReceiverBalance?: { phone: string; newBalance: number }
    addSenderTransaction?: any
    addReceiverTransaction?: any
  }
}

export const userService = {
  async getAdminBalance(): Promise<number> {
    try {
      const adminData = localStorage.getItem("adminData")
      if (adminData) {
        const admin = JSON.parse(adminData)
        return admin.balance || 0
      }

      const userData = localStorage.getItem("userData")
      if (userData) {
        const user = JSON.parse(userData)
        if (user.phoneNumber === "01709783145" || user.phoneNumber === "01930314459") {
          return user.balance || 0
        }
      }

      return 0
    } catch (error) {
      console.error("Get admin balance error:", error)
      return 0
    }
  },

  async updateAdminBalance(newBalance: number): Promise<boolean> {
    try {
      // Update in adminData
      const adminData = localStorage.getItem("adminData")
      if (adminData) {
        const admin = JSON.parse(adminData)
        admin.balance = newBalance
        localStorage.setItem("adminData", JSON.stringify(admin))
      }

      // Also update in userData if user is admin
      const userData = localStorage.getItem("userData")
      if (userData) {
        const user = JSON.parse(userData)
        if (user.phoneNumber === "01709783145" || user.phoneNumber === "01930314459") {
          user.balance = newBalance
          localStorage.setItem("userData", JSON.stringify(user))
          localStorage.setItem("userBalance", newBalance.toString())
        }
      }

      return true
    } catch (error) {
      console.error("Update admin balance error:", error)
      return false
    }
  },

  async syncUserData(phoneNumber: string): Promise<UserData | null> {
    try {
      const userBalanceKey = `userBalance_${phoneNumber}`
      const storedBalance = localStorage.getItem(userBalanceKey)

      if (phoneNumber === "01709783145" || phoneNumber === "01930314459") {
        const adminBalance = storedBalance ? Number.parseInt(storedBalance) : 0

        const userData = {
          phoneNumber: phoneNumber,
          fullName: "Admin User",
          balance: adminBalance,
          isVerified: true,
          accountNumber: phoneNumber === "01709783145" ? "ADMIN001" : "ADMIN002",
          createdAt: new Date().toISOString(),
        }

        localStorage.setItem(`userData_${phoneNumber}`, JSON.stringify(userData))
        localStorage.setItem(userBalanceKey, adminBalance.toString())

        const currentPhone = localStorage.getItem("phoneNumber")
        if (currentPhone === phoneNumber) {
          localStorage.setItem("userData", JSON.stringify(userData))
          localStorage.setItem("userBalance", adminBalance.toString())
          localStorage.setItem("isVerified", "true")
          localStorage.setItem("userName", "Admin User")
        }

        return userData
      }

      const userBalance = storedBalance ? Number.parseInt(storedBalance) : 0

      const regularUserData = {
        phoneNumber: phoneNumber,
        fullName: `User ${phoneNumber.slice(-4)}`,
        balance: userBalance,
        isVerified: true,
        accountNumber: `USER${Date.now()}`,
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem(`userData_${phoneNumber}`, JSON.stringify(regularUserData))
      localStorage.setItem(userBalanceKey, userBalance.toString())

      const currentPhone = localStorage.getItem("phoneNumber")
      if (currentPhone === phoneNumber) {
        localStorage.setItem("userData", JSON.stringify(regularUserData))
        localStorage.setItem("userBalance", userBalance.toString())
        localStorage.setItem("isVerified", "true")
        localStorage.setItem("userName", regularUserData.fullName)
      }

      console.log(`[v0] Synced user data for ${phoneNumber} with balance: ${userBalance}`)

      return regularUserData
    } catch (error) {
      console.error("Sync user data error:", error)
      return null
    }
  },

  async transferMoney(transferData: {
    senderPhone: string
    receiverPhone: string
    amount: number
    pin: string
    reference?: string
  }): Promise<TransferResult> {
    try {
      console.log("[v0] Starting real money transfer:", {
        from: transferData.senderPhone,
        to: transferData.receiverPhone,
        amount: transferData.amount,
      })

      const response = await fetch("/api/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transferData),
      })

      const result = await response.json()

      console.log("[v0] Transfer result:", result.message)

      if (result.success && result.localStorage) {
        const currentUserPhone = localStorage.getItem("phoneNumber")

        if (result.localStorage.updateSenderBalance) {
          const senderPhone = result.localStorage.updateSenderBalance.phone
          const newSenderBalance = result.localStorage.updateSenderBalance.newBalance

          localStorage.setItem(`userBalance_${senderPhone}`, newSenderBalance.toString())

          if (currentUserPhone === senderPhone) {
            localStorage.setItem("userBalance", newSenderBalance.toString())

            const userData = localStorage.getItem("userData")
            if (userData) {
              const user = JSON.parse(userData)
              user.balance = newSenderBalance
              localStorage.setItem("userData", JSON.stringify(user))
            }
            console.log("[v0] Updated sender balance:", newSenderBalance)
          }
        }

        if (result.localStorage.updateReceiverBalance) {
          const receiverPhone = result.localStorage.updateReceiverBalance.phone
          const newReceiverBalance = result.localStorage.updateReceiverBalance.newBalance

          localStorage.setItem(`userBalance_${receiverPhone}`, newReceiverBalance.toString())

          if (currentUserPhone === receiverPhone) {
            localStorage.setItem("userBalance", newReceiverBalance.toString())

            const userData = localStorage.getItem("userData")
            if (userData) {
              const user = JSON.parse(userData)
              user.balance = newReceiverBalance
              localStorage.setItem("userData", JSON.stringify(user))
            }
            console.log("[v0] Updated receiver balance:", newReceiverBalance)
          }

          console.log(`[v0] Stored receiver balance for ${receiverPhone}: ${newReceiverBalance}`)
        }

        const globalTransactionsKey = "globalTransactions"
        const storedGlobalTransactions = localStorage.getItem(globalTransactionsKey)
        let globalTransactions = []
        if (storedGlobalTransactions) {
          try {
            globalTransactions = JSON.parse(storedGlobalTransactions)
          } catch (e) {
            console.error("Error parsing global transactions:", e)
            globalTransactions = []
          }
        }

        if (result.localStorage.addSenderTransaction && currentUserPhone === transferData.senderPhone) {
          const senderTransaction = {
            ...result.localStorage.addSenderTransaction,
            userPhone: transferData.senderPhone,
          }
          globalTransactions.unshift(senderTransaction)
          console.log("[v0] Added sender transaction to global storage")
        }

        if (result.localStorage.addReceiverTransaction && currentUserPhone === transferData.receiverPhone) {
          const receiverTransaction = {
            ...result.localStorage.addReceiverTransaction,
            userPhone: transferData.receiverPhone,
          }
          globalTransactions.unshift(receiverTransaction)
          console.log("[v0] Added receiver transaction to global storage")
        }

        localStorage.setItem(globalTransactionsKey, JSON.stringify(globalTransactions))

        this.updateUserTransactions(currentUserPhone)

        window.dispatchEvent(
          new CustomEvent("newTransaction", {
            detail: result.transaction,
          }),
        )

        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "transactions",
            newValue: localStorage.getItem("transactions"),
            oldValue: null,
          }),
        )

        console.log("[v0] localStorage updated successfully")
      }

      return result
    } catch (error) {
      console.error("Transfer money error:", error)
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
      }
    }
  },

  updateUserTransactions(phoneNumber: string | null): void {
    if (!phoneNumber) return

    try {
      const globalTransactions = localStorage.getItem("globalTransactions")
      if (!globalTransactions) return

      const allTransactions = JSON.parse(globalTransactions)

      const userTransactions = allTransactions.filter((transaction: any) => transaction.userPhone === phoneNumber)

      const cleanTransactions = userTransactions.map((transaction: any) => {
        const { userPhone, ...cleanTransaction } = transaction
        return cleanTransaction
      })

      localStorage.setItem("transactions", JSON.stringify(cleanTransactions))
      console.log(`[v0] Updated transactions for user ${phoneNumber}: ${cleanTransactions.length} transactions`)
    } catch (error) {
      console.error("Error updating user transactions:", error)
    }
  },

  async getUserData(phoneNumber: string): Promise<UserData | null> {
    try {
      const response = await fetch(`/api/transfer?phoneNumber=${phoneNumber}`)
      const data = await response.json()

      if (data.success) {
        return {
          phoneNumber: data.user.phoneNumber,
          fullName: data.user.fullName,
          balance: data.balance,
          isVerified: data.user.isVerified,
          accountNumber: data.user.accountNumber,
          createdAt: new Date().toISOString(),
        }
      }
      return null
    } catch (error) {
      console.error("Get user data error:", error)
      return null
    }
  },

  async updateBalance(phoneNumber: string, newBalance: number): Promise<boolean> {
    if (phoneNumber === "01709783145" || phoneNumber === "01930314459") {
      return this.updateAdminBalance(newBalance)
    }

    const userData = await this.syncUserData(phoneNumber)
    return userData !== null
  },
}

export async function getUserByPhone(phoneNumber: string): Promise<UserData | null> {
  try {
    const userBalanceKey = `userBalance_${phoneNumber}`
    const storedBalance = localStorage.getItem(userBalanceKey)

    if (phoneNumber === "01709783145" || phoneNumber === "01930314459") {
      const adminBalance = storedBalance ? Number.parseInt(storedBalance) : 0
      return {
        phoneNumber: phoneNumber,
        fullName: "Admin User",
        balance: adminBalance,
        isVerified: true,
        accountNumber: phoneNumber === "01709783145" ? "ADMIN001" : "ADMIN002",
        createdAt: new Date().toISOString(),
      }
    }

    const userBalance = storedBalance ? Number.parseInt(storedBalance) : 0
    return {
      phoneNumber: phoneNumber,
      fullName: `User ${phoneNumber.slice(-4)}`,
      balance: userBalance,
      isVerified: true,
      accountNumber: `USER${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Get user by phone error:", error)
    return null
  }
}
