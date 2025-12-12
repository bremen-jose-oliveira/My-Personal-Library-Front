# Prebuild Validation Guide

## Overview

Before running `npx expo prebuild`, it's recommended to validate your project configuration to catch errors early. This saves time and prevents build failures.

## Quick Start

### Option 1: Use Safe Prebuild Commands (Recommended)

Instead of running `npx expo prebuild` directly, use these safe commands:

```bash
# Validate and prebuild for all platforms
npm run prebuild:safe

# Validate and prebuild for iOS only
npm run prebuild:ios

# Validate and prebuild for Android only
npm run prebuild:android
```

These commands will:

1. ✅ Run all validation checks
2. ✅ Only proceed with prebuild if all checks pass
3. ❌ Stop and show errors if any check fails

### Option 2: Run Validation Separately

```bash
# Just run validation (doesn't run prebuild)
npm run validate

# Then if validation passes, run prebuild manually
npx expo prebuild
```

## What Gets Validated

The validation script checks:

1. **Required Files**

   - ✅ `app.config.js` exists
   - ✅ `package.json` exists
   - ✅ `eas.json` exists
   - ✅ `tsconfig.json` exists

2. **Expo Configuration**

   - ✅ Runs `expo-doctor` to check for config issues
   - ⚠️ Warnings are allowed (won't fail)

3. **TypeScript**

   - ✅ Runs `tsc --noEmit` to check for type errors
   - ❌ Type errors will fail validation

4. **Code Quality**

   - ✅ Runs `npm run lint` to check code style
   - ⚠️ Linting warnings are allowed (won't fail)

5. **Dependencies**

   - ✅ Checks if `node_modules` exists
   - ❌ Missing node_modules will fail validation

6. **Environment Variables**
   - ℹ️ Checks for `.env` or `.env.gpg` files
   - ℹ️ Informational only (doesn't fail)

## Example Output

### ✅ Success Case

```
🔍 Running pre-prebuild validation checks...

📁 Checking required files...
✅ app.config.js exists
✅ package.json exists
✅ eas.json exists
✅ tsconfig.json exists

📋 Checking environment variables...
✅ .env.gpg file found

📦 Checking dependencies...
✅ node_modules exists

✅ Expo configuration check passed
✅ TypeScript type checking passed
✅ Code linting passed

✅ All checks passed (7/7)!
🚀 Safe to run prebuild
```

### ❌ Failure Case

```
❌ TypeScript type checking failed

Error: Type error in app/_layout.tsx:15:5
  Property 'headerTitle' does not exist on type...

❌ Some checks failed (5/7 passed)
⚠️  Please fix the errors above before running prebuild
```

## Common Issues & Solutions

### Issue: TypeScript Errors

**Solution:**

```bash
# Fix type errors
npx tsc --noEmit  # See all errors
# Fix the errors in your code
npm run validate  # Run again
```

### Issue: Missing node_modules

**Solution:**

```bash
npm install
npm run validate
```

### Issue: Expo Doctor Warnings

**Solution:**

- Warnings are allowed and won't fail validation
- Review warnings and fix if needed
- See `expo-doctor` output for details

### Issue: Linting Errors

**Solution:**

```bash
# Auto-fix what can be fixed
npm run lint -- --fix

# Or fix manually
npm run validate  # See errors
```

## Integration with CI/CD

You can use the validation script in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Validate before build
  run: npm run validate

- name: Prebuild
  run: npx expo prebuild
  if: success()
```

## Manual Validation Steps

If you prefer to run checks manually:

```bash
# 1. Check Expo configuration
npx expo-doctor

# 2. Check TypeScript
npx tsc --noEmit

# 3. Check linting
npm run lint

# 4. Then run prebuild
npx expo prebuild
```

## Tips

1. **Run validation before committing** - Catch errors early
2. **Use `prebuild:safe` commands** - Automatic validation
3. **Fix TypeScript errors first** - They're usually the most critical
4. **Review expo-doctor warnings** - They indicate potential issues

## Troubleshooting

### Script not found

```bash
# Make sure script is executable
chmod +x scripts/validate-before-prebuild.js

# Or run directly
node scripts/validate-before-prebuild.js
```

### Validation passes but prebuild still fails

- Some issues only appear during actual prebuild
- Check prebuild logs for specific errors
- Common causes: missing native dependencies, incorrect config values

### Want to skip validation?

```bash
# Run prebuild directly (not recommended)
npx expo prebuild
```

But remember: validation catches most errors early!
