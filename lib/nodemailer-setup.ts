// Method 3: Nodemailer with Gmail (Server-side only)

/*
STEP 1: Gmail App Password Setup
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Go to App Passwords
4. Generate password for "Mail"
5. Copy the 16-character password

STEP 2: Environment Variables
Add to .env.local:
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

STEP 3: Install Nodemailer
npm install nodemailer
npm install @types/nodemailer
*/

// This runs on server-side only (API routes)
import nodemailer from "nodemailer"

export async function sendRealGmailOTP(email: string, otp: string, name: string) {
  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASSWORD, // App Password
      },
    })

    // Email options
    const mailOptions = {
      from: `"Sheba Airlines" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🛫 Flight Booking OTP - Sheba Airlines",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0ea5e9;">✈️ Sheba Airlines</h1>
            <p style="color: #666;">Flight Booking Verification</p>
          </div>
          
          <h2 style="color: #333;">Dear ${name},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Your flight booking verification code is:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #0ea5e9; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 10px; letter-spacing: 5px;">
              ${otp}
            </div>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              ⏰ This code will expire in 10 minutes.<br>
              🛡️ Please do not share this code with anyone.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for choosing Sheba Airlines!
          </p>
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px;">
              Best regards,<br>
              Sheba Airlines Team
            </p>
          </div>
        </div>
      `,
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log(`✅ Real Gmail sent to ${email}:`, info.messageId)
    return { success: true, service: "Gmail" }
  } catch (error) {
    console.error("Gmail error:", error)
    return { success: false, error: error.message }
  }
}
