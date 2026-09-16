import 'server-only'

import Stripe from 'stripe'

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in the deployment environment.')
  }
  return new Stripe(secretKey)
}
