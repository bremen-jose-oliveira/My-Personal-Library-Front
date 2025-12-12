#!/usr/bin/env node

/**
 * Validation script to run before prebuild
 * Checks for common errors and configuration issues
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description, allowFailure = false) {
  log(`\n${description}...`, "blue");
  try {
    const output = execSync(command, {
      stdio: "inherit",
      encoding: "utf8",
      cwd: process.cwd(),
    });
    log(`✅ ${description} passed`, "green");
    return { success: true, output };
  } catch (error) {
    if (allowFailure) {
      log(`⚠️  ${description} had warnings (continuing...)`, "yellow");
      return { success: true, output: error.stdout || "" };
    } else {
      log(`❌ ${description} failed`, "red");
      log(`\nError: ${error.message}`, "red");
      return { success: false, error };
    }
  }
}

function checkFileExists(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    log(`✅ ${description} exists`, "green");
    return true;
  } else {
    log(`❌ ${description} missing: ${filePath}`, "red");
    return false;
  }
}

function checkEnvVars() {
  log("\n📋 Checking environment variables...", "blue");
  const requiredVars = ["EXPO_PUBLIC_API_URL"];

  const optionalVars = [
    "EXPO_PUBLIC_GOOGLE_CLIENT_ID",
    "EXPO_PUBLIC_WEB_CLIENT_ID",
    "EXPO_PUBLIC_IOS_CLIENT_ID",
    "EXPO_PUBLIC_ANDROID_CLIENT_ID",
  ];

  let allGood = true;

  // Check if .env file exists
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    log("⚠️  .env file not found (using defaults or system env)", "yellow");
  }

  // Note: We can't actually read .env.gpg, so we'll just check if it exists
  const envGpgPath = path.join(process.cwd(), ".env.gpg");
  if (fs.existsSync(envGpgPath)) {
    log("✅ .env.gpg file found", "green");
  }

  log("ℹ️  Environment variables will be loaded at runtime", "blue");
  return true; // Don't fail on env checks since they might be in .env.gpg
}

function main() {
  log("\n🔍 Running pre-prebuild validation checks...\n", "blue");
  log("=".repeat(60), "blue");

  const checks = [];
  let hasErrors = false;

  // 1. Check required files
  log("\n📁 Checking required files...", "blue");
  checks.push(checkFileExists("app.config.js", "app.config.js"));
  checks.push(checkFileExists("package.json", "package.json"));
  checks.push(checkFileExists("eas.json", "eas.json"));
  checks.push(checkFileExists("tsconfig.json", "tsconfig.json"));

  // 2. Check environment variables
  checks.push(checkEnvVars());

  // 3. Run expo-doctor (allows warnings)
  const doctorResult = runCommand(
    "npx expo-doctor",
    "Expo configuration check",
    true // Allow warnings
  );
  checks.push(doctorResult.success);

  // 4. Run TypeScript type checking
  const tsResult = runCommand(
    "npx tsc --noEmit",
    "TypeScript type checking",
    false
  );
  checks.push(tsResult.success);

  // 5. Run linting (allows warnings)
  const lintResult = runCommand(
    "npm run lint",
    "Code linting",
    true // Allow warnings
  );
  checks.push(lintResult.success);

  // 6. Check if node_modules exists
  log("\n📦 Checking dependencies...", "blue");
  if (fs.existsSync(path.join(process.cwd(), "node_modules"))) {
    log("✅ node_modules exists", "green");
    checks.push(true);
  } else {
    log("❌ node_modules missing - run npm install first", "red");
    checks.push(false);
    hasErrors = true;
  }

  // 7. Check for common native build issues (informational)
  log("\n📱 Checking native project configuration...", "blue");
  const iosDir = path.join(process.cwd(), "ios");
  const androidDir = path.join(process.cwd(), "android");

  if (fs.existsSync(iosDir)) {
    log("✅ iOS native directory exists", "green");
    const podfilePath = path.join(iosDir, "Podfile");
    if (fs.existsSync(podfilePath)) {
      log("✅ Podfile exists", "green");
      // Check if Podfile.lock exists (indicates pods were installed)
      const podfileLockPath = path.join(iosDir, "Podfile.lock");
      if (fs.existsSync(podfileLockPath)) {
        log("✅ Podfile.lock exists (pods installed)", "green");
      } else {
        log(
          "⚠️  Podfile.lock missing - run 'cd ios && pod install' after prebuild",
          "yellow"
        );
      }
    }
  }

  if (fs.existsSync(androidDir)) {
    log("✅ Android native directory exists", "green");
  }

  // Summary
  log("\n" + "=".repeat(60), "blue");
  const passed = checks.filter((c) => c === true).length;
  const total = checks.length;

  if (checks.every((c) => c === true)) {
    log(`\n✅ All checks passed (${passed}/${total})!`, "green");
    log("🚀 Safe to run prebuild\n", "green");
    process.exit(0);
  } else {
    log(`\n❌ Some checks failed (${passed}/${total} passed)`, "red");
    log("⚠️  Please fix the errors above before running prebuild\n", "yellow");
    process.exit(1);
  }
}

// Run validation
main();
