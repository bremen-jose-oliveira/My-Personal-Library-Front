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
import { useTranslation } from "react-i18next";

// Only import dev-client in development builds (prevents TestFlight crashes)
if (__DEV__) {
  require("expo-dev-client");
}

export default function WelcomeScreen() {
  const { t } = useTranslation();
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
        <Text style={{ marginTop: 10, color: "#666" }}>{t("common.loading")}</Text>
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
                {t("tabs.myLibrary")}
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
                {t("auth.tagline")}
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
                {t("auth.haveAccount")}{" "}
                <Link href="/Login" asChild>
                  <TouchableOpacity>
                    <Text style={{ color: "#FF6347", fontWeight: "600" }}>
                      {t("auth.signIn")}
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
                {t("auth.forgotPassword")}{" "}
                <Link href="/ForgotPassword" asChild>
                  <TouchableOpacity>
                    <Text style={{ color: "#FF6347", fontWeight: "600" }}>
                      {t("auth.resetPassword")}
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
