import { Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Href, Link } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import GoogleLogo from "../assets/images/google-icon.svg";

type Props = {
  emailHref: Href;
};

const SocialLoginButtons = (props: Props) => {
  const { emailHref } = props;

  return (
    <View className="self-stretch">
      <Animated.View className="self-stretch" entering={FadeInDown.delay(300).duration(500)}>
        <Link href={emailHref} asChild>
          <TouchableOpacity className="flex-row items-center justify-center border border-gray-400 p-2 rounded-full gap-2 mb-4">
            <Ionicons name="mail-outline" size={20} color="black" />
            <Text className="text-sm font-semibold text-black">Continue with Email</Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>

      <Animated.View className="self-stretch" entering={FadeInDown.delay(700).duration(500)}>
        <TouchableOpacity className="flex-row items-center justify-center border border-gray-400 p-2 rounded-full gap-2 mb-4">
          <GoogleLogo width={20} height={20} />
          <Text className="text-sm font-semibold text-black">Continue with Google</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View className="self-stretch" entering={FadeInDown.delay(1100).duration(500)}>
        <TouchableOpacity className="flex-row items-center justify-center border border-gray-400 p-2 rounded-full gap-2 mb-4">
          <Ionicons name="logo-apple" size={20} color="black" />
          <Text className="text-sm font-semibold text-black">Continue with Apple</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default SocialLoginButtons;
