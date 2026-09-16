"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, User, Building, Briefcase, Check, X, Clock } from "lucide-react"
import { isAdminPhone } from "@/lib/account-manager"

interface UserData {
  phoneNumber: string
  fullName: string
  balance: number
  accountType: "regular" | "business" | "state"
  isVerified: boolean
}

interface VerificationRequest {
  id: string
  phone: string
  nid_number: string
  status: "pending" | "approved" | "rejected"
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Admin")
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [activeTab, setActiveTab] = useState<"users" | "verification">("users")
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [adminPhone, setAdminPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const userPhone = localStorage.getItem("phoneNumber")

    if (!userPhone || !isAdminPhone(userPhone)) {
      router.replace("/")
      return
    }

    setAdminPhone(userPhone)

    const storedName = localStorage.getItem(`userName_${userPhone}`)
    if (storedName) {
      setUserName(storedName)
    }

    loadAllUsers()
    loadVerificationRequests()

    // Auto-refresh users every 5 seconds
    const interval = setInterval(() => {
      loadAllUsers()
    }, 5000)

    return () => clearInterval(interval)
  }, [router])

  const loadAllUsers = async () => {
    try {
      const userPhone = localStorage.getItem("phoneNumber")
      if (!userPhone) {
        console.error('[v0] No admin phone found')
        return
      }

      console.log('[v0] Loading users for admin:', userPhone)

      const response = await fetch('/api/admin/get-all-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPhone: userPhone }),
        cache: 'no-store',
      })

      if (!response.ok) {
        console.error('[v0] API response not OK:', response.status)
        throw new Error(`Failed to fetch users: ${response.status}`)
      }

      const data = await response.json()
      console.log('[v0] API response:', data)

      if (data.success && data.users && Array.isArray(data.users)) {
        const allUsers: UserData[] = data.users.map((user: any) => ({
          phoneNumber: user.phoneNumber || "",
          fullName: user.fullName || "Unknown User",
          balance: typeof user.balance === 'number' ? user.balance : Number(user.balance) || 0,
          accountType: (user.accountType || "personal") as "regular" | "business" | "state",
          isVerified: user.isVerified || false,
        }))
        
        setUsers(allUsers)
        setFilteredUsers(allUsers)
        console.log('[v0] Loaded users from Neon:', allUsers.length, 'users')
      } else {
        console.error('[v0] Invalid response format:', data)
        setUsers([])
        setFilteredUsers([])
      }
    } catch (error) {
      console.error('[v0] Error loading users from Neon:', error)
      setUsers([])
      setFilteredUsers([])
    }
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

  const loadVerificationRequests = async () => {
    try {
      const response = await fetch("/api/verify-request")
      const result = await response.json()
      if (result.success) {
        setVerificationRequests(result.data || [])
      }
    } catch (error) {
      console.error("[v0] Error loading verification requests:", error)
    }
  }

  // Subscribe to real-time verification request updates
  useEffect(() => {
    if (activeTab === "verification") {
      const supabase = createClient()
      const channel = supabase
        .channel("verification_requests:all")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "verification_requests",
          },
          () => {
            console.log("[v0] Verification request update detected")
            loadVerificationRequests()
          }
        )
        .subscribe()

      unsubscribeRef.current = () => {
        supabase.removeChannel(channel)
      }

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
        }
      }
    }
  }, [activeTab])

  const handleApproveReject = async (requestId: string, action: "approve" | "reject") => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/verify-request", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action,
          adminPhone,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Update the list
        setVerificationRequests(
          verificationRequests.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  status: action === "approve" ? "approved" : "rejected",
                  reviewed_at: new Date().toISOString(),
                  reviewed_by: adminPhone,
                }
              : req
          )
        )
        alert(`Verification request ${action}ed successfully!`)
      } else {
        alert(`Error: ${result.message}`)
      }
    } catch (error) {
      console.error("[v0] Error:", error)
      alert("Failed to process verification request")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <Check className="h-4 w-4" />
      case "rejected":
        return <X className="h-4 w-4" />
      default:
        return null
    }
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
            <CardDescription>
              {activeTab === "users"
                ? "Manage user accounts and convert to Business or State accounts"
                : "Review and approve/reject verification requests"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={activeTab === "users" ? "default" : "outline"}
                onClick={() => setActiveTab("users")}
              >
                <User className="h-4 w-4 mr-2" />
                Users
              </Button>
              <Button
                variant={activeTab === "verification" ? "default" : "outline"}
                onClick={() => {
                  setActiveTab("verification")
                  loadVerificationRequests()
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Verification Requests
              </Button>
            </div>
          </CardContent>
        </Card>

        {activeTab === "users" && (
          <>
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
          </>
        )}

        {activeTab === "verification" && (
          <div className="space-y-3 pb-20">
            {verificationRequests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">No verification requests found</CardContent>
              </Card>
            ) : (
              verificationRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">NID: {request.nid_number}</h3>
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Phone: {request.phone}</p>
                          <p className="text-sm text-gray-600">
                            Submitted: {new Date(request.submitted_at).toLocaleString()}
                          </p>
                          {request.reviewed_at && (
                            <p className="text-sm text-gray-600">
                              Reviewed: {new Date(request.reviewed_at).toLocaleString()} by {request.reviewed_by}
                            </p>
                          )}
                        </div>
                      </div>

                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveReject(request.id, "approve")}
                            disabled={isLoading}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {isLoading ? "Processing..." : "Approve"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleApproveReject(request.id, "reject")}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4 mr-1" />
                            {isLoading ? "Processing..." : "Reject"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
