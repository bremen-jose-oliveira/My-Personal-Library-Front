import { Link, Stack } from "expo-router";
import "../global.css";
import { TouchableOpacity, View, Text, ImageBackground } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function WelcomeScreen() {
  return (
    <>
    
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require("@/assets/images/Background.jpg")}
        style={{ flex: 1 , justifyContent: "center" ,}}
        resizeMode="cover"
        
      >
        <View className="flex-1 items-center justify-center">
          <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.5)", "rgba(255,255,255,1)"]}
            className="absolute top-0 bottom-0 left-0 right-0 flex-1 justify-end"
          >
            <View className="pb-12 px-5 items-center">
              <Animated.Text
                className="text-2xl font-bold tracking-[2.4px] text-primary mb-1"
                entering={FadeInRight.delay(300).duration(300).springify()}
              >
                My Library
              </Animated.Text>
              <Animated.Text
                className="text-sm font-bold tracking-[1.2px] text-gray leading-7 mb-5"
                entering={FadeInRight.delay(500).duration(300).springify()}
              >
                Your Own Private Book Collection
              </Animated.Text>

              <SocialLoginButtons emailHref="/Register" />

              <Text className="mt-8 text-sm leading-6 text-black">
                Have an Account?{" "}
                <Link href="/Login" asChild>
                  <TouchableOpacity>
                    <Text className="text-primary font-semibold">SignIn</Text>
                  </TouchableOpacity>
                </Link>
              </Text>
            </View>
          </LinearGradient>
        </View>
      </ImageBackground>
    </>
  );
}
