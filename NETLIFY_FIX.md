# Fix for Blank Netlify Deployment

## Problem
The web version shows blank because the build is using `localhost:8080` instead of your production backend URL.

## Root Cause
Environment variables (`EXPO_PUBLIC_API_URL`) are not set in Netlify, so the build uses localhost as fallback.

## Solution

### Step 1: Set Environment Variables in Netlify

1. Go to: https://app.netlify.com
2. Select your site: **p-lib**
3. Go to: **Site settings** → **Environment variables**
4. Click **Add variable** and add these:

```
EXPO_PUBLIC_API_URL = https://jose-long-morning-2431.fly.dev
EXPO_PUBLIC_IOS_CLIENT_ID = 958080376950-ov7dgq16sggjncpa7u5p4edesradrr0g.apps.googleusercontent.com
EXPO_PUBLIC_ANDROID_CLIENT_ID = your-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_WEB_CLIENT_ID = 958080376950-ii8vapnkoq7r9s7ji8ps55fh09ie47m7.apps.googleusercontent.com
```

**Important:** Replace `your-android-client-id` with your actual Android OAuth client ID if you have one.

### Step 2: Trigger a New Build

After setting the environment variables:

1. Go to: **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the build to complete
4. The new build will use the correct backend URL

### Step 3: Verify

After deployment, check:
- ✅ https://p-lib.netlify.app/ should load (not blank)
- ✅ Browser console should show API calls to `https://jose-long-morning-2431.fly.dev` (not localhost)
- ✅ Privacy policy: https://p-lib.netlify.app/privacy-policy
- ✅ Support: https://p-lib.netlify.app/support

## Why This Happens

Expo web builds embed environment variables at **build time**, not runtime. If `EXPO_PUBLIC_API_URL` is not set during the Netlify build, the code falls back to localhost, which doesn't work in production.

## Alternative: Check Build Logs

If it still doesn't work after setting environment variables:

1. Go to **Deploys** → Click on the latest deploy
2. Check the **Build log**
3. Look for errors or warnings
4. Verify that `EXPO_PUBLIC_API_URL` is being used in the build

## Quick Test

You can test locally to verify the build works:

```bash
# Set environment variable
export EXPO_PUBLIC_API_URL=https://jose-long-morning-2431.fly.dev

# Build
npx expo export -p web

# Check the built files
grep -r "localhost:8080" dist/
# Should return nothing (or only in comments)

grep -r "jose-long-morning-2431" dist/
# Should show your backend URL
```

