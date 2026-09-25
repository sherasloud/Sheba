/**
 * WhatsApp sender that talks to the standalone Baileys worker service.
 *
 * The worker is an always-on Node process (Railway/Render/VPS) that holds the
 * live WhatsApp connection. Vercel serverless functions cannot keep that
 * connection open, so we simply POST to the worker over HTTP.
 *
 * Required env vars (set these AFTER deploying the worker):
 *   WHATSAPP_WORKER_URL     e.g. https://sheba-whatsapp.up.railway.app
 *   WHATSAPP_WORKER_SECRET  shared secret, must match the worker's env
 */

export interface WhatsAppResult {
  success: boolean
  message: string
}

/**
 * Convert a local BD number (01XXXXXXXXX) to WhatsApp E.164 digits (8801XXXXXXXXX).
 */
function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("880")) return digits
  if (digits.startsWith("0")) return "88" + digits
  return digits
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<WhatsAppResult> {
  const workerUrl = process.env.WHATSAPP_WORKER_URL
  const secret = process.env.WHATSAPP_WORKER_SECRET

  if (!workerUrl || !secret) {
    console.error("[v0] WhatsApp worker not configured (WHATSAPP_WORKER_URL / WHATSAPP_WORKER_SECRET missing)")
    return { success: false, message: "WhatsApp service is not configured yet" }
  }

  const to = toWhatsAppNumber(phone)

  try {
    const res = await fetch(`${workerUrl.replace(/\/$/, "")}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-worker-secret": secret,
      },
      body: JSON.stringify({ to, message }),
    })

    const data = (await res.json().catch(() => ({}))) as { error?: string }

    if (!res.ok) {
      console.error("[v0] WhatsApp worker error:", res.status, data?.error)
      return { success: false, message: data?.error || `Worker error ${res.status}` }
    }

    return { success: true, message: "Message sent" }
  } catch (error: any) {
    console.error("[v0] WhatsApp send failed:", error?.message)
    return { success: false, message: error?.message || "Failed to reach WhatsApp worker" }
  }
}

export async function sendWhatsAppOTP(phone: string, otp: string): Promise<WhatsAppResult> {
  const message = `আপনার সেবা কোডটি হলো : ${otp}\n\nএই কোডটি ৫ মিনিটের জন্য বৈধ। কোডটি কারও সাথে শেয়ার করবেন না।`
  return sendWhatsAppMessage(phone, message)
}
