export class ShebaSMSService {
  async sendTransactionSMS(phoneNumber: string, type: string, amount: number, balance: number, details?: { fee?: number; transactionId?: string; label?: string }) {
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
    const message = `${details?.label || labels[type] || "Transaction Successful"}!\nAmount: ${amount} Tk\nFee: ${details?.fee ?? 0} Tk\nBalance: ${balance} Tk\nTransaction ID: ${details?.transactionId || "N/A"}\n${timestamp}`
    const digits = String(phoneNumber).replace(/\D/g, "")
    const recipient = digits.startsWith("0") ? `88${digits.slice(1)}` : digits

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
    const message = `Your Sheba verification code is: ${otp}. Do not share this code with anyone. Valid for 5 minutes.`

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          sender_id: this.senderId,
          message: message,
          recipient: phoneNumber,
        }),
      })

      return await response.json()
    } catch (error) {
      console.error("[v0] OTP SMS failed:", error)
      return { success: false, error }
    }
  }
}

export const shebaSMS = new ShebaSMSService()
