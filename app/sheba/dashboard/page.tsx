'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Eye, EyeOff, CreditCard, TrendingUp, LogOut, RefreshCw } from 'lucide-react'

export default function ShebaDashboard() {
  const router = useRouter()
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [transactions, setTransactions] = useState([])
  const [copied, setCopied] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const loadProvider = async () => {
    try {
      const phone = localStorage.getItem('phoneNumber')
      if (!phone) {
        router.push('/sheba/register')
        return
      }

      const response = await fetch('/api/sheba/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      if (response.ok) {
        const data = await response.json()
        setProvider(data.provider)
        if (data.provider.apiKey) {
          setApiKey(data.provider.apiKey)
        }
        setWebhookUrl(`${window.location.origin}/api/sheba/webhook`)
        
        // Load transactions
        const txnResponse = await fetch('/api/sheba/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerId: data.provider.id }),
        })
        if (txnResponse.ok) {
          const txnData = await txnResponse.json()
          setTransactions(txnData.transactions || [])
        }
      }
    } catch (error) {
      console.error('Error loading provider:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProvider()

    // Auto-refresh every 3 seconds to show real-time balance updates
    const interval = setInterval(() => {
      loadProvider()
    }, 3000)

    return () => clearInterval(interval)
  }, [router])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Provider not found</p>
          <button
            onClick={() => router.push('/sheba/register')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Register
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="hover:bg-blue-700 p-2 rounded">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Sheba Dashboard</h1>
            <p className="text-sm text-blue-100">{provider.name}</p>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('phoneNumber')
            router.push('/')
          }}
          className="hover:bg-blue-700 p-2 rounded"
        >
          <LogOut size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 shadow-lg">
          <p className="text-blue-100 text-sm mb-2">Current Balance</p>
          <h2 className="text-4xl font-bold mb-4">৳{Number(provider.balance || 0).toLocaleString('bn-BD')}</h2>
          <div className="flex gap-2 text-xs text-blue-100">
            <div>
              <p>Type: {provider.type?.toUpperCase()}</p>
              <p>Phone: {provider.phone}</p>
            </div>
          </div>
        </div>

        {/* API Credentials */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={20} />
            API Credentials
          </h3>

          {!apiKey ? (
            <button
              onClick={async () => {
                const response = await fetch('/api/sheba/generate-api-key', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ providerId: provider.id }),
                })
                if (response.ok) {
                  const data = await response.json()
                  setApiKey(data.apiKey)
                  setWebhookUrl(data.webhookUrl)
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 w-full"
            >
              Generate API Key
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-2">API Key</p>
                <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                  <code className="text-xs font-mono">
                    {showApiKey ? apiKey : '••••••••••••••••••••••••••'}
                  </code>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(apiKey, 'API Key')}
                className={`w-full p-2 rounded-lg text-sm font-medium transition ${
                  copied === 'API Key'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Copy size={16} className="inline mr-2" />
                {copied === 'API Key' ? 'Copied!' : 'Copy API Key'}
              </button>

              <div>
                <p className="text-xs text-gray-600 mb-2">Webhook URL</p>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <code className="text-xs font-mono break-all">{webhookUrl}</code>
                </div>
                <button
                  onClick={() => copyToClipboard(webhookUrl, 'Webhook URL')}
                  className={`w-full mt-2 p-2 rounded-lg text-sm font-medium transition ${
                    copied === 'Webhook URL'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Copy size={16} className="inline mr-2" />
                  {copied === 'Webhook URL' ? 'Copied!' : 'Copy Webhook URL'}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-blue-900 mb-2">How to integrate:</p>
                <ol className="text-blue-800 text-xs space-y-1 list-decimal list-inside">
                  <li>Use the Webhook URL for payment callbacks</li>
                  <li>Send: {'{userPhone, providerId, amount, description}'}</li>
                  <li>Amount will transfer directly to your balance</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Recent Transactions
          </h3>

          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((txn: any) => (
                <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{txn.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(txn.createdAt).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                  <p className="font-bold text-green-600">+৳{Number(txn.amount).toLocaleString('bn-BD')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
