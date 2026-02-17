import { TouchableOpacity, View, Text } from "react-native";
import React, { useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Href, Link } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import GoogleLogo from "../assets/images/google-icon.svg";
import "../global.css";
import { AuthContext } from "@/utils/Context/AuthContext";

type Props = {
  emailHref: Href;
};

const SocialLoginButtons = (props: Props) => {

  const { handleGoogleLogin} = useContext(AuthContext);
  const { appleLogin } = useContext(AuthContext);

  const { emailHref } = props;

  return (
    <View
      style={{
        alignSelf: "stretch",
      }}
    >
      <Animated.View
        style={{
          alignSelf: "stretch",
        }}
        entering={FadeInDown.delay(300).duration(500)}
      >
        <Link href={emailHref} asChild>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ffffff",
              borderWidth: 2,
              borderColor: "#e0e0e0",
              padding: 14,
              borderRadius: 12,
              gap: 10,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons name="mail-outline" size={22} color="#667eea" />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#333",
              }}
            >
              Continue with Email
            </Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>

      <Animated.View
        style={{
          alignSelf: "stretch",
        }}
        entering={FadeInDown.delay(500).duration(500)}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            borderWidth: 2,
            borderColor: "#e0e0e0",
            padding: 14,
            borderRadius: 12,
            gap: 10,
            marginBottom: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={handleGoogleLogin}
        >
          <GoogleLogo width={22} height={22} />
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#333" }}>
            Continue with Google
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={{
          alignSelf: "stretch",
        }}
        entering={FadeInDown.delay(700).duration(500)}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            borderWidth: 2,
            borderColor: "#e0e0e0",
            padding: 14,
            gap: 10,
            borderRadius: 12,
            marginBottom: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={appleLogin}
        >
          <Ionicons name="logo-apple" size={22} color="#000" />
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#333" }}>
            Continue with Apple
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default SocialLoginButtons;
