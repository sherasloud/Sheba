import { SSLWirelessRecharge } from "./ssl-wireless-recharge"

export type RechargeProvider = "ssl-wireless" | "robi-api" | "gp-api" | "mock"

export interface RechargeRequest {
  operator: string
  phoneNumber: string
  amount: number
}

export interface RechargeResponse {
  success: boolean
  transactionId: string
  message: string
  status: string
  timestamp: string
  operatorReference?: string
}

export class EnhancedRechargeService {
  private provider: RechargeProvider
  private sslService: SSLWirelessRecharge

  constructor(provider: RechargeProvider = "ssl-wireless") {
    this.provider = provider
    this.sslService = new SSLWirelessRecharge()
  }

  async processRecharge(data: RechargeRequest): Promise<RechargeResponse> {
    switch (this.provider) {
      case "ssl-wireless":
        return this.processSSLRecharge(data)
      case "mock":
        return this.processMockRecharge(data)
      default:
        throw new Error(`Unsupported provider: ${this.provider}`)
    }
  }

  private async processSSLRecharge(data: RechargeRequest): Promise<RechargeResponse> {
    try {
      const result = await this.sslService.processRecharge({
        operator: data.operator,
        phoneNumber: data.phoneNumber,
        amount: data.amount,
        merchantTxnId: `SHEBA-${Date.now()}`,
      })

      return {
        success: result.status === "SUCCESS",
        transactionId: result.transactionId,
        message: result.message,
        status: result.status === "SUCCESS" ? "completed" : "failed",
        timestamp: new Date().toISOString(),
        operatorReference: result.operatorTxnId,
      }
    } catch (error) {
      throw new Error(`SSL Wireless recharge failed: ${error}`)
    }
  }

  private async processMockRecharge(data: RechargeRequest): Promise<RechargeResponse> {
    // Fallback mock implementation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return {
      success: true,
      transactionId: `MOCK-${Date.now()}`,
      message: "Recharge successful (MOCK)",
      status: "completed",
      timestamp: new Date().toISOString(),
    }
  }

  async checkStatus(transactionId: string): Promise<RechargeResponse> {
    switch (this.provider) {
      case "ssl-wireless":
        const status = await this.sslService.checkStatus(transactionId)
        return {
          success: status.status === "SUCCESS",
          transactionId,
          message: status.message,
          status: status.status === "SUCCESS" ? "completed" : "failed",
          timestamp: new Date().toISOString(),
        }
      default:
        return {
          success: true,
          transactionId,
          message: "Status check successful (MOCK)",
          status: "completed",
          timestamp: new Date().toISOString(),
        }
    }
  }
}
