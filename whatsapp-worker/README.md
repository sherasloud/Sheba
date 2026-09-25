# Sheba WhatsApp Worker

An always-on Node service that keeps a live WhatsApp connection (via [Baileys](https://github.com/WhiskeySockets/Baileys)) and lets the Sheba app send OTP and transactional messages over WhatsApp.

> **Why a separate service?** Baileys needs a long-lived WebSocket connection to WhatsApp. Vercel serverless functions shut down after a few seconds, so they can't hold that connection. This worker runs somewhere always-on (Railway / Render / a VPS), and the Vercel app just calls it over HTTP.

```
Sheba (Vercel)  --HTTP POST /send-->  This worker  --->  WhatsApp
```

## What it does

- Connects to WhatsApp and prints a QR code to link your account (one time).
- Persists the session in `AUTH_DIR` so it stays logged in across restarts.
- Exposes:
  - `GET /health` → `{ ready, hasQR }`
  - `GET /qr` → the pending QR as a PNG (only until linked)
  - `POST /send` → send a message. Requires header `x-worker-secret`.

## Local run

```bash
cd whatsapp-worker
cp .env.example .env         # then fill WHATSAPP_WORKER_SECRET
npm install
npm start
```

Watch the terminal, then in WhatsApp go to **Settings → Linked Devices → Link a device** and scan the QR. Once you see `connection is OPEN`, it's ready.

Test it:

```bash
curl -X POST http://localhost:3001/send \
  -H "Content-Type: application/json" \
  -H "x-worker-secret: YOUR_SECRET" \
  -d '{"to":"8801XXXXXXXXX","message":"Test from Sheba"}'
```

## Deploy on Railway

1. Push this repo to GitHub (the worker lives in `whatsapp-worker/`).
2. On [Railway](https://railway.app): **New Project → Deploy from GitHub repo**.
3. Set the service **Root Directory** to `whatsapp-worker`.
4. Add variables:
   - `WHATSAPP_WORKER_SECRET` — a strong random string (`openssl rand -hex 32`).
   - `AUTH_DIR` — e.g. `/data/auth_info`.
5. Add a **Volume** mounted at `/data` so the WhatsApp session survives redeploys (otherwise you'll re-scan the QR each deploy).
6. Deploy. Open the deploy **logs**, or visit `https://<your-app>.up.railway.app/qr`, and scan the QR.
7. Copy the public URL — that's your `WHATSAPP_WORKER_URL`.

## Deploy on Render

1. **New → Web Service**, connect the GitHub repo.
2. **Root Directory**: `whatsapp-worker`. **Build**: `npm install`. **Start**: `npm start`.
3. Add env vars `WHATSAPP_WORKER_SECRET` and `AUTH_DIR=/var/data/auth_info`.
4. Add a **Disk** mounted at `/var/data` for session persistence.
5. Deploy, open logs / `/qr`, scan the QR, copy the URL.

## Wire it into the Sheba app

In the Sheba project's environment variables (Vercel), set:

| Variable                 | Value                                             |
| ------------------------ | ------------------------------------------------- |
| `WHATSAPP_WORKER_URL`    | the worker's public URL (no trailing slash)       |
| `WHATSAPP_WORKER_SECRET` | the **same** secret you set on the worker         |

That's it — `POST /api/send-otp` in the app will now deliver OTPs over WhatsApp.

## Notes & limits

- This uses an unofficial WhatsApp connection. Fine for low volume, but the number **can be rate-limited or banned** by WhatsApp if abused. Keep message volume reasonable and move to the official WhatsApp Business Cloud API as you grow.
- Use a **dedicated** WhatsApp number for this, not your personal one.
- The worker only accepts requests carrying the correct `x-worker-secret`. Keep that secret private.
