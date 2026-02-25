import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Link, router, Stack } from "expo-router";
import React, { useState, useContext } from "react";
import { Alert, TouchableOpacity, View, Text } from "react-native";
import Ioicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";

export default function Register() {
  const { t } = useTranslation();
  const { createUser } = useContext(AuthContext);
  const [secureText, setSecureText] = useState(true);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(""); // for confirming passwords

  const handleRegister = async () => {
    if (!agreedToPrivacy) {
      Alert.alert(t("common.error"), t("register.mustAgreeToRegister"));
      return;
    }
    if (!email || !password || !confirmPassword) {
      Alert.alert(t("common.error"), t("register.fillAllFields"));
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError(t("account.passwordsDoNotMatch"));
      return; // Prevent further action if passwords don't match
    }

    try {
      await createUser(username, email, password);
      router.dismissAll();
      router.push("/(tabs)");
    } catch (error) {
      Alert.alert(t("common.error"), t("register.failedToRegister"));
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: t("register.title"),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ioicons name="close" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1 justify-center items-center px-5 bg-gray-100">
        <Text className="text-2xl font-semibold tracking-wide text-black mb-12">
          {t("register.createAccountTitle")}
        </Text>

        <InputField
          value={username}
          onChangeText={setUsername}
          placeholder={t("register.enterUsername")}
          placeholderTextColor="gray"
          autoCapitalize="none"
        />

        <InputField
          value={email}
          onChangeText={setEmail}
          placeholder={t("register.enterEmail")}
          placeholderTextColor="gray"
          autoCapitalize="none"
        />

        <InputField
          secureTextEntry={secureText}
          value={password}
          onChangeText={setPassword}
          placeholder={t("register.enterPassword")}
          placeholderTextColor="gray"
        />

        <InputField
          secureTextEntry={secureText}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t("register.confirmPassword")}
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

        {passwordError && (
          <Text className="text-red-500 mt-1 mb-2">{passwordError}</Text>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "stretch", marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setAgreedToPrivacy(!agreedToPrivacy)}
            style={{ marginRight: 10 }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ioicons
              name={agreedToPrivacy ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={agreedToPrivacy ? "#bf471b" : "#6b7280"}
            />
          </TouchableOpacity>
          <Text className="text-sm text-black flex-1">
            {t("register.agreeToPrivacyPolicy")}{" "}
            <Link href="/PrivacyPolicy" asChild>
              <TouchableOpacity>
                <Text style={{ color: "#bf471b", fontWeight: "600", textDecorationLine: "underline" }}>
                  {t("account.privacyPolicyLink")}
                </Text>
              </TouchableOpacity>
            </Link>
          </Text>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: agreedToPrivacy ? "#bf471b" : "#9ca3af",
            alignItems: "center",
            borderRadius: 5,
            alignSelf: "stretch",
            paddingVertical: 14,
            paddingHorizontal: 18,
            marginBottom: 30,
          }}
          onPress={handleRegister}
          disabled={!agreedToPrivacy}
        >
          <Text className="text-white text-lg font-semibold">{t("register.createAccount")}</Text>
        </TouchableOpacity>

        <Text className="mb-5 text-sm text-black">
          {t("register.alreadyHaveAccount")}{" "}
          <Link href="/Login" asChild>
            <TouchableOpacity>
              <Text  style={{  color: "#bf471b"}}>{t("register.signIn")}</Text>
            </TouchableOpacity>
          </Link>
        </Text>

        <View className="border-t border-gray-300 w-1/3 mb-8"></View>
        <SocialLoginButtons emailHref="/Login" />
      </View>
    </>
  );
}
