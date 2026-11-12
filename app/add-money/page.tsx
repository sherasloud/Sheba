"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import VerificationRequired from "@/components/verification-required"

const bangladeshBanks = [
  { name: "Premier Bank PLC", shortName: "Premier Bank", logo: "/banks/premier-bank.jpeg" },
  { name: "Pubali Bank Limited", shortName: "Pubali Bank", logo: "/banks/pubali-bank.jpeg" },
  { name: "Islami Bank Bangladesh Limited", shortName: "Islami Bank", logo: "/banks/islami-bank.jpeg" },
  { name: "City Bank PLC", shortName: "City Bank", logo: "/banks/city-bank.jpeg" },
  { name: "United Commercial Bank PLC", shortName: "UCB Bank", logo: "/banks/ucb-bank.jpeg" },
  { name: "Dhaka Bank Limited", shortName: "Dhaka Bank", logo: "/banks/dhaka-bank.jpeg" },
  { name: "Bank Asia Limited", shortName: "Bank Asia", logo: "/banks/bank-asia.jpeg" },
  { name: "AB Bank Limited", shortName: "AB Bank", logo: "/banks/ab-bank.jpeg" },
  { name: "Prime Bank PLC", shortName: "Prime Bank", logo: "/banks/prime-bank.jpeg" },
  { name: "Mutual Trust Bank PLC", shortName: "Mutual Trust Bank", logo: "/banks/mutual-trust-bank.jpeg" },
]

export default function AddMoneyPage() {
  const router = useRouter()
  const [isVerified, setIsVerified] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState("")
  const [selectedBank, setSelectedBank] = useState("")
  const [step, setStep] = useState(1)
  const [bankPage, setBankPage] = useState(1)
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [gatewayUrl, setGatewayUrl] = useState("")
  const [gatewayLoaded, setGatewayLoaded] = useState(false)
  const checkoutStartedRef = useRef(false)

  const gatewayFrameRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handleGatewayMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== gatewayFrameRef.current?.contentWindow) return
      if (event.data?.type !== "sheba-payment-result") return

      setGatewayUrl("")
      setGatewayLoaded(false)
      setIsLoading(false)
      checkoutStartedRef.current = false
      if (event.data.status === "success") {
        if (event.data.amount) setAmount(String(event.data.amount))
        setSuccess(true)
      } else if (event.data.status === "failed") {
        setError("PayStation payment failed. Please try again.")
      } else if (event.data.status === "pending") {
        setError("Payment received. Wallet credit is being verified.")
      }
    }

    window.addEventListener("message", handleGatewayMessage)
    return () => window.removeEventListener("message", handleGatewayMessage)
  }, [])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const paymentStatus = searchParams.get("payment")
    if (paymentStatus === "success") {
      const returnedAmount = searchParams.get("amount") || localStorage.getItem("paystationAmount")
      if (returnedAmount) setAmount(returnedAmount)
      setSuccess(true)
      if (window.parent !== window) {
        window.parent.postMessage({ type: "sheba-payment-result", status: "success", amount: returnedAmount }, window.location.origin)
      }
      const addedAmount = Number(returnedAmount || amount || 0).toLocaleString("en-US")
      const transactionEmail = localStorage.getItem("shebaTransactionEmail")
      if (transactionEmail) {
        void fetch("/api/notifications/transaction-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: transactionEmail, title: "Add Money successful", amount: `${addedAmount} ৳`, details: "Money was added to your Sheba wallet." }),
        })
      }
      if ("Notification" in window) {
        const showNotification = () => new Notification("Add Money successful", {
          body: `আপনার wallet-এ ${addedAmount} ৳ যোগ হয়েছে।`,
          icon: "/icon-192x192.png",
        })
        if (Notification.permission === "granted") showNotification()
        else if (Notification.permission === "default") Notification.requestPermission().then((permission) => {
          if (permission === "granted") showNotification()
        })
      }
      localStorage.removeItem("paystationAmount")
      localStorage.removeItem("paystationInvoice")
      window.history.replaceState({}, "", "/add-money")
    } else if (paymentStatus === "failed") {
      setError("PayStation payment failed. Please try again.")
      if (window.parent !== window) window.parent.postMessage({ type: "sheba-payment-result", status: "failed" }, window.location.origin)
    } else if (paymentStatus === "pending") {
      setError("Payment received. Wallet credit is being verified.")
      if (window.parent !== window) window.parent.postMessage({ type: "sheba-payment-result", status: "pending" }, window.location.origin)
    }

    // Check verification status
    const userData = localStorage.getItem("userData")
    const storedVerified = localStorage.getItem("isVerified")

    if (userData) {
      const user = JSON.parse(userData)
      setIsVerified(user.isVerified || false)
    } else if (storedVerified) {
      setIsVerified(storedVerified === "true")
    }

    const fetchBalance = async () => {
  const currentPhone = localStorage.getItem("phoneNumber")
  if (currentPhone) {
        try {
          const response = await fetch(`/api/balance?phone=${currentPhone}`)
          const data = await response.json()
          if (data.balance !== undefined) {
            localStorage.setItem("userBalance", data.balance.toString())
            localStorage.setItem(`userBalance_${currentPhone}`, data.balance.toString())
          }
        } catch (error) {
          console.error("[v0] Failed to fetch balance from API:", error)
        }
      }
    }

    fetchBalance()

  }, [])

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method)
    setError("")
  }

  const handleBankSelect = (bankName: string) => {
    setSelectedBank(bankName)
    setError("")
    setStep(3)
  }

  const handleAmountNext = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) < 10 || Number(amount) > 9000000) {
      setError(Number(amount) > 9000000 ? "Maximum amount is Tk90,00,000 per transaction" : "Please enter an amount between Tk10 and Tk90,00,000")
      return
    }

    setError("")
    void startPayStationCheckout()
  }

  const startPayStationCheckout = async () => {
    if (checkoutStartedRef.current || isLoading) return

    const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}")
    const currentPhone = localStorage.getItem("phoneNumber") || storedUserData.phone || storedUserData.phoneNumber || ""
    if (!currentPhone) {
      setError("Phone number not found. Please log in again.")
      return
    }

    checkoutStartedRef.current = true
    setIsLoading(true)
    setError("")

    try {
      const userData = storedUserData
      const response = await fetch("/api/paystation/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: currentPhone,
          amount: Number(amount),
          userEmail: userData.email || localStorage.getItem("shebaTransactionEmail") || "customer@sheba.com",
          userName: userData.name || "Customer",
        }),
      })
      const result = await response.json().catch(() => ({ success: false, message: "Invalid response from PayStation" }))
      if (!response.ok || !result.success || !result.redirectUrl) {
        setError(result.message || "Unable to start PayStation checkout")
        checkoutStartedRef.current = false
        setIsLoading(false)
        return
      }

      localStorage.setItem("paystationInvoice", result.invoiceNumber)
      localStorage.setItem("paystationAmount", String(amount))
      setGatewayLoaded(false)
      setGatewayUrl(result.redirectUrl)
      setIsLoading(false)
    } catch {
      checkoutStartedRef.current = false
      setIsLoading(false)
      setError("Unable to connect to PayStation. Please try again.")
    }
  }

  const handleBackStep = () => {
    if (step === 3) {
      setStep(selectedMethod === "bank" ? 2 : 1)
    } else if (step === 2) {
      setStep(1)
    } else {
      router.push("/")
    }
    setError("")
  }

  if (gatewayUrl) {
    return (
      <div className="flex h-[100dvh] flex-col bg-white">
        <div className="flex shrink-0 items-center justify-between border-b border-[#edf0f3] px-4 py-3">
          <button type="button" onClick={() => { setGatewayUrl(""); setGatewayLoaded(false); checkoutStartedRef.current = false }} className="text-sm font-medium text-[#38afe8]">Back</button>
          <h1 className="text-base font-medium text-[#151522]">PayStation secure checkout</h1>
          <a href={gatewayUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[#38afe8]">Open securely</a>
        </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="relative min-h-0 flex-1">
              {!gatewayLoaded && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white text-sm text-gray-500">Loading PayStation…</div>}
              <iframe
                ref={gatewayFrameRef}
                src={gatewayUrl}
                title="PayStation payment gateway"
                className="h-full w-full border-0"
                allow="payment *"
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => setGatewayLoaded(true)}
              />
            </div>
            <p className="shrink-0 bg-white px-4 py-2 text-center text-xs text-gray-500">
              If the payment provider does not allow embedded checkout, use “Open securely” above.
            </p>
          </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-white text-[#38afe8]">
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-[#e8f7fd]">
            <Check size={56} strokeWidth={2.5} className="text-[#38afe8]" aria-hidden="true" />
          </div>
          <p className="mb-3 text-2xl font-normal tracking-tight sm:text-4xl">Sheba</p>
          <h1 className="mb-3 text-4xl font-normal tracking-tight sm:text-6xl">Add Money</h1>
          <p className="mb-12 text-2xl font-normal sm:text-4xl">সফল হয়েছে!</p>

          <div className="mb-10 flex flex-col items-center gap-2">
            <span className="text-2xl font-normal sm:text-4xl">Amount</span>
            <span className="text-5xl font-normal tracking-tight sm:text-7xl">{Number(amount || 0).toLocaleString("en-US")} ৳</span>
          </div>

          <button onClick={() => router.push("/")} className="w-full max-w-sm rounded-lg bg-[#38afe8] px-6 py-3 font-medium text-white">
            Done
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-white text-[#38afe8]">
      <div className="flex items-center bg-white px-5 py-5">
        <button onClick={() => router.push("/")} className="text-[#38afe8]" aria-label="Back">
          <ArrowLeft size={24} />
        </button>
        {step !== 3 && <div className="ml-auto mr-auto text-lg font-medium text-[#38afe8]">Add Money</div>}
        {step !== 3 && <div className="w-6" />}
      </div>

      {step === 1 && (
  <div className="flex flex-1 flex-col overflow-y-auto bg-white px-5 pb-8 pt-6">
  <div className="flex flex-col gap-2">
  <button
  type="button"
  onClick={() => {
    handleMethodSelect("card")
    setStep(3)
  }}
  className="flex w-full items-center rounded-xl border border-[#edf0f3] bg-white px-4 py-4 text-left shadow-[0_3px_12px_rgba(20,32,51,0.05)] transition-colors hover:border-[#38afe8]"
  >
    <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center"><Image src="/banks/card-to-sheba.png" alt="" width={48} height={48} className="h-12 w-12 object-contain" /></div>
    <div className="min-w-0 flex-1">
      <h3 className="text-base font-medium text-[#151522]">Card to Sheba</h3>
    </div>

  </button>
  <button
  type="button"
  onClick={() => {
    handleMethodSelect("bank")
    setStep(2)
  }}
  className="flex w-full items-center rounded-xl border border-[#edf0f3] bg-white px-4 py-4 text-left shadow-[0_3px_12px_rgba(20,32,51,0.05)] transition-colors hover:border-[#38afe8]"
  >
    <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center"><Image src="/banks/bank-to-sheba.png" alt="" width={48} height={48} className="h-12 w-12 object-contain" /></div>
    <div className="min-w-0 flex-1">
      <h3 className="text-base font-medium text-[#151522]">Bank to Sheba</h3>
    </div>

  </button>
  </div>

  {error && <div className="mt-4 text-center text-red-500">{error}</div>}
  </div>
      )}

      {step === 2 && selectedMethod === "bank" && (
        <div className="flex flex-1 flex-col overflow-y-auto bg-white px-5 pb-8 pt-8 text-[#142033]">
          <h1 className="mb-8 text-center text-[2.35rem] font-normal leading-tight text-[#38afe8]">ব্যাংক নির্বাচন করুন</h1>
          <section className="mx-auto flex w-full max-w-md flex-col gap-3" aria-label="বাংলাদেশের ব্যাংক">
            {bangladeshBanks.slice((bankPage - 1) * 5, bankPage * 5).map((bank) => (
              <button
                key={bank.name}
                type="button"
                onClick={() => handleBankSelect(bank.name)}
                className="flex min-h-[100px] w-full items-center gap-6 px-2 text-left transition-transform active:scale-[0.98]"
              >
                <Image src={bank.logo} alt={`${bank.shortName} logo`} width={140} height={86} className="h-20 w-32 object-contain" />
                <span className="text-lg font-medium text-[#182431]">{bank.shortName}</span>
              </button>
            ))}
          </section>
          {bangladeshBanks.length > 5 && (
            <nav className="mx-auto mt-4 flex w-full max-w-md items-center justify-between" aria-label="Bank pages">
              <button
                type="button"
                onClick={() => setBankPage((page) => Math.max(1, page - 1))}
                disabled={bankPage === 1}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#38afe8] disabled:opacity-40"
              >
                Previous
              </button>
              <span aria-live="polite" className="text-sm text-[#667085]">
                Page {bankPage} of {Math.ceil(bangladeshBanks.length / 5)}
              </span>
              <button
                type="button"
                onClick={() => setBankPage((page) => Math.min(Math.ceil(bangladeshBanks.length / 5), page + 1))}
                disabled={bankPage >= Math.ceil(bangladeshBanks.length / 5)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#38afe8] disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-1 flex-col overflow-y-auto bg-white px-8 pb-8 pt-16">
          {selectedMethod === "card" ? (
            <>
              <h1 className="mb-24 text-center text-[3.25rem] font-normal leading-tight text-[#38afe8]">এমাউন্ট লিখুন</h1>
              <div className="mb-16 flex min-h-24 w-full items-center justify-center gap-2 overflow-visible text-black">
                <input
                  type="text"
                  aria-label="Amount"
                  className="add-money-amount-input h-24 shrink-0 border-0 bg-transparent p-0 text-right font-normal leading-none text-black outline-none placeholder:text-black"
                  style={{ width: `${Math.max(amount.length, 1)}ch`, lineHeight: "1", fontWeight: 400 }}
                  value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                  inputMode="numeric"
                />
                <span className="add-money-amount-currency shrink-0 font-normal leading-none">৳</span>
              </div>
              <p className="mb-5 text-center text-sm text-[#667085]">
                {selectedMethod === "bank" ? `Selected: ${selectedBank}. Choose it in the PayStation checkout.` : "Next opens PayStation here. Enter card details in its secure checkout; Sheba does not collect them."}
              </p>
              {error && <div className="mb-4 text-center text-red-500">{error}</div>}
              <div className="flex justify-center"><button className="mobile-button w-full max-w-sm rounded-full py-5 text-5xl font-normal" onClick={handleAmountNext}>Next</button></div>
            </>
          ) : (
            <>
              <h1 className="mb-24 text-center text-[3.25rem] font-normal leading-tight text-[#38afe8]">এমাউন্ট লিখুন</h1>
              <div className="mb-16 flex min-h-24 w-full items-center justify-center gap-2 overflow-visible text-black">
                <input
                  type="text"
                  aria-label="Amount"
                  inputMode="numeric"
                  className="add-money-amount-input h-24 shrink-0 border-0 bg-transparent p-0 text-right font-normal leading-none text-black outline-none placeholder:text-black"
                  style={{ width: `${Math.max(amount.length, 1)}ch`, lineHeight: "1", fontWeight: 400 }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="0"
                />
                <span className="add-money-amount-currency shrink-0 font-normal leading-none">৳</span>
              </div>
              <p className="mb-5 text-center text-sm text-[#667085]">
                {selectedMethod === "bank" ? `Selected: ${selectedBank}. Choose it in the PayStation checkout.` : "Next opens PayStation here. Enter card details in its secure checkout; Sheba does not collect them."}
              </p>
              {error && <div className="mb-4 text-center text-red-500">{error}</div>}
              <div className="flex justify-center"><button className="mobile-button w-full max-w-sm rounded-full py-5 text-5xl font-normal" onClick={handleAmountNext}>Next</button></div>
            </>
          )}
        </div>
      )}






    </div>
  )
}
