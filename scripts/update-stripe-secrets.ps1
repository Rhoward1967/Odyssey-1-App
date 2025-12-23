# Update Stripe Secrets in Supabase
# Run this script after getting your real Stripe keys from https://dashboard.stripe.com/apikeys

Write-Host "🔐 Updating Stripe Secrets in Supabase..." -ForegroundColor Cyan
Write-Host ""
Write-Host "INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Go to https://dashboard.stripe.com/apikeys"
Write-Host "2. Copy your SECRET KEY (starts with sk_test_ or sk_live_)"
Write-Host "3. Copy your PUBLISHABLE KEY (starts with pk_test_ or pk_live_)"
Write-Host "4. Go to Products → Create 3 products ($99, $299, $999/month)"
Write-Host "5. Copy each Price ID (starts with price_)"
Write-Host ""

# Prompt for keys
$secretKey = Read-Host "Enter your STRIPE_SECRET_KEY (sk_test_... or sk_live_...)"
$publishableKey = Read-Host "Enter your STRIPE_PUBLISHABLE_KEY (pk_test_... or pk_live_...)"
$webhookSecret = Read-Host "Enter your STRIPE_WEBHOOK_SECRET (whsec_...)"
$priceId99 = Read-Host "Enter STRIPE_PRICE_ID_99 (price_...)"
$priceId299 = Read-Host "Enter STRIPE_PRICE_ID_299 (price_...)"
$priceId999 = Read-Host "Enter STRIPE_PRICE_ID_999 (price_...)"

Write-Host ""
Write-Host "📤 Uploading secrets to Supabase..." -ForegroundColor Cyan

# Set secrets
npx supabase secrets set "STRIPE_SECRET_KEY=$secretKey"
npx supabase secrets set "STRIPE_PUBLISHABLE_KEY=$publishableKey"
npx supabase secrets set "STRIPE_WEBHOOK_SECRET=$webhookSecret"
npx supabase secrets set "STRIPE_PRICE_ID_99=$priceId99"
npx supabase secrets set "STRIPE_PRICE_ID_299=$priceId299"
npx supabase secrets set "STRIPE_PRICE_ID_999=$priceId999"

Write-Host ""
Write-Host "✅ Stripe secrets updated!" -ForegroundColor Green
Write-Host ""
Write-Host "Verifying secrets..." -ForegroundColor Cyan
npx supabase secrets list

Write-Host ""
Write-Host "🎉 Done! Test your subscription page now." -ForegroundColor Green
