"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Search, Building2, Store, Landmark, User } from "lucide-react"
import Link from "next/link"

interface Account {
  id: string
  phone: string
  name: string
  balance: number
  account_type: string
  created_at: string
  is_nid_verified?: boolean
  face_verified?: boolean
}

export default function DevelopmentAppPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"accounts" | "bills" | "donations">("accounts")
  const [showAddModal, setShowAddModal] = useState<"state" | "business" | "institution" | "bill" | "donation" | "balance" | null>(null)
  const [accountPhone, setAccountPhone] = useState("")
  const [accountName, setAccountName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [addError, setAddError] = useState("")
  const [bills, setBills] = useState([
    { id: 1, name: 'DESCO', category: 'Electricity' },
    { id: 2, name: 'Titas Gas', category: 'Gas' },
    { id: 3, name: 'DWASA', category: 'Water' },
  ])
  const [donations, setDonations] = useState([
    { id: 1, name: 'SOS Children Village', category: 'Children' },
    { id: 2, name: 'Bangladesh Red Crescent', category: 'Health' },
  ])
  const [newItemName, setNewItemName] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("Electricity")
  const [newInstitutionType, setNewInstitutionType] = useState("School")

  const loadAccountsFromNeon = async () => {
    try {
      console.log('[v0] Fetching users from /api/users-list')
      const timestamp = Date.now()
      const response = await fetch(`/api/users-list?t=${timestamp}`, {
        cache: 'no-store',
        method: 'GET',
      })
      const data = await response.json()
      
      console.log('[v0] Response status:', response.status)
      console.log('[v0] Loaded accounts count:', Array.isArray(data) ? data.length : 0)
      if (Array.isArray(data) && data.length > 0) {
        console.log('[v0] First account:', data[0])
        console.log('[v0] Account types in response:', data.map((a: any) => ({ phone: a.phone, type: a.account_type })))
      }
      
      if (!response.ok) throw new Error(data.error || 'Failed to load users')
      
      setAccounts(Array.isArray(data) ? data : [])
      console.log('[v0] Accounts set to:', Array.isArray(data) ? data.length : 0, 'users')
    } catch (error) {
      console.error("[v0] Error loading accounts from Neon:", error)
      setAccounts([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const storedPhone = localStorage.getItem("phoneNumber")
    if (storedPhone) {
      setPhoneNumber(storedPhone)
      setIsAdmin(storedPhone === "01709783145")
    }

    loadAccountsFromNeon()

    // Refresh users every 3 seconds to show updated balance immediately
    const interval = setInterval(() => {
      console.log('[v0] Auto-refreshing Development App accounts...')
      loadAccountsFromNeon()
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const handleAddBill = () => {
    if (!newItemName.trim()) return
    setBills([...bills, { id: Date.now(), name: newItemName, category: newItemCategory }])
    setNewItemName("")
    setShowAddModal(null)
  }

  const handleDeleteBill = (id: number) => {
    setBills(bills.filter(b => b.id !== id))
  }

  const handleAddDonation = () => {
    if (!newItemName.trim()) return
    setDonations([...donations, { id: Date.now(), name: newItemName, category: newItemCategory }])
    setNewItemName("")
    setShowAddModal(null)
  }

  const handleDeleteDonation = (id: number) => {
    setDonations(donations.filter(d => d.id !== id))
  }

  const handleAddAccount = async (type: "state" | "business" | "institution") => {
    if (!accountPhone.trim() || !accountName.trim()) return
    if (accountPhone.length !== 11) {
      setAddError("সঠিক ১১ সংখ্যার ফোন নম্বর দিন")
      return
    }

    setAddError("")

    try {
      // Handle balance addition separately
      if (type === 'balance') {
        console.log(`[v0] Adding balance: ${accountPhone} - ৳${accountName}`)
        
        const response = await fetch('/api/add-balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: accountPhone,
            amount: parseInt(accountName),
          }),
        })
        
        const result = await response.json()
        console.log('[v0] Add-balance API response:', result)
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to add balance')
        }
        
        console.log('[v0] Balance added successfully')
        setAccountPhone("")
        setAccountName("")
        setShowAddModal(null)
        
        await new Promise(resolve => setTimeout(resolve, 500))
        await loadAccountsFromNeon()
        return
      }

      // Handle account creation
      console.log(`[v0] Adding ${type} account: ${accountPhone} - ${accountName}`)
      
      const response = await fetch('/api/add-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: accountPhone,
          name: accountName,
          accountType: type,
        }),
      })

      const result = await response.json()
      console.log('[v0] Add-account API response:', {
        status: response.status,
        success: result.success,
        message: result.message,
        user: result.user,
      })

      if (!response.ok || !result.success) {
        console.error('[v0] API error:', result)
        throw new Error(result.error || result.message || 'Failed to add account')
      }

      console.log('[v0] Account added successfully - clearing form')
      setAccountPhone("")
      setAccountName("")
      setShowAddModal(null)
      
      // Wait a moment then reload to ensure database is updated
      console.log('[v0] Waiting 1 second before reloading accounts...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('[v0] Now reloading accounts from database...')
      await loadAccountsFromNeon()
    } catch (error) {
      console.error(`[v0] Error adding ${type} account:`, error)
      setAddError("অ্যাকাউন্ট যোগ করতে সমস্যা হয়েছে")
    }
  }

  const getAccountTypeInfo = (type: string) => {
    switch (type) {
      case "state":
        return { label: "State (Cashout)", color: "bg-green-100 text-green-700", icon: Landmark }
      case "business":
        return { label: "Business", color: "bg-blue-100 text-blue-700", icon: Store }
      case "institution":
        return { label: "Institution", color: "bg-purple-100 text-purple-700", icon: Building2 }
      default:
        return { label: "Personal", color: "bg-gray-100 text-gray-700", icon: User }
    }
  }

  const filteredAccounts = accounts.filter(
    (account) =>
      account.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.phone.includes(searchQuery)
  )

  const stats = {
    personal: accounts.filter((a) => a.account_type === "personal").length,
    state: accounts.filter((a) => a.account_type === "state").length,
    business: accounts.filter((a) => a.account_type === "business").length,
    institution: accounts.filter((a) => a.account_type === "institution").length,
  }

  if (!isAdmin) {
    return (
      <div className="mobile-page">
        <div className="mobile-header">
          <Link href="/scan-qr" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <div className="text-lg font-medium">Development App</div>
        </div>
        <div className="mobile-content flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-bold mb-2">অ্যাক্সেস নেই</h2>
            <p className="text-gray-600">শুধুমাত্র অ্যাডমিনের জন্য</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-page">
      {/* Header */}
      <div className="mobile-header">
        <Link href="/scan-qr" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-lg font-medium">Development App</div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex gap-0">
          <button
            onClick={() => setActiveTab("accounts")}
            className={`flex-1 py-3 px-2 font-medium transition-colors text-sm ${
              activeTab === "accounts"
                ? "text-[#1FBFFF] border-b-2 border-[#1FBFFF]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            অ্যাকাউন্ট
          </button>
          <button
            onClick={() => setActiveTab("bills")}
            className={`flex-1 py-3 px-2 font-medium transition-colors text-sm ${
              activeTab === "bills"
                ? "text-[#1FBFFF] border-b-2 border-[#1FBFFF]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            বিল
          </button>
          <button
            onClick={() => setActiveTab("donations")}
            className={`flex-1 py-3 px-2 font-medium transition-colors text-sm ${
              activeTab === "donations"
                ? "text-[#1FBFFF] border-b-2 border-[#1FBFFF]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            দান
          </button>
        </div>
      </div>

      {/* Add Buttons for Accounts Tab */}
      {activeTab === "accounts" && (
        <div className="p-3 bg-gray-50 border-b flex gap-2 overflow-x-auto">
          <button
            onClick={() => setShowAddModal("state")}
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-lg whitespace-nowrap text-sm"
          >
            <Plus size={14} />
            State
          </button>
          <button
            onClick={() => setShowAddModal("business")}
            className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg whitespace-nowrap text-sm"
          >
            <Plus size={14} />
            Business
          </button>
          <button
            onClick={() => setShowAddModal("institution")}
            className="flex items-center gap-1 bg-purple-500 text-white px-3 py-2 rounded-lg whitespace-nowrap text-sm"
          >
            <Plus size={14} />
            Institution
          </button>
          <button
            onClick={() => setShowAddModal("balance")}
            className="flex items-center gap-1 bg-orange-500 text-white px-3 py-2 rounded-lg whitespace-nowrap text-sm"
          >
            <Plus size={14} />
            Balance
          </button>
        </div>
      )}

      {/* Stats - Only for Accounts Tab */}
      {activeTab === "accounts" && (
        <div className="grid grid-cols-4 gap-2 p-3 bg-white border-b">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-700">{stats.personal}</div>
            <div className="text-xs text-gray-500">Personal</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-700">{stats.state}</div>
            <div className="text-xs text-green-600">State</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-700">{stats.business}</div>
            <div className="text-xs text-blue-600">Business</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-700">{stats.institution}</div>
            <div className="text-xs text-purple-600">Institution</div>
          </div>
        </div>
      )}

      {/* Search - Only for Accounts Tab */}
      {activeTab === "accounts" && (
        <div className="p-3 bg-white border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ফোন নম্বর বা নাম দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-base"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Accounts Tab Content */}
        {activeTab === "accounts" && (
          <>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">লোড হচ্ছে...</div>
            ) : filteredAccounts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">কোনো অ্যাকাউন্ট পাওয়া যায়নি</div>
            ) : (
              filteredAccounts.map((account) => {
            const typeInfo = getAccountTypeInfo(account.account_type)
            const Icon = typeInfo.icon
            return (
              <div
                key={account.id}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${typeInfo.color} flex items-center justify-center`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{account.name}</div>
                      <div className="text-sm text-gray-500">{account.phone}</div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${typeInfo.color}`}>
                    {typeInfo.label}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">ব্যালেন্স:</span>
                    <span className="font-bold text-green-600">
                      ৳ {Number(account.balance).toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Verification Status */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500">যাচাইকরণ:</span>
                    <div className="flex items-center gap-2">
                      {account.is_nid_verified ? (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                          ✓ NID Verified
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                          ○ NID Unverified
                        </span>
                      )}
                      {account.face_verified ? (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                          ✓ Face OK
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                          ○ Face Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Overall Status */}
                  {account.is_nid_verified && account.face_verified ? (
                    <div className="text-xs text-center py-1 bg-green-50 text-green-700 rounded font-medium">
                      ✓ Fully Verified
                    </div>
                  ) : (
                    <div className="text-xs text-center py-1 bg-orange-50 text-orange-700 rounded font-medium">
                      ⚠ Unverified User
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
          </>
        )}

        {/* Bills Tab Content */}
        {activeTab === "bills" && (
          <>
            <div className="mb-4">
              <button
                onClick={() => setShowAddModal("bill")}
                className="w-full flex items-center justify-center gap-2 bg-[#1FBFFF] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#1fa5eb] transition"
              >
                <Plus size={18} />
                বিল পেমেন্ট যোগ করুন
              </button>
            </div>
            <div className="space-y-2">
              {bills.length === 0 ? (
                <p className="text-center text-gray-500 py-8">কোনো বিল পেমেন্ট যোগ করা হয়নি</p>
              ) : (
                bills.map((bill) => (
                  <div key={bill.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{bill.name}</p>
                      <p className="text-sm text-gray-500">{bill.category}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBill(bill.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                    >
                      <Search size={18} style={{display: 'none'}} />
                      <span className="text-red-600 font-bold">×</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Donations Tab Content */}
        {activeTab === "donations" && (
          <>
            <div className="mb-4">
              <button
                onClick={() => setShowAddModal("donation")}
                className="w-full flex items-center justify-center gap-2 bg-[#1FBFFF] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#1fa5eb] transition"
              >
                <Plus size={18} />
                দান সংস্থা যোগ করুন
              </button>
            </div>
            <div className="space-y-2">
              {donations.length === 0 ? (
                <p className="text-center text-gray-500 py-8">কোনো দান সংস্থা যোগ করা হয়নি</p>
              ) : (
                donations.map((org) => (
                  <div key={org.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{org.name}</p>
                      <p className="text-sm text-gray-500">{org.category}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteDonation(org.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                    >
                      <span className="text-red-600 font-bold">×</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-2">
              {showAddModal === "state" && "State অ্যাকাউন্ট যোগ করুন"}
              {showAddModal === "business" && "Business অ্যাকাউন্ট যোগ করুন"}
              {showAddModal === "institution" && "Institution যোগ করুন"}
              {showAddModal === "bill" && "বিল পেমেন্ট যোগ করুন"}
              {showAddModal === "donation" && "দান সংস্থা যোগ করুন"}
              {showAddModal === "balance" && "ব্যালেন্স যোগ করুন"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {showAddModal === "state" && "Cashout এর জন্য (৳৫ কমিশন প্রতি ৳১০০০)"}
              {showAddModal === "business" && "Payment প্রসেসিং এর জন্য"}
              {showAddModal === "institution" && "Institution পার্টনারদের জন্য"}
              {showAddModal === "bill" && "বিল পেমেন্ট সেবা যোগ করুন"}
              {showAddModal === "donation" && "দান সেবা যোগ করুন"}
              {showAddModal === "balance" && "কোনো account এ ব্যালেন্স যোগ করুন"}
            </p>
            
            <div className="space-y-3">
              {/* Account fields */}
              {(showAddModal === "state" || showAddModal === "business" || showAddModal === "institution") && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">ফোন নম্বর</label>
                    <input
                      type="tel"
                      value={accountPhone}
                      onChange={(e) => setAccountPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-1 text-base"
                      maxLength={11}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">অ্যাকাউন্ট নাম</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder={
                        showAddModal === "state"
                          ? "যেমন: রহিম এজেন্ট"
                          : showAddModal === "business"
                            ? "যেমন: ABC Store"
                            : "Institution Name"
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-1 text-base"
                    />
                  </div>
                  
                  {/* Institution Type Select - Only for Institution */}
                  {showAddModal === "institution" && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">প্রতিষ্ঠানের ধরন</label>
                      <select
                        value={newInstitutionType}
                        onChange={(e) => setNewInstitutionType(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-1 text-base bg-white hover:bg-gray-50 transition font-medium text-gray-900"
                      >
                        <option value="School" className="bg-white text-gray-900">স্কুল</option>
                        <option value="College" className="bg-white text-gray-900">কলেজ</option>
                        <option value="University" className="bg-white text-gray-900">বিশ্ববিদ্যালয়</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Balance fields */}
              {showAddModal === "balance" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">ফোন নম্বর</label>
                    <input
                      type="tel"
                      value={accountPhone}
                      onChange={(e) => setAccountPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-1 text-base"
                      maxLength={11}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">ব্যালেন্স যোগ করুন (টাকা)</label>
                    <input
                      type="number"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value.replace(/\D/g, ""))}
                      placeholder="উদাহরণ: 709"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-1 text-base"
                    />
                  </div>
                </>
              )}

              {/* Bill fields */}
              {showAddModal === "bill" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">বিল প্রদানকারীর নাম</label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="যেমন: DESCO, Titas Gas"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-1 text-base"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">ক্যাটাগরি</label>
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-1 text-base"
                    >
                      <option value="Electricity">বিদ্যুৎ</option>
                      <option value="Gas">গ্যাস</option>
                      <option value="Water">পানি</option>
                      <option value="Internet">ইন্টারনেট</option>
                    </select>
                  </div>
                </>
              )}

              {/* Donation fields */}
              {showAddModal === "donation" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">দান সংস্থার নাম</label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="যেমন: SOS Children Village"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-1 text-base"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">ক্যাটাগরি</label>
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-1 text-base"
                    >
                      <option value="Children">শিশু সহায়তা</option>
                      <option value="Health">স্বাস্থ্য</option>
                      <option value="Education">শিক্ষা</option>
                      <option value="Emergency">জরুরি সহায়তা</option>
                      <option value="Environment">পরিবেশ</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {addError && <div className="text-red-500 text-sm mt-3">{addError}</div>}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(null)
                  setAccountPhone("")
                  setAccountName("")
                  setNewItemName("")
                  setNewItemCategory("Electricity")
                  setNewInstitutionType("School")
                  setAddError("")
                }}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  if (showAddModal === "bill") {
                    handleAddBill()
                  } else if (showAddModal === "donation") {
                    handleAddDonation()
                  } else {
                    handleAddAccount(showAddModal as "state" | "business" | "institution")
                  }
                }}
                disabled={
                  (showAddModal === "state" || showAddModal === "business" || showAddModal === "institution")
                    ? !accountPhone.trim() || !accountName.trim() || accountPhone.length !== 11
                    : !newItemName.trim()
                }
                className={`flex-1 py-3 text-white rounded-lg disabled:opacity-50 ${
                  showAddModal === "state"
                    ? "bg-green-500 hover:bg-green-600"
                    : showAddModal === "business"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : showAddModal === "institution"
                        ? "bg-purple-500 hover:bg-purple-600"
                        : showAddModal === "bill"
                          ? "bg-orange-500 hover:bg-orange-600"
                          : "bg-pink-500 hover:bg-pink-600"
                }`}
              >
                যোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
