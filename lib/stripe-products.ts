export interface WalletProduct {
  id: string
  name: string
  description: string
  amountInCents: number // Amount in cents (e.g., 50000 = $500 = Tk50,000)
  amountInTaka: number  // For display
  currency: string
}

// Wallet recharge options - adjust these based on your needs
export const WALLET_PRODUCTS: WalletProduct[] = [
  {
    id: 'wallet-500',
    name: 'Tk 500',
    description: 'Add Tk500 to your wallet',
    amountInCents: 50000, // $500 equivalent for Stripe (you'll handle BDT conversion)
    amountInTaka: 500,
    currency: 'USD', // Stripe uses USD, BDT conversion happens in backend
  },
  {
    id: 'wallet-1000',
    name: 'Tk 1,000',
    description: 'Add Tk1,000 to your wallet',
    amountInCents: 100000,
    amountInTaka: 1000,
    currency: 'USD',
  },
  {
    id: 'wallet-2500',
    name: 'Tk 2,500',
    description: 'Add Tk2,500 to your wallet',
    amountInCents: 250000,
    amountInTaka: 2500,
    currency: 'USD',
  },
  {
    id: 'wallet-5000',
    name: 'Tk 5,000',
    description: 'Add Tk5,000 to your wallet',
    amountInCents: 500000,
    amountInTaka: 5000,
    currency: 'USD',
  },
  {
    id: 'wallet-10000',
    name: 'Tk 10,000',
    description: 'Add Tk10,000 to your wallet',
    amountInCents: 1000000,
    amountInTaka: 10000,
    currency: 'USD',
  },
]
