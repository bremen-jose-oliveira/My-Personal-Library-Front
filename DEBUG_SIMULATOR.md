# Fix: Simulator Not Showing in Safari Develop Menu

## Quick Fix Steps

### Step 1: Make Sure Simulator Has Safari Open

1. In **Simulator**, open **Safari** app
2. Navigate to **any website** (e.g., `google.com` or your Netlify URL)
3. Keep Safari open with the website loaded

### Step 2: Restart Safari on Mac

1. **Quit Safari completely**: Press `Cmd + Q` (or Safari → Quit Safari)
2. **Wait 2 seconds**
3. **Reopen Safari** on Mac
4. Click **Develop** menu → Should now show "Simulator"

### Step 3: If Still Not Working - Check Menu Visibility

1. Safari → **Settings** → **Advanced**
2. Make sure "**Show features for web developers**" is checked ✅
3. The **Develop** menu should appear in Safari's menu bar (top of screen)

### Step 4: Verify Simulator is Running Safari

In Simulator:

- Safari icon should be visible in dock
- Safari window should be open with a website

## Alternative: Use Chrome DevTools via localhost

If Safari Develop menu still doesn't work, you can test locally:

```bash
# In your project directory
npm run web
# Then open http://localhost:8081 in Simulator Safari
# Or use Chrome DevTools on Mac to inspect
```

## Still Not Working?

Try this command to verify WebKit debugging:

```bash
xcrun simctl list | grep Booted
```

If Simulator shows as "Booted", then try:

1. Close all Safari windows (on Mac)
2. Close Safari in Simulator
3. Reopen Safari in Simulator → go to website
4. On Mac: Safari → Develop → Simulator should appear
