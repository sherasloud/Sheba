"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Settings } from "lucide-react"

export default function InstitutionPage() {
  const router = useRouter()
  const [userPhone, setUserPhone] = useState("")
  const [institutions, setInstitutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({ name: "", type: "school" })

  useEffect(() => {
    const phone = localStorage.getItem("phoneNumber")
    if (!phone) {
      router.replace("/")
      return
    }
    setUserPhone(phone)
    loadInstitutions(phone)
  }, [router])

  const loadInstitutions = async (phone: string) => {
    try {
      const response = await fetch(`/api/institution/list?phone=${encodeURIComponent(phone)}`)
      if (response.ok) {
        const data = await response.json()
        setInstitutions(data.institutions || [])
      }
    } catch (error) {
      console.error("[v0] Failed to load institutions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInstitution = async () => {
    if (!formData.name.trim()) return

    try {
      const response = await fetch("/api/institution/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          managerPhone: userPhone,
        }),
      })

      if (response.ok) {
        setFormData({ name: "", type: "school" })
        setShowCreateForm(false)
        loadInstitutions(userPhone)
      }
    } catch (error) {
      console.error("[v0] Failed to create institution:", error)
    }
  }

  const handleSelectInstitution = (institutionId: string) => {
    localStorage.setItem("selectedInstitutionId", institutionId)
    router.push(`/institution/dashboard/${institutionId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1FBFFF] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="p-2 hover:bg-white/20 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">Institution</h1>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-white text-[#1FBFFF] p-2 rounded-lg hover:bg-gray-100"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Institution Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3"
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3"
          >
            <option value="school">School</option>
            <option value="college">College</option>
            <option value="university">University</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleCreateInstitution}
              className="flex-1 bg-[#1FBFFF] text-white p-3 rounded-lg font-medium hover:bg-blue-600"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Institutions List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1FBFFF]"></div>
          </div>
        ) : institutions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No institutions yet</p>
            <p className="text-sm mt-2">Create your first institution to get started</p>
          </div>
        ) : (
          institutions.map((inst: any) => (
            <div
              key={inst.id}
              onClick={() => handleSelectInstitution(inst.id)}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md cursor-pointer transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{inst.name}</h3>
                  <p className="text-sm text-gray-600 capitalize mt-1">
                    {inst.type.charAt(0).toUpperCase() + inst.type.slice(1)}
                  </p>
                </div>
                <Settings size={20} className="text-gray-400" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
