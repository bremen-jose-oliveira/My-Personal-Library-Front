# App Store Readiness Checklist

## ✅ What's Already Ready

### Technical Configuration
- ✅ Bundle Identifier (iOS): `com.jose-oliv.mypersonallibraryfront`
- ✅ Package Name (Android): `com.joseoliv.mypersonallibraryfront`
- ✅ Version: `1.0.0`
- ✅ EAS Project ID configured
- ✅ Backend URL configured: `https://jose-long-morning-2431.fly.dev`
- ✅ OAuth clients configured (Google, Apple)
- ✅ Camera permissions configured
- ✅ Splash screen configured
- ✅ Privacy descriptions (camera usage)

### Code Quality
- ✅ TypeScript configured
- ✅ Dependencies up to date
- ✅ EAS build configuration ready

## ⚠️ What Needs to Be Done Before Submission

### 1. App Icons (REQUIRED)
**Current Status:** You have `adaptive-icon.png` but need proper icon sets.

**Action Required:**
- **iOS:** Need app icon in multiple sizes (1024x1024 for App Store, plus various sizes for devices)
- **Android:** Need adaptive icon (foreground + background) or standard icon

**Quick Fix:**
```bash
# Generate icons using Expo's tool
npx expo install @expo/image-utils
# Or use online tool: https://www.appicon.co/ or https://icon.kitchen/
```

**Required Sizes:**
- iOS: 1024x1024 (App Store), plus device-specific sizes
- Android: 512x512 (Play Store), plus adaptive icon components

### 2. Privacy Policy URL (REQUIRED)
**Current Status:** ❌ Missing

**Action Required:**
- Create a privacy policy page (can be hosted on Netlify or your website)
- Must cover:
  - What data you collect (user info, books, reviews, etc.)
  - How you use the data
  - Third-party services (Google OAuth, Apple Sign In)
  - Data storage and security
  - User rights

**Quick Solution:**
1. Create `privacy-policy.html` in your frontend
2. Deploy to Netlify at: `https://p-lib.netlify.app/privacy-policy`
3. Add URL to app store listings

### 3. App Store Listing Information (REQUIRED)

#### iOS App Store Connect:
- [ ] App name (max 30 characters)
- [ ] Subtitle (max 30 characters)
- [ ] Description (max 4000 characters)
- [ ] Keywords (max 100 characters)
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] Privacy Policy URL ⚠️ REQUIRED
- [ ] Category (Books, Social Networking, etc.)
- [ ] Age rating
- [ ] Screenshots (required for all device sizes):
  - iPhone 6.7" (1290 x 2796)
  - iPhone 6.5" (1242 x 2688)
  - iPhone 5.5" (1242 x 2208)
  - iPad Pro 12.9" (2048 x 2732)
- [ ] App preview video (optional but recommended)

#### Google Play Console:
- [ ] App name (max 50 characters)
- [ ] Short description (max 80 characters)
- [ ] Full description (max 4000 characters)
- [ ] Privacy Policy URL ⚠️ REQUIRED
- [ ] Category
- [ ] Content rating
- [ ] Screenshots:
  - Phone: At least 2 (max 8), 320px to 3840px
  - Tablet: At least 2 (max 8), 320px to 3840px
  - TV: At least 1 (max 8), 320px to 3840px
- [ ] Feature graphic (1024 x 500)
- [ ] App icon (512 x 512)

### 4. App Store Accounts & Certificates

#### iOS:
- [ ] Apple Developer Account ($99/year)
- [ ] App Store Connect access
- [ ] Distribution certificates (EAS handles this automatically)

#### Android:
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Google Play Console access
- [ ] Signing key (EAS handles this automatically)

### 5. Testing & Quality Assurance

**Before Submission:**
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Test all OAuth flows (Google, Apple)
- [ ] Test camera/barcode scanning
- [ ] Test all major features (books, exchanges, reviews, friends)
- [ ] Test offline behavior
- [ ] Test error handling
- [ ] Check for crashes or memory leaks
- [ ] Verify backend is stable and production-ready

### 6. Legal & Compliance

- [ ] Privacy Policy created and accessible
- [ ] Terms of Service (optional but recommended)
- [ ] GDPR compliance (if targeting EU users)
- [ ] COPPA compliance (if targeting users under 13)
- [ ] Data export/deletion capabilities

### 7. App Configuration Updates Needed

**Recommended updates to `app.config.js`:**

```javascript
ios: {
  bundleIdentifier: "com.jose-oliv.mypersonallibraryfront",
  supportsTablet: true,
  usesAppleSignIn: true,
  buildNumber: "1", // Add this
  infoPlist: {
    NSCameraUsageDescription: "This app needs access to your camera to scan barcodes.",
    ITSAppUsesNonExemptEncryption: false,
    // Add privacy policy URL
    NSUserTrackingUsageDescription: "We use this to improve your experience.", // If using analytics
  }
},
android: {
  permissions: [
    "CAMERA",
    "android.permission.CAMERA"
  ],
  adaptiveIcon: {
    foregroundImage: "./assets/images/adaptive-icon.png", // Specify if exists
    backgroundColor: "#ffffff"
  },
  package: "com.joseoliv.mypersonallibraryfront",
  versionCode: 1, // Add this
  // Add privacy policy URL
  // googleServicesFile: "./google-services.json", // If using Firebase
}
```

## 📋 Pre-Submission Checklist

### Technical Readiness
- [ ] App builds successfully with EAS
- [ ] No console errors or warnings
- [ ] Backend is production-ready and stable
- [ ] Environment variables properly configured
- [ ] OAuth redirect URIs match production URLs
- [ ] App icons generated and added
- [ ] Splash screen looks good

### Content Readiness
- [ ] Privacy Policy created and hosted
- [ ] App description written
- [ ] Screenshots taken (all required sizes)
- [ ] App icon ready (all sizes)
- [ ] Support email/URL ready

### Account Readiness
- [ ] Apple Developer Account active
- [ ] Google Play Developer Account active
- [ ] Payment methods set up (if needed)

### Testing Readiness
- [ ] Tested on iOS device
- [ ] Tested on Android device
- [ ] All features working
- [ ] No critical bugs

## 🚀 Recommended Order of Operations

1. **Create Privacy Policy** (can be simple HTML page)
2. **Generate App Icons** (use online tool or Expo CLI)
3. **Take Screenshots** (use simulator or real device)
4. **Test thoroughly** on both platforms
5. **Build production versions** with EAS
6. **Create App Store listings** (draft, don't submit yet)
7. **Final testing** with TestFlight (iOS) and Internal Testing (Android)
8. **Submit for review**

## ⚡ Quick Start Commands

```bash
# 1. Build for iOS
eas build --platform ios --profile production

# 2. Build for Android
eas build --platform android --profile production

# 3. Submit to iOS App Store
eas submit --platform ios

# 4. Submit to Google Play (manual upload via Play Console)
# Download AAB from EAS, then upload to Play Console
```

## 📝 Notes

- **App Store review takes 1-3 days** typically
- **Google Play review takes 1-7 days** typically
- You can submit to both stores simultaneously
- TestFlight (iOS) allows beta testing before public release
- Google Play Internal Testing allows testing before public release

## ⚠️ Critical Missing Items

1. **Privacy Policy URL** - Cannot submit without this
2. **App Icons** - Required for both stores
3. **Screenshots** - Required for both stores
4. **Developer Accounts** - Required ($99/year iOS, $25 one-time Android)

## ✅ You Can Build Now, But...

You can build the apps right now with EAS, but you **cannot submit** to the stores until:
- Privacy Policy is created and hosted
- App icons are generated
- Screenshots are taken
- Developer accounts are set up

**Recommendation:** Build and test first, then prepare store listings while testing.

