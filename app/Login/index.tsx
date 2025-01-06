import { useContext, useState } from "react";
import { Alert, TouchableOpacity, View, Text } from "react-native";
import { Link, Stack, useRouter } from "expo-router";
import { AuthContext } from "@/utils/Context/AuthContext";
import Ioicons from "react-native-vector-icons/Ionicons";
import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import React from "react";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }

    try {
      await login(username, password);
      router.dismissAll();
      router.push("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login Error", error.message || "Failed to log in");
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
          Sign in your Account
        </Text>

        <InputField
          value={username}
          onChangeText={setUsername}
          placeholder="Enter a Username"
          placeholderTextColor="gray"
          autoCapitalize="none"
        />

        <InputField
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Enter Password..."
          placeholderTextColor="gray"
        />

        <TouchableOpacity
          onPress={handleLogin}
          className="bg-blue-500 px-4 py-3 w-full items-center rounded mb-8"
        >
          <Text className="text-white text-lg font-semibold">Sign In</Text>
        </TouchableOpacity>

        <Text className="mb-5 text-sm text-black">
          Don't have an Account?{" "}
          <Link href="/Register" asChild>
            <TouchableOpacity>
              <Text className="text-blue-500 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </Text>

        <View className="border-t border-gray-300 w-1/3 mb-8"></View>
        <SocialLoginButtons emailHref="/Register" />
      </View>
    </>
  );
}
