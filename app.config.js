export default {
  expo: {
    name: "My-Personal-Library-Front",
    slug: "my-personal-library-front",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splashscreen_logo.jpg",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    doctor: {
      reactNativeDirectoryCheck: {
        listUnknownPackages: false
      }
    },
    ios: {
      bundleIdentifier: "com.jose-oliv.mypersonallibraryfront",
      supportsTablet: true,
      usesAppleSignIn: true,
      buildNumber: "1",
      infoPlist: {
        NSCameraUsageDescription: "This app needs access to your camera to scan barcodes.",
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      permissions: [
        "CAMERA",
        "android.permission.CAMERA"
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/images/app-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.joseoliv.mypersonallibraryfront",
      versionCode: 1
    },
    icon: "./assets/images/app-icon.png",
    web: {
      bundler: "metro",
      output: "static",
      platforms: [
        "ios",
        "android",
        "web"
      ]
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: process.env.EXPO_PUBLIC_IOS_CLIENT_ID 
            ? `com.googleusercontent.apps.${process.env.EXPO_PUBLIC_IOS_CLIENT_ID.split('.')[0]}`
            : "com.googleusercontent.apps.958080376950-ov7dgq16sggjncpa7u5p4edesradrr0g"
        }
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera.",
          microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone.",
          recordAudioAndroid: true
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "bb066308-1f75-49d3-afaa-b0e7d10de5b3"
      },
      google: {
        iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID || "958080376950-ov7dgq16sggjncpa7u5p4edesradrr0g.apps.googleusercontent.com"
      },
      googleClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID || "958080376950-ii8vapnkoq7r9s7ji8ps55fh09ie47m7.apps.googleusercontent.com",
      // Expose environment variables to the app
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    },
    owner: "jose_oliv",
    newArchEnabled: true
  }
};

