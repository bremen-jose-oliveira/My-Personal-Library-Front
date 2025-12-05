const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer/expo"), // SVG support
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [
    ...resolver.sourceExts,
    "svg",
    "web.js",
    "web.jsx",
    "web.ts",
    "web.tsx",
  ],
  extraNodeModules: {
    "react-native": require.resolve("react-native-web"),
  },
  resolveRequest: (context, moduleName, platform) => {
    if (platform === "web") {
      // Handle Quagga2 for web builds
      if (
        moduleName === "@ericblade/quagga2" ||
        moduleName.startsWith("@ericblade/quagga2/")
      ) {
        // Let Metro resolve it normally - it should work with dynamic imports
        return context.resolveRequest(context, moduleName, platform);
      }
      if (moduleName.endsWith("BaseViewConfig")) {
        return {
          filePath: require.resolve("identity-obj-proxy"),
          type: "sourceFile",
        };
      }
      if (moduleName.endsWith("RCTNetworking")) {
        return {
          filePath: require.resolve("identity-obj-proxy"),
          type: "sourceFile",
        };
      }
      if (
        moduleName.endsWith(
          "../Components/AccessibilityInfo/legacySendAccessibilityEvent"
        )
      ) {
        return {
          filePath: require.resolve(
            "react-native-web/dist/exports/AccessibilityInfo"
          ),
          type: "sourceFile",
        };
      }
      if (moduleName.endsWith("./PlatformColorValueTypes")) {
        return {
          filePath: require.resolve("react-native-web/dist/exports/StyleSheet"),
          type: "sourceFile",
        };
      }
      if (moduleName.endsWith("./Image")) {
        return {
          filePath: require.resolve("react-native-web/dist/exports/Image"),
          type: "sourceFile",
        };
      }
      if (moduleName.endsWith("../../Image/Image")) {
        return {
          filePath: require.resolve("react-native-web/dist/exports/Image"),
          type: "sourceFile",
        };
      }
      if (moduleName.endsWith("DevToolsSettings/DevToolsSettingsManager")) {
        return {
          filePath: require.resolve("identity-obj-proxy"),
          type: "sourceFile",
        };
      }
      if (moduleName.endsWith("Utilities/BackHandler")) {
        return {
          filePath: require.resolve("identity-obj-proxy"),
          type: "sourceFile",
        };
      }
      if (moduleName.endsWith("./Utilities/BackHandler")) {
        return {
          filePath: require.resolve(
            "react-native-web/dist/exports/Utilities/BackHandler"
          ),
          type: "sourceFile",
        };
      }
      if (moduleName.endsWith("/Utilities/Platform")) {
        return {
          filePath: require.resolve("react-native-web/dist/exports/Platform"),
          type: "sourceFile",
        };
      }
      if (moduleName.endsWith("./StyleSheet/PlatformColorValueTypes")) {
        return {
          filePath: require.resolve("react-native-web/dist/exports/StyleSheet"),
          type: "sourceFile",
        };
      }
      if (moduleName.endsWith("./RCTAlertManager")) {
        // Specific fix for ./RCTAlertManager resolution in Alert.js
        return {
          filePath: require.resolve("react-native-web/dist/exports/Alert"),
          type: "sourceFile",
        };
      }
      if (moduleName.endsWith("./Platform")) {
        // Specific fix for ./Platform resolution in HMRClient.js
        return {
          filePath: require.resolve("react-native-web/dist/exports/Platform"),
          type: "sourceFile",
        };
      }
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

// Handle circular dependencies for Metro (e.g., missing dependency issues)
try {
  require.resolve("identity-obj-proxy");
} catch (err) {
  console.error(
    "Missing 'identity-obj-proxy' module. Run 'npm install identity-obj-proxy' to resolve."
  );
}

// Log any missing modules explicitly for easier debugging
process.on("unhandledRejection", (error) => {
  if (error.message.includes("Cannot find module")) {
    console.error(`⚠️ Missing Module: ${error.message}`);
  }
  throw error;
});

module.exports = withNativeWind(config, { input: "./global.css" });
