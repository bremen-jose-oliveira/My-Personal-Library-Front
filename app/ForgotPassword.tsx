import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Link, router, Stack } from "expo-router";
import React, { useState, useContext } from "react";
import { Alert, TouchableOpacity, View, Text } from "react-native";
import Ioicons from "react-native-vector-icons/Ionicons";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        Alert.alert("Check your email", data.message);
    } catch (error) {
      
        Alert.alert("Error", "Failed to send reset email");
    }
};

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Sign Up",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ioicons name="close" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1 justify-center items-center px-5 bg-gray-100">
        <Text className="text-2xl font-semibold tracking-wide text-black mb-12">
          Reset Password
        </Text>



        <InputField
          value={email}
          onChangeText={setEmail}
          placeholder="Enter Email..."
          placeholderTextColor="gray"
          autoCapitalize="none"
        />


        <TouchableOpacity
         style={{  backgroundColor: "#bf471b", alignItems:"center", borderRadius: 5, alignSelf: "stretch",   paddingVertical: 14,paddingHorizontal: 18,  marginBottom: 30,}}
       
          onPress={handleForgotPassword}
        >
          <Text className="text-white text-lg font-semibold">Reset</Text>
        </TouchableOpacity>

      
      </View>
    </>
  );
}
