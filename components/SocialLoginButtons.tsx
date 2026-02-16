import { Alert, Text, TouchableOpacity, View, StyleSheet } from "react-native";
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

  const { handleGoogleLogin } = useContext(AuthContext);
  const { appleLogin } = useContext(AuthContext);

  const { emailHref } = props;

  return (
    <View style={styles.container}>
      <Animated.View
        style={styles.buttonWrapper}
        entering={FadeInDown.delay(300).duration(500)}
      >
        <Link href={emailHref} asChild>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="mail-outline" size={20} color={Colors.text} />
            <Text style={styles.socialButtonText}>Continue with Email</Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>

      <Animated.View
        style={styles.buttonWrapper}
        entering={FadeInDown.delay(700).duration(500)}
      >
        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleGoogleLogin}
        >
          <GoogleLogo width={20} height={20} />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={styles.buttonWrapper}
        entering={FadeInDown.delay(1100).duration(500)}
      >
        <TouchableOpacity style={styles.socialButton} onPress={appleLogin}>
          <Ionicons name="logo-apple" size={20} color={Colors.text} />
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default SocialLoginButtons;

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
  },
  buttonWrapper: {
    alignSelf: "stretch",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 10,
    marginBottom: 12,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
});
