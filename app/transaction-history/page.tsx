"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send, Download } from "lucide-react"
import { getTransactions, subscribeToTransactions, getProfileByPhone } from "@/lib/supabase/data-service"
import { ErrorBoundary } from "@/components/error-boundary"

interface Transaction {
  id: string
  sender_phone: string
  receiver_phone: string
  amount: number
  transaction_type: string
  reference: string
  status: string
  created_at: string
}

interface TransactionDisplayData extends Transaction {
  isReceived: boolean
  sourcePhone: string
  category: "Served Cash" | "Cash Came"
}

export default function TransactionHistoryPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userPhone, setUserPhone] = useState("")
  const [userName, setUserName] = useState("")
  const [filter, setFilter] = useState<"all" | "sent" | "received">("all")

  useEffect(() => {
    // Check authentication
    const phone = localStorage.getItem("phoneNumber")
    if (!phone) {
      router.push("/enter-phone")
      return
    }

    setUserPhone(phone)
    loadTransactions(phone)
    loadUserName(phone)

    // Subscribe to transaction updates
    const unsubscribe = subscribeToTransactions(phone, (newTx) => {
      setTransactions((prev) => [newTx, ...prev])
    })

    return () => {
      unsubscribe()
    }
  }, [router])

  const loadUserName = async (phone: string) => {
    try {
      const profile = await getProfileByPhone(phone)
      if (profile) {
        setUserName(profile.name)
      }
    } catch {
      // Ignore errors
    }
  }

  const loadTransactions = async (phone: string) => {
    setIsLoading(true)
    try {
      const txns = await getTransactions(phone)
      setTransactions(txns as Transaction[])
    } catch (error) {
      console.error("[v0] Error loading transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const determineCategory = (isReceived: boolean): "Served Cash" | "Cash Came" => {
    // This can be expanded based on additional logic (payment sources, etc.)
    // For now: Received = Cash Came (from others), Sent = Served Cash (to others/state)
    return isReceived ? "Cash Came" : "Served Cash"
  }

  const getTransactionDisplayData = (tx: Transaction): TransactionDisplayData => {
    const isReceived = tx.receiver_phone === userPhone
    return {
      ...tx,
      isReceived,
      sourcePhone: isReceived ? tx.sender_phone : tx.receiver_phone,
      category: determineCategory(isReceived),
    }
  }

  const filteredTransactions = transactions
    .map(getTransactionDisplayData)
    .filter((tx) => {
      if (filter === "sent") return !tx.isReceived
      if (filter === "received") return tx.isReceived
      return true
    })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "গতকাল"
    }
    return date.toLocaleDateString("bn-BD")
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#1FBFFF] text-white p-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/20 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">লেনদেন ইতিহাস</h1>
        </div>

        {/* Filter Tabs */}
        <div className="sticky top-16 z-10 bg-gray-50 p-4 flex gap-2 overflow-x-auto">
          {(["all", "sent", "received"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                filter === f
                  ? "bg-[#1FBFFF] text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {f === "all" && "সব"}
              {f === "sent" && "পাঠানো"}
              {f === "received" && "পাওয়া"}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="p-4 pb-20">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#1FBFFF]/20 border-t-[#1FBFFF] rounded-full animate-spin"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">কোনো লেনদেন পাওয়া যায়নি</p>
              <p className="text-gray-400 text-sm">আপনার লেনদেন এখানে দেখা যাবে</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((tx) => {
                const lastFourDigits = tx.sourcePhone.slice(-4)
                const amountColor = tx.isReceived ? "text-blue-600" : "text-red-600"

                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <Send size={20} className="text-gray-600" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">
                        {tx.transaction_type || "লেনদেন"}
                      </p>
                      <p className="text-sm text-gray-600">{lastFourDigits}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(tx.created_at)} | ID: {tx.reference}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-lg ${amountColor}`}>
                        {tx.isReceived ? "+" : "-"}৳{tx.amount.toLocaleString("bn-BD")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tx.status === "completed" ? "সম্পন্ন" : "অপেক্ষমাণ"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Download Button */}
        {transactions.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4">
            <button className="w-full flex items-center justify-center gap-2 py-4 bg-[#1FBFFF] text-white rounded-full font-semibold hover:bg-[#1FBFFF]/90 transition-all">
              <Download size={20} />
              রিপোর্ট ডাউনলোড করুন
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
