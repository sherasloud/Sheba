'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, MapPin, Phone, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'

const SERVICE_TYPES = [
  { value: 'all', label: 'সব' },
  { value: 'doctor', label: 'ডাক্তার' },
  { value: 'lab', label: 'ল্যাব' },
  { value: 'physio', label: 'ফিজিও' },
  { value: 'hospital', label: 'হাসপাতাল' },
  { value: 'pharmacy', label: 'ফার্মেসি' },
]

interface ServiceProvider {
  id: string
  name: string
  phone: string
  type: string
  specialization?: string
  address?: string
  isVerified: boolean
}

export default function ShebaBrowsePage() {
  const router = useRouter()
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/sheba/list')
        if (response.ok) {
          const data = await response.json()
          setProviders(data.providers || [])
          setFilteredProviders(data.providers || [])
        }
      } catch (err) {
        console.error('[v0] Failed to fetch providers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [])

  useEffect(() => {
    let filtered = providers

    if (selectedType !== 'all') {
      filtered = filtered.filter((p) => p.type === selectedType)
    }

    if (searchTerm) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.specialization?.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    setFilteredProviders(filtered)
  }, [searchTerm, selectedType, providers])

  const getTypeLabel = (type: string) => {
    return SERVICE_TYPES.find((t) => t.value === type)?.label || type
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'doctor':
        return 'bg-blue-100 text-blue-700'
      case 'lab':
        return 'bg-purple-100 text-purple-700'
      case 'physio':
        return 'bg-green-100 text-green-700'
      case 'hospital':
        return 'bg-red-100 text-red-700'
      case 'pharmacy':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#1FBFFF] text-white p-4 flex items-center">
        <Link href="/" className="mr-4 touch-manipulation">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-lg font-bold">স্বাস্থ্য সেবা</div>
      </div>

      <div className="p-4 space-y-4 bg-gray-50 border-b">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FBFFF]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {SERVICE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-3 py-1 rounded-full whitespace-nowrap text-sm font-medium transition ${
                selectedType === type.value ? 'bg-[#1FBFFF] text-white' : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">লোড করছি...</p>
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">কোন সেবা প্রদানকারী পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredProviders.map((provider) => (
            <div
              key={provider.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{provider.name}</h3>
                    {provider.isVerified && <Award size={16} className="text-blue-600" />}
                  </div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getTypeColor(provider.type)}`}>
                    {getTypeLabel(provider.type)}
                  </span>
                </div>
              </div>

              {provider.specialization && (
                <p className="text-sm text-gray-600 mb-2">{provider.specialization}</p>
              )}

              {provider.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin size={14} />
                  <span className="truncate">{provider.address}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Phone size={14} />
                <span>{provider.phone}</span>
              </div>

              <button
                onClick={() => router.push(`/sheba/pay?providerId=${provider.id}`)}
                className="w-full bg-[#1FBFFF] text-white py-2 rounded-lg font-medium hover:bg-blue-400 transition"
              >
                সেবা গ্রহণ করুন
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 border-t bg-white">
        <button
          onClick={() => router.push('/sheba/register')}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
        >
          সেবা প্রদানকারী হন
        </button>
      </div>
    </div>
  )
}
