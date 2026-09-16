"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AgentRegisterPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [fullName, setFullName] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (phoneNumber.length !== 11 || !/^\d+$/.test(phoneNumber)) {
      setError("Please enter a valid 11-digit phone number.")
      setLoading(false)
      return
    }

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError("PIN must be a 6-digit number.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/register-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, fullName, pin }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Agent registered successfully! You can now log in.")
        setPhoneNumber("")
        setFullName("")
        setPin("")
        // Optionally redirect to login or home after a delay
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(data.message || "Registration failed. Please try again.")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mobile-page">
      <div className="mobile-header">
        <Link href="/" className="mr-4 touch-manipulation">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-lg font-medium">Agent Registration</div>
      </div>

      <div className="mobile-content flex flex-col justify-center">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Agent Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="01XXXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={11}
              required
              className="mobile-input"
            />
          </div>
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mobile-input"
            />
          </div>
          <div>
            <Label htmlFor="pin">6-Digit PIN</Label>
            <Input
              id="pin"
              type="password"
              placeholder="••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
              required
              className="mobile-input text-center"
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-500 text-sm text-center">{success}</div>}

          <Button type="submit" className="mobile-button w-full" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-[#29a9eb] hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
