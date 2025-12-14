# TestFlight Crash on Launch - Common Causes & Fixes

## Quick Checklist

If your app crashes immediately on launch in TestFlight, check these:

### 1. ✅ Dev Client Import (MOST COMMON)

**Problem:** `expo-dev-client` imported in production code crashes production builds.

**Check:** Look for `import 'expo-dev-client'` in your code.

**Fix:** Remove or conditionally import:
```typescript
// ❌ WRONG - will crash in production
import 'expo-dev-client';

// ✅ CORRECT - only import in development
if (__DEV__) {
  require('expo-dev-client');
}
```

### 2. ✅ Environment Variables

**Check:** Verify EAS build has environment variables:
```bash
# Check your eas.json has env vars for production
eas build --platform ios --profile production --show-build-config
```

**Fix:** Ensure `eas.json` production profile has:
```json
{
  "production": {
    "env": {
      "EXPO_PUBLIC_API_URL": "https://jose-long-morning-2431.fly.dev"
    }
  }
}
```

### 3. ✅ Missing Permissions

**Check:** Verify Info.plist has required permissions:
- `NSCameraUsageDescription` ✅ (you have this)
- `NSPhotoLibraryUsageDescription` (if using photo picker)

**Fix:** Add to `app.config.js`:
```javascript
ios: {
  infoPlist: {
    NSCameraUsageDescription: "This app needs access to your camera to scan barcodes.",
    NSPhotoLibraryUsageDescription: "This app needs access to your photo library to select images."
  }
}
```

### 4. ✅ AuthContext Initialization

**Check:** If AuthContext is null/undefined on launch, app might crash.

**Fix:** Add null checks (you already have these in `app/index.tsx` ✅)

### 5. ✅ Build Profile Mismatch

**Problem:** Building with `development` profile instead of `production`.

**Fix:** Always use:
```bash
eas build --platform ios --profile production
```

### 6. ✅ Missing Dependencies

**Problem:** Native modules not properly linked.

**Fix:** Run before building:
```bash
npx expo prebuild --clean
eas build --platform ios --profile production
```

## How to Debug TestFlight Crashes

### Option 1: Check Crash Reports in App Store Connect

1. Go to **App Store Connect** → Your App → **TestFlight**
2. Click on **Crashes** tab
3. Download crash logs
4. Look for error messages like:
   - "dyld: Library not loaded"
   - "NSInvalidArgumentException"
   - "undefined is not an object"

### Option 2: Use TestFlight Internal Testing

1. Add yourself as internal tester
2. Install TestFlight app on your iPhone
3. Install your app from TestFlight
4. Connect iPhone to Mac
5. Open **Console.app** on Mac
6. Filter by your app name
7. Reproduce crash - see logs in real-time

### Option 3: Check EAS Build Logs

1. Go to **expo.dev** → Your Project → **Builds**
2. Click on the build
3. Check for warnings/errors during build

## Common Error Messages & Solutions

### "dyld: Library not loaded"
- **Cause:** Missing native dependency
- **Fix:** Ensure all native modules are in `package.json` and run `npx expo prebuild`

### "NSInvalidArgumentException"
- **Cause:** Null/undefined value passed to native module
- **Fix:** Add null checks before calling native functions

### "undefined is not an object"
- **Cause:** JavaScript error accessing undefined property
- **Fix:** Add null checks, especially for context/props

### App launches then immediately closes (silent crash)
- **Cause:** Usually missing permission description or dev-client import
- **Fix:** Check Info.plist permissions and remove dev-client imports

## Quick Test Before TestFlight

Test with production-like build locally:
```bash
# Build production profile locally (if on Mac)
eas build --platform ios --profile production --local

# Or test in simulator
npx expo run:ios --configuration Release
```

## Current Status Check

Based on your codebase:

✅ **Good:**
- Camera permission is configured
- AuthContext has null checks
- Environment variables in eas.json

⚠️ **Check:**
- `import 'expo-dev-client'` in `app/index.tsx` line 15 - this might cause crashes
- Consider adding more error boundaries

## Recommended Fix

Most likely cause is the `expo-dev-client` import. Update `app/index.tsx`:

```typescript
// Remove or make conditional:
// import 'expo-dev-client';  // ❌ Remove this line

// Or make it conditional:
if (__DEV__) {
  require('expo-dev-client');  // ✅ Only in development
}
```

Then rebuild:
```bash
eas build --platform ios --profile production
```
