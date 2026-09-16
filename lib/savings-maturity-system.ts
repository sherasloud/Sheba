interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  duration: number // in months
  createdAt: string
  maturityDate: string
  status: "active" | "completed" | "cancelled"
  monthlyPayment: number
  interestRate?: number
  updatedAt?: string
}

interface SavingsTransaction {
  id: string
  goalId: string
  goalName: string
  amount: number
  type: "deposit" | "maturity" | "withdrawal" | "goal_creation"
  date: string
  description: string
}

interface SavingsMaturitySystem {
  savingsGoals: SavingsGoal[]
  transactions: SavingsTransaction[]
  addSavingsGoal: (
    goalData: Omit<SavingsGoal, "id" | "currentAmount" | "createdAt" | "maturityDate" | "status">,
  ) => SavingsGoal
  deposit: (goalId: string, amount: number) => SavingsGoal
  withdraw: (goalId: string, amount: number) => SavingsGoal
  getGoalById: (goalId: string) => SavingsGoal | undefined
  getTransactionsByGoalId: (goalId: string) => SavingsTransaction[]
  getAllGoals: () => SavingsGoal[]
}

class SavingsMaturitySystemImpl implements SavingsMaturitySystem {
  savingsGoals: SavingsGoal[] = []
  transactions: SavingsTransaction[] = []

  addSavingsGoal(
    goalData: Omit<SavingsGoal, "id" | "currentAmount" | "createdAt" | "maturityDate" | "status">,
  ): SavingsGoal {
    const now = new Date()
    const maturityDate = new Date(now)
    maturityDate.setMonth(maturityDate.getMonth() + goalData.duration)

    const newGoal: SavingsGoal = {
      id: `GOAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: goalData.name,
      targetAmount: goalData.targetAmount,
      currentAmount: 0,
      maturityDate: maturityDate.toISOString(),
      createdAt: new Date().toISOString(),
      status: "active",
      monthlyPayment: goalData.monthlyPayment,
      duration: goalData.duration,
      interestRate: goalData.interestRate,
    }

    this.savingsGoals.push(newGoal)

    // Add creation transaction
    const creationTransaction: SavingsTransaction = {
      id: `CREATE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      goalId: newGoal.id,
      goalName: goalData.name,
      amount: 0,
      type: "goal_creation",
      date: new Date().toISOString(),
      description: `Savings Page "${goalData.name}" - Tk${goalData.targetAmount.toLocaleString()} moved to savings`,
    }

    this.transactions.push(creationTransaction)

    return newGoal
  }

  deposit(goalId: string, amount: number): SavingsGoal {
    const goal = this.getGoalById(goalId)
    if (!goal) {
      throw new Error("Savings goal not found")
    }

    goal.currentAmount += amount
    goal.updatedAt = new Date().toISOString()

    const depositTransaction: SavingsTransaction = {
      id: `DEPOSIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      goalId: goal.id,
      goalName: goal.name,
      amount: amount,
      type: "deposit",
      date: new Date().toISOString(),
      description: `Deposited Tk${amount.toLocaleString()} to savings goal "${goal.name}"`,
    }

    this.transactions.push(depositTransaction)

    return goal
  }

  withdraw(goalId: string, amount: number): SavingsGoal {
    const goal = this.getGoalById(goalId)
    if (!goal) {
      throw new Error("Savings goal not found")
    }

    if (goal.currentAmount < amount) {
      throw new Error("Insufficient funds")
    }

    goal.currentAmount -= amount
    goal.updatedAt = new Date().toISOString()

    const withdrawalTransaction: SavingsTransaction = {
      id: `WITHDRAWAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      goalId: goal.id,
      goalName: goal.name,
      amount: amount,
      type: "withdrawal",
      date: new Date().toISOString(),
      description: `Withdrew Tk${amount.toLocaleString()} from savings goal "${goal.name}"`,
    }

    this.transactions.push(withdrawalTransaction)

    return goal
  }

  getGoalById(goalId: string): SavingsGoal | undefined {
    return this.savingsGoals.find((goal) => goal.id === goalId)
  }

  getTransactionsByGoalId(goalId: string): SavingsTransaction[] {
    return this.transactions.filter((transaction) => transaction.goalId === goalId)
  }

  getAllGoals(): SavingsGoal[] {
    return this.savingsGoals
  }
}

// Check for matured savings goals
export function checkMaturedSavings(): { maturedGoals: SavingsGoal[]; transactions: SavingsTransaction[] } {
  const goals = getSavingsGoals()
  const currentDate = new Date()
  const maturedGoals: SavingsGoal[] = []
  const newTransactions: SavingsTransaction[] = []

  goals.forEach((goal) => {
    if (goal.status === "active") {
      const maturityDate = new Date(goal.maturityDate)

      // Check if goal has matured
      if (currentDate >= maturityDate) {
        // Mark goal as completed
        goal.status = "completed"
        maturedGoals.push(goal)

        // Add maturity transaction
        const transaction: SavingsTransaction = {
          id: `MAT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          goalId: goal.id,
          goalName: goal.name,
          amount: goal.currentAmount,
          type: "maturity",
          date: new Date().toISOString(),
          description: `Savings goal "${goal.name}" matured - Amount added to main balance`,
        }
        newTransactions.push(transaction)

        // Add amount to main balance
        const currentBalance = Number(localStorage.getItem("userBalance") || "0")
        const newBalance = currentBalance + goal.currentAmount
        localStorage.setItem("userBalance", newBalance.toString())

        // Update user data
        const userData = localStorage.getItem("userData")
        if (userData) {
          const user = JSON.parse(userData)
          user.balance = newBalance
          localStorage.setItem("userData", JSON.stringify(user))
        }
      }
    }
  })

  // Save updated goals
  if (maturedGoals.length > 0) {
    saveSavingsGoals(goals)

    // Save new transactions
    const existingTransactions = getSavingsTransactions()
    const allTransactions = [...existingTransactions, ...newTransactions]
    saveSavingsTransactions(allTransactions)
  }

  return { maturedGoals, transactions: newTransactions }
}

// Get savings goals from localStorage
export function getSavingsGoals(): SavingsGoal[] {
  if (typeof window === "undefined") return []
  const goals = localStorage.getItem("savingsGoals")
  return goals ? JSON.parse(goals) : []
}

// Save savings goals to localStorage
export function saveSavingsGoals(goals: SavingsGoal[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("savingsGoals", JSON.stringify(goals))
}

// Get savings transactions from localStorage
export function getSavingsTransactions(): SavingsTransaction[] {
  if (typeof window === "undefined") return []
  const transactions = localStorage.getItem("savingsTransactions")
  return transactions ? JSON.parse(transactions) : []
}

// Save savings transactions to localStorage
export function saveSavingsTransactions(transactions: SavingsTransaction[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("savingsTransactions", JSON.stringify(transactions))
}

// Add a new savings goal with immediate balance deduction
export function addSavingsGoal(
  goal: Omit<SavingsGoal, "id" | "createdAt" | "maturityDate" | "status" | "currentAmount">,
): { success: boolean; goal?: SavingsGoal; message: string } {
  // Check if user has enough balance
  const currentBalance = Number(localStorage.getItem("userBalance") || "0")

  if (currentBalance < goal.targetAmount) {
    return {
      success: false,
      message: `Insufficient balance. You need Tk${goal.targetAmount.toLocaleString()} but only have Tk${currentBalance.toLocaleString()}`,
    }
  }

  const now = new Date()
  const maturityDate = new Date(now)
  maturityDate.setMonth(maturityDate.getMonth() + goal.duration)

  const newGoal: SavingsGoal = {
    ...goal,
    id: `GOAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now.toISOString(),
    maturityDate: maturityDate.toISOString(),
    status: "active",
    currentAmount: goal.targetAmount, // Set to full target amount immediately
  }

  // Deduct from main balance
  const newBalance = currentBalance - goal.targetAmount
  localStorage.setItem("userBalance", newBalance.toString())

  // Update user data
  const userData = localStorage.getItem("userData")
  if (userData) {
    const user = JSON.parse(userData)
    user.balance = newBalance
    localStorage.setItem("userData", JSON.stringify(user))
  }

  // Save goal
  const goals = getSavingsGoals()
  goals.push(newGoal)
  saveSavingsGoals(goals)

  // Create transaction for goal creation
  const transaction: SavingsTransaction = {
    id: `GOAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    goalId: newGoal.id,
    goalName: newGoal.name,
    amount: goal.targetAmount,
    type: "goal_creation",
    date: new Date().toISOString(),
    description: `Savings Page "${newGoal.name}" - Tk${goal.targetAmount.toLocaleString()} moved to savings`,
  }

  const transactions = getSavingsTransactions()
  transactions.push(transaction)
  saveSavingsTransactions(transactions)

  return { success: true, goal: newGoal, message: "Savings goal created successfully!" }
}

// Add money to savings goal (for additional deposits)
export function addMoneyToGoal(goalId: string, amount: number): boolean {
  const goals = getSavingsGoals()
  const goalIndex = goals.findIndex((g) => g.id === goalId)

  if (goalIndex === -1) return false

  goals[goalIndex].currentAmount += amount
  saveSavingsGoals(goals)

  // Add transaction
  const transaction: SavingsTransaction = {
    id: `DEP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    goalId: goalId,
    goalName: goals[goalIndex].name,
    amount: amount,
    type: "deposit",
    date: new Date().toISOString(),
    description: `Added Tk${amount.toLocaleString()} to "${goals[goalIndex].name}" savings goal`,
  }

  const transactions = getSavingsTransactions()
  transactions.push(transaction)
  saveSavingsTransactions(transactions)

  return true
}

// Get active savings goals
export function getActiveSavingsGoals(): SavingsGoal[] {
  return getSavingsGoals().filter((goal) => goal.status === "active")
}

// Get completed savings goals
export function getCompletedSavingsGoals(): SavingsGoal[] {
  return getSavingsGoals().filter((goal) => goal.status === "completed")
}

// Calculate days until maturity
export function getDaysUntilMaturity(goal: SavingsGoal): number {
  const now = new Date()
  const maturityDate = new Date(goal.maturityDate)
  const diffTime = maturityDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

// Format maturity date
export function formatMaturityDate(goal: SavingsGoal): string {
  const date = new Date(goal.maturityDate)
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export { SavingsMaturitySystemImpl }
export type { SavingsGoal, SavingsTransaction, SavingsMaturitySystem }
