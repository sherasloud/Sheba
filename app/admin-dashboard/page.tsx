"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, User, Building, Briefcase, Check } from "lucide-react"

interface UserData {
  phoneNumber: string
  fullName: string
  balance: number
  accountType: "regular" | "business" | "state"
  isVerified: boolean
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Admin")
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    const userPhone = localStorage.getItem("userPhone")

    if (userRole !== "admin" && userPhone !== "01709783145" && userPhone !== "01930314459") {
      router.replace("/login")
      return
    }

    const storedName = localStorage.getItem("userName")
    if (storedName) {
      setUserName(storedName)
    }

    loadAllUsers()
  }, [router])

  const loadAllUsers = () => {
    const allUsers: UserData[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("user_")) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || "{}")
          if (userData.phoneNumber) {
            const accountType = localStorage.getItem(`accountType_${userData.phoneNumber}`) || "regular"
            allUsers.push({
              phoneNumber: userData.phoneNumber,
              fullName: userData.fullName || "Unknown User",
              balance: userData.balance || 0,
              accountType: accountType as "regular" | "business" | "state",
              isVerified: userData.isVerified || false,
            })
          }
        } catch (error) {
          console.error("[v0] Error loading user:", error)
        }
      }
    }

    setUsers(allUsers)
    setFilteredUsers(allUsers)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(
      (user) => user.phoneNumber.includes(query) || user.fullName.toLowerCase().includes(query.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }

  const convertAccountType = (phoneNumber: string, newType: "regular" | "business" | "state") => {
    localStorage.setItem(`accountType_${phoneNumber}`, newType)

    const updatedUsers = users.map((user) =>
      user.phoneNumber === phoneNumber ? { ...user, accountType: newType } : user,
    )
    setUsers(updatedUsers)
    setFilteredUsers(
      updatedUsers.filter(
        (user) =>
          !searchQuery ||
          user.phoneNumber.includes(searchQuery) ||
          user.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    )

    alert(`${phoneNumber} successfully converted to ${newType} account!`)
  }

  const handleLogout = () => {
    localStorage.removeItem("phoneNumber")
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    localStorage.removeItem("userBalance")
    localStorage.removeItem("currentUser")
    localStorage.removeItem("isVerified")
    router.replace("/login")
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "business":
        return "bg-blue-500"
      case "state":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case "business":
        return <Building className="h-4 w-4" />
      case "state":
        return <Briefcase className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-[#29a9eb] text-white p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/20">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white hover:bg-white/20">
          Logout
        </Button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {userName}!</CardTitle>
            <CardDescription>Manage user accounts and convert to Business or State accounts</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by phone number or name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 pb-20">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">No users found</CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.phoneNumber}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.fullName}</h3>
                          {user.isVerified && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.phoneNumber}</p>
                        <p className="text-sm font-medium">Balance: ৳{user.balance.toLocaleString()}</p>
                      </div>
                      <Badge className={`${getAccountTypeColor(user.accountType)} text-white`}>
                        <span className="mr-1">{getAccountTypeIcon(user.accountType)}</span>
                        {user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={user.accountType === "regular" ? "default" : "outline"}
                        onClick={() => convertAccountType(user.phoneNumber, "regular")}
                        disabled={user.accountType === "regular"}
                        className="flex-1"
                      >
                        <User className="h-4 w-4 mr-1" />
                        Regular
                      </Button>
                      <Button
                        size="sm"
                        variant={user.accountType === "business" ? "default" : "outline"}
                        onClick={() => convertAccountType(user.phoneNumber, "business")}
                        disabled={user.accountType === "business"}
                        className="flex-1"
                      >
                        <Building className="h-4 w-4 mr-1" />
                        Business
                      </Button>
                      <Button
                        size="sm"
                        variant={user.accountType === "state" ? "default" : "outline"}
                        onClick={() => convertAccountType(user.phoneNumber, "state")}
                        disabled={user.accountType === "state"}
                        className="flex-1"
                      >
                        <Briefcase className="h-4 w-4 mr-1" />
                        State
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
