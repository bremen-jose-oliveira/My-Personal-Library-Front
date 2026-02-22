import { useContext, useState } from "react";
import { Alert, TouchableOpacity, View, Text } from "react-native";
import { Link, Stack, useRouter } from "expo-router";
import { AuthContext } from "@/utils/Context/AuthContext";
import Ioicons from "react-native-vector-icons/Ionicons";
import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import React from "react";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);
  const [secureText, setSecureText] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t("common.error"), t("auth.pleaseEnterEmailPassword"));
      return;
    }

    try {
      await login(email, password);
      // Only navigate if login was successful (no exception thrown)
      // The AuthContext will set isLoggedIn=true, and the app will redirect automatically
      router.dismissAll();
      router.push("/(tabs)");
    } catch (error: any) {
      // Login failed - don't navigate, stay on login screen
      // Alert is already shown in AuthContext.login()
      console.error("Login failed, staying on login screen");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: t("auth.register"),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ioicons name="close" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1 justify-center items-center px-5 bg-gray-100">
        <Text className="text-2xl font-semibold tracking-wide text-black mb-12">
          {t("auth.signInAccount")}
        </Text>

        <InputField
          value={email}
          onChangeText={setEmail}
          placeholder={t("auth.enterEmail")}
          placeholderTextColor="gray"
          autoCapitalize="none"
        />

        <InputField
          secureTextEntry={secureText}
          value={password}
          onChangeText={setPassword}
          placeholder={t("auth.enterPassword")}
          placeholderTextColor="gray"
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <Text
            style={{
              color: "#bf471b",
              fontWeight: "600",
              marginBottom: 20,
            }}
          >
            {secureText ? t("auth.showPassword") : t("auth.hidePassword")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogin}
          style={{
            backgroundColor: "#bf471b",
            alignItems: "center",
            borderRadius: 5,
            alignSelf: "stretch",
            paddingVertical: 14,
            paddingHorizontal: 18,
            marginBottom: 30,
          }}
        >
          <Text className="text-white text-lg font-semibold">Sign In</Text>
        </TouchableOpacity>

        <Text className="mb-5 text-sm text-black">
          Don't have an Account?{" "}
          <Link href="/Register" asChild>
            <TouchableOpacity>
              <Text style={{ color: "#bf471b" }}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </Text>

        <View className="border-t border-gray-300 w-1/3 mb-8"></View>
        <SocialLoginButtons emailHref="/Register" />
      </View>
    </>
  );
}
