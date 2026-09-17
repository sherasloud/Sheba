"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Phone, Lock } from "lucide-react"
import { findUserByPhone } from "@/lib/data/static-data"
import { 
  getAccountByPhone, 
  setCurrentUser, 
  getCurrentUser,
  verifyPIN,
  getAllAccounts 
} from "@/lib/account-manager"

export default function LoginPage() {
  const [loginMode, setLoginMode] = useState<"phone" | "pin">("phone")
  const [step, setStep] = useState<"phone" | "otp" | "pin">("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [pin, setPin] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [timer, setTimer] = useState(0)
  const [accountExists, setAccountExists] = useState(false)
  const router = useRouter()

  // Check if user already logged in
  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      router.push("/")
    }
  }, [router])

  // Check if account exists when phone number changes
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    setPhoneNumber(digits)
    console.log("[v0] Checking if account exists for phone:", digits)
    const account = getAccountByPhone(digits)
    console.log("[v0] Account found:", !!account)
    setAccountExists(!!account)
    // If account exists and we haven't set login mode yet, default to PIN
    if (account && loginMode === "phone") {
      setLoginMode("pin")
    }
  }

  // PIN Login Handler
  const handlePINLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!phoneNumber || phoneNumber.length < 11) {
      setError("Please enter a valid phone number (11 digits)")
      setIsLoading(false)
      return
    }

    if (!pin || pin.length < 4) {
      setError("Please enter a valid PIN (at least 4 digits)")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Verifying PIN for phone:", phoneNumber)
      
      const isValid = verifyPIN(phoneNumber, pin)
      if (isValid) {
        // Get the account with balance
        const account = getAccountByPhone(phoneNumber)
        if (account) {
          // Set current user
          setCurrentUser(phoneNumber)
          
          // Sync balance to localStorage for main app to use
          localStorage.setItem("phoneNumber", phoneNumber)
          localStorage.setItem(`userBalance_${phoneNumber}`, account.balance.toString())
          localStorage.setItem("userBalance", account.balance.toString())
          localStorage.setItem(`userName_${phoneNumber}`, account.name)
          localStorage.setItem("userName", account.name)
          localStorage.setItem("isVerified", "true")
          localStorage.setItem("isLoggedIn", "true")
          
          console.log("[v0] PIN verified, user data synced:", {
            phone: phoneNumber,
            balance: account.balance,
            name: account.name
          })
          
          router.push("/")
        } else {
          setError("Account not found. Please try again.")
        }
      } else {
        setError("Invalid PIN. Please try again.")
      }
    } catch (err) {
      console.error("[v0] PIN login error:", err)
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate phone number (Bangladesh format)
    if (!phoneNumber || phoneNumber.length < 11) {
      setError("Please enter a valid phone number (11 digits)")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Sending OTP to:", phoneNumber)
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber }),
      })

      const data = await response.json()

      if (data.success) {
        console.log("[v0] OTP sent successfully")
        setStep("otp")
        setTimer(300) // 5 minutes countdown
        const countdown = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              clearInterval(countdown)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(data.message || "Failed to send OTP")
      }
    } catch (err) {
      console.error("[v0] Error sending OTP:", err)
      setError("Failed to send OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleLoginMode = () => {
    setLoginMode(loginMode === "phone" ? "pin" : "phone")
    setStep(loginMode === "phone" ? "pin" : "phone")
    setError("")
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!otp || otp.length < 6) {
      setError("Please enter a valid 6-digit OTP")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Verifying OTP")
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, otp }),
      })

      const data = await response.json()

      if (data.success) {
        console.log("[v0] OTP verified successfully")
        
        // Find user and store data
        const user = findUserByPhone(phoneNumber)
        if (user) {
          localStorage.setItem("phoneNumber", phoneNumber)
          localStorage.setItem("userData", JSON.stringify(user))
          localStorage.setItem("userBalance", user.balance.toString())
          localStorage.setItem("isVerified", "true")
          localStorage.setItem("userName", user.fullName)
          localStorage.setItem("userRole", user.role)
        } else {
          // Auto-create user if doesn't exist
          localStorage.setItem("phoneNumber", phoneNumber)
          localStorage.setItem("isVerified", "true")
          localStorage.setItem("userName", "User")
          localStorage.setItem("userRole", "user")
        }

        // Redirect based on user role
        const role = user?.role || "user"
        switch (role) {
          case "admin":
            router.push("/admin-dashboard")
            break
          case "agent":
            router.push("/agent-dashboard")
            break
          case "merchant":
            router.push("/merchant-dashboard")
            break
          default:
            router.push("/")
            break
        }
      } else {
        setError(data.message || "Invalid OTP. Please try again.")
      }
    } catch (err) {
      console.error("[v0] Error verifying OTP:", err)
      setError("Failed to verify OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#29a9eb] to-[#1e7fa8] p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="flex flex-col items-center space-y-2 bg-gradient-to-r from-[#29a9eb] to-[#1e7fa8] text-white rounded-t-lg">
          <div className="bg-white/20 p-3 rounded-full mb-2">
            {loginMode === "phone" ? <Phone size={32} /> : <Lock size={32} />}
          </div>
          <CardTitle className="text-2xl font-bold">
            {loginMode === "phone" ? "Login with OTP" : "Quick PIN Login"}
          </CardTitle>
          <CardDescription className="text-white/80">
            {loginMode === "phone" 
              ? (step === "phone" ? "Enter your phone number" : "Enter the OTP sent to your phone")
              : "Existing users: Just enter PIN"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* PIN Login Mode */}
          {loginMode === "pin" && step === "pin" ? (
            <form onSubmit={handlePINLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin-phone" className="font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="pin-phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="01709783145"
                  required
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="text-lg py-6"
                  disabled={isLoading}
                />
                {accountExists && (
                  <p className="text-xs text-green-600">✓ Account found</p>
                )}
                {phoneNumber && !accountExists && (
                  <p className="text-xs text-orange-600">Account not found. Try OTP login.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin" className="font-semibold">
                  PIN
                </Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  placeholder="••••"
                  maxLength={6}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="text-lg py-6 text-center tracking-widest"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full py-6 text-lg font-bold bg-[#29a9eb] hover:bg-[#1e7fa8]"
                disabled={isLoading || phoneNumber.length !== 11 || !pin}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login with PIN"
                )}
              </Button>

              <div className="text-center pt-2">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm"
                  onClick={handleToggleLoginMode}
                >
                  Don't have PIN? Use OTP
                </Button>
              </div>
            </form>
          ) : loginMode === "phone" && step === "phone" ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="01709783145"
                  required
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="text-lg py-6"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">Format: 11 digits (e.g., 01709783145)</p>
              </div>

              <Button
                type="submit"
                className="w-full py-6 text-lg font-bold bg-[#29a9eb] hover:bg-[#1e7fa8]"
                disabled={isLoading || phoneNumber.length !== 11}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <p className="font-semibold mb-1">✓ Completely Free!</p>
                <p className="text-xs">
                  OTP login is powered by Supabase and costs nothing. You'll receive a code via SMS.
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="font-semibold">
                  Verification Code
                </Label>
                <div className="text-center mb-2 text-sm text-gray-600">
                  Code sent to {phoneNumber}
                </div>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "")
                    setOtp(digits.slice(0, 6))
                  }}
                  className="text-center text-2xl tracking-widest py-6 font-mono"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full py-6 text-lg font-bold bg-[#29a9eb] hover:bg-[#1e7fa8]"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </Button>

              <div className="text-center space-y-2">
                <Button
                  type="button"
                  variant="link"
                  className="text-xs"
                  onClick={() => {
                    setStep("phone")
                    setOtp("")
                    setError("")
                  }}
                >
                  Change phone number
                </Button>
                
                <div className="pt-2 border-t">
                  <Button
                    type="button"
                    variant="link"
                    className="text-xs text-green-600"
                    onClick={handleToggleLoginMode}
                  >
                    Already have an account? Use PIN
                  </Button>
                </div>
              </div>

              <div className="text-center text-sm">
                {timer > 0 ? (
                  <p className="text-gray-600">
                    Code expires in <span className="font-bold text-[#29a9eb]">{formatTime(timer)}</span>
                  </p>
                ) : (
                  <Button type="button" variant="link" className="text-xs" onClick={() => setStep("phone")}>
                    Didn't receive code? Send again
                  </Button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
