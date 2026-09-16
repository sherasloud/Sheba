'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function PayFeesPage() {
  const router = useRouter()
  const [fees, setFees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedFee, setSelectedFee] = useState<any>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const phone = localStorage.getItem('phoneNumber')
    if (!phone) {
      router.replace('/')
      return
    }
    setPhoneNumber(phone)
    loadPendingFees(phone)
  }, [router])

  const loadPendingFees = async (phone: string) => {
    try {
      const response = await fetch('/api/institution/student/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentPhone: phone }),
      })
      const data = await response.json()
      if (response.ok) {
        setFees(data.fees || [])
      }
    } catch (err) {
      console.error('Failed to load fees:', err)
      setError('ফি লোড করতে ব্যর্থ')
    } finally {
      setLoading(false)
    }
  }

  const handlePayFee = async (fee: any) => {
    setProcessing(true)
    try {
      const response = await fetch('/api/institution/fee/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feePaymentId: fee.id,
          studentPhone: phoneNumber,
          amount: fee.amount,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setSelectedFee(null)
        loadPendingFees(phoneNumber)
      } else {
        setError(data.message || 'পেমেন্ট ব্যর্থ')
      }
    } catch (err) {
      setError('পেমেন্ট প্রক্রিয়া ব্যর্থ')
    } finally {
      setProcessing(false)
    }
  }

  const pendingFees = fees.filter(f => f.status === 'pending')
  const paidFees = fees.filter(f => f.status === 'paid')
  const totalPending = pendingFees.reduce((sum, f) => sum + f.amount, 0)

  return (
    <div className="mobile-page">
      <div className="mobile-header">
        <Link href="/" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-lg font-medium">ফি পেমেন্ট</div>
      </div>

      <div className="mobile-content">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Total Pending */}
        {totalPending > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm font-medium">পেমেন্টের অপেক্ষায়</p>
            <p className="text-2xl font-bold text-red-600 mt-1">৳{totalPending.toLocaleString('bn-BD')}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Pending Fees */}
            {pendingFees.length > 0 && (
              <div className="mb-6">
                <h2 className="font-bold text-gray-900 mb-3">বকেয়া ফি</h2>
                <div className="space-y-3">
                  {pendingFees.map(fee => (
                    <div
                      key={fee.id}
                      className="bg-white p-4 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition"
                      onClick={() => setSelectedFee(fee)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-900">{fee.feeName}</p>
                        <p className="text-red-600 font-bold">৳{fee.amount.toLocaleString('bn-BD')}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        ক্লাস: {fee.className} • রোল: {fee.rollNo}
                      </p>
                      {fee.dueDate && (
                        <p className="text-xs text-orange-600 mt-1">
                          দেয়: {new Date(fee.dueDate).toLocaleDateString('bn-BD')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paid Fees */}
            {paidFees.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-900 mb-3">পরিশোধিত ফি</h2>
                <div className="space-y-2">
                  {paidFees.map(fee => (
                    <div key={fee.id} className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-start gap-3">
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900">{fee.feeName}</p>
                        <p className="text-xs text-green-700">
                          পরিশোধ: {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString('bn-BD') : 'N/A'}
                        </p>
                      </div>
                      <p className="text-green-600 font-bold">৳{fee.amount.toLocaleString('bn-BD')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fees.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">কোনো ফি পাওয়া যায়নি</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pay Modal */}
      {selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">ফি পেমেন্ট নিশ্চিত করুন</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600">ফি নাম</p>
              <p className="font-bold text-gray-900">{selectedFee.feeName}</p>
              <p className="text-sm text-gray-600 mt-2">পরিমাণ</p>
              <p className="text-2xl font-bold text-red-600">৳{selectedFee.amount.toLocaleString('bn-BD')}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedFee(null)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg"
              >
                বাতিল
              </button>
              <button
                onClick={() => handlePayFee(selectedFee)}
                disabled={processing}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg disabled:opacity-50"
              >
                {processing ? 'প্রক্রিয়াকরণ...' : 'এখনই পেমেন্ট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
