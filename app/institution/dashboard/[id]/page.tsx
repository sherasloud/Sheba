"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, Users, BookOpen, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function InstitutionDashboard() {
  const router = useRouter()
  const params = useParams()
  const institutionId = params.id as string
  const [institution, setInstitution] = useState<any>(null)
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [students, setStudents] = useState([])
  const [activeTab, setActiveTab] = useState("classes")
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ name: "", level: "" })

  useEffect(() => {
    loadInstitution()
    loadClasses()
  }, [institutionId])

  const loadInstitution = async () => {
    try {
      const response = await fetch(`/api/institution/get?id=${institutionId}`)
      if (response.ok) {
        const data = await response.json()
        setInstitution(data.institution)
      }
    } catch (error) {
      console.error("[v0] Failed to load institution:", error)
    }
  }

  const loadClasses = async () => {
    try {
      const response = await fetch(`/api/institution/classes?institutionId=${institutionId}`)
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])
      }
    } catch (error) {
      console.error("[v0] Failed to load classes:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async (classId: string) => {
    try {
      const response = await fetch(`/api/institution/students?classId=${classId}`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error("[v0] Failed to load students:", error)
    }
  }

  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId)
    loadStudents(classId)
    setActiveTab("students")
  }

  const handleAddClass = async () => {
    if (!formData.name.trim() || !formData.level) return

    try {
      const response = await fetch("/api/institution/class/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionId,
          name: formData.name,
          classLevel: Number(formData.level),
        }),
      })

      if (response.ok) {
        setFormData({ name: "", level: "" })
        setShowAddForm(false)
        loadClasses()
      }
    } catch (error) {
      console.error("[v0] Failed to create class:", error)
    }
  }

  const getClassLevelOptions = () => {
    if (institution?.type === "school") {
      return Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: `Class ${i + 1}` }))
    } else if (institution?.type === "college") {
      return [
        { value: 11, label: "Class 11" },
        { value: 12, label: "Class 12" },
      ]
    } else if (institution?.type === "university") {
      return [
        { value: 13, label: "1st Year" },
        { value: 14, label: "2nd Year" },
        { value: 15, label: "3rd Year" },
        { value: 16, label: "4th Year" },
      ]
    }
    return []
  }

  const getClassName = (level: number) => {
    if (institution?.type === "school") return `Class ${level}`
    if (institution?.type === "college") return `Class ${level}`
    if (institution?.type === "university") return `${level - 12}${['st', 'nd', 'rd', 'th'][level - 13]} Year`
    return `Class ${level}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1FBFFF] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/20 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-bold">{institution?.name}</h1>
            <p className="text-xs text-blue-100 capitalize">{institution?.type}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 bg-white sticky top-0 z-10 overflow-x-auto">
        <button
          onClick={() => setActiveTab("classes")}
          className={`py-3 px-4 font-medium transition-colors whitespace-nowrap ${
            activeTab === "classes"
              ? "text-[#1FBFFF] border-b-2 border-[#1FBFFF]"
              : "text-gray-600"
          }`}
        >
          <BookOpen size={18} className="inline mr-2" />
          Classes
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`py-3 px-4 font-medium transition-colors whitespace-nowrap ${
            activeTab === "students"
              ? "text-[#1FBFFF] border-b-2 border-[#1FBFFF]"
              : "text-gray-600"
          }`}
        >
          <Users size={18} className="inline mr-2" />
          Students
        </button>
        <Link
          href={`/institution/fee-collection/${institutionId}`}
          className={`py-3 px-4 font-medium transition-colors whitespace-nowrap text-gray-600 hover:text-[#1FBFFF]`}
        >
          <BarChart3 size={18} className="inline mr-2" />
          Fee Collection
        </Link>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "classes" && (
          <div>
            {/* Add Class Form */}
            {showAddForm && (
              <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
                <input
                  type="text"
                  placeholder="Class Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg mb-3"
                />
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg mb-3"
                >
                  <option value="">Select Level</option>
                  {getClassLevelOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddClass}
                    className="flex-1 bg-[#1FBFFF] text-white p-2 rounded-lg font-medium"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 p-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Classes List */}
            <div className="space-y-3">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full bg-[#1FBFFF] text-white p-3 rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Add Class
              </button>

              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1FBFFF]"></div>
                </div>
              ) : classes.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p>No classes yet</p>
                </div>
              ) : (
                classes.map((cls: any) => (
                  <div
                    key={cls.id}
                    onClick={() => handleClassSelect(cls.id)}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md cursor-pointer transition"
                  >
                    <div className="font-semibold text-gray-900">{cls.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {getClassName(cls.classLevel)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div>
            {selectedClassId ? (
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/institution/student/add?classId=${selectedClassId}&institutionId=${institutionId}`)}
                  className="w-full bg-[#1FBFFF] text-white p-3 rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Add Student
                </button>

                {students.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <p>No students in this class</p>
                  </div>
                ) : (
                  students.map((student: any) => (
                    <div
                      key={student.id}
                      className="bg-white p-4 rounded-lg border border-gray-200"
                    >
                      <div className="font-semibold text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Roll: {student.rollNo || "N/A"}
                      </div>
                      <button
                        onClick={() => router.push(`/institution/student/${student.id}/fees`)}
                        className="mt-3 w-full bg-gray-100 text-gray-700 p-2 rounded-lg text-sm hover:bg-gray-200"
                      >
                        Manage Fees
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>Select a class to see students</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
