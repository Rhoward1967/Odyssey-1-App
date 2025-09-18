# Famous AI + GoDaddy SSL Certificate Fix Guide

## Current Status Analysis
- **Domain**: odyssey-1.ai (GoDaddy managed)
- **Hosting**: Famous AI platform
- **Backend**: Supabase
- **IP**: 34.160.10.22 (Famous AI infrastructure)
- **Issue**: ERR_CERT_COMMON_NAME_INVALID

## Step 1: GoDaddy DNS Configuration

### A. Verify DNS Records
```bash
# Check current DNS
dig A odyssey-1.ai +short
dig A www.odyssey-1.ai +short
```

### B. Required GoDaddy DNS Settings
1. **A Record**: `@` → `34.160.10.22`
2. **CNAME Record**: `www` → `odyssey-1.ai`
3. **CAA Record**: `@` → `0 issue "letsencrypt.org"`

## Step 2: Famous AI Platform Configuration

### A. Domain Settings in Famous AI
1. Access Famous AI dashboard
2. Navigate to Domain/SSL settings
3. Add both domains:
   - `odyssey-1.ai`
   - `www.odyssey-1.ai`
4. Force SSL certificate regeneration

### B. SSL Certificate Request
```bash
# Verify CAA records allow SSL
dig CAA odyssey-1.ai +short
# Should return: 0 issue "letsencrypt.org"
```

## Step 3: Supabase Configuration

### A. Update Supabase Site URL
1. Go to Supabase Dashboard → Settings → General
2. Update Site URL to: `https://odyssey-1.ai`
3. Add redirect URLs:
   - `https://odyssey-1.ai/**`
   - `https://www.odyssey-1.ai/**`

### B. Environment Variables
Update your app's environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SITE_URL=https://odyssey-1.ai
```

## Step 4: Troubleshooting Commands

### A. DNS Verification
```bash
# Check global propagation
nslookup odyssey-1.ai 8.8.8.8
nslookup www.odyssey-1.ai 8.8.8.8

# Check CAA records
dig CAA odyssey-1.ai @8.8.8.8
```

### B. SSL Testing
```bash
# Test SSL handshake
openssl s_client -connect odyssey-1.ai:443 -servername odyssey-1.ai

# Check certificate details
curl -I https://odyssey-1.ai
```

## Step 5: Famous AI Specific Steps

### A. Platform Dashboard Actions
1. **Remove Domain**: Temporarily remove domain from Famous AI
2. **Wait**: 5-10 minutes for cleanup
3. **Re-add Domain**: Add domain back with SSL enabled
4. **Verify**: Check SSL certificate generation status

### B. Force SSL Renewal
- Look for "Renew SSL" or "Generate Certificate" button
- Enable "Force HTTPS" redirect
- Set up automatic SSL renewal

## Expected Timeline
- **DNS Changes**: 5-15 minutes
- **SSL Generation**: 10-30 minutes
- **Global Propagation**: 1-4 hours

## Verification Steps
1. **Test HTTPS**: `curl -I https://odyssey-1.ai`
2. **Browser Test**: Open in incognito mode
3. **SSL Checker**: Use online SSL checker tools
4. **Mobile Test**: Check on mobile networks

## Common Issues & Solutions

### Issue: Certificate Mismatch
**Solution**: Ensure both apex and www domains are configured

### Issue: Mixed Content Warnings
**Solution**: Update all HTTP links to HTTPS in your app

### Issue: Supabase Connection Errors
**Solution**: Verify CORS settings and site URLs in Supabase

## Contact Support
- **Famous AI**: Check their SSL/domain documentation
- **GoDaddy**: Domain management support
- **Supabase**: Backend configuration help

## Quick Status Check
```bash
# One-line status check
curl -s -o /dev/null -w "%{http_code} %{ssl_verify_result}" https://odyssey-1.ai
```
Success = `200 0` (HTTP 200, SSL verify success)