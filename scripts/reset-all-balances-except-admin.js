// Script to reset all user balances to 0 except for admin user (01709783145)
// This will fix the balance corruption issue

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetAllBalances() {
  try {
    console.log("[v0] Starting balance reset process...")

    // First, get all users from database
    const { data: users, error: fetchError } = await supabase.from("users").select("id, phone, name, balance")

    if (fetchError) {
      console.error("Error fetching users:", fetchError)
      return
    }

    console.log(`[v0] Found ${users.length} users in database`)

    // Reset all balances to 0 except admin
    const adminPhone = "01709783145"
    const adminBalance = 99979997979999

    for (const user of users) {
      let newBalance = 0

      // Keep admin balance massive
      if (user.phone === adminPhone) {
        newBalance = adminBalance
        console.log(`[v0] Keeping admin balance: ${user.phone} = ${newBalance}`)
      } else {
        console.log(`[v0] Resetting balance: ${user.phone} from ${user.balance} to ${newBalance}`)
      }

      // Update balance in database
      const { error: updateError } = await supabase.from("users").update({ balance: newBalance }).eq("id", user.id)

      if (updateError) {
        console.error(`Error updating balance for ${user.phone}:`, updateError)
      } else {
        console.log(`[v0] ✅ Updated ${user.phone} balance to ${newBalance}`)
      }
    }

    // Also clean up localStorage for all users
    console.log("[v0] Cleaning up localStorage balance corruption...")

    // Clear all userBalance_* keys except admin
    const allKeys = Object.keys(localStorage)
    const balanceKeys = allKeys.filter((key) => key.startsWith("userBalance_"))

    for (const key of balanceKeys) {
      const phone = key.replace("userBalance_", "")
      if (phone === adminPhone) {
        localStorage.setItem(key, adminBalance.toString())
        console.log(`[v0] Set admin localStorage balance: ${key} = ${adminBalance}`)
      } else {
        localStorage.setItem(key, "0")
        console.log(`[v0] Reset localStorage balance: ${key} = 0`)
      }
    }

    // Reset global userBalance if it exists
    const currentPhone = localStorage.getItem("phoneNumber")
    if (currentPhone === adminPhone) {
      localStorage.setItem("userBalance", adminBalance.toString())
      console.log(`[v0] Set current user balance to admin: ${adminBalance}`)
    } else {
      localStorage.setItem("userBalance", "0")
      console.log(`[v0] Reset current user balance to 0`)
    }

    // Update userData if it exists
    const userData = localStorage.getItem("userData")
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.phoneNumber === adminPhone) {
          user.balance = adminBalance
        } else {
          user.balance = 0
        }
        localStorage.setItem("userData", JSON.stringify(user))
        console.log(`[v0] Updated userData balance for ${user.phoneNumber}`)
      } catch (e) {
        console.error("Error updating userData:", e)
      }
    }

    console.log("[v0] ✅ Balance reset completed successfully!")
    console.log(`[v0] Admin (${adminPhone}) balance: ${adminBalance}`)
    console.log("[v0] All other users balance: 0")

    // Trigger a page refresh to update UI
    if (typeof window !== "undefined") {
      window.location.reload()
    }
  } catch (error) {
    console.error("[v0] Error during balance reset:", error)
  }
}

// Run the reset
resetAllBalances()
