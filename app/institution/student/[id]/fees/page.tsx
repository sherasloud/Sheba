"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus } from "lucide-react"

export default function StudentFeesPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  const [student, setStudent] = useState<any>(null)
  const [fees, setFees] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddFeeForm, setShowAddFeeForm] = useState(false)
  const [feeFormData, setFeeFormData] = useState({
    feeName: "",
    amount: "",
    frequency: "monthly",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    loadStudentData()
  }, [studentId])

  const loadStudentData = async () => {
    try {
      const response = await fetch(`/api/institution/student/fees?studentId=${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setStudent(data.student)
        setFees(data.fees || [])
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error("[v0] Failed to load student data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFee = async () => {
    if (!feeFormData.feeName.trim() || !feeFormData.amount) {
      setError("Please fill all fields")
      return
    }

    try {
      const response = await fetch("/api/institution/fee/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionId: student?.institutionId,
          classId: student?.classId,
          feeName: feeFormData.feeName,
          feeAmount: Number(feeFormData.amount),
          frequency: feeFormData.frequency,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Create payment record for this student
        await fetch("/api/institution/payment/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            feeStructureId: data.feeStructure.id,
            amount: Number(feeFormData.amount),
            status: "pending",
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }),
        })

        setFeeFormData({ feeName: "", amount: "", frequency: "monthly" })
        setShowAddFeeForm(false)
        setError("")
        loadStudentData()
      }
    } catch (err) {
      setError("Failed to create fee")
      console.error("[v0] Error:", err)
    }
  }

  const handlePayFee = async (paymentId: string, amount: number) => {
    try {
      const response = await fetch("/api/institution/payment/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          amount,
        }),
      })

      if (response.ok) {
        loadStudentData()
      } else {
        setError("Payment failed")
      }
    } catch (err) {
      setError("Payment error")
      console.error("[v0] Error:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1FBFFF]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1FBFFF] text-white p-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/20 rounded-lg">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-lg font-bold">{student?.name}</h1>
          <p className="text-xs text-blue-100">Fee Management</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        {/* Create Fee Form */}
        {showAddFeeForm && (
          <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200 space-y-3">
            <input
              type="text"
              placeholder="Fee Name (e.g., Tuition Fee)"
              value={feeFormData.feeName}
              onChange={(e) => setFeeFormData({ ...feeFormData, feeName: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              placeholder="Amount"
              value={feeFormData.amount}
              onChange={(e) => setFeeFormData({ ...feeFormData, amount: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <select
              value={feeFormData.frequency}
              onChange={(e) => setFeeFormData({ ...feeFormData, frequency: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleCreateFee}
                className="flex-1 bg-[#1FBFFF] text-white p-2 rounded-lg font-medium"
              >
                Create
              </button>
              <button
                onClick={() => setShowAddFeeForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 p-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add Fee Button */}
        <button
          onClick={() => setShowAddFeeForm(!showAddFeeForm)}
          className="w-full bg-[#1FBFFF] text-white p-3 rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center gap-2 mb-4"
        >
          <Plus size={20} /> Add Tuition Fee
        </button>

        {/* Payments List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">Payment Status</h2>

          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No fees assigned</p>
            </div>
          ) : (
            payments.map((payment: any) => (
              <div
                key={payment.id}
                className={`p-4 rounded-lg border ${
                  payment.status === "paid"
                    ? "bg-green-50 border-green-200"
                    : payment.status === "overdue"
                    ? "bg-red-50 border-red-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{payment.feeName}</p>
                    <p className="text-sm text-gray-600">৳{payment.amount.toLocaleString()}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      payment.status === "paid"
                        ? "bg-green-200 text-green-800"
                        : payment.status === "overdue"
                        ? "bg-red-200 text-red-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {payment.status.toUpperCase()}
                  </span>
                </div>

                {payment.status !== "paid" && (
                  <button
                    onClick={() => handlePayFee(payment.id, payment.amount)}
                    className="w-full mt-3 bg-blue-600 text-white p-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Pay Now
                  </button>
                )}

                {payment.paidDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    Paid: {new Date(payment.paidDate).toLocaleDateString("bn-BD")}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
