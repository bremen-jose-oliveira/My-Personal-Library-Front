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
          backgroundColor: "#ffffff",
          width: "100%",
          height: "100%",
        }}
      >
        <LinearGradient
          colors={["#ff6b35", "#ff9166", "#ffffff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            justifyContent: "space-between",
            paddingTop: 80,
            paddingBottom: 40,
            paddingHorizontal: 24,
          }}
        >
          {/* Header Section */}
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 48, color: "#fff" }}>📚</Text>
            </View>
            <Text
              style={{
                fontSize: 36,
                fontWeight: "800",
                color: "#fff",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              My Library
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "500",
                color: "rgba(255, 255, 255, 0.95)",
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              Your Personal Book Collection
            </Text>
          </View>

          {/* Login Section */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 24,
              padding: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 16,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#171717",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Get Started
            </Text>

            <SocialLoginButtons emailHref="/Register" />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 16,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: "#e5e5e5",
                }}
              />
              <Text
                style={{
                  marginHorizontal: 12,
                  fontSize: 14,
                  color: "#a3a3a3",
                  fontWeight: "500",
                }}
              >
                or
              </Text>
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: "#e5e5e5",
                }}
              />
            </View>

            <Text
              style={{
                fontSize: 14,
                color: "#525252",
                textAlign: "center",
              }}
            >
              Already have an account?{" "}
              <Link href="/Login" asChild>
                <TouchableOpacity>
                  <Text
                    style={{
                      color: "#ff6b35",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </Text>

            <Text
              style={{
                marginTop: 12,
                fontSize: 14,
                color: "#525252",
                textAlign: "center",
              }}
            >
              Forgot Password?{" "}
              <Link href="/ForgotPassword" asChild>
                <TouchableOpacity>
                  <Text
                    style={{
                      color: "#ff6b35",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    Reset
                  </Text>
                </TouchableOpacity>
              </Link>
            </Text>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}
