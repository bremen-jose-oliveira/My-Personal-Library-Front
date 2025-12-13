# Troubleshooting iPhone Not Appearing in Safari Develop Menu

## Step-by-Step Checklist

### 1. iPhone Settings (Critical!)

- [ ] iPhone is **unlocked** (not locked screen)
- [ ] Settings → Safari → Advanced → **Web Inspector is ON** (green)
- [ ] iPhone is **not in airplane mode**

### 2. USB Connection

- [ ] iPhone connected via USB cable to Mac
- [ ] Use a **data cable** (not charge-only cable)
- [ ] Try a different USB port if available
- [ ] If iPhone shows "Trust This Computer?" → Tap **Trust**
- [ ] Enter your iPhone passcode if prompted

### 3. Safari on iPhone

- [ ] Open Safari app on iPhone (not Chrome yet)
- [ ] Navigate to **any website** (e.g., google.com)
- [ ] Keep Safari open on iPhone

### 4. Safari on Mac

- [ ] Quit Safari completely (Safari → Quit Safari, or Cmd+Q)
- [ ] Reopen Safari on Mac
- [ ] Check if **Develop** menu is visible in menu bar
- [ ] Click **Develop** → See if iPhone appears now

### 5. Alternative: Use Image Capture / Finder

- [ ] Open **Finder** on Mac
- [ ] See if iPhone appears in sidebar under "Locations"
- [ ] If iPhone appears in Finder but not Safari, try restarting Safari again

### 6. If Still Not Working

- [ ] Restart iPhone
- [ ] Restart Mac Safari
- [ ] Try different USB cable
- [ ] Try Image Capture app - if iPhone appears there, connection is good

## Quick Test

1. Connect iPhone to Mac
2. On iPhone: Settings → Safari → Advanced → Web Inspector ON
3. On iPhone: Open Safari → go to google.com
4. On Mac: Open Safari → Develop menu
5. iPhone should appear!

## Alternative: Use iOS Simulator

If physical device debugging doesn't work:

```bash
# Open iOS Simulator
open -a Simulator

# Then in Safari on Mac:
# Develop → Simulator → [Safari tab]
```

This works great for testing without physical device!
