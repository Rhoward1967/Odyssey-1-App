# Complete GoDaddy Deployment Guide

## BEFORE YOU CALL GODADDY - PREPARATION CHECKLIST

### What You Need Ready:
1. **Domain name**: Odyssey-1ai (you have this!)
2. **Your app files** (we'll build these in Step 1)
3. **Payment method** ready
4. **This guide** open during the call

---

## STEP 1: BUILD YOUR APP FILES

**Do this on your computer FIRST:**

1. Open Terminal/Command Prompt in your project folder
2. Run these commands:
   ```bash
   npm install
   npm run build
   ```
3. This creates a `dist` folder with your website files
4. **IMPORTANT**: Keep this `dist` folder - you'll upload it to GoDaddy

---

## STEP 2: WHAT TO BUY FROM GODADDY

### Call GoDaddy and say:
"I need to host a React website. I need:"

1. **Domain registration for Odyssey-1ai** 
   - Tell them: "I want Odyssey-1ai.com" (or .net/.org if .com is taken)
   
2. **Web hosting plan**
   - Ask for: "Shared hosting" or "Economy plan"
   - Should cost $5-15/month
   
3. **SSL Certificate** 
   - Say: "I need SSL for security"
   - Many plans include this free

### Questions GoDaddy Will Ask You:
- **Domain name**: "Odyssey-1ai.com" (you have this ready!)
- **Hosting duration**: 1 year minimum usually
- **Add-ons**: Say "just basic hosting and SSL"

---

## STEP 3: AFTER PURCHASE - GET YOUR LOGIN INFO

GoDaddy will give you:
1. **cPanel login** (username/password)
2. **FTP details** (for file upload)
3. **Domain management access**

**Write these down immediately!**

---

## STEP 4: UPLOAD YOUR FILES

### Method 1: cPanel File Manager (YOU ARE HERE!)
1. ✓ Login to your GoDaddy cPanel (DONE!)
2. ✓ Find "File Manager" (DONE!)

### 🚨 STOP! DO YOU HAVE YOUR WEBSITE FILES YET?

**If you haven't built your app yet:**
1. **MINIMIZE this browser window** (don't close it!)
2. **Open Terminal/Command Prompt** on your computer
3. **Navigate to your project folder** (where your React app is)
4. **Run these commands:**
   ```bash
   npm install
   npm run build
   ```
5. **This creates a "dist" folder** - that's what you upload!
6. **Come back to this File Manager** and continue below

**If you already have a "dist" folder:**
3. **NEXT**: Look for "public_html" folder and double-click it
4. **DELETE**: Any default files (index.html, coming-soon.html, etc.)
5. **UPLOAD**: ALL files from inside your "dist" folder here
6. **IMPORTANT**: Upload the CONTENTS of dist folder, not the dist folder itself
### Method 2: FTP (Alternative)
1. Download FileZilla (free FTP software)
2. Use FTP details from GoDaddy
3. Upload `dist` folder contents to `public_html`

---

## STEP 5: CONFIGURE YOUR DOMAIN

### If domain is new:
- Wait 24-48 hours for DNS to work
- GoDaddy handles this automatically

### If you have existing domain:
- Update nameservers to point to GoDaddy
- GoDaddy support will help with this

---

## STEP 6: TEST YOUR WEBSITE

1. Go to your domain in browser
2. Check if website loads
3. Test navigation (click different pages)
4. If issues, call GoDaddy support

---

## WHAT TO TELL GODADDY SUPPORT

### If you need help:
"I have a React single-page application for my Odyssey-1ai website that I built. I need help uploading the files to public_html and making sure the routing works correctly."

### Key phrases to use:
- "React single-page application"
- "Need .htaccess file for routing"
- "Upload to public_html folder"
- "Static website files"

---

## TROUBLESHOOTING

### Common Issues:
1. **404 errors on page refresh**
   - Solution: Ensure .htaccess file is uploaded
   
2. **Website shows GoDaddy placeholder**
   - Solution: Files not in public_html root
   
3. **Blank white page**
   - Solution: Check browser console for errors

### Emergency Contact:
- GoDaddy Support: 1-480-505-8877
- Say: "Technical support for web hosting"

---

## YOUR CHECKLIST BEFORE CALLING:
□ Domain name: Odyssey-1ai.com ✓
□ Payment method ready
□ App built (dist folder created)  
□ This guide printed/saved  
□ 30-60 minutes available for setup  

**You're ready! Call GoDaddy and follow this guide step by step.**