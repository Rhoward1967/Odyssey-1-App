# VISUAL STUDIO CODE GIT RESET GUIDE

## IMMEDIATE SOLUTION FOR STUCK VERCEL DEPLOYMENTS

### STEP 1: BACKUP YOUR CURRENT CODE
1. Open Visual Studio Code
2. File → Save Workspace As → Save as "backup-workspace.code-workspace"
3. Copy entire project folder to desktop as backup

### STEP 2: DISCONNECT FROM OLD GITHUB (VS CODE)
1. Open VS Code Terminal (View → Terminal)
2. If terminal doesn't work, use VS Code Source Control panel
3. Go to Source Control tab (Ctrl+Shift+G)
4. Click "..." menu → "Remote" → "Remove Remote" → Select "origin"

### STEP 3: CREATE NEW GITHUB REPOSITORY
1. Go to github.com in browser
2. Click "New Repository" (green button)
3. Name: "odyssey-fresh-deploy"
4. Make it PUBLIC
5. DO NOT initialize with README
6. Click "Create Repository"

### STEP 4: CONNECT TO NEW REPO (VS CODE)
1. In VS Code, open Source Control panel
2. Click "Initialize Repository" if not already git repo
3. Stage all files (click "+" next to "Changes")
4. Commit with message: "Fresh deployment reset"
5. Click "..." → "Remote" → "Add Remote"
6. Name: origin
7. URL: https://github.com/YOUR_USERNAME/odyssey-fresh-deploy.git
8. Click "Publish Branch" → Select "origin" → "main"

### STEP 5: ADD ENVIRONMENT VARIABLES (GITHUB)
1. Go to your new repo on github.com
2. Settings → Secrets and variables → Actions
3. Click "New repository secret" for each:

**REQUIRED SECRETS:**
- VITE_SUPABASE_URL: `https://your-project.supabase.co`
- VITE_SUPABASE_ANON_KEY: `your-anon-key`
- VERCEL_TOKEN: (get from vercel.com/account/tokens)

### STEP 6: TRIGGER FRESH DEPLOYMENT
1. In VS Code, make small change (add space to README)
2. Stage → Commit → Push
3. Go to GitHub Actions tab - should see deployment running
4. Check Vercel dashboard for new deployment

### STEP 7: VERIFY FIX
1. Visit your Vercel URL
2. Should show current code (not week-old version)
3. Check browser console for no Supabase errors

## TROUBLESHOOTING

**If VS Code Git still not working:**
1. Install GitHub Desktop app
2. Clone your new repo through GitHub Desktop
3. Open folder in VS Code
4. Make changes in VS Code
5. Commit/push through GitHub Desktop

**If Vercel still showing old code:**
1. Go to Vercel dashboard
2. Delete old deployment
3. Import fresh GitHub repo
4. Redeploy

## SUCCESS INDICATORS
✅ GitHub shows recent commits (today's date)
✅ Vercel shows recent deployment (today's date)  
✅ Website loads without console errors
✅ All features working properly

Your pipeline should now be current and deployments working!