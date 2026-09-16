'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Settings, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Link } from 'lucide-react'
import { NIDVerificationModal } from '@/components/nid-verification-modal'

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState('transactions')
  const [isVerified, setIsVerified] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])

  // Fetch verification status from API
  useEffect(() => {
    const userData = localStorage.getItem('userData')
    if (userData) {
      const user = JSON.parse(userData)
      const userPhone = user.phoneNumber || user.phone
      if (userPhone) {
        fetch(`/api/verification-status?phone=${encodeURIComponent(userPhone)}`)
          .then(res => res.json())
          .then(result => {
            if (result.success && result.data) {
              setIsVerified(result.data.isVerified === true)
            }
          })
          .catch(err => {
            console.error('[v0] Error fetching verification:', err)
            setIsVerified(false)
          })
      }
    }
  }, [])

  // Load transactions from localStorage or create mock data
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions')
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions))
      } catch {
        setTransactions([])
      }
    } else {
      // Start with empty transactions - will be populated from real data
      setTransactions([])
    }

    // Listen for new transactions
    const handleNewTransaction = (event: CustomEvent) => {
      const { type, amount, to } = event.detail
      const newTx = {
        type: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' '),
        description: `To ${to}`,
        amount: -Math.abs(amount),
        date: new Date().toLocaleString()
      }
      setTransactions(prev => [newTx, ...prev])
    }

    window.addEventListener('newTransaction', handleNewTransaction as EventListener)
    return () => window.removeEventListener('newTransaction', handleNewTransaction as EventListener)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="hover:bg-blue-700 p-1 rounded">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-bold">Inbox</div>
        </div>
        <Settings size={24} />
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'transactions'
              ? 'border-b-2 border-[#29a9eb] text-[#29a9eb]'
              : 'text-gray-600'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'notifications'
              ? 'border-b-2 border-[#29a9eb] text-[#29a9eb]'
              : 'text-gray-600'
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'settings'
              ? 'border-b-2 border-[#29a9eb] text-[#29a9eb]'
              : 'text-gray-600'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'transactions' && (
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No transactions yet
              </div>
            ) : (
              transactions.map((tx, i) => (
                <div key={i} className="p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{tx.type}</p>
                      <p className="text-sm text-gray-600">{tx.description}</p>
                    </div>
                    <p className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : '-'} Tk {Math.abs(tx.amount)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="text-center py-8 text-gray-600">
            No new notifications
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Account Verification */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle
                    size={20}
                    className={isVerified ? 'text-green-600' : 'text-gray-400'}
                  />
                  <span className="font-medium">
                    {isVerified ? 'Account Verified' : 'Account Unverified'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {isVerified
                  ? 'Your account is verified and all features are unlocked'
                  : 'Verify your account with NID and face verification'}
              </p>
              {!isVerified && (
                <button
                  onClick={() => setShowVerificationModal(true)}
                  className="bg-[#29a9eb] text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
                >
                  Verify Now
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* NID Verification Modal */}
      <NIDVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerified={() => {
          setShowVerificationModal(false)
          window.location.reload()
        }}
      />
    </div>
  )
}
