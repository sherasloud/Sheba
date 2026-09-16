"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EduFeeStudentIdPage() {
  const router = useRouter()
  const [studentId, setStudentId] = useState("")
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const rawInstitution = localStorage.getItem("selectedInstitution")

    if (!rawInstitution) {
      router.push("/edu-fee")
      return
    }

    try {
      const institution = JSON.parse(rawInstitution)
      setSelectedInstitution(institution)
    } catch (error) {
      console.error("Error parsing institution data:", error)
      router.push("/edu-fee")
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentId.trim()) {
      setError("Please enter your Student ID/Roll Number")
      return
    }

    if (studentId.length < 5) {
      setError("Student ID must be at least 5 characters")
      return
    }

    // Store student ID and navigate immediately
    localStorage.setItem("studentId", studentId.trim())
    router.push("/edu-fee/amount")
  }

  if (!selectedInstitution) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <button onClick={() => router.push("/edu-fee")} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-medium">Student Information</div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#29a9eb]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <button onClick={() => router.push("/edu-fee")} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div className="text-xl font-medium">Student Information</div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        {/* Institution Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg overflow-hidden mr-3 bg-white p-1">
              {selectedInstitution.logo ? (
                <img
                  src={selectedInstitution.logo || "/placeholder.svg"}
                  alt={selectedInstitution.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#29a9eb] text-xl">
                  {selectedInstitution.type === "schools" ? "🏫" : selectedInstitution.type === "colleges" ? "🎓" : "🏛️"}
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold text-lg">{selectedInstitution.name}</div>
              <div className="text-sm text-gray-600 capitalize">
                {selectedInstitution.type === "schools"
                  ? "School"
                  : selectedInstitution.type === "colleges"
                    ? "College"
                    : "University"}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
              Student ID / Roll Number
            </label>
            <input
              type="text"
              id="studentId"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value)
                setError("")
              }}
              placeholder="Enter your Student ID or Roll Number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#29a9eb] focus:border-transparent"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={!studentId.trim()}
            className="w-full bg-[#29a9eb] text-white py-4 rounded-lg font-medium text-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#2196d3] transition-colors"
          >
            Continue
          </button>
        </form>

        {/* Info note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Please enter your correct Student ID or Roll Number as it appears on your institution
            records.
          </p>
        </div>
      </div>
    </div>
  )
}
