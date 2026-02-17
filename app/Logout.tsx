import "react-native-reanimated";

import { Link, Stack, Redirect } from "expo-router";
import "../global.css";
import { TouchableOpacity, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useContext } from "react";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { AuthContext } from "@/utils/Context/AuthContext";

export default function LogoutScreen() {
  const authContext = useContext(AuthContext);
  const { isLoggedIn, loading } = authContext || {
    isLoggedIn: false,
    loading: false,
  };

  // If user logs in from this screen, redirect to tabs
  if (!loading && isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 60,
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              alignItems: "center",
              width: "100%",
            }}
          >
            <Text
              style={{
                fontSize: 48,
                fontWeight: "800",
                color: "#ffffff",
                marginBottom: 8,
                textShadowColor: "rgba(0, 0, 0, 0.3)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            >
              My Library
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "rgba(255,255,255,0.9)",
                marginBottom: 40,
                textAlign: "center",
              }}
            >
              Your Own Private Book Collection
            </Text>

            <SocialLoginButtons emailHref="/Register" />

            <Text
              style={{
                marginTop: 20,
                marginBottom: 20,
                fontSize: 15,
                color: "#ffffff",
                textAlign: "center",
              }}
            >
              Have an Account?{" "}
              <Link href="/Login" asChild>
                <TouchableOpacity>
                  <Text style={{ color: "#ffffff", fontWeight: "700", textDecorationLine: "underline" }}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </Text>

            <Text
              style={{
                fontSize: 15,
                color: "#ffffff",
                textAlign: "center",
              }}
            >
              Forgot Password?{" "}
              <Link href="/ForgotPassword" asChild>
                <TouchableOpacity>
                  <Text style={{ color: "#ffffff", fontWeight: "700", textDecorationLine: "underline" }}>
                    Reset Password
                  </Text>
                </TouchableOpacity>
              </Link>
            </Text>
          </View>
        </View>
      </LinearGradient>
    </>
  );
}
