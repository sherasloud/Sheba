"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Search, Building2, Store, Landmark, User } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Account {
  id: string
  phone: string
  name: string
  balance: number
  account_type: string
  created_at: string
}

export default function DevelopmentAppPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState<"state" | "business" | "institution" | null>(null)
  const [accountPhone, setAccountPhone] = useState("")
  const [accountName, setAccountName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [addError, setAddError] = useState("")

  const loadAccountsFromSupabase = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setAccounts(data || [])
    } catch (error) {
      console.error("Error loading accounts:", error)
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

    loadAccountsFromSupabase()

    // Subscribe to realtime updates
    const supabase = createClient()
    const channel = supabase
      .channel("profiles_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        loadAccountsFromSupabase()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleAddAccount = async (type: "state" | "business" | "institution") => {
    if (!accountPhone.trim() || !accountName.trim()) return
    if (accountPhone.length !== 11) {
      setAddError("সঠিক ১১ সংখ্যার ফোন নম্বর দিন")
      return
    }

    setAddError("")

    try {
      const supabase = createClient()
      
      // Check if phone already exists
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", accountPhone)
        .single()

      if (existing) {
        // Update existing account type
        const { error } = await supabase
          .from("profiles")
          .update({ 
            account_type: type,
            name: accountName 
          })
          .eq("phone", accountPhone)

        if (error) throw error
      } else {
        // Create new account
        const { error } = await supabase
          .from("profiles")
          .insert({
            phone: accountPhone,
            name: accountName,
            account_type: type,
            pin: "123456",
            balance: type === "state" ? 20000 : type === "business" ? 50000 : 10000,
          })

        if (error) throw error
      }

      setAccountPhone("")
      setAccountName("")
      setShowAddModal(null)
      await loadAccountsFromSupabase()
    } catch (error) {
      console.error(`Error adding ${type} account:`, error)
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

      {/* Add Buttons */}
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
      </div>

      {/* Stats */}
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

      {/* Search */}
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

      {/* Account List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">ব্যালেন্স:</span>
                  <span className="font-bold text-green-600">
                    ৳ {Number(account.balance).toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-2">
              {showAddModal === "state" && "State অ্যাকাউন্ট যোগ করুন"}
              {showAddModal === "business" && "Business অ্যাকাউন্ট যোগ করুন"}
              {showAddModal === "institution" && "Institution যোগ করুন"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {showAddModal === "state" && "Cashout এর জন্য (৳৫ কমিশন প্রতি ৳১০০০)"}
              {showAddModal === "business" && "Payment প্রসেসিং এর জন্য"}
              {showAddModal === "institution" && "Institution পার্টনারদের জন্য"}
            </p>
            
            <div className="space-y-3">
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
            </div>

            {addError && <div className="text-red-500 text-sm mt-3">{addError}</div>}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(null)
                  setAccountPhone("")
                  setAccountName("")
                  setAddError("")
                }}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                বাতিল
              </button>
              <button
                onClick={() => handleAddAccount(showAddModal)}
                disabled={!accountPhone.trim() || !accountName.trim() || accountPhone.length !== 11}
                className={`flex-1 py-3 text-white rounded-lg disabled:opacity-50 ${
                  showAddModal === "state"
                    ? "bg-green-500 hover:bg-green-600"
                    : showAddModal === "business"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-purple-500 hover:bg-purple-600"
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
