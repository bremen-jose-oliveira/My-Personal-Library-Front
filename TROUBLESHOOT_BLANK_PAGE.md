# Troubleshooting Blank Page on Netlify

## Current Issue
https://p-lib.netlify.app/ shows a blank page

## Root Cause
The build is using `localhost:8080` because `EXPO_PUBLIC_API_URL` environment variable is not set in Netlify.

## Step-by-Step Fix

### Step 1: Set Environment Variable in Netlify Dashboard

1. **Go to Netlify Dashboard:**
   - Visit: https://app.netlify.com
   - Login to your account

2. **Select Your Site:**
   - Click on **p-lib** (or your site name)

3. **Navigate to Environment Variables:**
   - Click **Site settings** (gear icon in top menu)
   - Scroll down to **Build & deploy**
   - Click **Environment variables** in the left sidebar

4. **Add the Variable:**
   - Click **Add variable** button
   - **Key:** `EXPO_PUBLIC_API_URL`
   - **Value:** `https://jose-long-morning-2431.fly.dev`
   - Click **Save**

### Step 2: Trigger a New Build

**IMPORTANT:** After adding the environment variable, you MUST trigger a new build!

1. **Go to Deploys Tab:**
   - Click **Deploys** in the top menu

2. **Trigger Deploy:**
   - Click **Trigger deploy** dropdown
   - Select **Deploy site**
   - Wait for the build to complete (usually 2-5 minutes)

3. **Verify Build:**
   - Check the build log to ensure it completed successfully
   - Look for any errors in the build log

### Step 3: Check Browser Console

After the new build is deployed:

1. **Open the site:** https://p-lib.netlify.app/
2. **Open Browser DevTools:**
   - Press `F12` or `Right-click → Inspect`
   - Go to **Console** tab
3. **Check for errors:**
   - Look for red error messages
   - Check if API calls are going to `localhost:8080` (wrong) or `jose-long-morning-2431.fly.dev` (correct)

### Step 4: Verify Environment Variable is Set

**Check in Netlify:**
1. Go to **Site settings** → **Environment variables**
2. Verify `EXPO_PUBLIC_API_URL` is listed
3. Verify the value is `https://jose-long-morning-2431.fly.dev`

**Check in Build Log:**
1. Go to **Deploys** → Click on the latest deploy
2. Click **View build log**
3. Search for `EXPO_PUBLIC_API_URL` - it should show in the build process

## Common Issues

### Issue 1: "I set the variable but it's still blank"
**Solution:** Did you trigger a new build? Environment variables only take effect on NEW builds, not existing ones.

### Issue 2: "Build succeeded but page is still blank"
**Check:**
- Open browser console (F12) and look for JavaScript errors
- Check Network tab to see if API calls are failing
- Verify the backend is accessible: https://jose-long-morning-2431.fly.dev

### Issue 3: "I can't find Environment Variables in Netlify"
**Solution:**
- Make sure you're in **Site settings**, not the main dashboard
- Look for **Build & deploy** section
- Click **Environment variables** in the left sidebar

### Issue 4: "Build is failing"
**Check the build log for:**
- Missing dependencies
- Build command errors
- Node version issues

## Quick Verification Commands

If you want to test locally first:

```bash
# Set the environment variable
export EXPO_PUBLIC_API_URL=https://jose-long-morning-2431.fly.dev

# Build locally
npx expo export -p web

# Check if localhost is in the build (should be empty)
grep -r "localhost:8080" dist/ || echo "✅ No localhost found - good!"

# Check if your backend URL is in the build
grep -r "jose-long-morning-2431" dist/ && echo "✅ Backend URL found - good!"
```

## Still Not Working?

If after following all steps it's still blank:

1. **Check Netlify Build Log:**
   - Look for any errors or warnings
   - Verify the build command completed successfully

2. **Check Browser Console:**
   - Look for JavaScript errors
   - Check Network tab for failed requests

3. **Verify Backend is Running:**
   - Test: https://jose-long-morning-2431.fly.dev/api/books
   - Should return data or an error (not connection refused)

4. **Check CORS Settings:**
   - Make sure backend allows requests from `https://p-lib.netlify.app`

## Expected Result

After fixing:
- ✅ Page loads (not blank)
- ✅ Browser console shows API calls to `jose-long-morning-2431.fly.dev`
- ✅ No errors in console
- ✅ App functionality works

