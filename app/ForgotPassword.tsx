import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { Link, router, Stack } from "expo-router";
import React, { useState } from "react";
import { Alert, TouchableOpacity, View, Text } from "react-native";
import Ioicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();  
        Alert.alert(t("forgotPassword.checkEmail"), data.message);
    } catch (error) {
      
        Alert.alert(t("common.error"), t("forgotPassword.failedToSend"));
    }
};

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: t("forgotPassword.title"),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ioicons name="close" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1 justify-center items-center px-5 bg-gray-100">
        <Text className="text-2xl font-semibold tracking-wide text-black mb-12">
          {t("forgotPassword.title")}
        </Text>

        <InputField
          value={email}
          onChangeText={setEmail}
          placeholder={t("forgotPassword.enterEmail")}
          placeholderTextColor="gray"
          autoCapitalize="none"
        />


        <TouchableOpacity
         style={{  backgroundColor: "#bf471b", alignItems:"center", borderRadius: 5, alignSelf: "stretch",   paddingVertical: 14,paddingHorizontal: 18,  marginBottom: 30,}}
       
          onPress={handleForgotPassword}
        >
          <Text className="text-white text-lg font-semibold">{t("forgotPassword.resetButton")}</Text>
        </TouchableOpacity>

      
      </View>
    </>
  );
}
