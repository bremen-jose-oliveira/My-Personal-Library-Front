# Building iOS App on Mac Air

## Quick Start (EAS Cloud Build - Recommended)

This works from **any machine** (Windows, Mac, Linux). No Xcode needed!

```bash
# 1. Login to Expo (if not already)
eas login

# 2. Build iOS app in the cloud
eas build --platform ios --profile production

# 3. Wait ~10-20 minutes for build to complete
# 4. Download the .ipa file from the EAS dashboard
```

**That's it!** The build happens in Expo's cloud servers.

## Local Build on Mac Air (Alternative)

If you want to build locally on your Mac Air:

### Prerequisites
1. Install **Xcode** from Mac App Store (free, but large ~15GB)
2. Install **Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```

### Build Commands

**For production build:**
```bash
eas build --platform ios --profile production --local
```

**For development/testing:**
```bash
# Run on iOS Simulator
npx expo run:ios

# Or open in Xcode
npx expo prebuild
open ios/MyPersonalLibraryFront.xcworkspace
```

## Submitting to App Store

After building, submit to App Store:

```bash
# Submit the production build
eas submit --platform ios
```

This will:
- Upload your app to App Store Connect
- You'll need to complete the App Store listing in App Store Connect
- Then submit for review

## Notes

- **EAS Cloud Build** is free for limited builds, then paid plans available
- **Local builds** are free but require Xcode installation
- Your backend URL is already configured: `https://jose-long-morning-2431.fly.dev`
- The `eas.json` file is already set up with production profile

## Troubleshooting

**"EAS CLI not found"**
```bash
npm install -g eas-cli
```

**"Not logged in"**
```bash
eas login
```

**"Xcode not found" (for local builds)**
- Install Xcode from Mac App Store
- Run `xcode-select --install`

