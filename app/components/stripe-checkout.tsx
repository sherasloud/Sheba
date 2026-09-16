'use client'

import { useCallback } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { startCheckoutSession } from '@/app/actions/stripe-checkout'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export default function StripeCheckout({
  productId,
  phoneNumber,
}: {
  productId: string
  phoneNumber: string
}) {
  const startCheckoutSessionForProduct = useCallback(
    () => startCheckoutSession(productId, phoneNumber),
    [productId, phoneNumber],
  )

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ clientSecret: startCheckoutSessionForProduct }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
