"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, XCircle, Home } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"

interface VerificationStatus {
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  nidNumber: string
}

export default function VerificationProcessingPage() {
  const router = useRouter()
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [userPhone, setUserPhone] = useState("")

  useEffect(() => {
    const phone = localStorage.getItem("phoneNumber") || localStorage.getItem("currentUser")
    const requestId = sessionStorage.getItem("verificationRequestId")
    const nidNumber = sessionStorage.getItem("nidNumber") || "****"

    if (!phone) {
      router.replace("/login")
      return
    }

    setUserPhone(phone)

    // Load initial verification status
    loadVerificationStatus(phone, nidNumber)

    // Subscribe to real-time updates
    const supabase = createClient()
    const channel = supabase
      .channel(`verification_${phone}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "verification_requests",
          filter: `phone=eq.${phone}`,
        },
        (payload) => {
          console.log("[v0] Verification status updated:", payload)
          if (payload.new) {
            const newData = payload.new as any
            setVerificationStatus({
              status: newData.status,
              submittedAt: newData.submitted_at,
              nidNumber: newData.nid_number,
            })

            // Auto-redirect if approved
            if (newData.status === "approved") {
              setTimeout(() => {
                router.replace("/dashboard")
              }, 2000)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  const loadVerificationStatus = async (phone: string, nidNumber: string) => {
    try {
      console.log("[v0] Loading verification status for phone:", phone)
      const response = await fetch(`/api/verify-request?phone=${phone}`)
      const result = await response.json()
      console.log("[v0] API response:", result)

      if (result.success && result.data && result.data.length > 0) {
        const latestRequest = result.data[0]
        console.log("[v0] Found verification request in DB:", latestRequest)
        setVerificationStatus({
          status: latestRequest.status,
          submittedAt: latestRequest.submitted_at,
          nidNumber: latestRequest.nid_number,
        })
      } else {
        console.log("[v0] No data from API, checking sessionStorage")
        // Fallback to session data
        const sessionStatus = sessionStorage.getItem("verificationStatus") || "pending"
        const sessionSubmittedAt = sessionStorage.getItem("verificationSubmittedAt") || new Date().toISOString()
        
        setVerificationStatus({
          status: sessionStatus as any,
          submittedAt: sessionSubmittedAt,
          nidNumber: nidNumber,
        })
      }
    } catch (error) {
      console.error("[v0] Error loading verification status:", error)
      setVerificationStatus({
        status: "pending",
        submittedAt: new Date().toISOString(),
        nidNumber: nidNumber,
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusDisplay = () => {
    if (!verificationStatus) return null

    switch (verificationStatus.status) {
      case "pending":
        return {
          icon: <Clock className="h-16 w-16 text-yellow-500 animate-spin" />,
          title: "Verification in Progress",
          description: "Your verification request is being processed by our admin team.",
          badge: "Pending",
          badgeColor: "bg-yellow-100 text-yellow-800",
        }
      case "approved":
        return {
          icon: <CheckCircle2 className="h-16 w-16 text-green-500" />,
          title: "Verification Approved!",
          description: "Your verification has been approved. Redirecting to dashboard...",
          badge: "Approved",
          badgeColor: "bg-green-100 text-green-800",
        }
      case "rejected":
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: "Verification Rejected",
          description: "Your verification request was not approved. Please try again with correct information.",
          badge: "Rejected",
          badgeColor: "bg-red-100 text-red-800",
        }
      default:
        return null
    }
  }

  const handleGoHome = () => {
    router.replace("/")
  }

  const handleRetry = () => {
    sessionStorage.removeItem("verificationRequestId")
    sessionStorage.removeItem("verificationStatus")
    router.replace("/verification")
  }

  const display = getStatusDisplay()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>Your NID verification request</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Spinner className="h-12 w-12" />
                <p className="text-sm text-gray-600">Loading verification status...</p>
              </div>
            ) : display ? (
              <>
                <div className="flex flex-col items-center justify-center py-4 space-y-4">
                  {display.icon}
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold">{display.title}</h2>
                    <p className="text-sm text-gray-600">{display.description}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                    <Badge className={`${display.badgeColor} mt-1`}>{display.badge}</Badge>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">NID Number</p>
                    <p className="text-sm font-mono mt-1">{verificationStatus.nidNumber}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Submitted</p>
                    <p className="text-sm mt-1">
                      {new Date(verificationStatus.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {verificationStatus.status === "pending" && (
                    <div className="text-center text-sm text-gray-600">
                      <p>Please wait while our team reviews your request.</p>
                      <p className="text-xs mt-1">Typically approved within 24 hours.</p>
                    </div>
                  )}

                  {verificationStatus.status === "approved" && (
                    <Button onClick={() => router.replace("/dashboard")} className="w-full">
                      Go to Dashboard
                    </Button>
                  )}

                  {verificationStatus.status === "rejected" && (
                    <div className="space-y-2">
                      <Button onClick={handleRetry} className="w-full" variant="default">
                        Try Again
                      </Button>
                      <Button onClick={handleGoHome} variant="outline" className="w-full">
                        Go Home
                      </Button>
                    </div>
                  )}

                  {verificationStatus.status === "pending" && (
                    <Button onClick={handleGoHome} variant="outline" className="w-full">
                      <Home className="h-4 w-4 mr-2" />
                      Go Home
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Unable to load verification status</p>
                <Button onClick={handleGoHome} variant="outline" className="mt-4">
                  Go Home
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>User Phone: {userPhone}</p>
        </div>
      </div>
    </div>
  )
}
