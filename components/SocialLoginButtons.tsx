import { Alert, Text, TouchableOpacity, View } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import React, { useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Href, Link, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import GoogleLogo from "../assets/images/google-icon.svg";
import "../global.css";
import * as SecureStore from "expo-secure-store";
import { getToken, storeToken } from "@/utils/Context/storageUtils";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Colors } from "@/constants/Colors";

type Props = {
  emailHref: Href;
};

const SocialLoginButtons = (props: Props) => {
  const router = useRouter();

  const { handleGoogleLogin} = useContext(AuthContext);
  const { appleLogin } = useContext(AuthContext);

  const { emailHref } = props;

  return (
    <View
      style={{
        alignSelf: "stretch",
        paddingHorizontal: 8,
      }}
    >
      <Animated.View
        style={{
          alignSelf: "stretch",
        }}
        entering={FadeInDown.delay(200).duration(500)}
      >
        <Link href={emailHref} asChild>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: Colors.surface,
              borderWidth: 2,
              borderColor: Colors.lightGray,
              padding: 16,
              borderRadius: 16,
              gap: 10,
              marginBottom: 12,
              shadowColor: Colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons name="mail-outline" size={24} color={Colors.primary} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: Colors.textPrimary,
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
        entering={FadeInDown.delay(400).duration(500)}
      >
       
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Colors.surface,
            borderWidth: 2,
            borderColor: Colors.lightGray,
            padding: 16,
            borderRadius: 16,
            gap: 10,
            marginBottom: 12,
            shadowColor: Colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={handleGoogleLogin}
        >
          <GoogleLogo width={24} height={24} />
          <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary }}>
            Continue with Google
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={{
          alignSelf: "stretch",
        }}
        entering={FadeInDown.delay(600).duration(500)}
      >

   
       <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Colors.surface,
            borderWidth: 2,
            borderColor: Colors.lightGray,
            padding: 16,
            gap: 10,
            borderRadius: 16,
            marginBottom: 12,
            shadowColor: Colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          // onPress={() => {appleLogin();}}
          onPress={appleLogin}
        >
          <Ionicons name="logo-apple" size={24} color={Colors.textPrimary} />
          <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary }}>
            Continue with Apple
          </Text>
        </TouchableOpacity>

      


      </Animated.View>
    </View>
  );
};

export default SocialLoginButtons;
