import { getCollection } from "@/lib/db/mongodb"

export async function getUserBalance(phoneNumber: string): Promise<number> {
  try {
    const collection = await getCollection("user_balances")
    const record = await collection.findOne({ phone_number: phoneNumber })
    
    if (!record) {
      console.log("[v0] No balance record found for:", phoneNumber)
      return 0
    }
    
    return Number(record.balance) || 0
  } catch (error) {
    console.error("[v0] Error fetching balance:", error)
    return 0
  }
}

export async function updateUserBalance(phoneNumber: string, newBalance: number): Promise<boolean> {
  try {
    const collection = await getCollection("user_balances")
    
    const result = await collection.updateOne(
      { phone_number: phoneNumber },
      {
        $set: {
          phone_number: phoneNumber,
          balance: newBalance,
          updated_at: new Date(),
        }
      },
      { upsert: true }
    )
    
    console.log("[v0] Updated balance for", phoneNumber, "to", newBalance)
    return true
  } catch (error) {
    console.error("[v0] Error updating balance:", error)
    return false
  }
}

export async function deductBalance(phoneNumber: string, amount: number): Promise<boolean> {
  try {
    const currentBalance = await getUserBalance(phoneNumber)
    const newBalance = currentBalance - amount

    if (newBalance < 0) {
      console.error("[v0] Insufficient balance")
      return false
    }

    return await updateUserBalance(phoneNumber, newBalance)
  } catch (error) {
    console.error("[v0] Error deducting balance:", error)
    return false
  }
}
