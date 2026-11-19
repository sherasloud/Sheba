"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Minus, Plus } from "lucide-react"

const PAYMENT_WINDOW_SECONDS = 7 * 60

export default function PaymentGatewayScreen() {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_WINDOW_SECONDS)
  const [helpIsOpen, setHelpIsOpen] = useState(false)
  const [previewNotice, setPreviewNotice] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneError, setPhoneError] = useState("")

  const handleConfirm = () => {
    if (!/^1[3-9]\d{8}$/.test(phoneNumber)) {
      setPhoneError("Enter a valid 10-digit Bangladesh mobile number.")
      setPreviewNotice(false)
      return
    }

    setPhoneError("")
    setPreviewNotice(true)
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((seconds) => Math.max(0, seconds - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  return (
    <main className="min-h-[100svh] bg-white px-5 pb-[max(2rem,env(safe-area-inset-bottom))] text-[#171717]">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[480px] flex-col">
        <div className="flex justify-center pt-[12vh] sm:pt-[15vh]">
          <Image
            src="/images/sheba-headline-logo.jpeg"
            alt="Sheba"
            width={1080}
            height={607}
            priority
            className="h-auto w-[min(88vw,390px)] object-contain"
          />
        </div>

        <section className="flex flex-1 flex-col justify-center gap-2" aria-label="Payer phone number">
          <label htmlFor="payer-phone" className="text-sm font-medium text-[#292929]">
            Bangladesh mobile number
          </label>
          <div className={`flex min-h-14 items-center rounded-xl border bg-white px-4 ${phoneError ? "border-red-500" : "border-[#d9d9d9] focus-within:border-[#078bb2]"}`}>
            <span className="mr-3 shrink-0 text-base font-medium text-[#555]" aria-hidden="true">+880</span>
            <input
              id="payer-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={11}
              value={phoneNumber}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, "")
                const localNumber =
                  digits.length === 11 && digits.startsWith("0") ? digits.slice(1) : digits.slice(0, 10)
                setPhoneNumber(localNumber)
                setPhoneError("")
                setPreviewNotice(false)
              }}
              placeholder="17XXXXXXXX"
              aria-label="Bangladesh mobile number without country code"
              aria-invalid={Boolean(phoneError)}
              aria-describedby={phoneError ? "payer-phone-error" : "payer-phone-hint"}
              className="min-w-0 flex-1 bg-transparent py-3 text-base text-[#171717] outline-none placeholder:text-[#9a9a9a]"
            />
          </div>
          <p id={phoneError ? "payer-phone-error" : "payer-phone-hint"} className={`text-sm ${phoneError ? "text-red-600" : "text-[#646464]"}`} role={phoneError ? "alert" : undefined}>
            {phoneError || "Enter 10 digits after +880."}
          </p>
        </section>

        <section className="pb-[5vh]" aria-label="Payment confirmation">
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={secondsLeft === 0}
              className="min-h-[58px] w-full rounded-xl bg-[#078bb2] px-6 py-4 text-lg font-semibold text-white shadow-[0_3px_0_0_#05799b] transition-colors hover:bg-[#067da2] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#078bb2]/25 disabled:cursor-not-allowed disabled:bg-[#9acbd9] disabled:shadow-none"
            >
              CONFIRM
            </button>
            <button
              type="button"
              onClick={() => router.push("/payment")}
              className="min-h-[58px] w-full rounded-xl bg-[#858585] px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#737373] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#858585]/25"
            >
              CANCEL
            </button>
          </div>

          {previewNotice && (
            <p className="mt-4 rounded-lg bg-[#eef8fb] px-4 py-3 text-sm leading-6 text-[#245566]" role="status">
              This gateway preview does not process a payment.
            </p>
          )}

          <p className="mt-6 text-base leading-6 text-[#171717] sm:text-lg" aria-live="polite">
            {secondsLeft > 0
              ? `The page will automatically timeout after ${minutes} minutes ${String(seconds).padStart(2, "0")} seconds.`
              : "This payment session has timed out."}
          </p>

          <div className="mt-3 border-t border-[#e7e7e7] pt-3">
            <button
              type="button"
              aria-expanded={helpIsOpen}
              aria-controls="gateway-help"
              onClick={() => setHelpIsOpen((open) => !open)}
              className="flex min-h-11 w-full items-center justify-between gap-4 text-left text-base text-[#292929] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#078bb2] sm:text-lg"
            >
              <span>Need some help?</span>
              {helpIsOpen ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}
            </button>
            {helpIsOpen && (
              <p id="gateway-help" className="pb-2 pt-1 text-sm leading-6 text-[#646464]">
                Review the payment details on the previous screen. If you did not start this payment, choose Cancel.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
