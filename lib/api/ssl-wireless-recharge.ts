// Enhanced SSL Wireless API Integration
interface SSLRechargeRequest {
  operator: string
  phoneNumber: string
  amount: number
  merchantTxnId: string
}

interface SSLRechargeResponse {
  status: string
  message: string
  transactionId: string
  operatorTxnId?: string
  balance?: number
}

export class SSLWirelessRecharge {
  private baseURL = process.env.SSL_WIRELESS_API_URL || "https://api.sslwireless.com"
  private apiKey = process.env.SSL_WIRELESS_API_KEY || "demo_api_key"
  private storeId = process.env.SSL_WIRELESS_STORE_ID || "demo_store"
  private storePassword = process.env.SSL_WIRELESS_STORE_PASSWORD || "demo_password"
  private isDemoMode = process.env.NODE_ENV === "development" && process.env.FORCE_REAL_RECHARGE !== "true"

  async processRecharge(data: SSLRechargeRequest): Promise<SSLRechargeResponse> {
    console.log("🔌 SSL Wireless Recharge Request:", {
      operator: data.operator,
      amount: data.amount,
      merchantTxnId: data.merchantTxnId,
    })

    // Demo mode for development
    if (this.isDemoMode) {
      return this.processDemoRecharge(data)
    }

    const payload = {
      store_id: this.storeId,
      store_passwd: this.storePassword,
      operator: this.mapOperator(data.operator),
      msisdn: data.phoneNumber,
      amount: data.amount.toString(),
      ref_id: data.merchantTxnId,
      product_category: "mobile_recharge",
      product_name: `${data.operator} Recharge`,
      product_profile: "general",
    }

    try {
      const response = await fetch(`${this.baseURL}/gwprocess/v1/api.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "ShebaApp/1.0",
        },
        body: new URLSearchParams(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("📡 SSL Wireless Response:", result)

      return {
        status: result.status || "FAILED",
        message: result.message || result.reason || "Unknown error",
        transactionId: result.tran_id || data.merchantTxnId,
        operatorTxnId: result.operator_tran_id,
        balance: result.balance ? Number(result.balance) : undefined,
      }
    } catch (error) {
      console.error("💥 SSL Wireless API Error:", error)
      throw new Error(`SSL Wireless recharge failed: ${error}`)
    }
  }

  private async processDemoRecharge(data: SSLRechargeRequest): Promise<SSLRechargeResponse> {
    console.log("🧪 Demo Mode: Simulating SSL Wireless recharge...")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return {
      status: "SUCCESS",
      message: `Tk ${data.amount} recharge successful to ${data.phoneNumber} (Demo Mode)`,
      transactionId: `SSL-DEMO-${Date.now()}`,
      operatorTxnId: `OP-${Math.floor(Math.random() * 1000000)}`,
      balance: 99979997979999 - data.amount, // Massive balance remains functional
    }
  }

  private mapOperator(operator: string): string {
    const operatorMap: { [key: string]: string } = {
      Grameenphone: "GP",
      Robi: "ROBI",
      Banglalink: "BL",
      Airtel: "AIRTEL",
      Teletalk: "TT",
      Skitto: "SKITTO",
    }
    return operatorMap[operator] || operator.toUpperCase()
  }

  async checkStatus(transactionId: string): Promise<SSLRechargeResponse> {
    if (this.isDemoMode) {
      return {
        status: "SUCCESS",
        message: "Transaction completed successfully",
        transactionId,
      }
    }

    const payload = {
      store_id: this.storeId,
      store_passwd: this.storePassword,
      tran_id: transactionId,
    }

    try {
      const response = await fetch(`${this.baseURL}/validator/api/validationserverAPI.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(payload),
      })

      return await response.json()
    } catch (error) {
      throw new Error(`Status check failed: ${error}`)
    }
  }

  async checkBalance(): Promise<number> {
    if (this.isDemoMode) {
      return 99979997979999
    }

    try {
      const payload = {
        store_id: this.storeId,
        store_passwd: this.storePassword,
      }

      const response = await fetch(`${this.baseURL}/balance/api/balance.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(payload),
      })

      const result = await response.json()
      return Number(result.balance) || 0
    } catch (error) {
      console.error("Balance check failed:", error)
      return 0
    }
  }
}
