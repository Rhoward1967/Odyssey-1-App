# Email Service Setup - Resend Integration

## Step 1: Create Resend Account (2 minutes)

1. Go to: https://resend.com/signup
2. Sign up with **generalmanager81@gmail.com**
3. Verify your email address

## Step 2: Get Your API Key

1. After logging in, go to: https://resend.com/api-keys
2. Click **"Create API Key"**
3. Name it: `Odyssey-1 Production`
4. **Copy the API key** (starts with `re_`)
   - **⚠️ IMPORTANT:** You can only see this once! Copy it now.

## Step 3: Add API Key to Supabase

Run this command in PowerShell (replace `YOUR_API_KEY_HERE` with your actual key):

```powershell
npx supabase secrets set RESEND_API_KEY=YOUR_API_KEY_HERE
```

Example:
```powershell
npx supabase secrets set RESEND_API_KEY=re_123abc456def789ghi
```

## Step 4: Deploy Updated Email Function

```powershell
npx supabase functions deploy send-email
```

## Step 5: Test Email Delivery

```powershell
node scripts/test-email-delivery.mjs
```

---

## Pricing (Free Tier)

✅ **3,000 emails/month FREE**
✅ **100 emails/day FREE**
✅ Perfect for 19 customers (invoice emails, payment confirmations, etc.)

Your estimated usage: ~60 emails/month (19 customers × 3 emails average)

---

## Email "From" Address

Currently set to: `ODYSSEY-1 AI LLC <noreply@odyssey-1-app.vercel.app>`

**To use your own domain (optional):**
1. Add custom domain in Resend dashboard
2. Update DNS records (they'll provide the values)
3. Change `from:` in send-email function

---

## What This Fixes

- ✅ Invoice emails will actually arrive
- ✅ Payment confirmations sent to customers
- ✅ Automated billing reminders on March 1st
- ✅ Customer support notifications
- ✅ System alerts to generalmanager81@gmail.com

---

## Need Help?

Video Tutorial: https://www.youtube.com/watch?v=g9vYovJgsA4
Resend Docs: https://resend.com/docs/send-with-supabase-edge-functions
