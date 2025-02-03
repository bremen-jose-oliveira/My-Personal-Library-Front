// app//index.tsx

import { Link, Stack } from "expo-router";
import "../global.css";
import { TouchableOpacity, View, Text, ImageBackground } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import React, { useContext } from "react";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { AuthContext } from "@/utils/Context/AuthContext";

export default function WelcomeScreen() {

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require("@/assets/images/livraria-lello3.jpg")}
        style={{
          flex: 1, // Take full screen
          width: "100%", // Make sure it spans full width
          height: "100%", // Make sure it spans full height
          justifyContent: "center", // Center content vertically
          alignItems: "center", // Center content horizontally
        }}
        resizeMode="cover" // Ensures the image covers the screen
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.1)", "rgba(255,255,255,0.8)"]}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            justifyContent: "flex-end", // Align items to the bottom of the screen
            alignItems: "center", // Center horizontally
            paddingBottom: 12, // Additional bottom padding
          }}
        >
          <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
            <Animated.Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                letterSpacing: 2.4,
                color: "#FF6347", // Adjust color as per your theme
                marginBottom: 5,
              }}
              entering={FadeInRight.delay(300).duration(300).springify()}
            >
              My Library
            </Animated.Text>
            <Animated.Text
              style={{
                fontSize: 14,
                fontWeight: "bold",
                letterSpacing: 1.2,
                color: "#808080", 
                lineHeight: 21,
                marginBottom: 15,
                textAlign: "center",
              }}
              entering={FadeInRight.delay(500).duration(300).springify()}
            >
              Your Own Private Book Collection
            </Animated.Text>

            <SocialLoginButtons emailHref="/Register" />

            <Text style={{ marginTop: 5 ,marginBottom:35, fontSize: 14, color: "black", textAlign: "center" }}>
              Have an Account?{" "}
              <Link href="/Login" asChild>
                <TouchableOpacity>
                  <Text style={{ color: "#FF6347", fontWeight: "600" }}>SignIn</Text>
                </TouchableOpacity>
              </Link>
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </>
  );
}
