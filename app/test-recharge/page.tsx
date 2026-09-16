"use client"

import { useState } from "react"

export default function TestRechargePage() {
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const testRecharge = async () => {
    setLoading(true)
    setStatus("Starting recharge...")

    try {
      console.log("[v0] Starting test recharge")

      const response = await fetch("/api/recharge/direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: "01709783145",
          operator: "Grameenphone",
          type: "Prepaid",
          amount: 35,
          pin: "123456",
        }),
      })

      console.log("[v0] Response status:", response.status)

      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (data.success) {
        setStatus("✅ SUCCESS! Recharge completed: " + JSON.stringify(data, null, 2))
      } else {
        setStatus(
          "❌ FAILED: " + (data.error || "Unknown error") + "\n\nFull response: " + JSON.stringify(data, null, 2),
        )
      }
    } catch (error: any) {
      console.error("[v0] Test recharge error:", error)
      setStatus("❌ ERROR: " + error.message + "\n\nStack: " + error.stack)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Test Recharge Page</h1>
      <p>This is a minimal test page to check if the recharge API works.</p>

      <button
        onClick={testRecharge}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: loading ? "#ccc" : "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Testing..." : "Test Recharge"}
      </button>

      {status && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#f5f5f5",
            border: "1px solid #ddd",
            borderRadius: "5px",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        >
          {status}
        </pre>
      )}
    </div>
  )
}
