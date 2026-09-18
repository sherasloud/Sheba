"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Search, CheckCircle, AlertCircle, Plus, Trash2, Edit2 } from "lucide-react"
import { isAdminPhone } from "@/lib/account-manager"
import Loading from "./loading"

function ManageAccountsContent() {
  const router = useRouter()
  const [adminPhone, setAdminPhone] = useState("")
  const [searchPhone, setSearchPhone] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [latestUsers, setLatestUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("accounts") // "accounts", "billers", "donations"
  const [billers, setBillers] = useState([
    { id: 1, name: "Desko", category: "Biller" },
    { id: 2, name: "Utility Provider A", category: "Biller" },
  ])
  const [donations, setDonations] = useState([
    { id: 1, name: "SOS Children Village", category: "Donation" },
    { id: 2, name: "Bangladesh Red Crescent", category: "Donation" },
  ])
  const [institutions, setInstitutions] = useState([
    { id: 1, name: "Example School", type: "School" },
    { id: 2, name: "Example College", type: "College" },
    { id: 3, name: "Example University", type: "University" },
  ])
  const [newBillerName, setNewBillerName] = useState("")
  const [newDonationName, setNewDonationName] = useState("")
  const [newInstitutionName, setNewInstitutionName] = useState("")
  const [newInstitutionType, setNewInstitutionType] = useState("School")
  const [billItems, setBillItems] = useState([
    { id: 1, name: "DESCO", category: "Electricity" },
    { id: 2, name: "Titas Gas", category: "Gas" },
    { id: 3, name: "DWASA", category: "Water" },
  ])
  const [donationItems, setDonationItems] = useState([
    { id: 1, name: "SOS Children Village", category: "Children" },
    { id: 2, name: "Bangladesh Red Crescent", category: "Health" },
  ])
  const [newBillName, setNewBillName] = useState("")
  const [newBillCategory, setNewBillCategory] = useState("Electricity")
  const [newDonateOrgName, setNewDonateOrgName] = useState("")
  const [newDonateCategory, setNewDonateCategory] = useState("Children")

  useEffect(() => {
    const phone = localStorage.getItem("phoneNumber")
    if (!phone) {
      router.replace("/")
      return
    }
    if (!isAdminPhone(phone)) {
      router.replace("/")
      return
    }
    setAdminPhone(phone)
    
    // Fetch latest users
    const fetchLatestUsers = async () => {
      try {
        const response = await fetch('/api/admin/latest-users')
        if (response.ok) {
          const data = await response.json()
          setLatestUsers(data.users || [])
        }
      } catch (err) {
        console.error('Failed to fetch latest users:', err)
      } finally {
        setUsersLoading(false)
      }
    }
    
    fetchLatestUsers()
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
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: searchPhone }),
      })

      if (!response.ok) throw new Error('Failed to fetch user')

      const data = await response.json()
      if (data.success && data.user) {
        setSelectedUser({
          name: data.user.fullName,
          phone: data.user.phoneNumber,
          account_type: data.user.accountType,
          balance: data.user.balance,
          isVerified: data.user.isVerified,
        })
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

  const handleChangeAccountType = async (newType: string) => {
    if (!selectedUser) return

    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch('/api/admin/update-account-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPhone,
          userPhone: selectedUser.phone,
          newAccountType: newType,
        }),
      })

      const result = await response.json()

      if (result.success) {
        const typeLabel = newType === "state" ? "স্টেট" : newType === "business" ? "বিজনেস" : "ব্যক্তিগত"
        setMessage(`${selectedUser.name} এর অ্যাকাউন্ট ${typeLabel} এ পরিবর্তন করা হয়েছে`)
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

  const handleAddBiller = () => {
    if (!newBillerName.trim()) return
    setBillers([...billers, { id: Date.now(), name: newBillerName, category: "Biller" }])
    setNewBillerName("")
  }

  const handleDeleteBiller = (id: number) => {
    setBillers(billers.filter(b => b.id !== id))
  }

  const handleAddDonation = () => {
    if (!newDonationName.trim()) return
    setDonations([...donations, { id: Date.now(), name: newDonationName, category: "Donation" }])
    setNewDonationName("")
  }

  const handleDeleteDonation = (id: number) => {
    setDonations(donations.filter(d => d.id !== id))
  }

  const handleAddInstitution = () => {
    if (!newInstitutionName.trim()) return
    setInstitutions([...institutions, { id: Date.now(), name: newInstitutionName, type: newInstitutionType }])
    setNewInstitutionName("")
  }

  const handleDeleteInstitution = (id: number) => {
    setInstitutions(institutions.filter(i => i.id !== id))
  }

  const handleAddBill = () => {
    if (!newBillName.trim()) return
    setBillItems([...billItems, { id: Date.now(), name: newBillName, category: newBillCategory }])
    setNewBillName("")
  }

  const handleDeleteBill = (id: number) => {
    setBillItems(billItems.filter(b => b.id !== id))
  }

  const handleAddDonateOrg = () => {
    if (!newDonateOrgName.trim()) return
    setDonationItems([...donationItems, { id: Date.now(), name: newDonateOrgName, category: newDonateCategory }])
    setNewDonateOrgName("")
  }

  const handleDeleteDonateOrg = (id: number) => {
    setDonationItems(donationItems.filter(d => d.id !== id))
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
        <h1 className="text-xl font-bold">অ্যাডমিন প্যানেল</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex gap-1 p-2">
          <button
            onClick={() => setActiveTab("accounts")}
            className={`px-4 py-2 font-medium rounded-lg transition ${
              activeTab === "accounts"
                ? "bg-[#1FBFFF] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            অ্যাকাউন্ট
          </button>
          <button
            onClick={() => setActiveTab("billers")}
            className={`px-4 py-2 font-medium rounded-lg transition ${
              activeTab === "billers"
                ? "bg-[#1FBFFF] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            বিলার
          </button>
          <button
            onClick={() => setActiveTab("donations")}
            className={`px-4 py-2 font-medium rounded-lg transition ${
              activeTab === "donations"
                ? "bg-[#1FBFFF] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            দান
          </button>
          <button
            onClick={() => setActiveTab("institutions")}
            className={`px-4 py-2 font-medium rounded-lg transition ${
              activeTab === "institutions"
                ? "bg-[#1FBFFF] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            প্রতিষ্ঠান
          </button>
          <button
            onClick={() => setActiveTab("bills")}
            className={`px-4 py-2 font-medium rounded-lg transition ${
              activeTab === "bills"
                ? "bg-[#1FBFFF] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            বিল পেমেন্ট
          </button>
          <button
            onClick={() => setActiveTab("donate-orgs")}
            className={`px-4 py-2 font-medium rounded-lg transition ${
              activeTab === "donate-orgs"
                ? "bg-[#1FBFFF] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            দান সংস্থা
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Accounts Tab */}
        {activeTab === "accounts" && (
          <>
            {/* Latest Users Section */}
            {latestUsers.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-900">নতুন ব্যবহারকারী</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {latestUsers.map((user: any, index: number) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition"
                  onClick={() => {
                    setSearchPhone(user.phoneNumber)
                    handleSearch()
                  }}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-sm text-gray-600">{user.phoneNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium px-2 py-1 rounded ${
                      user.accountType === "personal" ? "bg-blue-100 text-blue-700" :
                      user.accountType === "state" ? "bg-green-100 text-green-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {user.accountType === "personal" ? "ব্যক্তিগত" :
                       user.accountType === "state" ? "স্টেট" : "বিজনেস"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ব্যালেন্স:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">৳ {Number(selectedUser.balance).toLocaleString('bn-BD')}</span>
                  <button
                    onClick={() => handleSearch()}
                    disabled={loading}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition disabled:opacity-50"
                    title="রিফ্রেশ করুন"
                  >
                    ↻
                  </button>
                </div>
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
          </>
        )}

        {/* Billers Tab */}
        {activeTab === "billers" && (
          <div className="bg-white rounded-lg p-6 space-y-4 shadow-md">
            <h2 className="text-lg font-bold text-gray-900">বিলার ব্যবস্থাপনা</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="নতুন বিলার নাম..."
                value={newBillerName}
                onChange={(e) => setNewBillerName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newBillerName.trim()) {
                    handleAddBiller()
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF] focus:border-transparent bg-gray-50 hover:bg-white transition"
              />
              <button
                onClick={handleAddBiller}
                className="px-6 py-3 bg-[#1FBFFF] text-white rounded-lg font-medium hover:bg-[#1fa5eb] active:scale-95 transition flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} />
                যোগ করুন
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
              {billers.length === 0 ? (
                <p className="text-center text-gray-500 py-4">কোনো বিলার যোগ করা হয়নি</p>
              ) : (
                billers.map((biller) => (
                  <div
                    key={biller.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-50 transition border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{biller.name}</p>
                      <p className="text-xs text-gray-500">{biller.category}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBiller(biller.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="ডিলিট করুন"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === "donations" && (
          <div className="bg-white rounded-lg p-6 space-y-4 shadow-md">
            <h2 className="text-lg font-bold text-gray-900">দান সংস্থা ব্যবস্থাপনা</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="নতুন দান সংস্থা নাম..."
                value={newDonationName}
                onChange={(e) => setNewDonationName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newDonationName.trim()) {
                    handleAddDonation()
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF] focus:border-transparent bg-gray-50 hover:bg-white transition"
              />
              <button
                onClick={handleAddDonation}
                className="px-6 py-3 bg-[#1FBFFF] text-white rounded-lg font-medium hover:bg-[#1fa5eb] active:scale-95 transition flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} />
                যোগ করুন
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
              {donations.length === 0 ? (
                <p className="text-center text-gray-500 py-4">কোনো দান সংস্থা যোগ করা হয়নি</p>
              ) : (
                donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-50 transition border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{donation.name}</p>
                      <p className="text-xs text-gray-500">{donation.category}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteDonation(donation.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="ডিলিট করুন"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Institutions Tab */}
        {activeTab === "institutions" && (
          <div className="bg-white rounded-lg p-6 space-y-4 shadow-md">
            <h2 className="text-lg font-bold text-gray-900">প্রতিষ্ঠান ব্যবস্থাপনা</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="নতুন প্রতিষ্ঠান নাম..."
                  value={newInstitutionName}
                  onChange={(e) => setNewInstitutionName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newInstitutionName.trim()) {
                      handleAddInstitution()
                    }
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF] focus:border-transparent bg-gray-50 hover:bg-white transition"
                />
                <select
                  value={newInstitutionType}
                  onChange={(e) => setNewInstitutionType(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF] focus:border-transparent bg-white hover:bg-gray-50 transition font-medium text-gray-900 min-w-fit"
                >
                  <option value="School" className="bg-white text-gray-900">স্কুল</option>
                  <option value="College" className="bg-white text-gray-900">কলেজ</option>
                  <option value="University" className="bg-white text-gray-900">বিশ্ববিদ্যালয়</option>
                </select>
                <button
                  onClick={handleAddInstitution}
                  className="px-6 py-3 bg-[#1FBFFF] text-white rounded-lg font-medium hover:bg-[#1fa5eb] active:scale-95 transition flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus size={18} />
                  যোগ করুন
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
              {institutions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">কোনো প্রতিষ্ঠান যোগ করা হয়নি</p>
              ) : (
                institutions.map((institution) => (
                  <div
                    key={institution.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-50 transition border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{institution.name}</p>
                      <p className="text-xs text-gray-500">
                        {institution.type === "School" ? "স্কুল" :
                         institution.type === "College" ? "কলেজ" : "বিশ্ববিদ্যালয়"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteInstitution(institution.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="ডিলিট করুন"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bills Tab */}
        {activeTab === "bills" && (
          <div className="bg-white rounded-lg p-6 space-y-4 shadow-md">
            <h2 className="text-lg font-bold text-gray-900">বিল পেমেন্ট ব্যবস্থাপনা</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="বিল প্রদানকারীর নাম..."
                value={newBillName}
                onChange={(e) => setNewBillName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newBillName.trim()) {
                    handleAddBill()
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF] focus:border-transparent bg-gray-50 hover:bg-white transition"
              />
              <select
                value={newBillCategory}
                onChange={(e) => setNewBillCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF] focus:border-transparent bg-white hover:bg-gray-50 transition font-medium text-gray-900 min-w-fit"
              >
                <option value="Electricity" className="bg-white text-gray-900">বিদ্যুৎ</option>
                <option value="Gas" className="bg-white text-gray-900">গ্যাস</option>
                <option value="Water" className="bg-white text-gray-900">পানি</option>
                <option value="Internet" className="bg-white text-gray-900">ইন্টারনেট</option>
              </select>
              <button
                onClick={handleAddBill}
                className="px-6 py-3 bg-[#1FBFFF] text-white rounded-lg font-medium hover:bg-[#1fa5eb] active:scale-95 transition flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} />
                যোগ করুন
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
              {billItems.length === 0 ? (
                <p className="text-center text-gray-500 py-4">কোনো বিল পেমেন্ট যোগ করা হয়নি</p>
              ) : (
                billItems.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-50 transition border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{bill.name}</p>
                      <p className="text-xs text-gray-500">{bill.category}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBill(bill.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="ডিলিট করুন"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Donate Organizations Tab */}
        {activeTab === "donate-orgs" && (
          <div className="bg-white rounded-lg p-6 space-y-4 shadow-md">
            <h2 className="text-lg font-bold text-gray-900">দান সংস্থা ব্যবস্থাপনা</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="দান সংস্থার নাম..."
                value={newDonateOrgName}
                onChange={(e) => setNewDonateOrgName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newDonateOrgName.trim()) {
                    handleAddDonateOrg()
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF] focus:border-transparent bg-gray-50 hover:bg-white transition"
              />
              <select
                value={newDonateCategory}
                onChange={(e) => setNewDonateCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF] focus:border-transparent bg-white hover:bg-gray-50 transition font-medium text-gray-900 min-w-fit"
              >
                <option value="Children" className="bg-white text-gray-900">শিশু সহায়তা</option>
                <option value="Health" className="bg-white text-gray-900">স্বাস্থ্য</option>
                <option value="Education" className="bg-white text-gray-900">শিক্ষা</option>
                <option value="Emergency" className="bg-white text-gray-900">জ��ুরি সহায়তা</option>
                <option value="Environment" className="bg-white text-gray-900">পরিবেশ</option>
              </select>
              <button
                onClick={handleAddDonateOrg}
                className="px-6 py-3 bg-[#1FBFFF] text-white rounded-lg font-medium hover:bg-[#1fa5eb] active:scale-95 transition flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} />
                যোগ করুন
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
              {donationItems.length === 0 ? (
                <p className="text-center text-gray-500 py-4">কোনো দান সংস্থা যোগ করা হয়নি</p>
              ) : (
                donationItems.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-50 transition border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{org.name}</p>
                      <p className="text-xs text-gray-500">{org.category}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteDonateOrg(org.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="ডিলিট করুন"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
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
