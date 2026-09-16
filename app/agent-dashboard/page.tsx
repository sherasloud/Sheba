"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { formatBalance } from "@/lib/utils/balance-formatter" // Assuming this utility exists

export default function AgentDashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Agent")
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    const storedName = localStorage.getItem("userName")
    const storedBalance = localStorage.getItem("userBalance")

    if (userRole !== "agent") {
      router.replace("/login") // Redirect if not agent
    } else {
      if (storedName) setUserName(storedName)
      if (storedBalance) setBalance(Number(storedBalance))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("phoneNumber")
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    localStorage.removeItem("userBalance")
    localStorage.removeItem("currentUser")
    localStorage.removeItem("isVerified")
    // Keep PIN verification data intact for smoother re-entry
    router.replace("/login")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-[#29a9eb] text-white p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Agent Dashboard</h1>
        <div className="w-6"></div> {/* Placeholder for alignment */}
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Welcome, {userName}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold mb-2">Your Current Balance: {formatBalance(balance)}Tk</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Button className="w-full">Cash-In</Button>
              <Button className="w-full">Cash-Out</Button>
              <Button className="w-full">Transaction History</Button>
              <Button className="w-full">User Registration</Button>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleLogout} className="w-full mt-6 bg-red-500 hover:bg-red-600">
          Logout
        </Button>
      </main>
    </div>
  )
}
