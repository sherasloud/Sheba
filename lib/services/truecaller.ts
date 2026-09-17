import crypto from 'crypto'

interface TruecallerOTPRequest {
  phone: string
  countryCode?: string
}

interface TruecallerOTPResponse {
  success: boolean
  requestId?: string
  message: string
  error?: string
}

interface TruecallerVerifyRequest {
  phone: string
  token: string
  requestId: string
}

interface TruecallerVerifyResponse {
  success: boolean
  verified: boolean
  message: string
  error?: string
}

// Generate signature for Truecaller API
export function generateTruecallerSignature(data: any): string {
  const apiKey = process.env.TRUECALLER_SECRET_KEY || ''
  const message = JSON.stringify(data)
  return crypto
    .createHmac('sha256', apiKey)
    .update(message)
    .digest('hex')
}

// Request OTP from Truecaller
export async function requestTruecallerOTP(
  phone: string,
  countryCode: string = 'BD'
): Promise<TruecallerOTPResponse> {
  try {
    const appKey = process.env.TRUECALLER_APP_KEY
    const apiUrl = process.env.TRUECALLER_API_URL || 'https://verification-sdk-console.truecaller.com/api/v1/otp'

    if (!appKey) {
      return {
        success: false,
        message: 'Truecaller app key not configured',
        error: 'MISSING_CONFIG',
      }
    }

    // Format phone number (ensure it starts with +)
    const formattedPhone = phone.startsWith('+') ? phone : `+880${phone.slice(-10)}`

    const payload = {
      phoneNumber: formattedPhone,
      countryCode,
      language: 'Bengali',
    }

    const signature = generateTruecallerSignature(payload)

    const response = await fetch(`${apiUrl}/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': appKey,
        'X-Signature': signature,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[v0] Truecaller API error:', error)
      return {
        success: false,
        message: 'Failed to send OTP via Truecaller',
        error: error.error || response.statusText,
      }
    }

    const data = await response.json()
    console.log('[v0] Truecaller OTP request successful:', data.requestId)

    return {
      success: true,
      requestId: data.requestId,
      message: 'OTP sent successfully via Truecaller',
    }
  } catch (error: any) {
    console.error('[v0] Truecaller OTP request error:', error.message)
    return {
      success: false,
      message: 'Error requesting OTP from Truecaller',
      error: error.message,
    }
  }
}

// Verify OTP from Truecaller
export async function verifyTruecallerOTP(
  phone: string,
  token: string,
  requestId: string
): Promise<TruecallerVerifyResponse> {
  try {
    const appKey = process.env.TRUECALLER_APP_KEY
    const apiUrl = process.env.TRUECALLER_API_URL || 'https://verification-sdk-console.truecaller.com/api/v1/otp'

    if (!appKey) {
      return {
        success: false,
        verified: false,
        message: 'Truecaller app key not configured',
        error: 'MISSING_CONFIG',
      }
    }

    // Format phone number
    const formattedPhone = phone.startsWith('+') ? phone : `+880${phone.slice(-10)}`

    const payload = {
      phoneNumber: formattedPhone,
      requestId,
      token,
    }

    const signature = generateTruecallerSignature(payload)

    const response = await fetch(`${apiUrl}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': appKey,
        'X-Signature': signature,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[v0] Truecaller verification error:', error)
      return {
        success: false,
        verified: false,
        message: 'OTP verification failed',
        error: error.error || response.statusText,
      }
    }

    const data = await response.json()
    console.log('[v0] Truecaller OTP verified successfully')

    return {
      success: true,
      verified: data.verified === true,
      message: 'OTP verified successfully',
    }
  } catch (error: any) {
    console.error('[v0] Truecaller verification error:', error.message)
    return {
      success: false,
      verified: false,
      message: 'Error verifying OTP with Truecaller',
      error: error.message,
    }
  }
}
