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

**"No code signing certificates are available" (when running `npx expo run:ios`)**

If `npx expo run:ios` fails with code signing errors even for simulator, use Xcode directly:

```bash
# 1. Navigate to iOS directory
cd ios

# 2. Build for simulator using xcodebuild
xcodebuild -workspace MyPersonalLibraryFront.xcworkspace \
  -scheme MyPersonalLibraryFront \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 16 Plus' \
  build

# 3. Find the built app path (usually in DerivedData)
# Look for: ~/Library/Developer/Xcode/DerivedData/MyPersonalLibraryFront-*/Build/Products/Debug-iphonesimulator/MyPersonalLibraryFront.app

# 4. Install on simulator
xcrun simctl install "iPhone 16 Plus" /path/to/MyPersonalLibraryFront.app

# 5. Launch the app
xcrun simctl launch "iPhone 16 Plus" com.jose-oliv.mypersonallibraryfront

# 6. Now start Expo dev server (in project root)
cd ..
npx expo start
```

The app will connect to the Expo dev server automatically.
