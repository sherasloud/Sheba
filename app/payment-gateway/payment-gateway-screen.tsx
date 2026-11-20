"use client"

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, LoaderCircle, Minus, Plus } from "lucide-react"

const PAYMENT_WINDOW_SECONDS = 7 * 60
const OTP_RESEND_SECONDS = 60

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${String(remainder).padStart(2, "0")}`
}

function preventComposingSubmit(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === "Enter" && (event.nativeEvent.isComposing || event.keyCode === 229)) {
    event.preventDefault()
  }
}

export default function PaymentGatewayScreen() {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_WINDOW_SECONDS)
  const [resendSeconds, setResendSeconds] = useState(0)
  const [step, setStep] = useState<"phone" | "otp" | "verified">("phone")
  const [helpIsOpen, setHelpIsOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [otpMessage, setOtpMessage] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [otpError, setOtpError] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const otpCaptureController = useRef<AbortController | null>(null)
  const phoneForApi = `0${phoneNumber}`
  const maskedPhone = phoneNumber ? `+880 ${phoneNumber.slice(0, 2)}••••••${phoneNumber.slice(-2)}` : ""

  useEffect(() => {
    if (secondsLeft === 0) return
    const timer = window.setTimeout(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  useEffect(() => {
    if (resendSeconds === 0) return
    const timer = window.setTimeout(() => setResendSeconds((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [resendSeconds])

  useEffect(() => () => otpCaptureController.current?.abort(), [])

  const cancelOtpCapture = () => {
    otpCaptureController.current?.abort()
    otpCaptureController.current = null
  }

  const startOtpCapture = () => {
    cancelOtpCapture()
    if (!window.isSecureContext || !("OTPCredential" in window) || !navigator.credentials) return

    const controller = new AbortController()
    otpCaptureController.current = controller
    const options = {
      otp: { transport: ["sms"] },
      signal: controller.signal,
    } as CredentialRequestOptions

    void navigator.credentials
      .get(options)
      .then((credential) => {
        if (credential && "code" in credential && typeof credential.code === "string") {
          setOtp(credential.code.replace(/\D/g, "").slice(0, 6))
        }
      })
      .catch(() => undefined)
  }

  const goBack = () => {
    cancelOtpCapture()
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "")
    const nationalNumber = digits.startsWith("880") ? digits.slice(3) : digits.startsWith("0") ? digits.slice(1) : digits
    setPhoneNumber(nationalNumber.slice(0, 10))
    setPhoneError("")
  }

  const requestOtp = async () => {
    startOtpCapture()
    const response = await fetch("/api/payment-gateway/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneForApi }),
    })
    const result = await response.json()

    if (!response.ok || !result.success) {
      cancelOtpCapture()
      throw new Error(result.message || "We couldn't send your code. Please try again.")
    }

    setOtpMessage(result.message)
    setOtp("")
    setOtpError("")
    setResendSeconds(OTP_RESEND_SECONDS)
    setStep("otp")
  }

  const handleContinue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!/^1[3-9]\d{8}$/.test(phoneNumber)) {
      setPhoneError("Enter a valid 10-digit Bangladesh mobile number.")
      return
    }
    if (secondsLeft === 0) return

    setIsSending(true)
    setPhoneError("")
    try {
      await requestOtp()
    } catch (error) {
      setPhoneError(error instanceof Error ? error.message : "We couldn't send your code. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleResend = async () => {
    if (resendSeconds > 0 || isSending || secondsLeft === 0) return
    setIsSending(true)
    setOtpError("")
    try {
      await requestOtp()
    } catch (error) {
      cancelOtpCapture()
      setOtpError(error instanceof Error ? error.message : "We couldn't resend your code. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Enter the 6-digit code from your SMS.")
      return
    }
    if (secondsLeft === 0) return

    setIsVerifying(true)
    setOtpError("")
    try {
      const response = await fetch("/api/payment-gateway/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneForApi, otp }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        setOtpError(result.message || "The code is invalid or expired. Request a new one and try again.")
        return
      }
      cancelOtpCapture()
      setStep("verified")
    } catch {
      setOtpError("We couldn't verify the code. Check your connection and try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  const changePhoneNumber = () => {
    cancelOtpCapture()
    setOtp("")
    setOtpError("")
    setStep("phone")
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  return (
    <main className="fixed inset-0 z-50 min-h-[100svh] overflow-y-auto bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] text-[#171717]">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[480px] flex-col">
        <header className="flex justify-center pt-[8vh] sm:pt-[10vh] [@media(max-height:700px)]:!pt-4">
          <Image
            src="/images/sheba-headline-logo.jpeg"
            alt="Sheba"
            width={1080}
            height={607}
            priority
            className="h-auto w-[min(76vw,320px)] object-contain [@media(max-height:700px)]:w-[min(66vw,260px)]"
          />
        </header>

        <div className="flex flex-1 flex-col justify-center py-8 [@media(max-height:700px)]:!py-2">
          {step === "phone" && (
            <section aria-labelledby="gateway-phone-title">
              <div className="mb-8 [@media(max-height:700px)]:mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#299fd8]">Secure checkout</p>
                <h1 id="gateway-phone-title" className="mt-2 text-2xl font-semibold tracking-tight text-[#161c24]">
                  Verify your phone
                </h1>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#68717c]">
                  Enter the number linked to your Sheba account. We&apos;ll send a one-time code by SMS.
                </p>
              </div>

              <form onSubmit={handleContinue} className="space-y-5 [@media(max-height:700px)]:space-y-3">
                <div className="space-y-2">
                  <label htmlFor="payer-phone" className="text-sm font-medium text-[#303a45]">Mobile number</label>
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 shrink-0 items-center gap-2.5 rounded-xl border border-[#dce3e9] bg-[#f8fbfd] px-3">
                      <span className="relative block h-6 w-9 overflow-hidden rounded-[3px] bg-[#006a4e]" aria-hidden="true">
                        <span className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f42a41]" />
                      </span>
                      <span className="flex flex-col text-left leading-tight">
                        <span className="text-xs font-medium text-[#242a31]">Bangladesh</span>
                        <span className="mt-0.5 text-xs text-[#707b86]">+880</span>
                      </span>
                    </div>
                    <div className={`flex min-h-14 min-w-0 flex-1 items-center rounded-xl border bg-white px-4 transition-colors ${phoneError ? "border-red-500" : "border-[#dce3e9] focus-within:border-[#38afe8] focus-within:ring-4 focus-within:ring-[#38afe8]/10"}`}>
                      <input
                        id="payer-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        maxLength={14}
                        value={phoneNumber}
                        disabled={isSending}
                        onChange={(event) => handlePhoneChange(event.target.value)}
                        onKeyDown={preventComposingSubmit}
                        placeholder="17XXXXXXXX"
                        aria-invalid={Boolean(phoneError)}
                        aria-describedby={phoneError ? "payer-phone-error" : "payer-phone-hint"}
                        className="min-w-0 flex-1 bg-transparent py-3 text-base text-[#171717] outline-none placeholder:text-[#a0a8b0]"
                      />
                    </div>
                  </div>
                  <p id={phoneError ? "payer-phone-error" : "payer-phone-hint"} className={`text-sm leading-5 ${phoneError ? "text-red-600" : "text-[#68717c]"}`} role={phoneError ? "alert" : undefined}>
                    {phoneError || "Enter the 10 digits after +880."}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSending || secondsLeft === 0}
                    className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-xl bg-[#38afe8] px-6 py-4 text-base font-semibold text-white shadow-[0_3px_0_0_#2b9dd5] transition-colors hover:bg-[#259edc] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#38afe8]/25 disabled:cursor-not-allowed disabled:bg-[#a8d8ef] disabled:shadow-none"
                  >
                    {isSending && <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />}
                    {isSending ? "Sending SMS" : "Continue"}
                  </button>
                  <button
                    type="button"
                    onClick={goBack}
                    className="min-h-[54px] w-full rounded-xl bg-[#858585] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#737373] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#858585]/25"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          {step === "otp" && (
            <section aria-labelledby="gateway-otp-title">
              <button
                type="button"
                onClick={changePhoneNumber}
                disabled={isSending}
                className="mb-6 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#278fc2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38afe8] disabled:cursor-not-allowed disabled:opacity-60 [@media(max-height:700px)]:mb-3"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Change number
              </button>
              <div className="mb-7 [@media(max-height:700px)]:mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#299fd8]">SMS verification</p>
                <h1 id="gateway-otp-title" className="mt-2 text-2xl font-semibold tracking-tight text-[#161c24]">
                  Enter verification code
                </h1>
                <p className="mt-2 text-sm leading-6 text-[#68717c]" role="status">
                  {otpMessage || "If this number is linked to a Sheba account, an OTP will arrive shortly."}
                </p>
                <p className="mt-3 text-sm font-medium text-[#303a45]">Sent to {maskedPhone}</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-5 [@media(max-height:700px)]:space-y-3">
                <div className="space-y-2">
                  <label htmlFor="gateway-otp" className="text-sm font-medium text-[#303a45]">6-digit code</label>
                  <input
                    id="gateway-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={otp}
                    disabled={isVerifying || isSending}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={preventComposingSubmit}
                    aria-invalid={Boolean(otpError)}
                    aria-describedby={otpError ? "gateway-otp-error" : "gateway-otp-hint"}
                    className={`h-16 w-full rounded-xl border bg-white px-4 text-center text-2xl font-semibold tracking-[0.55em] text-[#171717] outline-none transition-colors placeholder:text-[#c5ccd2] focus:border-[#38afe8] focus:ring-4 focus:ring-[#38afe8]/10 [@media(max-height:700px)]:h-14 ${otpError ? "border-red-500" : "border-[#dce3e9]"}`}
                    placeholder="••••••"
                  />
                  <p id={otpError ? "gateway-otp-error" : "gateway-otp-hint"} className={`text-sm leading-5 ${otpError ? "text-red-600" : "text-[#68717c]"}`} role={otpError ? "alert" : undefined}>
                    {otpError || "On supported browsers, the SMS code can fill in automatically."}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={isVerifying || otp.length !== 6 || secondsLeft === 0}
                    className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-xl bg-[#38afe8] px-6 py-4 text-base font-semibold text-white shadow-[0_3px_0_0_#2b9dd5] transition-colors hover:bg-[#259edc] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#38afe8]/25 disabled:cursor-not-allowed disabled:bg-[#a8d8ef] disabled:shadow-none"
                  >
                    {isVerifying && <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />}
                    {isVerifying ? "Verifying code" : "Verify code"}
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendSeconds > 0 || isSending || secondsLeft === 0}
                    className="min-h-11 w-full text-sm font-medium text-[#278fc2] transition-colors hover:text-[#16739f] disabled:cursor-not-allowed disabled:text-[#9aa5ae]"
                  >
                    {isSending ? "Sending new code" : resendSeconds > 0 ? `Resend SMS in ${resendSeconds}s` : "Resend SMS"}
                  </button>
                  <button
                    type="button"
                    onClick={goBack}
                    className="min-h-11 w-full text-sm font-medium text-[#68717c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38afe8]"
                  >
                    Cancel payment
                  </button>
                </div>
              </form>
            </section>
          )}

          {step === "verified" && (
            <section className="flex flex-col items-center text-center" aria-labelledby="gateway-verified-title" role="status">
              <CheckCircle2 className="h-14 w-14 text-[#20b79f]" aria-hidden="true" />
              <h1 id="gateway-verified-title" className="mt-5 text-2xl font-semibold tracking-tight text-[#161c24]">Phone verified</h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#68717c]">
                Your number has been verified. This gateway preview does not process a payment.
              </p>
              <button
                type="button"
                onClick={goBack}
                className="mt-8 min-h-[58px] w-full rounded-xl bg-[#38afe8] px-6 py-4 text-base font-semibold text-white shadow-[0_3px_0_0_#2b9dd5] transition-colors hover:bg-[#259edc] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#38afe8]/25"
              >
                Return to payment
              </button>
            </section>
          )}
        </div>

        <footer className="pb-[3vh] [@media(max-height:700px)]:pb-2">
          <p className="text-sm leading-6 text-[#414950]" aria-live="polite">
            {secondsLeft > 0
              ? `The page will automatically time out after ${minutes} minutes ${String(seconds).padStart(2, "0")} seconds.`
              : "This payment session has timed out."}
          </p>
          <div className="mt-3 border-t border-[#e7e7e7] pt-3">
            <button
              type="button"
              aria-expanded={helpIsOpen}
              aria-controls="gateway-help"
              onClick={() => setHelpIsOpen((open) => !open)}
              className="flex min-h-11 w-full items-center justify-between gap-4 text-left text-sm font-medium text-[#303a45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38afe8]"
            >
              <span>Need some help?</span>
              {helpIsOpen ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}
            </button>
            {helpIsOpen && (
              <p id="gateway-help" className="pb-2 pt-1 text-sm leading-6 text-[#68717c]">
                Use the phone number linked to your Sheba account. Your verification code expires after five minutes; you can request another code when the resend timer ends.
              </p>
            )}
          </div>
        </footer>
      </div>
    </main>
  )
}
