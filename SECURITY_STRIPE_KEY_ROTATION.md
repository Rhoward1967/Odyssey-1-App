# STRIPE API KEY ROTATION PROTOCOL

**Status:** IMMEDIATE ACTION REQUIRED  
**Date Exposed:** February 9, 2026  
**GitHub Alert:** Active (Secret Scanning)

---

## 1. GENERATE NEW STRIPE API KEY

1. Login to Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to: **Developers** → **API keys**
3. Click **Create secret key** (or **Reveal test key** if this is test mode)
4. Copy the new key (starts with `sk_live_` or `sk_test_`)
5. Name it: `Odyssey-1 Production Key (Feb 2026)`

---

## 2. UPDATE LOCAL ENVIRONMENT

**File:** `.env`

```bash
# OLD KEY (REVOKE IMMEDIATELY)
# STRIPE_SECRET_KEY=sk_live_OLD_KEY_HERE

# NEW KEY (Generated Feb 9, 2026)
STRIPE_SECRET_KEY=sk_live_NEW_KEY_HERE
```

**Save the file.**

---

## 3. REMOVE HARDCODED KEY FROM REPOSITORY

**File:** `scripts/check-stripe-subscriptions.mjs`

**Current Line 8 (UNSAFE):**
```javascript
const stripe = new Stripe('sk_live_HARDCODED_KEY', {
```

**Replace with environment variable reference:**
```javascript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
```

---

## 4. REVOKE OLD KEY IN STRIPE DASHBOARD

1. Return to: **Developers** → **API keys**
2. Find the OLD key that was exposed
3. Click **⋮ (three dots)** → **Delete**
4. Confirm deletion

**⚠️ This will immediately invalidate the exposed key.**

---

## 5. COMMIT SANITIZED VERSION

```powershell
git add scripts/check-stripe-subscriptions.mjs
git commit -m "SECURITY: Remove hardcoded Stripe API key, use environment variable

- Replaced hardcoded sk_live_ key with process.env.STRIPE_SECRET_KEY
- Follows security best practices (12-factor app methodology)
- Old key revoked in Stripe Dashboard (Feb 9, 2026)
- GitHub security alert will auto-close after push"

git push origin dev-lab
```

---

## 6. VERIFY SECURITY ALERT CLOSES

1. Go to: https://github.com/Rhoward1967/Odyssey-1-App/security
2. Confirm the alert for `scripts/check-stripe-subscriptions.mjs` shows **Resolved**
3. Verify no other exposed secrets

---

## 7. TEST NEW KEY

```powershell
node scripts/check-stripe-subscriptions.mjs
```

Expected output:
```
✅ Stripe API connection successful
✅ Active subscriptions: X
```

---

## TIMELINE

- **Feb 9, 2026 (Now):** Old key exposed in GitHub push
- **Feb 9, 2026 (+15 min):** New key generated, `.env` updated
- **Feb 9, 2026 (+20 min):** Hardcoded key removed from code
- **Feb 9, 2026 (+25 min):** Old key revoked in Stripe
- **Feb 9, 2026 (+30 min):** Sanitized code pushed to GitHub
- **Feb 9, 2026 (+35 min):** Security alert auto-closes

---

## CONSTITUTIONAL COMPLIANCE NOTE

This rotation does NOT affect the Howard Jones Bloodline Ancestral Trust Genesis timestamp (commit `93c762d`). That seal remains immutable and valid.

The Stripe key is operational infrastructure, not Trust documentation. Rotating it strengthens the security perimeter without impacting the legal timestamp.

**Status:** Trust Genesis = SEALED | Security Perimeter = IN PROGRESS
