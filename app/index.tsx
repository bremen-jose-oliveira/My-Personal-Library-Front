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
import { Colors } from "@/constants/Colors";

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
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10, color: Colors.textSecondary }}>Loading...</Text>
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
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10, color: Colors.textSecondary }}>Redirecting...</Text>
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
          backgroundColor: Colors.background,
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
            console.error("ImageBackground failed to load:", error);
          }}
        >
          <LinearGradient
            colors={[
              "rgba(0,0,0,0.3)",
              "rgba(0,0,0,0.5)",
              "rgba(247,249,252,0.95)",
            ]}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              justifyContent: "flex-end",
              alignItems: "center",
              paddingBottom: 40,
            }}
          >
            <View
              style={{
                alignItems: "center",
                paddingHorizontal: 24,
                width: "100%",
              }}
            >
              {/* App Title */}
              <View style={{ marginBottom: 8 }}>
                <Text
                  style={{
                    fontSize: 40,
                    fontWeight: "800",
                    letterSpacing: 1,
                    color: Colors.primary,
                    textAlign: "center",
                  }}
                >
                  My Library
                </Text>
              </View>
              
              {/* Subtitle */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  letterSpacing: 0.5,
                  color: Colors.textSecondary,
                  marginBottom: 40,
                  textAlign: "center",
                }}
              >
                Your Personal Book Collection
              </Text>

              {/* Social Login Buttons */}
              <SocialLoginButtons emailHref="/Register" />

              {/* Sign In Link */}
              <Text
                style={{
                  marginTop: 20,
                  marginBottom: 12,
                  fontSize: 15,
                  color: Colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Already have an account?{" "}
                <Link href="/Login" asChild>
                  <TouchableOpacity>
                    <Text style={{ color: Colors.primary, fontWeight: "700" }}>
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </Link>
              </Text>

              {/* Forgot Password Link */}
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Forgot Password?{" "}
                <Link href="/ForgotPassword" asChild>
                  <TouchableOpacity>
                    <Text style={{ color: Colors.primary, fontWeight: "600" }}>
                      Reset Password
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
