# Famous.ai Domain Recovery Guide

## Issue: Missing Domain After Adding New One

You added `odyssey-1.ai/` to Famous.ai dashboard and another domain disappeared.

## What Likely Happened

Famous.ai platform may have a limit on domains or replaced the previous domain when you added the new one.

## Recovery Steps

### 1. Check Current Domain Status
- Go to Project Settings > Domains
- Note which domain is currently showing: `odyssey-1.ai/`
- Check if the missing domain was a subdomain or different format

### 2. Common Missing Domains
The missing domain was likely one of these:
- `ai-tools-advanced-1.deploypad.app` (default Famous.ai domain)
- `www.odyssey-1.ai`
- A previous custom domain

### 3. Re-add Missing Domain
1. In Project Settings > Domains
2. Click "Add a domain you own"
3. Enter the missing domain (without http://)
4. Save changes

### 4. Domain Priority Order
Famous.ai typically shows domains in this priority:
1. Custom domains (odyssey-1.ai)
2. Default platform domains (deploypad.app)

## Verification Steps

1. Test both domains work:
   - https://odyssey-1.ai
   - https://[missing-domain]

2. Check DNS propagation:
   - Use online DNS checker tools
   - Wait 24-48 hours if recently added

## Important Notes

- Don't include `http://` or `https://` when adding domains
- Use format: `odyssey-1.ai` not `http://odyssey-1.ai`
- Famous.ai handles SSL certificates automatically

## If Domain Still Missing

Contact Famous.ai support with:
- Project slug: `ai-tools-advanced-1`
- Missing domain name
- When it disappeared
- Screenshot of current domain settings