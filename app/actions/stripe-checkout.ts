'use server'

import { getStripe } from '@/lib/stripe'
import { WALLET_PRODUCTS } from '@/lib/stripe-products'

export async function startCheckoutSession(
  productId: string,
  phoneNumber: string,
) {
  const product = WALLET_PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  // Create Checkout Sessions from body params.
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: [
      {
        price_data: {
          currency: product.currency.toLowerCase(),
          product_data: {
            name: `Add Money - ${product.name}`,
            description: product.description,
          },
          unit_amount: product.amountInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      phoneNumber: phoneNumber,
      takaAmount: product.amountInTaka.toString(),
      productId: productId,
    },
  })

  return session.client_secret
}
