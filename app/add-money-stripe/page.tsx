'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { WALLET_PRODUCTS } from '@/lib/stripe-products'

const StripeCheckout = dynamic(() => import('@/app/components/stripe-checkout'), {
  ssr: false,
})

export default function AddMoneyStripePage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Select amount, 2: Checkout
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    // Check verification status and get phone number
    const userData = localStorage.getItem('userData')
    const currentPhone = localStorage.getItem('phoneNumber')

    if (userData) {
      const user = JSON.parse(userData)
      setIsVerified(user.isVerified || false)
    }

    if (currentPhone) {
      setPhoneNumber(currentPhone)
    } else {
      // Not logged in, redirect to login
      router.push('/login')
    }
  }, [router])

  const handleSelectAmount = (productId: string) => {
    setSelectedProduct(productId)
    setStep(2)
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setSelectedProduct(null)
    } else {
      router.back()
    }
  }

  if (!isVerified) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <button onClick={() => router.back()} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-medium">Add Money with Card</div>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <p className="text-gray-600 text-center">
            Please verify your account to add money with a card.
          </p>
          <button
            onClick={() => router.push('/verify')}
            className="mt-6 bg-[#29a9eb] text-white py-3 px-6 rounded-md"
          >
            Verify Account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <button onClick={handleBack} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div className="text-xl font-medium">Add Money with Card</div>
      </div>

      {step === 1 && (
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Select Amount</h2>
            <p className="text-gray-600 mb-6">
              Choose how much you want to add to your wallet
            </p>

            <div className="space-y-3">
              {WALLET_PRODUCTS.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectAmount(product.id)}
                  className="w-full border border-gray-200 rounded-lg p-4 text-left hover:bg-blue-50 transition-colors hover:border-[#29a9eb]"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-gray-500 text-sm">
                        {product.description}
                      </p>
                    </div>
                    <div className="text-[#29a9eb] font-bold">→</div>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-8 text-center">
              Powered by Stripe • Supports VISA, Mastercard, Amex
            </p>
          </div>
        </div>
      )}

      {step === 2 && selectedProduct && (
        <div className="flex flex-col flex-1">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold mb-2">Secure Payment</h2>
            <p className="text-gray-600 text-sm">
              {WALLET_PRODUCTS.find((p) => p.id === selectedProduct)?.description}
            </p>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <StripeCheckout
              productId={selectedProduct}
              phoneNumber={phoneNumber}
            />
          </div>
        </div>
      )}
    </div>
  )
}
