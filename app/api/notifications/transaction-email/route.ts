import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim() : ""
  const title = typeof body?.title === "string" ? body.title.trim() : "Transaction notification"
  const amount = typeof body?.amount === "string" ? body.amount.trim() : ""
  const details = typeof body?.details === "string" ? body.details.trim() : ""

  if (!email || !email.includes("@") || !title || !amount) {
    return NextResponse.json({ success: false, message: "Invalid notification details" }, { status: 400 })
  }

  const from = process.env.RESEND_EMAIL_DOMAIN
    ? `Sheba <notifications@${process.env.RESEND_EMAIL_DOMAIN}>`
    : "Sheba <onboarding@resend.dev>"

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `Sheba: ${title}`,
      html: `<div style="font-family:Arial,sans-serif"><h2>${title}</h2><p style="font-size:24px;color:#29a9eb"><strong>${amount}</strong></p>${details ? `<p>${details}</p>` : ""}<p>Thank you for using Sheba.</p></div>`,
      headers: { "X-Entity-Ref-ID": `transaction-${Date.now()}` },
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("[v0] Resend transaction email failed", error)
    return NextResponse.json({ success: false, message: "Email could not be sent" }, { status: 502 })
  }

  return NextResponse.json({ success: true })
}
