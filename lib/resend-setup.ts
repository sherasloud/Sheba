// Method 2: Resend API (Professional)

/*
STEP 1: Resend Account Setup
1. Go to https://resend.com/
2. Sign up for free account
3. Verify your email
4. Get API key from dashboard

STEP 2: Domain Setup (Optional)
1. Add your domain (optional for testing)
2. Verify DNS records
3. Or use resend.dev domain for testing

STEP 3: Get API Key
- Go to API Keys section
- Create new key
- Copy the key (starts with re_)
*/

export async function sendRealResendOTP(email: string, otp: string, name: string) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`, // Your API key
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Sheba Airlines <noreply@yourdomain.com>", // Your domain
        to: [email],
        subject: "🛫 Flight Booking OTP - Sheba Airlines",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0ea5e9;">🛫 Sheba Airlines</h2>
            <p>Dear ${name},</p>
            <p>Your flight booking verification code is:</p>
            <div style="background: #f0f9ff; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #0ea5e9; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p>⏰ This code will expire in 10 minutes.</p>
            <p>🛡️ Please do not share this code with anyone.</p>
            <p>Thank you for choosing Sheba Airlines!</p>
          </div>
        `,
      }),
    })

    if (response.ok) {
      console.log(`✅ Real email sent via Resend to ${email}`)
      return { success: true, service: "Resend" }
    }
    throw new Error("Resend failed")
  } catch (error) {
    console.error("Resend error:", error)
    return { success: false, error: error.message }
  }
}
