// EmailJS Real Setup Guide

/*
STEP 1: EmailJS Account Setup
1. Go to https://www.emailjs.com/
2. Create free account
3. Add Email Service (Gmail/Outlook)
4. Create Email Template
5. Get your keys

STEP 2: Gmail Setup (if using Gmail)
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in EmailJS

STEP 3: Create Template in EmailJS
Template ID: template_flight_otp
Template Content:
---
Subject: Flight Booking OTP - {{from_name}}

Dear {{to_name}},

Your flight booking verification code is:

{{otp_code}}

This code will expire in 10 minutes.
Please do not share this code with anyone.

Thank you for choosing Sheba Airlines!
---

STEP 4: Get Your Keys
- Service ID: service_xxxxxxx
- Template ID: template_flight_otp  
- Public Key: user_xxxxxxxxxxxxx
*/

// Real EmailJS Implementation
export async function sendRealEmailJSOTP(email: string, otp: string, name: string) {
  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID, // Your service ID
        template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, // Your template ID
        user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_ID, // Your public key
        template_params: {
          to_email: email,
          to_name: name,
          from_name: "Sheba Airlines",
          otp_code: otp,
        },
      }),
    })

    if (response.ok) {
      console.log(`✅ Real email sent to ${email}`)
      return { success: true, service: "EmailJS" }
    }
    throw new Error("EmailJS failed")
  } catch (error) {
    console.error("EmailJS error:", error)
    return { success: false, error: error.message }
  }
}
