import "react-native-reanimated";

import { Link, Stack, Redirect, useRouter, useSegments } from "expo-router";
import "../global.css";
import {
  TouchableOpacity,
  View,
  Text,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useContext } from "react";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { useEffect } from "react";
import { AuthContext } from "@/utils/Context/AuthContext";

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
        setRefreshKey((prev) => prev + 1);
      }, 600);
    }
    prevIsLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn, loading]);

  const hasNavigatedRef = React.useRef(false);
  useEffect(() => {
    if (
      !loading &&
      !isLoggedIn &&
      segments.length > 0 &&
      segments[0] === "(tabs)" &&
      !hasNavigatedRef.current
    ) {
      hasNavigatedRef.current = true;
      setTimeout(() => {
        try {
          router.replace("/");
        } catch (error) {
          console.error("Navigation error:", error);
          hasNavigatedRef.current = false;
        }
      }, 100);
    } else if (isLoggedIn) {
      hasNavigatedRef.current = false;
    }
  }, [isLoggedIn, loading, segments, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [loading]);

  if (!loading && isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  if (loading && !loadingTimeout) {
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

  if (isLoggedIn) {
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
        <LinearGradient
          colors={["#667eea", "#764ba2", "#f093fb"]}
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 80,
              paddingBottom: 40,
              paddingHorizontal: 30,
              width: "100%",
            }}
          >
            {/* Hero Section */}
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: "800",
                  color: "#ffffff",
                  marginBottom: 10,
                  textAlign: "center",
                  textShadowColor: "rgba(0, 0, 0, 0.3)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 8,
                }}
              >
                My Library
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "500",
                  color: "rgba(255,255,255,0.95)",
                  lineHeight: 26,
                  marginBottom: 20,
                  textAlign: "center",
                  paddingHorizontal: 20,
                }}
              >
                Your Personal Book Collection
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "400",
                  color: "rgba(255,255,255,0.85)",
                  lineHeight: 22,
                  textAlign: "center",
                  paddingHorizontal: 30,
                }}
              >
                Organize, track, and share your favorite books with friends
              </Text>
            </View>

            {/* Login Options */}
            <View
              style={{
                width: "100%",
                maxWidth: 400,
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: 24,
                padding: 30,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <SocialLoginButtons emailHref="/Register" />

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 20,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: "#e0e0e0",
                  }}
                />
                <Text
                  style={{
                    marginHorizontal: 10,
                    color: "#666",
                    fontSize: 14,
                  }}
                >
                  OR
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: "#e0e0e0",
                  }}
                />
              </View>

              <Link href="/Login" asChild>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#667eea",
                    alignItems: "center",
                    borderRadius: 12,
                    paddingVertical: 16,
                    marginBottom: 15,
                    shadowColor: "#667eea",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Sign In to Your Account
                  </Text>
                </TouchableOpacity>
              </Link>

              <Link href="/ForgotPassword" asChild>
                <TouchableOpacity style={{ alignItems: "center", marginTop: 5 }}>
                  <Text
                    style={{
                      color: "#667eea",
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}
