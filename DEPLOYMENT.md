# Deployment Guide

## Web Deployment (Netlify)

### Setting Environment Variables in Netlify

The frontend uses `EXPO_PUBLIC_*` environment variables that need to be set in Netlify's dashboard:

1. Go to your Netlify site dashboard: https://app.netlify.com
2. Navigate to: **Site settings** → **Environment variables**
3. Add the following variables:

```
EXPO_PUBLIC_API_URL=https://jose-long-morning-2431.fly.dev
EXPO_PUBLIC_IOS_CLIENT_ID=958080376950-ov7dgq16sggjncpa7u5p4edesradrr0g.apps.googleusercontent.com
EXPO_PUBLIC_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_WEB_CLIENT_ID=958080376950-ii8vapnkoq7r9s7ji8ps55fh09ie47m7.apps.googleusercontent.com
```

**Important:** 
- Replace `https://your-backend-url.fly.dev` with your actual backend URL
- These variables are injected at **build time**, so you need to trigger a new build after setting them
- Go to **Deploys** → **Trigger deploy** → **Deploy site** to rebuild with new variables

### Build Settings

The `netlify.toml` file is already configured with:
- Build command: `npm install && npx expo export -p web`
- Publish directory: `dist`

## Mobile Deployment (Android & iOS)

Netlify is **only for web deployment**. For Android and iOS apps, you need to use **EAS Build** (Expo Application Services).

### Prerequisites

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure EAS:
```bash
eas build:configure
```

### Setting Environment Variables for Mobile Builds

1. Set secrets in EAS:
```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://your-backend-url.fly.dev
eas secret:create --scope project --name EXPO_PUBLIC_IOS_CLIENT_ID --value your-ios-client-id
eas secret:create --scope project --name EXPO_PUBLIC_ANDROID_CLIENT_ID --value your-android-client-id
eas secret:create --scope project --name EXPO_PUBLIC_WEB_CLIENT_ID --value your-web-client-id
```

2. The `eas.json` file is already configured with environment variables for preview and production builds. The backend URL is set to `https://jose-long-morning-2431.fly.dev`.

### Building for Android

```bash
# Build APK (for testing)
eas build --platform android --profile preview

# Build AAB (for Google Play Store)
eas build --platform android --profile production
```

### Building for iOS

```bash
# Build for internal testing
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production
```

### Publishing to Stores

**Google Play Store:**
1. Build the AAB file using EAS
2. Go to Google Play Console
3. Upload the AAB file
4. Complete store listing and submit for review

**Apple App Store:**
1. Build the iOS app using EAS
2. Use `eas submit` to automatically submit to App Store Connect:
```bash
eas submit --platform ios
```
3. Complete App Store listing in App Store Connect
4. Submit for review

### Notes

- **Web**: Use Netlify (already configured)
- **Android**: Use EAS Build → Google Play Store
- **iOS**: Use EAS Build → App Store Connect
- Environment variables must be set separately for each platform (Netlify for web, EAS secrets for mobile)

