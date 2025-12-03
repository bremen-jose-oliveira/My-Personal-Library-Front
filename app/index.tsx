// app//index.tsx
import 'react-native-gesture-handler';  // Must be imported first
import 'react-native-reanimated';        // Then Reanimated

import { Link, Stack, Redirect } from "expo-router";
import "../global.css";
import { TouchableOpacity, View, Text, ImageBackground, ActivityIndicator } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import React, { useContext, useState } from "react";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { AuthContext } from "@/utils/Context/AuthContext";
import 'react-native-reanimated';
import 'expo-dev-client';
import { NavigationContainer } from '@react-navigation/native';



export default function WelcomeScreen() {
  const authContext = useContext(AuthContext);
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);

  // Safety check - if AuthContext is not available, show welcome screen
  if (!authContext) {
    console.error('❌ AuthContext is not available!');
    // Still show the welcome screen
  }

  const { isLoggedIn, loading } = authContext || { isLoggedIn: false, loading: false };

  console.log('🔍 WelcomeScreen - isLoggedIn:', isLoggedIn, 'loading:', loading);

  // Timeout fallback - if loading takes more than 5 seconds, show welcome screen anyway
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Loading timeout - showing welcome screen anyway');
        setLoadingTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [loading]);

  // Use Redirect component instead of router.replace to avoid mounting issues
  if (!loading && isLoggedIn) {
    console.log('✅ User is logged in, redirecting to tabs...');
    return <Redirect href="/(tabs)" />;
  }

  // Show loading spinner while checking login status (with timeout fallback)
  if (loading && !loadingTimeout) {
    console.log('⏳ Still loading...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  // Show loading while redirecting if user is logged in
  if (isLoggedIn) {
    console.log('🔄 User logged in, redirecting...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={{ marginTop: 10, color: '#666' }}>Redirecting...</Text>
      </View>
    );
  }

  console.log('✅ Showing welcome screen');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require("@/assets/images/livraria-lello3.jpg")}
        style={{
          flex: 1, 
          width: "100%", 
          height: "100%", 
          justifyContent: "center", 
          alignItems: "center",
        }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.1)", "rgba(255,255,255,0.8)"]}
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
          <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
            <Animated.Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                letterSpacing: 2.4,
                color: "#FF6347", 
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
            
            <Text style={{ marginTop: 5 ,marginBottom:35, fontSize: 14, color: "black", textAlign: "center" }}>
              Forgot Passord?{" "}
              <Link href="/ForgotPassword" asChild>
                <TouchableOpacity>
                  <Text style={{ color: "#FF6347", fontWeight: "600" }}>ResetPassword</Text>
                </TouchableOpacity>
              </Link>
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </>
  );
}
