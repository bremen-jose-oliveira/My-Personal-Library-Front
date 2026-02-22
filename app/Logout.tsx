import "react-native-reanimated";

import { Link, Stack, Redirect } from "expo-router";
import "../global.css";
import { TouchableOpacity, View, Text, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { AuthContext } from "@/utils/Context/AuthContext";

export default function LogoutScreen() {
  const { t } = useTranslation();
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
      <View
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
