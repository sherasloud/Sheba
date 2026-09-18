'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowUp, ArrowDown, LogOut, Copy, Check, Upload, User } from 'lucide-react'
import Link from 'next/link'

export default function InboxPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('transactions')
  const [transactions, setTransactions] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [userPhone, setUserPhone] = useState('')
  const [userName, setUserName] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [transactionProfilePics, setTransactionProfilePics] = useState<Record<string, string | null>>({})
  const [showNameModal, setShowNameModal] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    const phone = localStorage.getItem('phoneNumber')
    const name = localStorage.getItem('userName') || 'User'
    const verified = localStorage.getItem('isVerified') === 'true'
    
    if (!phone) {
      router.push('/pin')
      return
    }
    setUserPhone(phone)
    setUserName(name)
    setNewName(name)
    setIsVerified(verified)
    loadTransactions(phone)
    loadNotifications(phone)
  }, [router])

  const loadNotifications = async (phone: string) => {
    try {
      const trimmedPhone = phone.trim()
      const response = await fetch('/api/get-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: trimmedPhone }),
      })

      const data = await response.json()
      if (response.ok) {
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('[v0] Error loading notifications:', error)
    }
  }

  const handleNameChange = () => {
    if (newName.trim()) {
      localStorage.setItem('userName', newName)
      setUserName(newName)
      setShowNameModal(false)
    }
  }

  const loadTransactions = async (phone: string) => {
    try {
      const trimmedPhone = phone.trim()
      console.log('[v0] Inbox: Loading transactions for:', trimmedPhone)
      
      const response = await fetch('/api/get-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: trimmedPhone }),
      })

      const data = await response.json()
      console.log('[v0] Inbox: API response:', { status: response.status, count: data.transactions?.length })

      if (response.ok) {
        setTransactions(data.transactions || [])
      } else {
        console.error('[v0] Inbox: API error:', data)
      }
    } catch (error) {
      console.error('[v0] Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }
    return d.toLocaleDateString('bn-BD', options)
  }

  const getMonthYear = (date: string | Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' })
  }

  const groupedTransactions = transactions.reduce((acc: any, tx: any) => {
    const monthYear = getMonthYear(tx.createdAt)
    if (!acc[monthYear]) acc[monthYear] = []
    acc[monthYear].push(tx)
    return acc
  }, {})

  // Money goes out if this is the user's transaction
  const isMoneyOut = (tx: any) => tx.phonenumber === userPhone
  // Description contains recipient info
  const otherParty = (tx: any) => tx.description?.split(' ')?.pop() || 'Transaction'

  const handleLogout = () => {
    localStorage.clear()
    router.push('/pin')
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingProfile(true)
    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64String = event.target?.result as string
        localStorage.setItem(`profilePic_${userPhone}`, base64String)
        setProfilePic(base64String)
        console.log('[v0] Profile pic uploaded successfully')
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('[v0] Error uploading profile pic:', err)
    } finally {
      setUploadingProfile(false)
    }
  }

  useEffect(() => {
    if (userPhone && transactions.length > 0) {
      const savedPic = localStorage.getItem(`profilePic_${userPhone}`)
      if (savedPic) {
        setProfilePic(savedPic)
      }

      // Load profile pics for all transaction users
      const pics: Record<string, string | null> = {}
      transactions.forEach((tx: any) => {
        const otherPhone = tx.type === 'transfer' && tx.toPhone
          ? tx.toPhone
          : tx.type === 'receive'
            ? tx.fromPhone || 'Unknown'
            : tx.toPhone || 'System'
        
        const savedUserPic = localStorage.getItem(`profilePic_${otherPhone}`)
        if (savedUserPic) {
          pics[otherPhone] = savedUserPic
        }
      })
      setTransactionProfilePics(pics)
    }
  }, [userPhone, transactions])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between bg-white px-5 pb-3 pt-5">
        <button onClick={() => router.push('/')} className="flex h-11 w-11 items-center justify-center text-[#142033]" aria-label="Back">
          <ArrowLeft size={30} strokeWidth={1.8} />
        </button>
        <img src="/images/inbox-header-logo.png" alt="সেবা" className="h-10 w-[150px] object-contain" />
        <div className="w-11" />
      </header>
      <div className="border-b border-[#e9eef3] px-5 pb-4 pt-2">
        <h1 className="text-3xl font-normal text-[#485163]">Inbox</h1>
        <p className="mt-1 text-sm text-[#8a93a3]">আপনার লেনদেন ও নোটিফিকেশন</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 bg-white sticky top-0 z-10">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-3 px-4 font-medium transition-colors ${
            activeTab === 'transactions'
              ? 'text-[#1FBFFF] border-b-2 border-[#1FBFFF]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 py-3 px-4 font-medium transition-colors ${
            activeTab === 'notifications'
              ? 'text-[#1FBFFF] border-b-2 border-[#1FBFFF]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`flex-1 py-3 px-4 font-medium transition-colors ${
            activeTab === 'account'
              ? 'text-[#1FBFFF] border-b-2 border-[#1FBFFF]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1FBFFF]"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-gray-500 text-center">কোন লেনদেন নেই</p>
              </div>
            ) : (
              <div className="space-y-0">
                {transactions.map((tx: any, index: number) => {
                  const isReceived = tx.description?.includes('Received from')
                  const otherPhone = tx.description?.split(' ')?.pop() || tx.phonenumber
                  const colors = ['bg-purple-500', 'bg-green-500', 'bg-pink-500', 'bg-red-500', 'bg-orange-500']
                  const hash = (otherPhone?.charCodeAt(0) || 0) % colors.length
                  const bgColor = colors[hash]
                  
                  const userProfilePic = transactionProfilePics[otherPhone]
                  const displayChar = otherPhone ? otherPhone.charAt(0).toUpperCase() : null

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 p-2 bg-white mx-2 my-0 hover:bg-gray-50 transition"
                    >
                      <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden`}>
                        {userProfilePic ? (
                          <img src={userProfilePic} alt={otherPhone || 'Profile'} className="w-full h-full object-cover" />
  ) : displayChar ? (
  displayChar
  ) : (
  <User size={22} strokeWidth={1.8} aria-hidden="true" />
  )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">
                          {isReceived ? 'Received' : tx.type === 'transfer' ? 'Send Money' : tx.type === 'cashout' ? 'Cashout' : 'Payment'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {isReceived ? 'From' : 'To'} {otherPhone}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(tx.createdAt).toLocaleDateString('en-BD')} {new Date(tx.createdAt).toLocaleTimeString('en-BD', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                          })}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-blue-600 font-medium">
                            ID: {tx.id.replace('_rcv', '')}
                          </p>
                          <button
                            onClick={() => copyToClipboard(tx.id.replace('_rcv', ''), tx.id)}
                            className="p-1 hover:bg-blue-50 rounded transition"
                            title="Copy Transaction ID"
                          >
                            {copiedId === tx.id ? (
                              <Check size={14} className="text-green-600" />
                            ) : (
                              <Copy size={14} className="text-blue-600 hover:text-blue-800" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <p className={`font-bold text-lg ${isReceived ? 'text-blue-600' : 'text-red-600'}`}>
                          {isReceived ? '+' : '-'}৳{Number(tx.amount).toLocaleString('bn-BD')}
                        </p>
                        {tx.description?.includes('Fee:') && (
                          <p className="text-xs text-gray-600 mt-1">
                            {tx.description.split(' - ')[1]}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="p-0">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-gray-500 text-center">কোন বিজ্ঞপ্তি নেই</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notif: any) => (
                  <div
                    key={notif.id}
                    className={`p-4 flex items-start gap-3 ${notif.isRead ? 'bg-gray-50' : 'bg-blue-50'}`}
                  >
                    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${notif.isRead ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.createdAt).toLocaleDateString('bn-BD', {
                          day: 'numeric',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'account' && (
          <div className="p-4 space-y-4">
            {/* Profile Picture Section */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="font-bold text-lg mb-4">প্রোফাইল ছবি</h2>
              
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1FBFFF] to-[#1fa5eb] flex items-center justify-center overflow-hidden">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-white" />
                  )}
                </div>
                
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicUpload}
                    disabled={uploadingProfile}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#1FBFFF] text-white rounded-lg hover:bg-[#1fa5eb] transition font-medium">
                    <Upload size={18} />
                    {uploadingProfile ? 'আপলোড করছি...' : 'ছবি আপলোড করুন'}
                  </div>
                </label>
              </div>
            </div>

            {/* Account Settings Section */}
            <div className="bg-gradient-to-r from-[#29a9eb] to-blue-400 rounded-lg p-4 border-2 border-[#29a9eb]">
              <h2 className="font-bold text-lg mb-4 text-white">👤 আপনার নাম</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">বর্তমান নাম</p>
                  <p className="font-bold text-white text-lg">{userName}</p>
                </div>
                <button
                  onClick={() => setShowNameModal(true)}
                  className="bg-white text-[#29a9eb] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  পরিবর্তন করুন
                </button>
              </div>
            </div>

            {/* Account Settings Section */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="font-bold text-lg mb-4">অ্যাকাউন্ট সেটিংস</h2>
              
              <div className="space-y-3">
                <div className="pb-3 border-b border-gray-200">
                  <p className="text-sm text-gray-600">ফোন নম্বর</p>
                  <p className="font-medium">{userPhone}</p>
                </div>
                
                <div className="pb-3 border-b border-gray-200">
                  <p className="text-sm text-gray-600">ফোন নম্বর</p>
                  <p className="font-medium">{userPhone}</p>
                </div>
                
                <div className="pb-3 border-b border-gray-200">
                  <p className="text-sm text-gray-600">যাচাইকরণ স্থিতি</p>
                  <p className="font-medium">
                    {isVerified ? '✓ যাচাইকৃত' : '✗ অ-যাচাইকৃত'}
                  </p>
                </div>
              </div>
            </div>

            {/* Facebook Link Section */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 border-2 border-blue-500">
              <a
                href="https://facebook.com/ShebaBangIadesh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between hover:opacity-90 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white text-blue-600 p-3 rounded-lg font-bold text-lg">f</div>
                  <div>
                    <div className="font-bold text-white">📘 Sheba Facebook</div>
                    <div className="text-sm text-blue-100">আমাদের অফিসিয়াল ফেসবুক পেজ</div>
                  </div>
                </div>
                <div className="text-white text-xl">→</div>
              </a>
            </div>

            {/* Logout Section */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition"
              >
                <LogOut size={18} />
                লগআউট
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Name Change Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-900">নাম পরিবর্তন করুন</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="নতুন নাম লিখুন"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleNameChange}
                className="flex-1 bg-[#29a9eb] text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                সংরক্ষণ করুন
              </button>
              <button
                onClick={() => setShowNameModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
