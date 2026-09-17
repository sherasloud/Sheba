'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Filter, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface FeeRecord {
  id: string
  studentName: string
  rollNo: string
  className: string
  feeName: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  dueDate: string
  paidDate?: string
}

export default function FeeCollectionPage() {
  const router = useRouter()
  const params = useParams()
  const institutionId = params.id as string

  const [fees, setFees] = useState<FeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')
  const [managerPhone, setManagerPhone] = useState('')

  useEffect(() => {
    const phone = localStorage.getItem('phoneNumber')
    if (!phone) {
      router.replace('/')
      return
    }
    setManagerPhone(phone)
    loadFeeCollection(institutionId)
  }, [institutionId, router])

  const loadFeeCollection = async (id: string) => {
    try {
      const response = await fetch('/api/institution/fee-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institutionId: id }),
      })
      const data = await response.json()
      if (response.ok) {
        setFees(data.fees || [])
      }
    } catch (err) {
      console.error('Failed to load fee collection:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredFees = fees.filter(f => {
    if (filter === 'all') return true
    return f.status === filter
  })

  const stats = {
    total: fees.length,
    paid: fees.filter(f => f.status === 'paid').length,
    pending: fees.filter(f => f.status === 'pending').length,
    overdue: fees.filter(f => f.status === 'overdue').length,
    totalCollected: fees
      .filter(f => f.status === 'paid')
      .reduce((sum, f) => sum + f.amount, 0),
    totalPending: fees
      .filter(f => f.status !== 'paid')
      .reduce((sum, f) => sum + f.amount, 0),
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'পরিশোধিত'
      case 'pending':
        return 'পেমেন্টের অপেক্ষায়'
      case 'overdue':
        return 'বিলম্বিত'
      default:
        return status
    }
  }

  return (
    <div className="mobile-page">
      <div className="mobile-header">
        <Link href={`/institution/dashboard/${institutionId}`} className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-lg font-medium">ফি সংগ্রহ রিপোর্ট</div>
      </div>

      <div className="mobile-content">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600">মোট ফি</p>
            <p className="text-lg font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-xs text-green-600">পরিশোধিত</p>
            <p className="text-lg font-bold text-green-900">{stats.paid}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-600">পেন্ডিং</p>
            <p className="text-lg font-bold text-yellow-900">{stats.pending}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-xs text-red-600">বিলম্বিত</p>
            <p className="text-lg font-bold text-red-900">{stats.overdue}</p>
          </div>
        </div>

        {/* Collection Summary */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
          <p className="text-sm text-gray-600">সংগৃহীত</p>
          <p className="text-2xl font-bold text-green-600">৳{stats.totalCollected.toLocaleString('bn-BD')}</p>
          <p className="text-sm text-gray-600 mt-2">পেন্ডিং</p>
          <p className="text-2xl font-bold text-red-600">৳{stats.totalPending.toLocaleString('bn-BD')}</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['all', 'paid', 'pending', 'overdue'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'সব' : status === 'paid' ? 'পরিশোধিত' : status === 'pending' ? 'পেন্ডিং' : 'বিলম্বিত'}
            </button>
          ))}
        </div>

        {/* Fee List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFees.length > 0 ? (
              filteredFees.map(fee => (
                <div key={fee.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{fee.studentName}</p>
                      <p className="text-xs text-gray-600">রোল: {fee.rollNo} • {fee.className}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusBadge(fee.status)}`}>
                      {getStatusText(fee.status)}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-600">{fee.feeName}</p>
                      {fee.dueDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          দেয়: {new Date(fee.dueDate).toLocaleDateString('bn-BD')}
                        </p>
                      )}
                    </div>
                    <p className="font-bold text-lg text-gray-900">৳{fee.amount.toLocaleString('bn-BD')}</p>
                  </div>
                  {fee.paidDate && (
                    <p className="text-xs text-green-600 mt-2">পরিশোধ: {new Date(fee.paidDate).toLocaleDateString('bn-BD')}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">কোনো ফি পাওয়া যায়নি</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
