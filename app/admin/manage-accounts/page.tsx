"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Search, CheckCircle, AlertCircle } from "lucide-react"
import { getProfileByPhone, updateAccountType, isAdminPhone } from "@/lib/supabase/data-service"
import Loading from "./loading"

function ManageAccountsContent() {
  const router = useRouter()
  const [adminPhone, setAdminPhone] = useState("")
  const [searchPhone, setSearchPhone] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const phone = localStorage.getItem("phoneNumber")
    if (!phone || !isAdminPhone(phone)) {
      router.replace("/")
      return
    }
    setAdminPhone(phone)
  }, [router])

  const handleSearch = async () => {
    if (!searchPhone || searchPhone.length !== 11) {
      setError("সঠিক ১১ সংখ্যার ফোন নম্বর দিন")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      const user = await getProfileByPhone(searchPhone)
      if (user) {
        setSelectedUser(user)
      } else {
        setError("ব্যবহারকারী পাওয়া যায়নি")
        setSelectedUser(null)
      }
    } catch (err) {
      setError("সার্ভারে সমস্যা হয়েছে")
      setSelectedUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeAccountType = async (newType) => {
    if (!selectedUser) return

    setLoading(true)
    setError("")
    setMessage("")

    try {
      const result = await updateAccountType(selectedUser.phone, adminPhone, newType)
      
      if (result.success) {
        setMessage(`${selectedUser.name} এর অ্যাকাউন্ট ${newType === "state" ? "স্টেট" : "বিজনেস"} এ পরিবর্তন করা হয়েছে`)
        setSelectedUser({
          ...selectedUser,
          account_type: newType,
        })
      } else {
        setError(result.error || "পরিবর্তন করতে ব্যর্থ")
      }
    } catch (err) {
      setError("সার্ভারে সমস্যা হয়েছে")
    } finally {
      setLoading(false)
    }
  }

  if (!adminPhone) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1FBFFF] to-[#1FB5FF]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1FBFFF] to-[#1FB5FF] text-white p-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-lg">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">অ্যাকাউন্ট ব্যবস্থাপনা</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Search Box */}
        <div className="bg-white rounded-lg p-4 space-y-3 shadow-sm">
          <label className="block text-sm font-medium text-gray-700">ব্যবহারকারীর ফোন নম্বর</label>
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="01XXXXXXXXX"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF]"
              maxLength="11"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-[#1FBFFF] text-white rounded-lg font-medium hover:bg-[#1fa5eb] disabled:opacity-50"
            >
              খুঁজুন
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <p className="text-green-700">{message}</p>
          </div>
        )}

        {/* User Details */}
        {selectedUser && (
          <div className="bg-white rounded-lg p-4 space-y-4 shadow-sm">
            <div className="space-y-3 pb-4 border-b">
              <div className="flex justify-between">
                <span className="text-gray-600">নাম:</span>
                <span className="font-semibold">{selectedUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ফোন:</span>
                <span className="font-semibold">{selectedUser.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">অ্যাকাউন্ট ধরন:</span>
                <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                  selectedUser.account_type === "personal" ? "bg-blue-100 text-blue-700" :
                  selectedUser.account_type === "state" ? "bg-green-100 text-green-700" :
                  "bg-purple-100 text-purple-700"
                }`}>
                  {selectedUser.account_type === "personal" ? "ব্যক্তিগত" :
                   selectedUser.account_type === "state" ? "স্টেট" : "বিজনেস"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ব্যালেন্স:</span>
                <span className="font-semibold">৳ {selectedUser.balance}</span>
              </div>
            </div>

            {/* Account Type Change */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">অ্যাকাউন্ট ধরন পরিবর্তন করুন:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleChangeAccountType("state")}
                  disabled={loading || selectedUser.account_type === "state"}
                  className={`p-3 rounded-lg font-medium transition-all ${
                    selectedUser.account_type === "state"
                      ? "bg-green-100 text-green-700 cursor-not-allowed"
                      : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  }`}
                >
                  স্টেট অ্যাকাউন্ট
                </button>
                <button
                  onClick={() => handleChangeAccountType("business")}
                  disabled={loading || selectedUser.account_type === "business"}
                  className={`p-3 rounded-lg font-medium transition-all ${
                    selectedUser.account_type === "business"
                      ? "bg-purple-100 text-purple-700 cursor-not-allowed"
                      : "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                  }`}
                >
                  বিজনেস অ্যাকাউন্ট
                </button>
              </div>
            </div>
          </div>
        )}

        {!selectedUser && !error && (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <p>ব্যবহারকারীর ফোন নম্বর দিয়ে খুঁজুন</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ManageAccountsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ManageAccountsContent />
    </Suspense>
  )
}
