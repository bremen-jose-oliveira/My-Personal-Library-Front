# Generate App Icons - Step by Step Guide

## Option 1: Using Expo (Recommended - Easiest)

Expo can automatically generate all icon sizes from your `adaptive-icon.png`.

### Step 1: Install Expo CLI (if not already installed)

```powershell
npm install -g expo-cli
```

### Step 2: Generate Icons

```powershell
cd E:\new_github_folder\Bibliotek\My-Personal-Library-Front

# Generate all icon sizes automatically
npx expo prebuild --clean
```

This will:
- Generate all iOS icon sizes
- Generate all Android icon sizes
- Create the necessary folders and files

**Note:** This creates native folders. You can delete them after if you only need the icons.

### Step 3: Alternative - Use Expo's Icon Generator

If `prebuild` doesn't work, you can use:

```powershell
# Make sure your icon is 1024x1024 (or larger)
# Expo will resize it automatically

# The icon is already configured in app.config.js:
# icon: "./assets/images/adaptive-icon.png"
```

When you build with EAS, it will automatically generate icons from this file.

## Option 2: Online Tool (Quick & Easy)

### Using AppIcon.co

1. **Go to:** https://www.appicon.co/
2. **Upload:** Your `adaptive-icon.png` file
3. **Select platforms:** iOS + Android
4. **Download:** The generated icon set
5. **Extract and add** to your project

### Using Icon Kitchen

1. **Go to:** https://icon.kitchen/
2. **Upload:** Your `adaptive-icon.png`
3. **Select:** iOS and Android
4. **Download:** Generated icons

## Option 3: Manual (If you have design software)

### iOS Icons Needed:
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 120x120 (iPhone)
- 87x87 (iPhone)
- 80x80 (iPhone)
- 76x76 (iPad)
- 60x60 (iPhone)
- 58x58 (iPhone)
- 40x40 (iPhone)
- 29x29 (iPhone)
- 20x20 (iPhone)

### Android Icons Needed:
- 512x512 (Play Store)
- 192x192
- 144x144
- 96x96
- 72x72
- 48x48
- 36x36

## Current Setup

Your `app.config.js` already has:
```javascript
icon: "./assets/images/adaptive-icon.png"
```

This tells Expo to use this file as the source. Expo/EAS will automatically generate all sizes during build.

## Recommended: Let EAS Generate Icons

**Easiest approach:** Just make sure your `adaptive-icon.png` is:
- At least 1024x1024 pixels
- Square (1:1 aspect ratio)
- Good quality

Then when you build with EAS:
```powershell
eas build --platform ios --profile production
eas build --platform android --profile production
```

EAS will automatically generate all required icon sizes from your source icon.

## Verify Your Icon

Check your current icon:
```powershell
# Check if file exists
Test-Path "assets\images\adaptive-icon.png"
```

If you need to resize or optimize it, you can use:
- Online: https://www.iloveimg.com/resize-image
- Or any image editor

## Quick Test

To verify icons will work:
```powershell
# Check icon configuration
npx expo config --type public
```

This will show your app configuration including icon paths.

