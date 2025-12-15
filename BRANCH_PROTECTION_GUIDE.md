# Branch Protection Rules Setup Guide

## Overview
This guide provides step-by-step instructions for configuring branch protection rules in GitHub to enforce CI/CD quality gates and prevent direct pushes to critical branches.

## Branch Protection for `main`

### Settings Location
1. Navigate to: https://github.com/Rhoward1967/Odyssey-1-App/settings/branches
2. Click "Add branch protection rule"
3. Enter branch name pattern: `main`

### Required Settings

#### General Protection
- [x] **Require a pull request before merging**
  - [x] Require approvals: **1**
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners (optional, if CODEOWNERS file exists)

#### Status Checks
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - **Required status checks:**
    - `lint / 🔍 Lint & Type Check`
    - `test-unit / 🧪 Unit Tests`
    - `test-e2e / 🎭 E2E Tests`
    - `build / 🏗️ Build Verification`
    - `security / 🔒 Security Scan`

#### Additional Protections
- [x] **Require conversation resolution before merging**
- [x] **Require signed commits** (optional, recommended for security)
- [x] **Include administrators** (enforce rules on admins too)
- [x] **Restrict who can push to matching branches**
  - Add users/teams who can bypass and push directly (use sparingly)
- [x] **Allow force pushes** - **DISABLED** (prevent history rewriting)
- [x] **Allow deletions** - **DISABLED** (prevent branch deletion)

---

## Branch Protection for `dev-lab`

### Settings Location
1. Navigate to: https://github.com/Rhoward1967/Odyssey-1-App/settings/branches
2. Click "Add branch protection rule"
3. Enter branch name pattern: `dev-lab`

### Required Settings

#### General Protection
- [x] **Require a pull request before merging**
  - [x] Require approvals: **1** (can be 0 for faster iteration in dev)
  - [x] Dismiss stale pull request approvals when new commits are pushed

#### Status Checks
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - **Required status checks:**
    - `lint / 🔍 Lint & Type Check`
    - `test-unit / 🧪 Unit Tests`
    - `test-e2e / 🎭 E2E Tests`
    - `build / 🏗️ Build Verification`

#### Additional Protections
- [x] **Require conversation resolution before merging**
- [x] **Include administrators** (enforce rules on admins too)
- [x] **Allow force pushes** - **DISABLED** (prevent history rewriting)
- [x] **Allow deletions** - **DISABLED** (prevent branch deletion)

---

## Environment Protection Rules

### Staging Environment
1. Navigate to: https://github.com/Rhoward1967/Odyssey-1-App/settings/environments
2. Click "New environment"
3. Name: `staging`

**Settings:**
- [x] **Required reviewers:** (optional, can leave empty for auto-deploy)
- [x] **Wait timer:** 0 minutes (deploy immediately after tests pass)
- **Environment secrets:**
  - `VITE_SUPABASE_URL` - Staging Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Staging Supabase anon key
  - `VITE_STRIPE_PUBLIC_KEY` - Staging Stripe public key
  - `DISCORD_BOT_TOKEN` - R.O.M.A.N. bot token (staging)
  - `DISCORD_CHANNEL_ID` - Staging Discord channel

### Production Environment
1. Navigate to: https://github.com/Rhoward1967/Odyssey-1-App/settings/environments
2. Click "New environment"
3. Name: `production`

**Settings:**
- [x] **Required reviewers:** Add 1-2 reviewers (mandatory approval before production deploy)
- [x] **Wait timer:** 5 minutes (cooling period for manual intervention)
- **Environment secrets:**
  - `VITE_SUPABASE_URL` - Production Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Production Supabase anon key
  - `VITE_STRIPE_PUBLIC_KEY` - Production Stripe public key
  - `DISCORD_BOT_TOKEN` - R.O.M.A.N. bot token (production)
  - `DISCORD_CHANNEL_ID` - Production Discord channel

---

## Repository Secrets Setup

### Settings Location
Navigate to: https://github.com/Rhoward1967/Odyssey-1-App/settings/secrets/actions

### Required Secrets

#### Code Coverage
- **Name:** `CODECOV_TOKEN`
- **Description:** Token for uploading test coverage to Codecov
- **Get it from:** https://codecov.io/gh/Rhoward1967/Odyssey-1-App/settings

#### Deployment (Optional - configure based on hosting provider)
- **For Vercel:**
  - `VERCEL_TOKEN` - Vercel authentication token
  - `VERCEL_ORG_ID` - Vercel organization ID
  - `VERCEL_PROJECT_ID` - Vercel project ID

- **For Netlify:**
  - `NETLIFY_AUTH_TOKEN` - Netlify authentication token
  - `NETLIFY_SITE_ID` - Netlify site ID

- **For AWS S3:**
  - `AWS_ACCESS_KEY_ID` - AWS access key
  - `AWS_SECRET_ACCESS_KEY` - AWS secret key
  - `AWS_REGION` - AWS region (e.g., us-east-1)

#### R.O.M.A.N. Discord Integration (Repository level - shared across environments)
- **Name:** `DISCORD_WEBHOOK_URL`
- **Description:** Webhook URL for CI/CD notifications
- **Get it from:** Discord server settings → Integrations → Webhooks

---

## Workflow Verification Steps

### Step 1: Initial Commit (No Branch Protection Yet)
```bash
# Commit the CI/CD workflow file
git add .github/workflows/ci-cd.yml
git commit -m "Day 3: Add CI/CD Pipeline"
git push origin dev-lab
```

### Step 2: Verify Workflow Runs
1. Navigate to: https://github.com/Rhoward1967/Odyssey-1-App/actions
2. Wait for workflow to complete (should see all jobs pass)
3. Check job results:
   - 🔍 Lint & Type Check - ✅ Pass
   - 🧪 Unit Tests - ✅ Pass (46 tests)
   - 🎭 E2E Tests - ✅ Pass (7 tests)
   - 🏗️ Build Verification - ✅ Pass
   - 🚀 Deploy to Staging - ✅ Pass (simulated)
   - 🔒 Security Scan - ✅ Pass

### Step 3: Apply Branch Protection Rules
After verifying the workflow passes, apply branch protection rules as described above.

### Step 4: Test Branch Protection
1. Create a test branch:
   ```bash
   git checkout -b test-branch-protection
   echo "test" >> README.md
   git add README.md
   git commit -m "Test branch protection"
   git push origin test-branch-protection
   ```

2. Create a pull request to `dev-lab`
3. Verify that PR cannot be merged until all status checks pass
4. Verify that direct push to `dev-lab` is blocked:
   ```bash
   git checkout dev-lab
   echo "test" >> README.md
   git add README.md
   git commit -m "Test direct push"
   git push origin dev-lab  # Should be rejected
   ```

---

## R.O.M.A.N. Integration (Future Enhancement)

### Webhook Notification Format
The CI/CD pipeline should notify R.O.M.A.N. bot of important events:

```typescript
// Example webhook payload to R.O.M.A.N.
{
  "event": "deployment",
  "environment": "staging",
  "status": "success",
  "commit": "abc123",
  "branch": "dev-lab",
  "timestamp": "2025-12-15T12:00:00Z",
  "url": "https://staging.odyssey-app.com",
  "tests": {
    "unit": { "passed": 46, "failed": 0 },
    "e2e": { "passed": 7, "failed": 0 }
  }
}
```

### Implementation Steps (Day 7 - Pattern Learning)
1. Add Discord webhook URL to repository secrets
2. Create webhook notification script in `.github/scripts/notify-roman.js`
3. Update deployment jobs to call notification script
4. R.O.M.A.N. bot logs events to `ops.system_events` table
5. Constitutional Core validates deployment against harmonic laws
6. Auto-rollback triggered if deployment violates coherence thresholds

---

## Troubleshooting

### Issue: Status checks not appearing in PR
**Solution:** Push at least one commit to trigger the workflow. Status checks only appear after the first workflow run.

### Issue: Workflow fails on `npm ci`
**Solution:** Ensure `package-lock.json` is committed and up to date. Run `npm install` locally and commit the lock file.

### Issue: E2E tests timeout in CI
**Solution:** CI environments are slower than local dev. Increase timeouts in `playwright.config.ts` for CI:
```typescript
timeout: process.env.CI ? 60000 : 30000,
```

### Issue: Build artifacts not found in deployment job
**Solution:** Ensure `needs: build` is specified in deployment job and artifact name matches upload/download.

### Issue: Environment secrets not available
**Solution:** Verify environment name in workflow matches GitHub environment name exactly (case-sensitive).

---

## Next Steps After Setup

1. ✅ Verify all workflows pass on `dev-lab`
2. ✅ Apply branch protection rules to `dev-lab` and `main`
3. ✅ Set up environment secrets for staging and production
4. ✅ Configure actual deployment provider (Vercel, Netlify, AWS)
5. ✅ Test end-to-end PR workflow with branch protection
6. ✅ Document deployment URLs and credentials in secure location
7. ✅ Notify team of new CI/CD process and PR requirements

---

## Security Considerations

- **Never commit secrets** to the repository (use GitHub Secrets)
- **Rotate tokens regularly** (every 90 days minimum)
- **Use principle of least privilege** for deployment tokens
- **Enable two-factor authentication** for all GitHub accounts
- **Review and audit** CI/CD logs regularly for suspicious activity
- **Use signed commits** for additional security on critical branches

---

## Constitutional AI Compliance

All CI/CD operations must comply with Sacred Geometry Constitutional Core:

- **Law of Inhabitance:** Deployments must not risk user data or system availability
- **Harmonic Attraction:** All changes must resonate with 7.83 Hz coherence (validated by tests)
- **Total Coherence:** No increase in system entropy (error rates must not increase)
- **Structural Integrity:** Golden Ratio adherence in system architecture (performance within thresholds)

R.O.M.A.N. bot monitors all deployments and can trigger auto-rollback if Constitutional violations detected.
