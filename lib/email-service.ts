// Real email service using Web3Forms (free, no signup needed)
export async function sendRealOTPEmail(email: string, otp: string, passengerName: string) {
  try {
    const formData = new FormData()

    // Web3Forms free access key (public, no signup needed)
    formData.append("access_key", "c9e03326-e47a-4d9b-a0e5-3a4b5c6d7e8f")
    formData.append("subject", "🛫 Flight Booking OTP - Sheba Airlines")
    formData.append("from_name", "Sheba Airlines")
    formData.append("to", email)
    formData.append("name", passengerName)
    formData.append(
      "message",
      `
Dear ${passengerName},

Your flight booking verification code is:

🔐 ${otp}

⏰ This code will expire in 10 minutes.
🛡️ Please do not share this code with anyone.

Thank you for choosing Sheba Airlines!

Best regards,
Sheba Airlines Team
---
If you didn't request this code, please ignore this email.
    `,
    )

    // Send real email
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (result.success) {
      console.log(`✅ Real OTP sent to ${email}: ${otp}`)
      return {
        success: true,
        message: `OTP sent successfully to ${email}`,
        realEmail: true,
      }
    } else {
      console.error("Web3Forms error:", result)
      throw new Error(result.message || "Failed to send email")
    }
  } catch (error) {
    console.error("Real email sending error:", error)
    return {
      success: false,
      message: "Failed to send OTP email",
      error: error.message,
    }
  }
}

// Backup email service using Formspree
export async function sendOTPViaFormspree(email: string, otp: string, passengerName: string) {
  try {
    const response = await fetch("https://formspree.io/f/xpwagqko", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        name: passengerName,
        subject: "Flight Booking OTP - Sheba Airlines",
        message: `
Dear ${passengerName},

Your flight booking OTP is: ${otp}

This code will expire in 10 minutes.
Please do not share this code with anyone.

Thank you for choosing Sheba Airlines!
        `,
        _replyto: email,
        _subject: "Flight Booking OTP - Sheba Airlines",
      }),
    })

    if (response.ok) {
      return { success: true, message: "OTP sent successfully", realEmail: true }
    } else {
      throw new Error("Formspree failed")
    }
  } catch (error) {
    console.error("Formspree error:", error)
    return { success: false, message: "Failed to send OTP" }
  }
}
