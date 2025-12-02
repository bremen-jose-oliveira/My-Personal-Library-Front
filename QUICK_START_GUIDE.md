# Quick Start Guide - App Store Submission

Follow these steps in order to prepare your app for submission.

## ✅ Step 1: Update Contact Information

1. Open `public/privacy-policy.html`
2. Replace `[Your Support Email]` with your actual email address (appears in 2 places)
3. Open `public/support.html`
4. Replace `[Your Support Email]` with your actual email address

## ✅ Step 2: Generate App Icons

You have `adaptive-icon.png` - now generate all required sizes:

### Option A: Online Tool (Easiest)
1. Go to: https://www.appicon.co/
2. Upload your `assets/images/adaptive-icon.png`
3. Select platforms: iOS and Android
4. Download the generated icon set
5. Extract and add icons to your project (Expo will handle this automatically if you use the right structure)

### Option B: Using Expo CLI
```bash
# Install icon generator
npm install -g @expo/image-utils

# Generate icons (Expo will use your icon from app.config.js)
npx expo prebuild
```

### Option C: Manual (if you have design software)
Create these sizes:
- **iOS:** 1024x1024 (App Store), 180x180, 120x120, 87x87, 80x80, 76x76, 60x60, 58x58, 40x40, 29x29, 20x20
- **Android:** 512x512 (Play Store), 192x192, 144x144, 96x96, 72x72, 48x48, 36x36

**Note:** For now, your `adaptive-icon.png` will work. Expo/EAS can generate the rest during build, but having a 1024x1024 version is recommended.

## ✅ Step 3: Deploy Privacy Policy & Support Pages

The HTML files are ready in the `public/` folder. They need to be accessible via Netlify:

1. **Check Netlify Configuration:**
   - Make sure `netlify.toml` is configured to serve static files from `public/` or `dist/`
   - If using Expo web export, the `public/` folder should be copied to `dist/` during build

2. **Deploy to Netlify:**
   ```bash
   # Build the web version
   npx expo export -p web
   
   # Copy public folder to dist (if not automatic)
   cp -r public/* dist/
   
   # Deploy (if using Netlify CLI)
   netlify deploy --prod
   ```

3. **Verify URLs are accessible:**
   - `https://p-lib.netlify.app/privacy-policy`
   - `https://p-lib.netlify.app/support`

## ✅ Step 4: Take Screenshots

You need screenshots for both stores. Here's what to capture:

### Required Screenshots:

1. **Library/Home Screen** - Show your book collection
2. **Book Details** - Show book info with reading status
3. **Barcode Scanner** - Show camera scanning or scan result
4. **Exchanges** - Show exchange requests list
5. **Friends/Social** - Show friends or friend's library
6. **Reviews** - Show reviews on a book
7. **Notifications** - Show notification list

### How to Take Screenshots:

**iOS:**
- Use a real iPhone or iPad
- Press: Volume Up + Power Button (or Home + Power on older devices)
- Screenshots saved to Photos app

**Android:**
- Use a real Android device
- Press: Volume Down + Power Button
- Screenshots saved to Gallery

### Screenshot Requirements:

**iOS App Store:**
- iPhone 6.7" (1290 x 2796) - REQUIRED
- iPhone 6.5" (1242 x 2688) - REQUIRED
- iPhone 5.5" (1242 x 2208) - REQUIRED
- iPad Pro 12.9" (2048 x 2732) - If supporting iPad

**Google Play:**
- Phone: At least 2 screenshots (320px to 3840px width)
- Tablet: At least 2 screenshots (if supporting tablets)
- Feature Graphic: 1024 x 500 (banner image)

### Tips:
- Use real content (not empty states)
- Remove any personal/sensitive info
- Make sure text is readable
- Use consistent styling
- Take more than required (you can choose the best ones)

## ✅ Step 5: Create Store Listings

### iOS App Store Connect:
1. Go to: https://appstoreconnect.apple.com
2. Create new app
3. Fill in information from `STORE_LISTING_CONTENT.md`
4. Upload screenshots
5. Set privacy policy URL: `https://p-lib.netlify.app/privacy-policy`
6. Complete all required fields

### Google Play Console:
1. Go to: https://play.google.com/console
2. Create new app
3. Fill in information from `STORE_LISTING_CONTENT.md`
4. Upload screenshots
5. Set privacy policy URL: `https://p-lib.netlify.app/privacy-policy`
6. Complete content rating questionnaire
7. Complete all required fields

## ✅ Step 6: Build Production Apps

### Build iOS:
```bash
eas build --platform ios --profile production
```
- Wait for build to complete (~15-20 minutes)
- Download the `.ipa` file

### Build Android:
```bash
eas build --platform android --profile production
```
- Wait for build to complete (~10-15 minutes)
- Download the `.aab` file

## ✅ Step 7: Test Before Submission

### iOS - TestFlight:
1. After building, submit to TestFlight:
   ```bash
   eas submit --platform ios
   ```
2. Add internal testers in App Store Connect
3. Test the app thoroughly
4. Fix any issues before public release

### Android - Internal Testing:
1. Upload the AAB to Google Play Console
2. Create an internal testing track
3. Add testers
4. Test the app thoroughly
5. Fix any issues before public release

## ✅ Step 8: Submit for Review

### iOS:
1. In App Store Connect, submit your build for review
2. Answer any questions from Apple
3. Wait for review (typically 1-3 days)

### Android:
1. In Google Play Console, submit for review
2. Complete content rating if not done
3. Wait for review (typically 1-7 days)

## 📋 Pre-Submission Checklist

Before clicking "Submit for Review", verify:

- [ ] Privacy Policy is live and accessible
- [ ] Support page is live and accessible
- [ ] Contact email is updated in both HTML files
- [ ] App icons are generated (at least 1024x1024)
- [ ] Screenshots are taken and uploaded
- [ ] Store listing content is complete
- [ ] App builds successfully
- [ ] App tested on real devices
- [ ] No critical bugs
- [ ] Backend is stable and production-ready
- [ ] OAuth redirect URIs are correct for production

## 🚨 Common Issues & Solutions

### Issue: Privacy Policy 404 Error
**Solution:** Make sure `public/` folder is deployed to Netlify. Check `netlify.toml` configuration.

### Issue: App Icons Missing
**Solution:** Expo/EAS can generate icons automatically, but having a 1024x1024 source image helps.

### Issue: Screenshots Rejected
**Solution:** Make sure screenshots show actual app content, not just placeholders. Remove any personal info.

### Issue: Build Fails
**Solution:** Check EAS build logs. Common issues: missing environment variables, certificate problems.

## 📞 Need Help?

- Check `APP_STORE_READINESS.md` for detailed requirements
- Check `STORE_LISTING_CONTENT.md` for listing content
- EAS Documentation: https://docs.expo.dev/build/introduction/
- Apple App Store Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Policies: https://play.google.com/about/developer-content-policy/

## ⏱️ Estimated Timeline

- **Icons & Screenshots:** 1-2 hours
- **Store Listings:** 1-2 hours
- **Building Apps:** 30-60 minutes (wait time)
- **Testing:** 1-2 days (recommended)
- **Review Process:** 1-7 days (varies by platform)

**Total:** Plan for 3-5 days from start to approval (assuming no major issues).

