"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const classOptions: Record<string, { label: string; value: number }[]> = {
  school: Array.from({ length: 10 }, (_, i) => ({ label: `Class ${i + 1}`, value: i + 1 })),
  college: [
    { label: "11th (College)", value: 11 },
    { label: "12th (College)", value: 12 },
  ],
  university: [
    { label: "1st Year", value: 13 },
    { label: "2nd Year", value: 14 },
    { label: "3rd Year", value: 15 },
    { label: "4th Year", value: 16 },
  ],
}

const sectionOptions = ["A", "B", "C", "D", "E"]
const shiftOptions = ["Morning", "Day", "Evening"]

const institutionLabels: Record<string, string> = {
  school: "স্কুল",
  college: "কলেজ",
  university: "বিশ্ববিদ্যালয়",
}

export default function EduLoginPage() {
  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")
  const [loginError, setLoginError] = useState("")

  // Available institution types from Admin
  const [availableTypes, setAvailableTypes] = useState<string[]>([])

  // Student form state
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [studentData, setStudentData] = useState({
    name: "",
    rollNo: "",
    studentId: "",
    class: "",
    section: "",
    shift: "",
  })
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (isLoggedIn) {
      loadAvailableTypes()
    }
  }, [isLoggedIn])

  const loadAvailableTypes = async () => {
    try {
      const response = await fetch("/api/institutions/all")
      if (response.ok) {
        const data = await response.json()
        if (data.institutions) {
          // Get available types from institutions
          const types = Object.keys(data.institutions)
            .filter((type) => data.institutions[type].length > 0)
          setAvailableTypes(types)
          console.log("[v0] Available institution types:", types)
        }
      }
    } catch (error) {
      console.error("[v0] Failed to load institution types:", error)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    if (!phone || !pin) {
      setLoginError("ফোন নম্বর এবং PIN দুটোই প্রয়োজন")
      return
    }

    if (phone.length < 10) {
      setLoginError("সঠিক ফোন নম্বর দিন")
      return
    }

    if (pin.length < 4) {
      setLoginError("PIN কমপক্ষে 4 digit হতে হবে")
      return
    }

    // Simple validation - any phone + PIN works
    setIsLoggedIn(true)
    setPhone("")
    setPin("")
    setSelectedType(null)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setAvailableTypes([])
    setSelectedType(null)
    setStudentData({
      name: "",
      rollNo: "",
      studentId: "",
      class: "",
      section: "",
      shift: "",
    })
    setSuccessMessage("")
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!studentData.name || !studentData.rollNo || !studentData.studentId || !studentData.class) {
      alert("সব ফিল্ড পূরণ করুন")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/student/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studentData.name,
          rollNo: studentData.rollNo,
          studentId: studentData.studentId,
          institutionType: selectedType,
          class: studentData.class,
          section: studentData.section,
          shift: studentData.shift,
        }),
      })

      if (response.ok) {
        setSuccessMessage(`${studentData.name} সফলভাবে যোগ হয়েছে`)
        setStudentData({
          name: "",
          rollNo: "",
          studentId: "",
          class: "",
          section: "",
          shift: "",
        })
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (error) {
      console.error("[v0] Failed to add student:", error)
      alert("শিক্ষার্থী যোগ করতে ব্যর্থ")
    } finally {
      setLoading(false)
    }
  }

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Back button */}
          <Link href="/" className="inline-block mb-8">
            <ArrowLeft className="text-gray-800" size={24} />
          </Link>

          {/* Login Form */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-blue-500 mb-2">শিক্ষা</h1>
            <p className="text-gray-600">আপনার শিক্ষার্থী যোগ করতে প্রবেশ করুন</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {loginError}
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ফোন নম্বর
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              প্রবেশ করুন
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-8">
            Sheba app দিয়ে একই নম্বর এবং PIN ব্যবহার করুন
          </p>
        </div>
      </div>
    )
  }

  // Institution Type Selection Screen
  if (!selectedType) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 font-medium text-sm"
            >
              লগ আউট
            </button>
            <h1 className="text-4xl font-bold text-blue-500 flex-1 text-center">শিক্ষা</h1>
            <div className="w-12"></div>
          </div>

          {/* Type Selection */}
          <div className="text-center mb-12">
            <p className="text-gray-600 text-lg">একটি প্রতিষ্ঠান ধরন নির্বাচন করুন</p>
          </div>

          {availableTypes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">কোনো প্রতিষ্ঠান পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className="w-full p-8 border-2 border-blue-500 rounded-xl text-center hover:bg-blue-50 transition-colors group"
                >
                  <div className="text-3xl font-bold text-blue-500 group-hover:scale-110 transition-transform">
                    {institutionLabels[type] || type}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">ড্যাশবোর্ড</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Student Form Screen
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
        <button
          onClick={() => setSelectedType(null)}
          className="text-blue-500 hover:text-blue-600 font-medium text-sm"
        >
          ← ফিরে যান
        </button>
        <h1 className="text-2xl font-bold text-blue-500 flex-1 text-center">
          {institutionLabels[selectedType] || selectedType}
        </h1>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-600 font-medium text-sm"
        >
          লগ আউট
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto bg-white p-5">
        <div className="max-w-2xl mx-auto">
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-700">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleAddStudent} className="space-y-5">
            {/* Student Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                শিক্ষার্থীর নাম
              </label>
              <input
                type="text"
                value={studentData.name}
                onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                placeholder="নাম"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Roll No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                রোল নম্বর
              </label>
              <input
                type="text"
                value={studentData.rollNo}
                onChange={(e) => setStudentData({ ...studentData, rollNo: e.target.value })}
                placeholder="রোল নম্বর"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                শিক্ষার্থী আইডি
              </label>
              <input
                type="text"
                value={studentData.studentId}
                onChange={(e) => setStudentData({ ...studentData, studentId: e.target.value })}
                placeholder="শিক্ষার্থী আইডি"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ক্লাস
              </label>
              <select
                value={studentData.class}
                onChange={(e) => setStudentData({ ...studentData, class: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">নির্বাচন করুন</option>
                {classOptions[selectedType]?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                সেকশন
              </label>
              <select
                value={studentData.section}
                onChange={(e) => setStudentData({ ...studentData, section: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">নির্বাচন করুন</option>
                {sectionOptions.map((section) => (
                  <option key={section} value={section}>
                    সেকশন {section}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                শিফট
              </label>
              <select
                value={studentData.shift}
                onChange={(e) => setStudentData({ ...studentData, shift: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">নির্বাচন করুন</option>
                {shiftOptions.map((shift) => (
                  <option key={shift} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? "যোগ হচ্ছে..." : "শিক্ষার্থী যোগ করুন"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
