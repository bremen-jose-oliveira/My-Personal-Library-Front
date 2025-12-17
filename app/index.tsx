// app//index.tsx
import "react-native-reanimated"; // Reanimated

import { Link, Stack, Redirect, useRouter, useSegments } from "expo-router";
import "../global.css";
import {
  TouchableOpacity,
  View,
  Text,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import React, { useContext } from "react";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { useEffect } from "react";
import { AuthContext } from "@/utils/Context/AuthContext";
import "react-native-reanimated";
// Only import dev-client in development builds (prevents TestFlight crashes)
if (__DEV__) {
  require("expo-dev-client");
}

export default function WelcomeScreen() {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const segments = useSegments();
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Safety check - if AuthContext is not available, show welcome screen
  if (!authContext) {
    console.error("❌ AuthContext is not available!");
    // Still show the welcome screen
  }

  const { isLoggedIn, loading } = authContext || {
    isLoggedIn: false,
    loading: false,
  };

  // Force re-render when logout happens by watching isLoggedIn change to false
  // Use a ref to prevent multiple updates
  const prevIsLoggedInRef = React.useRef(isLoggedIn);
  useEffect(() => {
    // Only update refreshKey when transitioning from logged in to logged out
    if (
      !loading &&
      prevIsLoggedInRef.current === true &&
      isLoggedIn === false
    ) {
      // When user logs out, increment refresh key to force component re-render
      // Use a longer delay to ensure navigation and app reload have completed
      setTimeout(() => {
        setRefreshKey((prev) => {
          const newKey = prev + 1;
          console.log(
            "🔄 Welcome screen refreshed after logout, refreshKey:",
            newKey
          );
          return newKey;
        });
      }, 600); // Increased delay to account for app reload
    }
    prevIsLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn, loading]);

  console.log(
    "🔍 WelcomeScreen - isLoggedIn:",
    isLoggedIn,
    "loading:",
    loading,
    "authContext available:",
    !!authContext,
    "segments:",
    segments,
    "refreshKey:",
    refreshKey,
    "current route check"
  );

  // If we're on tabs route but logged out, force navigation to root
  // This ensures we're on the correct route to show the welcome screen
  // Use a ref to prevent multiple navigation calls
  const hasNavigatedRef = React.useRef(false);
  useEffect(() => {
    if (
      !loading &&
      !isLoggedIn &&
      segments.length > 0 &&
      segments[0] === "(tabs)" &&
      !hasNavigatedRef.current
    ) {
      console.log(
        "⚠️ Still on tabs route after logout, forcing navigation to root"
      );
      hasNavigatedRef.current = true;
      // Use a small delay to avoid conflicts with other navigation
      setTimeout(() => {
        try {
          router.replace("/");
          console.log("✅ Navigated from tabs route to root after logout");
        } catch (error) {
          console.warn("Navigation error:", error);
          hasNavigatedRef.current = false; // Reset on error
        }
      }, 100);
    } else if (isLoggedIn) {
      // Reset flag when logged in
      hasNavigatedRef.current = false;
    }
  }, [isLoggedIn, loading, segments, router]);

  // Timeout fallback - if loading takes more than 5 seconds, show welcome screen anyway
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("⚠️ Loading timeout - showing welcome screen anyway");
        setLoadingTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [loading]);

  // Use Redirect component instead of router.replace to avoid mounting issues
  // IMPORTANT: Only redirect to tabs if user is actually logged in
  // After logout, isLoggedIn will be false, so this won't redirect
  if (!loading && isLoggedIn) {
    console.log("✅ User is logged in, redirecting to tabs...");
    return <Redirect href="/(tabs)" />;
  }

  // Debug: Log when we're showing welcome screen (after logout)
  if (!loading && !isLoggedIn) {
    console.log("✅ Showing welcome screen - user is logged out");
  }

  // Show loading spinner while checking login status (with timeout fallback)
  if (loading && !loadingTimeout) {
    console.log("⏳ Still loading...");
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading...</Text>
      </View>
    );
  }

  // Show loading while redirecting if user is logged in
  if (isLoggedIn) {
    console.log("🔄 User logged in, redirecting...");
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={{ marginTop: 10, color: "#666" }}>Redirecting...</Text>
      </View>
    );
  }

  console.log("✅ Showing welcome screen, refreshKey:", refreshKey);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        key={refreshKey}
        style={{
          flex: 1,
          backgroundColor: "#f5f5f5",
          width: "100%",
          height: "100%",
        }}
      >
        <ImageBackground
          source={require("@/assets/images/login.png")}
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          resizeMode="cover"
          onError={(error) => {
            console.error("❌ ImageBackground failed to load:", error);
          }}
          onLoad={() => {
            console.log("✅ ImageBackground loaded successfully");
          }}
        >
          <LinearGradient
            colors={[
              "transparent",
              "rgba(255,255,255,0.1)",
              "rgba(255,255,255,0.8)",
            ]}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              justifyContent: "flex-end",
              alignItems: "center",
              paddingBottom: 12,
            }}
          >
            <View
              style={{
                alignItems: "center",
                paddingHorizontal: 20,
                width: "100%",
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  letterSpacing: 2.4,
                  color: "#FF6347",
                  marginBottom: 5,
                }}
              >
                My Library
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  letterSpacing: 1.2,
                  color: "#808080",
                  lineHeight: 21,
                  marginBottom: 15,
                  textAlign: "center",
                }}
              >
                Your Own Private Book Collection
              </Text>

              <SocialLoginButtons emailHref="/Register" />

              <Text
                style={{
                  marginTop: 5,
                  marginBottom: 35,
                  fontSize: 14,
                  color: "black",
                  textAlign: "center",
                }}
              >
                Have an Account?{" "}
                <Link href="/Login" asChild>
                  <TouchableOpacity>
                    <Text style={{ color: "#FF6347", fontWeight: "600" }}>
                      SignIn
                    </Text>
                  </TouchableOpacity>
                </Link>
              </Text>

              <Text
                style={{
                  marginTop: 5,
                  marginBottom: 35,
                  fontSize: 14,
                  color: "black",
                  textAlign: "center",
                }}
              >
                Forgot Passord?{" "}
                <Link href="/ForgotPassword" asChild>
                  <TouchableOpacity>
                    <Text style={{ color: "#FF6347", fontWeight: "600" }}>
                      ResetPassword
                    </Text>
                  </TouchableOpacity>
                </Link>
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    </>
  );
}
