/**
 * Sheba WhatsApp worker.
 *
 * An always-on Node service that keeps a live WhatsApp connection using Baileys
 * and exposes a tiny HTTP API for the Next.js app to send messages through.
 *
 * Deploy this on Railway / Render / a VPS (NOT Vercel — serverless cannot hold
 * the socket open). On first boot, open the logs and scan the QR code with the
 * WhatsApp account you want to send from (Settings > Linked Devices).
 *
 * Endpoints:
 *   GET  /health  -> { ready, hasQR }
 *   GET  /qr      -> current QR as a PNG (only while waiting to be linked)
 *   POST /send    -> { to, message }  (requires header x-worker-secret)
 */

const express = require("express")
const qrcodeTerminal = require("qrcode-terminal")
const QRCode = require("qrcode")
const pino = require("pino")
const { Boom } = require("@hapi/boom")
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("baileys")

const PORT = process.env.PORT || 3001
const SECRET = process.env.WHATSAPP_WORKER_SECRET
const AUTH_DIR = process.env.AUTH_DIR || "auth_info"

if (!SECRET) {
  console.error("[worker] WHATSAPP_WORKER_SECRET is not set. Refusing to start.")
  process.exit(1)
}

const logger = pino({ level: "warn" })

let sock = null
let isReady = false
let lastQR = null

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    version,
    auth: state,
    logger,
    browser: ["Sheba", "Chrome", "1.0.0"],
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      lastQR = qr
      console.log("\n[worker] Scan this QR with WhatsApp (Linked Devices):\n")
      qrcodeTerminal.generate(qr, { small: true })
      console.log("\n[worker] ...or open GET /qr in a browser to scan a bigger image.\n")
    }

    if (connection === "open") {
      isReady = true
      lastQR = null
      console.log("[worker] WhatsApp connection is OPEN and ready to send.")
    }

    if (connection === "close") {
      isReady = false
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode
      const loggedOut = statusCode === DisconnectReason.loggedOut
      console.log(`[worker] Connection closed (status ${statusCode}). loggedOut=${loggedOut}`)
      if (!loggedOut) {
        setTimeout(connectToWhatsApp, 3000)
      } else {
        console.log(`[worker] Logged out. Delete the "${AUTH_DIR}" folder and restart to re-link.`)
      }
    }
  })
}

connectToWhatsApp().catch((err) => {
  console.error("[worker] Failed to start WhatsApp connection:", err)
})

const app = express()
app.use(express.json())

app.get("/health", (_req, res) => {
  res.json({ ready: isReady, hasQR: !!lastQR })
})

// Serve the pending QR as an image so it can be scanned without reading logs.
app.get("/qr", async (_req, res) => {
  if (!lastQR) {
    res.status(404).send(isReady ? "Already linked." : "No QR available yet. Try again shortly.")
    return
  }
  try {
    const png = await QRCode.toBuffer(lastQR, { width: 320 })
    res.setHeader("Content-Type", "image/png")
    res.send(png)
  } catch (err) {
    res.status(500).send("Failed to render QR")
  }
})

app.post("/send", async (req, res) => {
  if (req.headers["x-worker-secret"] !== SECRET) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  if (!isReady || !sock) {
    return res.status(503).json({ error: "WhatsApp not connected yet" })
  }

  const { to, message } = req.body || {}
  if (!to || !message) {
    return res.status(400).json({ error: "'to' and 'message' are required" })
  }

  const digits = String(to).replace(/\D/g, "")
  const jid = `${digits}@s.whatsapp.net`

  try {
    // Verify the number actually has WhatsApp before sending
    const [result] = await sock.onWhatsApp(jid)
    if (!result?.exists) {
      return res.status(422).json({ error: "This number is not on WhatsApp" })
    }

    await sock.sendMessage(result.jid || jid, { text: String(message) })
    console.log(`[worker] Sent message to ${digits}`)
    res.json({ success: true })
  } catch (err) {
    console.error("[worker] Send error:", err?.message)
    res.status(500).json({ error: err?.message || "Failed to send message" })
  }
})

app.listen(PORT, () => {
  console.log(`[worker] HTTP server listening on port ${PORT}`)
})
