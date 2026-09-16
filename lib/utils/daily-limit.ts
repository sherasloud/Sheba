// Daily limit configuration
const DAILY_LIMIT = 5000 // Tk 5000 per day

export interface DailyLimitInfo {
  totalUsed: number
  remaining: number
  limit: number
  resetTime: string
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

/**
 * Get daily recharge limit info for admin user
 */
export function getDailyLimitInfo(adminPhone: string): DailyLimitInfo {
  const today = getTodayDateString()
  const storageKey = `daily_recharge_${adminPhone}_${today}`

  const storedAmount = localStorage.getItem(storageKey)
  const totalUsed = storedAmount ? Number(storedAmount) : 0
  const remaining = Math.max(0, DAILY_LIMIT - totalUsed)

  // Calculate reset time (midnight tonight)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const resetTime = tomorrow.toISOString()

  return {
    totalUsed,
    remaining,
    limit: DAILY_LIMIT,
    resetTime,
  }
}

/**
 * Add recharge amount to daily total
 */
export function addToDailyTotal(adminPhone: string, amount: number): boolean {
  const today = getTodayDateString()
  const storageKey = `daily_recharge_${adminPhone}_${today}`

  const limitInfo = getDailyLimitInfo(adminPhone)

  // Check if adding this amount would exceed limit
  if (limitInfo.totalUsed + amount > DAILY_LIMIT) {
    return false
  }

  // Add to total
  const newTotal = limitInfo.totalUsed + amount
  localStorage.setItem(storageKey, newTotal.toString())

  return true
}

/**
 * Check if recharge amount is within daily limit
 */
export function canRecharge(
  adminPhone: string,
  amount: number,
): {
  allowed: boolean
  message?: string
  remaining: number
} {
  const limitInfo = getDailyLimitInfo(adminPhone)

  if (amount > limitInfo.remaining) {
    return {
      allowed: false,
      message: `Daily limit exceeded. You have Tk${limitInfo.remaining} remaining today. Limit resets at midnight.`,
      remaining: limitInfo.remaining,
    }
  }

  return {
    allowed: true,
    remaining: limitInfo.remaining,
  }
}
