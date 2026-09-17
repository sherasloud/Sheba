import { db } from "@/lib/db"
import { appUsers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return Response.json({ error: "Phone number required" }, { status: 400 })
    }

    const user = await db
      .select({
        phoneNumber: appUsers.phoneNumber,
        fullName: appUsers.fullName,
        balance: appUsers.balance,
      })
      .from(appUsers)
      .where(eq(appUsers.phoneNumber, phone))
      .limit(1)

    if (!user || user.length === 0) {
      return Response.json({ fullName: "User", balance: 0 }, { status: 200 })
    }

    return Response.json(
      {
        fullName: user[0].fullName || "User",
        balance: user[0].balance || 0,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error("[v0] Error fetching user data:", err)
    return Response.json({ fullName: "User", balance: 0 }, { status: 200 })
  }
}
