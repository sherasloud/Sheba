'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

export default function WithdrawPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleWithdraw = async () => {
    if (!amount || !bankName || !accountNumber || !accountHolder) {
      setError('Please fill all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const phone = localStorage.getItem('phoneNumber')
      const response = await fetch('/api/sheba/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          amount: Number(amount),
          bankDetails: { bankName, accountNumber, accountHolder },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setAmount('')
        setBankName('')
        setAccountNumber('')
        setAccountHolder('')
        setTimeout(() => router.push('/'), 2000)
      } else {
        setError(data.error || 'Withdrawal failed')
      }
    } catch (err) {
      setError('Withdrawal failed. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <button onClick={() => router.push('/')} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-medium">Withdrawal</div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Withdrawal Successful!</h2>
          <p className="text-gray-600 text-center">Your withdrawal request has been processed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <button onClick={() => router.back()} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div className="text-xl font-medium">Withdraw from Sheba</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawal Amount (৳)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#29a9eb] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#29a9eb] focus:border-transparent"
            >
              <option value="">Select Bank</option>
              <option value="Bkash">Bkash</option>
              <option value="Nagad">Nagad</option>
              <option value="Rocket">Rocket</option>
              <option value="Upay">Upay</option>
              <option value="DBL">DBL</option>
              <option value="Islami Bank">Islami Bank</option>
              <option value="Sonali Bank">Sonali Bank</option>
              <option value="Dutch Bangla">Dutch Bangla</option>
              <option value="Dhaka Bank">Dhaka Bank</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#29a9eb] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Enter account holder name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#29a9eb] focus:border-transparent"
            />
          </div>

          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="w-full bg-[#29a9eb] text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition"
          >
            {loading ? 'Processing...' : 'Confirm Withdrawal'}
          </button>
        </div>
      </div>
    </div>
  )
}
