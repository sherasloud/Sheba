"use client"

import { useState } from "react"

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [adminData, setAdminData] = useState(null)

  const setupAdmin = async () => {
    setLoading(true)
    setMessage("")
    try {
      const response = await fetch("/api/setup-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()
      console.log("[v0] Admin setup response:", data)

      if (data.success) {
        setMessage("✓ Admin account created successfully!")
        setAdminData(data.admin)
      } else {
        setMessage(data.message || "Admin already exists or error occurred")
        setAdminData(data.admin)
      }
    } catch (error) {
      console.error("[v0] Error setting up admin:", error)
      setMessage("Error: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cyan-400 via-blue-400 to-blue-500 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Setup</h1>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Phone:</strong> 01709783145
          </p>
          <p className="text-sm text-gray-700">
            <strong>PIN:</strong> 872026
          </p>
        </div>

        <button
          onClick={setupAdmin}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Setting up..." : "Create Admin Account"}
        </button>

        {message && (
          <div className={`mt-6 p-4 rounded-lg ${message.startsWith("✓") ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>
            {message}
          </div>
        )}

        {adminData && (
          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Admin Details:</h3>
            <pre className="text-xs text-gray-700 overflow-auto">
              {JSON.stringify(adminData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
