export class ShebaSMSService {
  private apiUrl = process.env.SMS_GATEWAY_URL || "https://api.sms.net.bd/sendsms"
  private apiKey = process.env.SMS_API_KEY || ""
  private senderId = "SHEBA" // Your brand name

  async sendTransactionSMS(phoneNumber: string, type: string, amount: number, balance: number) {
    const messages = {
      recharge: `Dear Customer, Your mobile recharge of Tk.${amount} is successful. Current Sheba balance: Tk.${balance}. Thank you for using Sheba.`,
      cashin: `Dear Customer, Cash In of Tk.${amount} successful. Your Sheba wallet balance: Tk.${balance}. Thank you for using Sheba.`,
      cashout: `Dear Customer, Cash Out of Tk.${amount} successful. Your Sheba wallet balance: Tk.${balance}. Thank you for using Sheba.`,
      transfer: `Dear Customer, Money transfer of Tk.${amount} successful. Your Sheba wallet balance: Tk.${balance}. Thank you for using Sheba.`,
      payment: `Dear Customer, Bill payment of Tk.${amount} successful. Your Sheba wallet balance: Tk.${balance}. Thank you for using Sheba.`,
    }

    const message =
      messages[type] || `Transaction of Tk.${amount} successful. Balance: Tk.${balance}. Thank you for using Sheba.`

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

      const result = await response.json()
      console.log("[v0] Sheba SMS sent:", result)
      return result
    } catch (error) {
      console.error("[v0] SMS sending failed:", error)
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
