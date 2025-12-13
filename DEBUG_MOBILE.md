# Debugging Mobile Browser (iPhone)

## Quick Setup for Safari Web Inspector (Recommended)

### On iPhone:

1. Settings → Safari → Advanced
2. Turn ON "Web Inspector"

### On Mac:

1. Safari → Settings → Advanced
2. Check ✅ "Show Develop menu in menu bar"

### Connect & Debug:

1. Connect iPhone to Mac via USB cable
2. Open your website in Chrome/Safari on iPhone
3. On Mac Safari: **Develop** → **[Your iPhone]** → **[Your Website Tab]**
4. DevTools opens on Mac with full console access!

## Alternative: On-Device Debug Apps

If you can't use Safari Web Inspector:

### Option 1: MIHTool (App Store)

- Download "MIHTool" from App Store
- Built-in web inspector on your iPhone
- No Mac needed

### Option 2: Inspect Browser (App Store)

- Download "Inspect Browser"
- JavaScript console on device
- DOM inspection tools

## Important Notes

- **Chrome on iPhone uses Safari's engine** - so Safari Web Inspector works with Chrome tabs too!
- The "Developer" tab in Safari settings is NOT what you need - go to **"Advanced"** tab
- The "Allow remote automation" checkbox is for Selenium/automation tools, NOT for Web Inspector

## What to Look For When Debugging Scanner

Once connected, check Console for:

- `🔵 Starting scanner initialization...` - Component mounted
- `✅ Quagga2 module loaded` - Library loaded
- `🔄 Frames: 50, 100...` - Quagga processing
- Any red errors - JavaScript failures

## Network Tab

Check if Quagga2 library is loading:

- Look for requests to `@ericblade/quagga2`
- Check for 404 errors or failed loads
