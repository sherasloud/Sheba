"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

const categoryLabels: Record<string, string> = {
  schools: "স্কুল",
  colleges: "কলেজ",
  universities: "বিশ্ববিদ্যালয়",
}

export default function EduFeePage() {
  const [step, setStep] = useState<"type" | "list">("type")
  const [selectedCategory, setSelectedCategory] = useState("schools")
  const [searchTerm, setSearchTerm] = useState("")
  const [institutions, setInstitutions] = useState<{ [key: string]: any[] }>({})
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadInstitutions()
    
    // প্রতি ২ সেকেন্ডে database থেকে real-time update চেক করা
    const interval = setInterval(() => {
      console.log("[v0] Database থেকে real-time update চেক করছি")
      loadInstitutions()
    }, 2000)
    
    // পেজ ফোকাস হলে সাথে সাথে লোড করা
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("[v0] পেজ ফোকাস হয়েছে, রিলোড করছি")
        loadInstitutions()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const loadInstitutions = async () => {
    try {
      const grouped: { [key: string]: any[] } = { schools: [], colleges: [], universities: [] }
      
      // প্রথমে Database থেকে real-time সব institutions fetch করছি
      try {
        const response = await fetch('/api/institutions/all')
        if (response.ok) {
          const data = await response.json()
          if (data.institutions) {
            // Database থেকে data merge করছি
            Object.keys(grouped).forEach(type => {
              grouped[type] = [...(data.institutions[type] || [])]
            })
            console.log("[v0] Database থেকে লোড হয়েছে:", grouped)
          }
        }
      } catch (dbError) {
        console.log("[v0] Database fetch ব্যর্থ:", dbError)
      }
      
      // এখন localStorage থেকে আগের data যোগ করছি (backward compatibility)
      try {
        const adminInstitutions = localStorage.getItem('adminInstitutions')
        if (adminInstitutions) {
          const parsed = JSON.parse(adminInstitutions)
          console.log("[v0] localStorage থেকে পুরনো data:", parsed)
          parsed.forEach((inst: any) => {
            const instType = inst.type || "schools"
            if (grouped[instType]) {
              // duplicate check করছি (id থেকে)
              const isDuplicate = grouped[instType].some(existing => existing.id === inst.id)
              if (!isDuplicate) {
                grouped[instType].push(inst)
              }
            }
          })
        }
      } catch (e) {
        console.error("[v0] localStorage পার্স ব্যর্থ:", e)
      }
      
      console.log("[v0] চূড়ান্ত institutions list:", grouped)
      setInstitutions(grouped)
      setLoading(false)
    } catch (error) {
      console.error("[v0] প্রতিষ্ঠান লোড ব্যর্থ:", error)
      setLoading(false)
    }
  }

  const filteredInstitutions = (institutions[selectedCategory] || []).filter((institution) =>
    institution.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const loadStudents = async (institutionId: string) => {
    try {
      const response = await fetch('/api/students/all')
      if (response.ok) {
        const data = await response.json()
        if (data.students) {
          // ঐ institution এর students filter করছি
          const instStudents = data.students.find((s: any) => s.id === institutionId)
          if (instStudents) {
            setStudents(instStudents.classes || {})
            setSelectedInstitution(institutionId)
          }
        }
      }
    } catch (error) {
      console.error("[v0] Failed to load students:", error)
    }
  }

  const handleInstitutionSelect = (institution: any) => {
    loadStudents(institution.id)
  }

  if (step === "type") {
    return (
      <div className="flex flex-col h-screen bg-white">
        {/* Header */}
        <div className="bg-white px-5 py-4">
          <Link href="/" className="inline-flex" aria-label="ফিরে যান">
            <ArrowLeft size={24} className="text-gray-800" />
          </Link>
        </div>

        {/* Title */}
        <h1 className="px-6 pt-6 pb-2 text-3xl font-bold text-blue-500 text-center text-balance leading-snug">
          প্রতিষ্ঠান নির্বাচন করুন
        </h1>

        {/* Type options */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          {Object.entries(categoryLabels).map(([key, label]) => {
            const active = selectedCategory === key
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                aria-pressed={active}
                className={`w-full min-h-[64px] rounded-2xl text-3xl font-bold transition-colors ${
                  active
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                    : "bg-white text-gray-900 border border-gray-200 hover:border-blue-300"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Next button */}
        <div className="px-6 pb-10 pt-4">
          <button
            onClick={() => setStep("list")}
            className="w-full min-h-[56px] rounded-full bg-blue-500 text-white text-2xl font-medium hover:bg-blue-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-white items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
        <p className="mt-4 text-gray-600 font-medium">লোড হচ্ছে...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
        <button
          onClick={() => {
            setStep("type")
            setSelectedInstitution(null)
            setStudents([])
            setSearchTerm("")
          }}
          className="flex-shrink-0"
          aria-label="ফিরে যান"
        >
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-3xl font-bold text-blue-500 flex-1 text-center">শিক্ষা</h1>
        <div className="flex-shrink-0 w-6"></div>
      </div>

      {/* Category tabs */}
      <div className="flex bg-white border-b border-gray-200">
        {Object.entries(categoryLabels).map(([key, label], index) => (
          <button
            key={key}
            onClick={() => {
              setSelectedCategory(key)
              setSearchTerm("")
            }}
            className={`flex-1 py-3 px-2 text-center font-medium transition-colors ${
              selectedCategory === key
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 border-b-2 border-transparent hover:text-gray-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="px-5 py-3 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={`${categoryLabels[selectedCategory as keyof typeof categoryLabels]} খুঁজুন...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        {/* Show institutions list or students list */}
        {!selectedInstitution ? (
          // Institutions View
          <>
            {filteredInstitutions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="text-lg font-medium">কোনো প্রতিষ্ঠান নেই</p>
                <p className="text-sm text-gray-400">খুঁজ পরিবর্তন করুন</p>
              </div>
            ) : (
              <div>
                {filteredInstitutions.map((institution, index) => (
                  <div
                    key={institution.id || index}
                    onClick={() => handleInstitutionSelect(institution)}
                    className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="w-12 h-12 mr-4 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      {institution.logo ? (
                        <Image
                          src={institution.logo}
                          alt={institution.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-bold">
                            {institution.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{institution.name}</h3>
                      <p className="text-sm text-gray-600">
                        {categoryLabels[selectedCategory as keyof typeof categoryLabels]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Students View
          <div>
            <div className="p-4 border-b border-gray-200 flex items-center">
              <button
                onClick={() => {
                  setSelectedInstitution(null)
                  setStudents([])
                }}
                className="text-blue-500 font-medium text-sm hover:text-blue-600"
              >
                ← ফিরে যান
              </button>
            </div>

            {Object.keys(students).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <p className="text-lg font-medium">কোনো শিক্ষার্থী নেই</p>
                <p className="text-sm text-gray-400 mt-2">
                  <a href="/edu-login" className="text-blue-500 hover:underline">
                    এখানে শিক্ষার্থী যোগ করুন
                  </a>
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {Object.entries(students).map(([classLevel, classData]: [string, any]) => (
                  <div key={classLevel} className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">{classData.name}</h3>
                    <div className="space-y-2">
                      {classData.students?.map((student: any, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm">
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-gray-600">রোল: {student.rollNo}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
