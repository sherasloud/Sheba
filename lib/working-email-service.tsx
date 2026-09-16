import nodemailer from "nodemailer"

// Create transporter for email service
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

// Send OTP email function
export async function sendWorkingOTPEmail(email: string, subject: string, userName: string) {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Sheba</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">Transaction Notification</h3>
              <p style="color: #666; line-height: 1.6;">
                Your transaction has been processed successfully. Thank you for using Sheba!
              </p>
              
              <div style="border-top: 2px solid #667eea; margin: 20px 0; padding-top: 20px;">
                <p style="color: #333; font-weight: bold;">Transaction Details:</p>
                <p style="color: #666;">Date: ${new Date().toLocaleDateString()}</p>
                <p style="color: #666;">Time: ${new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Best regards,<br>
              <strong>Sheba Team</strong>
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2025 Sheba. All rights reserved.
            </p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log("[v0] Email sent successfully to:", email)
    return { success: true }
  } catch (error) {
    console.error("[v0] Email sending failed:", error)
    return { success: false, error }
  }
}

// Send Add Money email function
export async function sendAddMoneyEmail(email: string, amount: number, method: string, userName: string) {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Add Money Success - Tk${amount.toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Sheba</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0;">💰 Add Money Successful!</h3>
              <p style="color: #666; line-height: 1.6;">
                Your Add Money transaction has been completed successfully!
              </p>
              
              <div style="border-top: 2px solid #28a745; margin: 20px 0; padding-top: 20px;">
                <h4 style="color: #333; margin-bottom: 15px;">💰 Transaction Details:</h4>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                  <p style="margin: 5px 0; color: #333;"><strong>Amount:</strong> Tk${amount.toLocaleString()}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Method:</strong> ${method}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
                </div>
              </div>
              
              <p style="color: #28a745; font-weight: bold; text-align: center; margin: 20px 0;">
                Your money has been added to your Sheba wallet successfully!
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Thank you for using Sheba!<br>
              <strong>Sheba Team</strong>
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2025 Sheba. All rights reserved.
            </p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log("[v0] Add Money email sent successfully to:", email)
    return { success: true }
  } catch (error) {
    console.error("[v0] Add Money email sending failed:", error)
    return { success: false, error }
  }
}
