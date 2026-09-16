"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

export default function BusinessRegisterPage() {
  const [companyName, setCompanyName] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!companyName || !businessType || !contactPhone) {
      setError("All fields are required.")
      return
    }

    // Simulate API call for business registration
    try {
      // In a real application, you would send this data to your backend
      // For now, we'll simulate success and store in localStorage
      const businessData = {
        companyName,
        businessType,
        contactPhone,
        registeredAt: new Date().toISOString(),
        isBusinessAccount: true,
      }

      localStorage.setItem("businessAccountData", JSON.stringify(businessData))
      setSuccess("Business account registered successfully! Redirecting to login...")

      setTimeout(() => {
        router.push("/login")
      }, 2000) // Redirect after 2 seconds
    } catch (err) {
      setError("Failed to register business account. Please try again.")
      console.error("Business registration error:", err)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="mb-8">
        <Image src="/images/droplet-logo.png" alt="Seba Logo" width={120} height={120} className="mx-auto" />
        <h1 className="text-3xl font-bold text-center text-[#29a9eb] mt-4">Sheba Business</h1>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Register Your Business Account</CardTitle>
          <CardDescription className="text-center">
            Fill in the details below to create your Sheba Business account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="company-name">Company Name</label>
              <Input
                id="company-name"
                type="text"
                placeholder="e.g., ABC Solutions Ltd."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="business-type">Business Type</label>
              <Input
                id="business-type"
                type="text"
                placeholder="e.g., Retail, Service, Manufacturing"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="contact-phone">Contact Phone Number</label>
              <Input
                id="contact-phone"
                type="tel"
                placeholder="e.g., 017XXXXXXXX"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {success && <p className="text-green-500 text-sm text-center">{success}</p>}
            <Button type="submit" className="w-full bg-[#29a9eb] hover:bg-[#248ec7]">
              Register Business
            </Button>
          </form>
        </CardContent>
        <div className="text-center text-sm text-gray-500 mb-4">
          Already have a personal account?{" "}
          <Link href="/login" className="underline hover:text-[#29a9eb]">
            Login here
          </Link>
        </div>
      </Card>
    </div>
  )
}
