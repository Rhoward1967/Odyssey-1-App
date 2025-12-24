# 🛰️ SOVEREIGN PLATFORM SETTINGS AUDIT
**DATE:** December 24, 2025  
**PURPOSE:** Manual verification checklist for platform toggles that SQL/code cannot control  
**IMPACT:** "Built" → "Alive" - The difference between code and functioning system

---

## 🎯 CRITICAL ISSUES BLOCKING SOVEREIGNTY

### Issue #1: Users Can't Log In (Development)
**PLATFORM:** Supabase Dashboard  
**ROOT CAUSE:** Email confirmation enabled  
**SYMPTOM:** User registers → receives email → never confirmed → can't log in  
**FIX LOCATION:** Supabase Dashboard → Authentication → Settings

---

## 📋 SUPABASE DASHBOARD TOGGLES

### 1. Authentication Settings
**URL:** `https://supabase.com/dashboard/project/[YOUR_PROJECT]/auth/users`

#### ✅ Email Confirmation (CRITICAL - Development)
- [ ] Navigate to: **Authentication** → **Settings** → **Email Auth**
- [ ] Find: **"Confirm email"** toggle
- [ ] **ACTION:** **DISABLE** for development (users can log in immediately)
- [ ] **Production:** Re-enable before launch
- [ ] **Why:** Without this, every test user needs to click confirmation email

#### ✅ Email Rate Limiting
- [ ] Navigate to: **Authentication** → **Settings** → **Rate Limits**
- [ ] Find: **"Email send rate limit"**
- [ ] **Current:** Check if set (default: 1 email/hour per user)
- [ ] **ACTION:** Increase to 10/hour for development
- [ ] **Why:** Testing signup flows repeatedly hits this limit

#### ✅ Auto-confirm New Users (Development)
- [ ] Navigate to: **Authentication** → **Settings** → **Email Auth**
- [ ] Find: **"Enable email confirmations"**
- [ ] **ACTION:** **UNCHECK** this box
- [ ] **Verify:** New users should have `confirmed_at` populated immediately

### 2. Database Settings

#### ✅ Connection Pooling
- [ ] Navigate to: **Database** → **Settings** → **Connection Pool**
- [ ] **Current:** Check if enabled
- [ ] **Recommended:** Enable with pool size 15-20 for production
- [ ] **Why:** Prevents connection exhaustion

#### ✅ pg_cron Extension (APPLIED VIA GEMINI MIGRATION)
- [ ] Navigate to: **Database** → **Extensions**
- [ ] Find: **pg_cron**
- [ ] **Expected:** ✅ Enabled (from migration)
- [ ] **Verify:** `SELECT * FROM cron.job;` should show 2 jobs

### 3. Edge Functions

#### ✅ Function Permissions
- [ ] Navigate to: **Edge Functions** → Each function → **Settings**
- [ ] Find: **"Verify JWT"** toggle
- [ ] **ACTION:** Enable for production functions (chat, ai-calculator, etc.)
- [ ] **Why:** Unauthenticated access = security breach

#### ✅ Function Secrets
- [ ] Navigate to: **Edge Functions** → **Settings** → **Secrets**
- [ ] **Verify:** All 61 secrets present
- [ ] **Check:** ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, OPENAI_API_KEY
- [ ] **Why:** Missing secrets = 500 errors

### 4. Storage Settings

#### ✅ Public Bucket Policies
- [ ] Navigate to: **Storage** → **Policies**
- [ ] Find: Buckets like `avatars`, `media`, `documents`
- [ ] **Verify:** Public read enabled for `avatars`
- [ ] **Verify:** Authenticated-only for `documents`

---

## 🐙 GITHUB REPOSITORY SETTINGS

### 1. Actions Permissions (CRITICAL - R.O.M.A.N. LEARNING)
**URL:** `https://github.com/Rhoward1967/Odyssey-1-App/settings/actions`

#### ✅ Workflow Permissions
- [ ] Navigate to: **Settings** → **Actions** → **General** → **Workflow permissions**
- [ ] **Current:** Likely "Read repository contents and packages permissions"
- [ ] **ACTION:** Change to **"Read and write permissions"**
- [ ] **Why:** R.O.M.A.N. cannot commit autonomous fixes without write access
- [ ] **Impact:** governance_changes logs exist but fixes never reach repo

#### ✅ Allow GitHub Actions
- [ ] Navigate to: **Settings** → **Actions** → **General**
- [ ] Find: **"Actions permissions"**
- [ ] **ACTION:** Select "Allow all actions and reusable workflows"
- [ ] **Why:** Restrictive settings block automated deployments

### 2. Branch Protection (dev-lab)
**URL:** `https://github.com/Rhoward1967/Odyssey-1-App/settings/branches`

#### ✅ Require Pull Request Reviews
- [ ] Navigate to: **Settings** → **Branches** → **dev-lab** → **Edit**
- [ ] Find: **"Require a pull request before merging"**
- [ ] **ACTION:** **DISABLE** for solo development
- [ ] **Why:** You're the only developer, PRs slow down iteration

#### ✅ Status Checks
- [ ] Find: **"Require status checks to pass before merging"**
- [ ] **ACTION:** Enable only for production branch
- [ ] **Why:** dev-lab needs rapid prototyping freedom

### 3. Secrets for Actions
**URL:** `https://github.com/Rhoward1967/Odyssey-1-App/settings/secrets/actions`

#### ✅ Repository Secrets
- [ ] Verify these secrets exist:
  - [ ] `SUPABASE_ACCESS_TOKEN` (for migrations)
  - [ ] `SUPABASE_PROJECT_ID`
  - [ ] `ANTHROPIC_API_KEY` (if deploying edge functions via Actions)
- [ ] **Why:** CI/CD pipelines fail without these

---

## 🌐 VERCEL DASHBOARD TOGGLES

### 1. Analytics (CRITICAL - Empty Charts)
**URL:** `https://vercel.com/[YOUR_TEAM]/odyssey-1-app/analytics`

#### ✅ Enable Web Analytics
- [ ] Navigate to: **Analytics** tab
- [ ] Find: **"Enable Web Analytics"** button
- [ ] **ACTION:** Click **"Enable"**
- [ ] **Why:** Vercel does NOT auto-enable analytics, charts stay empty
- [ ] **Expected:** Real-time visitor data appears within 5 minutes

#### ✅ Speed Insights
- [ ] Navigate to: **Speed Insights** tab
- [ ] Find: **"Enable Speed Insights"** button
- [ ] **ACTION:** Click **"Enable"**
- [ ] **Why:** Performance metrics (Core Web Vitals) won't collect without this

### 2. Environment Variables
**URL:** `https://vercel.com/[YOUR_TEAM]/odyssey-1-app/settings/environment-variables`

#### ✅ Production Environment
- [ ] Verify these exist for **Production**:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_STRIPE_PUBLIC_KEY`
  - [ ] `ANTHROPIC_API_KEY` (if using serverless functions)
- [ ] **Why:** Build succeeds but runtime fails with undefined vars

#### ✅ Preview Environment
- [ ] Check: Same variables exist for **Preview** deployments
- [ ] **Why:** Pull request previews crash without preview env vars

### 3. Function Configuration
**URL:** `https://vercel.com/[YOUR_TEAM]/odyssey-1-app/settings/functions`

#### ✅ Function Regions
- [ ] Navigate to: **Settings** → **Functions**
- [ ] Find: **"Function Region"**
- [ ] **ACTION:** Set to **"Washington, D.C., USA (iad1)"** (closest to Supabase)
- [ ] **Why:** Cross-region latency causes timeouts

#### ✅ Max Duration
- [ ] Find: **"Max Duration"**
- [ ] **Current:** Default 10s (Hobby), 60s (Pro)
- [ ] **ACTION:** Increase to 60s if on Pro plan
- [ ] **Why:** AI model calls (Claude, GPT) often exceed 10s

---

## 🔧 AUTOMATED VERIFICATION SCRIPT

Create `verify-platform-toggles.mjs` to check what's verifiable programmatically:

```javascript
// Run: node verify-platform-toggles.mjs
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🛰️ PLATFORM TOGGLES VERIFICATION\n');

// 1. Check pg_cron enabled
const { data: cronJobs } = await supabase.rpc('cron.job');
console.log(cronJobs?.length > 0 ? '✅' : '❌', 'pg_cron enabled:', cronJobs?.length || 0, 'jobs');

// 2. Check subscription tiers exist
const { data: tiers, count } = await supabase
  .from('subscription_tiers')
  .select('*', { count: 'exact' });
console.log(count === 4 ? '✅' : '❌', 'Subscription tiers:', count || 0, '(expected 4)');

// 3. Check email confirmation setting (requires admin API)
const { data: authSettings } = await supabase.auth.admin.getSettings();
console.log('⚠️ Email confirmation:', authSettings?.email?.enable_confirmations ? 'ENABLED (disable for dev)' : 'DISABLED');

// 4. Check function secrets (can't verify values, only existence)
console.log('⚠️ Edge function secrets: Check Supabase Dashboard manually');

// 5. GitHub Actions (requires GitHub API token)
console.log('⚠️ GitHub Actions permissions: Check repository settings manually');

// 6. Vercel Analytics (requires Vercel API token)
console.log('⚠️ Vercel Analytics: Check Vercel Dashboard manually');
```

---

## 📊 VERIFICATION CHECKLIST SUMMARY

### Supabase (6 critical toggles)
- [ ] Email confirmation DISABLED (development)
- [ ] pg_cron extension ENABLED
- [ ] Edge function JWT verification ENABLED (production)
- [ ] Edge function secrets present (61 total)
- [ ] Connection pooling ENABLED
- [ ] Storage bucket policies correct

### GitHub (3 critical toggles)
- [ ] Actions workflow permissions: **Read/Write**
- [ ] Branch protection: Disabled on dev-lab
- [ ] Repository secrets: SUPABASE_ACCESS_TOKEN, etc.

### Vercel (5 critical toggles)
- [ ] **Web Analytics ENABLED** ← Empty charts issue
- [ ] Speed Insights ENABLED
- [ ] Production environment variables set
- [ ] Preview environment variables set
- [ ] Function region: iad1 (closest to Supabase)

---

## 🎯 IMMEDIATE ACTION ITEMS

### Priority 1 (Blocks Development)
1. **Supabase:** Disable email confirmation
2. **GitHub:** Enable Actions Read/Write permissions
3. **Vercel:** Enable Web Analytics

### Priority 2 (Blocks Production)
4. Verify all Edge Function secrets
5. Enable Edge Function JWT verification
6. Set Vercel function region to iad1

### Priority 3 (Optimization)
7. Enable connection pooling
8. Increase Vercel function timeout to 60s
9. Verify pg_cron jobs running (after migration)

---

## 🚀 POST-TOGGLE VERIFICATION

After applying all toggles, run:

```bash
# 1. Test authentication (should work without email confirmation)
# Register new user → should log in immediately

# 2. Check pg_cron jobs
# Supabase SQL Editor: SELECT * FROM cron.job;

# 3. Verify Vercel Analytics
# Wait 5 minutes → Check Vercel Dashboard → Should see visitor data

# 4. Test R.O.M.A.N. autonomous fix
# Trigger STALE_CACHE → Check governance_changes table

# 5. Check subscription tiers
# SELECT * FROM subscription_tiers; -- Should show 4 tiers
```

---

## 📝 DOCUMENTATION UPDATES NEEDED

After verification, update:
1. `README.md` - Add "Platform Setup" section
2. `DEPLOYMENT.md` - Document required toggles before deployment
3. Meeting Minutes - Log toggle audit completion

---

**STATUS:** 🔴 NOT VERIFIED  
**NEXT STEP:** Work through checklist, mark ✅ as completed  
**GOAL:** All 14 critical toggles verified → System transitions from "Built" to "Alive"
