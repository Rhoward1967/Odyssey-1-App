# ODYSSEY-1 Development Environment Setup

**Version:** 2.0.0  
**Last Updated:** December 15, 2025  
**Platform:** Windows / macOS / Linux

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [R.O.M.A.N. Discord Bot](#roman-discord-bot)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Development Workflow](#development-workflow)

---

## Prerequisites

### Required Software

- **Node.js** 20.x or higher ([Download](https://nodejs.org))
- **npm** 10.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com))
- **VS Code** (recommended) ([Download](https://code.visualstudio.com))

### Optional but Recommended

- **Supabase CLI** ([Installation Guide](https://supabase.com/docs/guides/cli))
- **PostgreSQL** (for local development)
- **Playwright** browsers (auto-installed with E2E tests)

### Required Accounts

1. **Supabase** - Database & Auth ([Sign up](https://supabase.com))
2. **Stripe** - Payment processing ([Sign up](https://stripe.com))
3. **Anthropic** - Claude AI ([Get API key](https://console.anthropic.com))
4. **Discord** - R.O.M.A.N. bot ([Developer Portal](https://discord.com/developers))
5. **Resend** - Email service (optional) ([Sign up](https://resend.com))

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/Rhoward1967/Odyssey-1-App.git
cd Odyssey-1-App
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your credentials
code .env  # or use your preferred editor
```

### 4. Start Development Server

```bash
npm run dev
```

Application runs at: **http://localhost:8080**

---

## Detailed Setup

### Step 1: Supabase Project Setup

#### Create Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Name:** `odyssey-1-production` (or `odyssey-1-dev`)
   - **Database Password:** Save this securely
   - **Region:** Choose closest to your users
4. Wait for project provisioning (~2 minutes)

#### Get API Keys

1. Navigate to **Settings** → **API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → `VITE_SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Keep secret!**

#### Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push

# Verify tables created
supabase db list
```

---

### Step 2: Stripe Setup

#### Create Stripe Account

1. Sign up at [Stripe](https://dashboard.stripe.com/register)
2. Complete business verification (required for production)

#### Get API Keys

1. Navigate to **Developers** → **API keys**
2. Copy:
   - **Publishable key** → `VITE_STRIPE_PUBLIC_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY` ⚠️ **Backend only!**

#### Create Products

```bash
# Navigate to Products → Add Product
# Create subscription plans:
1. Professional - $99/month
2. Business - $299/month
3. Enterprise - $999/month
```

Copy **Price IDs** for each plan.

#### Setup Webhook

1. Navigate to **Developers** → **Webhooks**
2. Click "Add endpoint"
3. URL: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
4. Events to listen:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy **Webhook Secret** → `STRIPE_WEBHOOK_SECRET`

---

### Step 3: Anthropic (Claude AI)

1. Sign up at [Anthropic Console](https://console.anthropic.com)
2. Navigate to **API Keys**
3. Create new key
4. Copy to `ANTHROPIC_API_KEY`

**Recommended Model:**
- `claude-3-5-sonnet-20241022` (latest, best performance)

---

### Step 4: Discord Bot (R.O.M.A.N.)

#### Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name: `R.O.M.A.N.` (or your preferred name)

#### Create Bot

1. Navigate to **Bot** section
2. Click "Add Bot"
3. Under **Privileged Gateway Intents**, enable:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
4. Under **TOKEN**, click "Reset Token" and copy → `DISCORD_BOT_TOKEN`

#### Invite Bot to Server

1. Navigate to **OAuth2** → **URL Generator**
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select permissions:
   - ✅ Send Messages
   - ✅ Read Message History
   - ✅ Use Slash Commands
4. Copy generated URL and open in browser
5. Select your server and authorize

#### Get Channel ID

1. Enable Developer Mode in Discord:
   - Settings → Advanced → Developer Mode
2. Right-click on channel where R.O.M.A.N. will operate
3. Click "Copy ID" → `DISCORD_CHANNEL_ID`

#### Setup Webhook (Optional for CI/CD notifications)

1. Server Settings → Integrations → Webhooks
2. Create webhook
3. Copy URL → `DISCORD_WEBHOOK_URL`

---

### Step 5: Email Service (Resend)

1. Sign up at [Resend](https://resend.com)
2. Navigate to **API Keys**
3. Create key → `RESEND_API_KEY`
4. Verify domain (for production):
   - Navigate to **Domains**
   - Add your domain
   - Add DNS records as instructed

---

## Environment Variables

### Create `.env` File

```bash
# Supabase
VITE_SUPABASE_URL=https://tvsxloejfsrdganemsmg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # ⚠️ NEVER commit to Git!

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...  # ⚠️ Backend only!
STRIPE_WEBHOOK_SECRET=whsec_...  # ⚠️ Backend only!

# AI Providers
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...  # Optional
GOOGLE_AI_API_KEY=AIza...  # Optional (Gemini)

# Discord (R.O.M.A.N.)
DISCORD_BOT_TOKEN=MTIz...  # ⚠️ Keep secret!
DISCORD_CHANNEL_ID=1234567890
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Email (Resend)
RESEND_API_KEY=re_...

# Feature Flags
VITE_ENABLE_TRADING=true
VITE_ENABLE_AI_RESEARCH=true
VITE_ENABLE_ACADEMIC_SEARCH=true

# Development
VITE_DEV_MODE=true
VITE_LOG_LEVEL=debug
```

### Security Notes

⚠️ **NEVER commit `.env` to version control!**

The `.gitignore` already excludes:
```
.env
.env.local
.env.production
```

### Environment-Specific Files

- `.env` - Local development (Git ignored)
- `.env.example` - Template (committed to Git)
- `.env.production` - Production secrets (stored in hosting provider)

---

## Database Setup

### Option 1: Supabase Cloud (Recommended)

1. Create project (see Step 1 above)
2. Run migrations:
   ```bash
   supabase db push
   ```
3. Verify in Supabase Dashboard → Table Editor

### Option 2: Local PostgreSQL

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize local Supabase
supabase init

# Start local services (Postgres + Studio)
supabase start

# Database runs at: postgresql://postgres:postgres@localhost:54322/postgres
# Studio UI at: http://localhost:54323
```

Update `.env`:
```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<from supabase start output>
```

---

## Running the Application

### Development Server

```bash
# Start Vite dev server
npm run dev
```

Access at: **http://localhost:8080**

Features:
- ⚡ Hot Module Replacement (HMR)
- 🔥 Fast refresh
- 📦 On-demand compilation
- 🐛 Source maps for debugging

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Build output: `dist/`

### Start R.O.M.A.N. Discord Bot

```bash
# In separate terminal
node src/start-bot.ts
```

Or use VS Code task: **Terminal → Run Task → 🚀 Start Robust Lab Server**

---

## R.O.M.A.N. Discord Bot

### Constitutional Core Integration

R.O.M.A.N. validates all actions against Sacred Geometry principles:

1. **Law of Inhabitance** - No harm to life
2. **Harmonic Attraction** - Schumann Resonance (7.83 Hz) alignment
3. **Total Coherence** - Zero entropy increase in critical states
4. **Structural Integrity** - Golden Ratio (Phi 1.618) adherence

### Bot Commands

In Discord, mention `@R.O.M.A.N.` or use commands:

- `/status` - System health check
- `/approve <action>` - Request approval for action
- `/audit` - Run system audit
- `/metrics` - View AI usage metrics

### Approval Workflow

1. User requests action in Discord
2. R.O.M.A.N. receives request
3. Constitutional Core validates against principles
4. If compliant → Approve and execute
5. If violated → Reject with explanation + Axiom citation
6. Log to `ops.roman_events`

---

## Testing

### Unit Tests (Vitest)

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode (visual test runner)
npm run test:ui
```

**Test files:** `src/**/*.test.ts`, `src/**/*.test.tsx`

**Current status:** 46/46 passing

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# View HTML report
npm run test:e2e:report
```

**Test files:** `e2e/*.spec.ts`

**Current status:** 7/7 passing (28.6s)

### Linting & Type Checking

```bash
# ESLint
npm run lint

# TypeScript type check
npx tsc --noEmit
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to Supabase"

**Solution:**
```bash
# Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection
curl -I https://YOUR_PROJECT.supabase.co
```

#### 2. "Vite dev server won't start"

**Solution:**
```bash
# Check if port 8080 is in use
netstat -ano | findstr :8080  # Windows
lsof -i :8080  # macOS/Linux

# Use different port
npm run dev -- --port 3000
```

#### 3. "Discord bot not responding"

**Solution:**
```bash
# Verify bot token
# Check Privileged Gateway Intents are enabled
# Ensure bot has permissions in channel
# Check Discord Developer Portal → Bot → TOKEN is valid
```

#### 4. "Stripe webhook not working locally"

**Solution:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Forward webhooks to local
stripe listen --forward-to localhost:8080/api/stripe-webhook
```

#### 5. "Database migrations failed"

**Solution:**
```bash
# Reset database (dev only - destroys data!)
supabase db reset

# Re-run migrations
supabase db push

# Check migration status
supabase migration list
```

#### 6. "R.O.M.A.N. Constitutional Core errors"

**Solution:**
```typescript
// Check Sacred Geometry constants are correct
import { SCHUMANN_RESONANCE_HZ, PRINCIPLE_SACRED_GEOMETRY_RATIO } from '@/lib/roman-constitutional-core';

console.log('Schumann:', SCHUMANN_RESONANCE_HZ);  // Should be 7.83
console.log('Golden Ratio:', PRINCIPLE_SACRED_GEOMETRY_RATIO);  // Should be 1.618
```

---

## Development Workflow

### Branch Strategy

```
main (production) ← protected
  ↑
dev-lab (staging) ← protected
  ↑
feature/* (development branches)
```

### Git Workflow

```bash
# Start new feature
git checkout dev-lab
git pull origin dev-lab
git checkout -b feature/your-feature-name

# Make changes, commit
git add .
git commit -m "feat: Add new feature"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# → CI/CD runs automatically
# → Requires approval before merge
```

### CI/CD Pipeline

Every push/PR triggers:

1. **🔍 Lint & Type Check** - ESLint + TypeScript
2. **🧪 Unit Tests** - 46 tests with coverage
3. **🎭 E2E Tests** - 7 Playwright tests
4. **🏗️ Build** - Production build verification
5. **🔒 Security Scan** - npm audit

**Branch Protection:**
- All checks must pass before merge
- Requires 1 approval on `main`
- No direct pushes to `main` or `dev-lab`

### Deployment

#### Staging (dev-lab)

```bash
git push origin dev-lab
# → Auto-deploys to staging environment
```

#### Production (main)

```bash
# Merge dev-lab → main via PR
# → Requires manual approval
# → 5 minute wait timer
# → Auto-deploys to production
```

---

## VS Code Extensions (Recommended)

Install for better DX:

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **TypeScript Importer** (`pmneo.tsimporter`)
- **Playwright Test** (`ms-playwright.playwright`)
- **GitLens** (`eamodio.gitlens`)
- **Thunder Client** (`rangav.vscode-thunder-client`) - API testing

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

## Directory Structure

```
Odyssey-1-App/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions CI/CD
├── docs/
│   ├── API_DOCUMENTATION.md   # API reference
│   ├── DATABASE_SCHEMA.md     # Database docs
│   └── SETUP_GUIDE.md         # This file
├── e2e/
│   └── critical-flows.spec.ts # Playwright E2E tests
├── public/                    # Static assets
├── src/
│   ├── components/            # React components
│   ├── pages/                 # Page components
│   ├── services/              # API services
│   ├── lib/                   # Utilities
│   │   ├── supabase.ts        # Supabase client
│   │   ├── roman-constitutional-core.ts
│   │   └── ErrorBoundary.tsx
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript types
│   └── App.tsx                # Root component
├── supabase/
│   ├── functions/             # Edge Functions
│   └── migrations/            # Database migrations
├── .env                       # Local environment (Git ignored)
├── .env.example               # Environment template
├── package.json               # Dependencies & scripts
├── playwright.config.ts       # Playwright config
├── vite.config.ts             # Vite config
├── tailwind.config.js         # Tailwind CSS config
└── tsconfig.json              # TypeScript config
```

---

## Performance Optimization

### Development

```bash
# Use SWC instead of Babel (faster transpilation)
# Already configured in vite.config.ts

# Enable caching
npm run dev -- --force  # Clear cache if needed
```

### Production

```bash
# Build with optimizations
npm run build

# Analyze bundle size
npm run build -- --analyze

# Preview production build locally
npm run preview
```

---

## Security Checklist

✅ **Environment Variables**
- [ ] No secrets in `.env` committed to Git
- [ ] Service role key never exposed to frontend
- [ ] Stripe secret key server-side only

✅ **Database Security**
- [ ] RLS enabled on all tables
- [ ] Service role only for R.O.M.A.N.
- [ ] All functions have locked `search_path`

✅ **API Security**
- [ ] All Edge Functions validate JWT
- [ ] Rate limiting configured
- [ ] CORS properly configured

✅ **Frontend Security**
- [ ] No API keys in client code
- [ ] CSP headers configured
- [ ] XSS protection enabled

---

## Support & Resources

- **Documentation:** `/docs` directory
- **Issues:** [GitHub Issues](https://github.com/Rhoward1967/Odyssey-1-App/issues)
- **Supabase Docs:** https://supabase.com/docs
- **Discord Support:** https://discord.gg/YOUR_SERVER
- **Email:** rhoward@hjsservices.us

---

## Next Steps

After setup:

1. ✅ Verify all tests passing (`npm test && npm run test:e2e`)
2. ✅ Start Discord bot (`node src/start-bot.ts`)
3. ✅ Create test organization in UI
4. ✅ Test Stripe checkout flow (use test card `4242 4242 4242 4242`)
5. ✅ Review API documentation (`docs/API_DOCUMENTATION.md`)
6. ✅ Explore database schema (`docs/DATABASE_SCHEMA.md`)

---

**© 2025 ODYSSEY-1 AI LLC. All Rights Reserved.**  
**Setup Guide by Rickey A Howard**
