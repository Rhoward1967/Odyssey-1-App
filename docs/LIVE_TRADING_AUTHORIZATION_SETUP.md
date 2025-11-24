# Live Trading Authorization Setup

**Security Model:**
- **Paper Trading:** Available to ALL users (educational/practice mode)
- **Live Trading:** ONLY available to authorized accounts (owner/admin)
- Users learn with paper trading, owner trades with live trading

## Step 1: Get Your Supabase User ID

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your Odyssey-1-App project
3. Go to **Authentication** → **Users**
4. Find your user account (Rickey Howard)
5. Copy the **User UID** (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

## Step 2: Add Your User ID to Authorization List

Edit `src/services/RobustTradingService.ts`:

```typescript
// AUTHORIZED USER IDs FOR LIVE TRADING (Supabase User IDs)
const AUTHORIZED_LIVE_TRADING_USERS = [
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  // Replace with YOUR actual user ID
];
```

## Step 3: Add Your Wallet Addresses

Get your MetaMask wallet addresses:

1. Open MetaMask
2. Copy your main Polygon wallet address
3. Add to authorization list:

```typescript
// AUTHORIZED WALLETS FOR LIVE TRADING (Owner/Admin only)
const AUTHORIZED_LIVE_TRADING_WALLETS = [
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',  // Your main wallet
  '0xAnotherWalletAddressIfNeeded12345678901234',  // Backup wallet (optional)
];
```

## Step 4: Update User Profile (Alternative Method)

You can also authorize users via database:

```sql
-- Option A: Set user role to admin
UPDATE user_profiles 
SET role = 'admin'
WHERE id = 'your-user-id-here';

-- Option B: Enable live trading flag
UPDATE user_profiles 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{liveTradingEnabled}',
  'true'
)
WHERE id = 'your-user-id-here';
```

## How Authorization Works

### Three Layers of Security:

1. **User ID Check:**
   - Checks if user ID is in `AUTHORIZED_LIVE_TRADING_USERS` array

2. **Role Check:**
   - Queries `user_profiles` table
   - Allows if role is `admin` or `owner`

3. **Metadata Check:**
   - Checks if `metadata.liveTradingEnabled === true`

### UI Enforcement:

When user tries to toggle to "LIVE" mode:
1. ✅ Checks authorization
2. ❌ If unauthorized: Shows error toast, keeps paper mode
3. ✅ If authorized: Shows warning confirmation
4. ✅ After confirmation: Enables live trading

### Backend Enforcement:

When executing a trade:
1. ✅ Validates authorization before R.O.M.A.N. validation
2. ❌ If unauthorized: Returns error, blocks execution
3. ✅ If authorized: Proceeds with constitutional validation
4. ✅ Then executes blockchain transaction

## User Experience

### For Regular Users (Unauthorized):
- ✅ Can use paper trading (unlimited)
- ✅ Learn platform features safely
- ✅ Practice trading strategies
- ❌ Cannot enable live trading mode
- 📄 Shown: "Paper trading available for all users"

### For Owner/Admin (Authorized):
- ✅ Can use paper trading
- ✅ Can enable live trading mode
- ✅ Shown: Warning confirmation before live trading
- ✅ All trades routed through R.O.M.A.N. validation
- 🔴 Executing with real blockchain transactions

## Testing Authorization

### Test 1: Unauthorized User
```typescript
// Create test user without authorization
const testUser = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'test123'
});

// Try to toggle to live mode → Should be blocked
// Expected: Error toast "Access Restricted"
```

### Test 2: Authorized User
```typescript
// Sign in as Rickey (authorized)
const { data } = await supabase.auth.signInWithPassword({
  email: 'your-email@example.com',
  password: 'your-password'
});

// Try to toggle to live mode → Should show warning
// Expected: Confirmation dialog, then live mode enabled
```

## Security Notes

1. **Fail Secure:** If authorization check fails (database error), access is DENIED
2. **Double Validation:** Checked in both UI (RobustTradingControls) and backend (RobustTradingService)
3. **Logged:** All unauthorized attempts are logged with timestamp
4. **No Wallet Risk:** Unauthorized users cannot trigger blockchain transactions

## Environment Configuration

For production, consider moving to environment variables:

```typescript
// .env.local
VITE_AUTHORIZED_USER_IDS=user-id-1,user-id-2
VITE_AUTHORIZED_WALLETS=0xWallet1,0xWallet2
```

```typescript
// RobustTradingService.ts
const AUTHORIZED_LIVE_TRADING_USERS = 
  import.meta.env.VITE_AUTHORIZED_USER_IDS?.split(',') || [];
```

This prevents hardcoding sensitive IDs in source code.

---

## Quick Start

**Right Now (5 minutes):**
1. Get your Supabase User ID from dashboard
2. Replace `'your-supabase-user-id-here'` in RobustTradingService.ts
3. Get your MetaMask wallet address
4. Replace `'0xYourWalletAddress1'` in RobustTradingService.ts
5. Save file
6. Test: Try toggling to live mode → Should work for you, fail for others

**Your users get:**
- ✅ Paper trading (safe, unlimited practice)
- ✅ Full platform access
- ✅ Learn trading strategies
- ❌ No access to your money

**You get:**
- ✅ Paper trading (testing)
- ✅ Live trading (real blockchain execution)
- ✅ Full control
- ✅ No liability for user funds
