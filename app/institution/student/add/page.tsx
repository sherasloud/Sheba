"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function AddStudentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const classId = searchParams.get("classId")
  const institutionId = searchParams.get("institutionId")

  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    parentPhone: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAddStudent = async () => {
    if (!formData.name.trim()) {
      setError("Student name is required")
      return
    }

    if (!classId || !institutionId) {
      setError("Class and Institution information missing")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/institution/student/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          institutionId,
          name: formData.name,
          rollNo: formData.rollNo || null,
          parentPhone: formData.parentPhone || null,
        }),
      })

      if (response.ok) {
        router.back()
      } else {
        setError("Failed to add student")
      }
    } catch (err) {
      setError("An error occurred")
      console.error("[v0] Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1FBFFF] text-white p-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/20 rounded-lg">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Add Student</h1>
      </div>

      {/* Form */}
      <div className="p-4">
        <div className="bg-white rounded-lg p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter student name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
            <input
              type="text"
              value={formData.rollNo}
              onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
              placeholder="Enter roll number (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone</label>
            <input
              type="text"
              value={formData.parentPhone}
              onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              placeholder="Enter parent phone (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF]"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleAddStudent}
              disabled={loading}
              className="flex-1 bg-[#1FBFFF] text-white p-3 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? "Adding..." : "Add Student"}
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
