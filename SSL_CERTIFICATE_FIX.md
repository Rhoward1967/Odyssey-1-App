# SSL Certificate Fix for odyssey-1.ai

## Current Issue
Getting `ERR_CERT_COMMON_NAME_INVALID` when accessing https://odyssey-1.ai

## Root Cause
The SSL certificate is likely still configured for the old domain or hasn't been properly generated for the new domain yet.

## Immediate Solutions

### 1. Check Vercel Domain Configuration
1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Click on "Domains" section
4. Verify `odyssey-1.ai` is listed and shows "Valid Configuration"
5. If it shows any errors, follow the DNS instructions

### 2. Verify DNS Records (GoDaddy)
Check these records are set correctly:
```
Type: CNAME
Host: @
Value: cname.vercel-dns.com

Type: CNAME  
Host: www
Value: cname.vercel-dns.com
```

### 3. Check CAA Records
Your domain must allow Let's Encrypt to issue certificates.
Run: `dig CAA +short odyssey-1.ai`
Should show: `0 issue "letsencrypt.org"`

### 4. Force Certificate Regeneration
In Vercel dashboard:
1. Remove the domain `odyssey-1.ai`
2. Wait 5 minutes
3. Re-add the domain
4. This forces a new SSL certificate generation

### 5. Clear Browser SSL Cache
- Chrome: Settings → Privacy → Clear browsing data → Cached images/files
- Or try incognito mode

## Timeline
- DNS propagation: 24-48 hours
- SSL certificate generation: 5-15 minutes after DNS is correct
- Full resolution: Usually within 2-4 hours

## Verification
Test these URLs:
- `https://odyssey-1.ai` (should work without SSL error)
- `https://www.odyssey-1.ai` (should redirect or work)

## If Still Not Working
Contact Vercel support with:
- Domain: odyssey-1.ai
- Error: ERR_CERT_COMMON_NAME_INVALID
- DNS provider: GoDaddy
- Request SSL certificate regeneration