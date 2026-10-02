export class ShebaSMSService {
  async sendTransactionSMS(phoneNumber: string, type: string, amount: number, balance: number, details?: { fee?: number; transactionId?: string; label?: string; userNumber?: string }) {
    const apiKey = process.env.AUTOMAS_API_KEY
    const senderId = process.env.AUTOMAS_SENDER_ID
    if (!apiKey || !senderId) return { success: false, error: "AutomAS credentials are not configured" }

    const labels: Record<string, string> = {
      transfer: "Send Money Successful",
      cashout: "Cash Out Successful",
      payment: "Payment Successful",
      cashin: "Add Money Successful",
      recharge: "Recharge Successful",
    }
    const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })
    const formatDisplayPhone = (value: string) => {
      const digits = String(value).replace(/\D/g, "")
      return digits.startsWith("88") ? `0${digits.slice(2)}` : digits
    }
    const userNumber = formatDisplayPhone(details?.userNumber || phoneNumber)
    const message = `${details?.label || labels[type] || "Transaction Successful"}!\nUser : ${userNumber}\nAmount : ${amount} ৳\nFee : ${details?.fee ?? 0} ৳\nBalance : ${balance} ৳\nTransaction ID : ${details?.transactionId || "N/A"}\n${timestamp}`
    const digits = String(phoneNumber).replace(/\D/g, "")
    // AutomAS v3 expects a local Bangladesh MSISDN, e.g. 01709783145.
    const recipient = digits.startsWith("88") ? `0${digits.slice(2)}` : digits

    try {
      const params = new URLSearchParams({
        apikey: apiKey,
        sender: senderId,
        msisdn: recipient,
        smstext: message,
      })
      const response = await fetch(`https://api.automas.com.bd/smsapiv3?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      })
      const raw = await response.text()
      const statusCode = Number(raw.trim())
      return { success: response.ok && statusCode === 0, message: raw.trim() }
    } catch (error) {
      console.error("[v0] Transaction SMS failed:", error)
      return { success: false, error }
    }
  }

  async sendOTP(phoneNumber: string, otp: string) {
    const apiKey = process.env.AUTOMAS_API_KEY
    const senderId = process.env.AUTOMAS_SENDER_ID
    if (!apiKey || !senderId) return { success: false, error: "AutomAS credentials are not configured" }

    const digits = String(phoneNumber).replace(/\D/g, "")
    const recipient = digits.startsWith("88") ? `0${digits.slice(2)}` : digits
    const params = new URLSearchParams({
      apikey: apiKey,
      sender: senderId,
      msisdn: recipient,
      smstext: `Sheba OTP: ${otp}. Valid for 5 minutes.`,
    })

    try {
      const response = await fetch(`https://api.automas.com.bd/smsapiv3?${params.toString()}`, { cache: "no-store" })
      const raw = await response.text()
      const statusCode = Number(raw.trim())
      return { success: response.ok && statusCode === 0, message: raw.trim() }
    } catch (error) {
      console.error("[v0] OTP SMS failed:", error)
      return { success: false, error }
    }
  }
}

export const shebaSMS = new ShebaSMSService()
