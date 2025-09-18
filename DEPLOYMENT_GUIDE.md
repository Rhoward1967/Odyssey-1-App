# GoDaddy Deployment Guide

## Step 1: Build Your Project Locally

1. Open terminal/command prompt in your project folder
2. Run these commands:
```bash
npm install
npm run build
```
3. This creates a `dist/` folder with your built website

## Step 2: Access GoDaddy File Manager

1. Log into your GoDaddy account
2. Go to "My Products" → "Web Hosting"
3. Click "Manage" next to your hosting account
4. Click "File Manager" or "cPanel File Manager"

## Step 3: Upload Files

1. Navigate to `public_html` folder (this is your website root)
2. DELETE any existing files in public_html (like index.html, etc.)
3. Upload ALL contents from your `dist/` folder to public_html:
   - index.html
   - assets/ folder
   - robots.txt
   - Any other files in dist/

## Step 4: Configure Domain (if needed)

If using a custom domain:
1. In GoDaddy DNS settings, point your domain to your hosting
2. Wait 24-48 hours for DNS propagation

## Step 5: Test Your Site

Visit your domain - your React app should load!

## Troubleshooting

- If you see "Index of /" instead of your site, ensure index.html is in public_html root
- If CSS/JS doesn't load, check that assets/ folder uploaded correctly
- For routing issues, you may need to add .htaccess file for React Router

Need more specific help? Let me know what step you're stuck on!