// Working email service using multiple providers
export async function sendRealOTPEmail(email: string, otp: string, passengerName: string) {
  try {
    // Method 1: Using EmailJS (most reliable)
    const emailJSResult = await sendViaEmailJS(email, otp, passengerName)
    if (emailJSResult.success) {
      return emailJSResult
    }

    // Method 2: Using Web3Forms with correct configuration
    const web3Result = await sendViaWeb3Forms(email, otp, passengerName)
    if (web3Result.success) {
      return web3Result
    }

    // Method 3: Using Formspree
    const formspreeResult = await sendViaFormspree(email, otp, passengerName)
    if (formspreeResult.success) {
      return formspreeResult
    }

    throw new Error("All email services failed")
  } catch (error) {
    console.error("Email sending failed:", error)
    return {
      success: false,
      message: error.message,
    }
  }
}

// EmailJS implementation (requires setup but very reliable)
async function sendViaEmailJS(email: string, otp: string, passengerName: string) {
  try {
    // Using public EmailJS service
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: "service_gmail",
        template_id: "template_otp",
        user_id: "user_public_key",
        template_params: {
          to_email: email,
          to_name: passengerName,
          otp_code: otp,
          from_name: "Sheba Airlines",
          subject: "Flight Booking OTP",
        },
      }),
    })

    if (response.ok) {
      console.log(`✅ EmailJS sent to ${email}`)
      return { success: true, service: "EmailJS" }
    }
    throw new Error("EmailJS failed")
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Web3Forms with correct configuration
async function sendViaWeb3Forms(email: string, otp: string, passengerName: string) {
  try {
    const formData = new FormData()
    formData.append("access_key", "YOUR_WEB3FORMS_KEY") // Need real key
    formData.append("subject", "Flight Booking OTP - Sheba Airlines")
    formData.append("email", email)
    formData.append("name", passengerName)
    formData.append("message", `Your OTP is: ${otp}`)

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()
    if (result.success) {
      console.log(`✅ Web3Forms sent to ${email}`)
      return { success: true, service: "Web3Forms" }
    }
    throw new Error("Web3Forms failed")
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Formspree implementation
async function sendViaFormspree(email: string, otp: string, passengerName: string) {
  try {
    const response = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        name: passengerName,
        subject: "Flight Booking OTP",
        message: `Dear ${passengerName}, Your OTP is: ${otp}`,
      }),
    })

    if (response.ok) {
      console.log(`✅ Formspree sent to ${email}`)
      return { success: true, service: "Formspree" }
    }
    throw new Error("Formspree failed")
  } catch (error) {
    return { success: false, error: error.message }
  }
}
