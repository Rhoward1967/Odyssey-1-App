# Domain Configuration Fix Guide

## Issue
Dashboard shows `ai-tools-advanced-1.deploypad.app` but should show `odyssey-1.ai`

## Solution Steps

### 1. Vercel Dashboard Settings
- Go to your Vercel project settings
- Navigate to "Domains" section
- Add `odyssey-1.ai` as primary domain
- Add `www.odyssey-1.ai` as redirect
- Remove or set `ai-tools-advanced-1.deploypad.app` as secondary

### 2. DNS Configuration (GoDaddy)
Ensure these records are set in GoDaddy DNS:
```
Type: CNAME
Host: @
Value: cname.vercel-dns.com

Type: CNAME  
Host: www
Value: cname.vercel-dns.com
```

### 3. Verify Configuration
- Check that `vercel.json` includes domains array
- Redeploy the project after domain changes
- Test both `odyssey-1.ai` and `www.odyssey-1.ai`

### 4. SSL Certificate
- Vercel will automatically provision SSL for custom domains
- Allow 24-48 hours for full propagation

## Files Updated
- `vercel.json` - Added explicit domain configuration
- This guide for reference

## Expected Result
Dashboard should show `odyssey-1.ai` as the primary domain after these changes.