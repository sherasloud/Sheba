'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const PROVIDER_TYPES = [
  { value: 'doctor', label: 'ডাক্তার (Doctor)' },
  { value: 'lab', label: 'ল্যাব (Laboratory)' },
  { value: 'physio', label: 'ফিজিও (Physiotherapy)' },
  { value: 'hospital', label: 'হাসপাতাল (Hospital)' },
  { value: 'pharmacy', label: 'ফার্মেসি (Pharmacy)' },
]

export default function ShebaRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [verificationCodeSent, setVerificationCodeSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    type: 'doctor',
    specialization: '',
    address: '',
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/sheba/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      setVerificationCodeSent(true)
    } catch (err) {
      setError('Network error')
      console.error('[v0] Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/sheba/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          verificationCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Verification failed')
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/sheba/dashboard'), 2000)
    } catch (err) {
      setError('Network error')
      console.error('[v0] Verification error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#1FBFFF] text-white p-4 flex items-center">
        <Link href="/" className="mr-4 touch-manipulation">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-lg font-bold">সেবা প্রদানকারী নিবন্ধন</div>
      </div>

      {success ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">সফল!</h2>
            <p className="text-gray-600">আপনি সফলভাবে যাচাইকৃত হয়েছেন</p>
          </div>
        </div>
      ) : verificationCodeSent ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <form onSubmit={handleVerifyCode} className="w-full max-w-md">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">যাচাইকরণ কোড</label>
              <p className="text-xs text-gray-600 mb-3">{formData.phone} এ পাঠানো কোড লিখুন</p>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="6-সংখ্যার কোড"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF]"
                required
              />
            </div>

            {error && <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded">{error}</div>}

            <button
              type="submit"
              disabled={loading || !verificationCode}
              className="w-full bg-[#1FBFFF] text-white py-3 rounded-lg font-bold disabled:bg-gray-400"
            >
              {loading ? 'যাচাই করছি...' : 'যাচাই করুন'}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleRegister} className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ফোন নম্বর</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01700000000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">নাম</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="আপনার নাম"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">সেবার ধরন</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF]"
              >
                {PROVIDER_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">বিশেষত্ব (ঐচ্ছিক)</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="যেমন: কার্ডিওলজি, জেনারেল প্র্যাকটিস"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ঠিকানা</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="সম্পূর্ণ ঠিকানা"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF]"
              />
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1FBFFF] text-white py-3 rounded-lg font-bold disabled:bg-gray-400"
            >
              {loading ? 'নিবন্ধন করছি...' : 'নিবন্ধন করুন'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
