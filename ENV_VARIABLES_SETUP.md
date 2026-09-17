# Environment Variables Setup for Sheba Chai

## Critical: Add These Variables to Vercel

Go to: https://vercel.com → Your Project → Settings → Environment Variables

### Truecaller Integration (REQUIRED for OTP to work)

Add these **exactly**:

```
Key: TRUECALLER_APP_KEY
Value: asc6W4c5449ab515e4116918a30e4603f7dda
Scope: Production, Preview, Development
```

```
Key: NEXT_PUBLIC_TRUECALLER_APP_KEY
Value: asc6W4c5449ab515e4116918a30e4603f7dda
Scope: Production, Preview, Development
```

```
Key: NEXT_PUBLIC_APP_URL
Value: https://shebabangladesh.vercel.app
Scope: Production, Preview, Development
```

## Important Notes

- **TRUECALLER_APP_KEY** - Backend only (server-side)
- **NEXT_PUBLIC_TRUECALLER_APP_KEY** - Frontend (client-side, used in Truecaller SDK)
- Both must have the same value
- The `NEXT_PUBLIC_` prefix makes it available to browser

## Webhook Configuration in Truecaller Dashboard

1. Go to: https://verification-sdk-console.truecaller.com
2. Select your "Sheba" application
3. Find Webhook/Callback URL setting
4. Add: `https://shebabangladesh.vercel.app/api/truecaller/webhook`

## After Adding Variables

1. Deploy your project
2. Test with your phone number
3. Truecaller dialog should appear instantly
4. Select your verified number
5. Auto-logged in!

## Troubleshooting

If Truecaller button doesn't appear:
- Check browser console for errors
- Verify NEXT_PUBLIC_TRUECALLER_APP_KEY is set
- Make sure project is deployed

If verification fails:
- Check webhook URL is correct
- Verify backend logs
- Check if requestId is being generated
