import { useContext, useState } from "react";
import { Alert, TouchableOpacity, View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Link, Stack, useRouter } from "expo-router";
import { AuthContext } from "@/utils/Context/AuthContext";
import Ioicons from "react-native-vector-icons/Ionicons";
import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import React from "react";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [secureText, setSecureText] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
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
          headerTitle: "Sign In",
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.textPrimary,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}>
              <Ioicons name="close" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          style={{ backgroundColor: Colors.background }}
        >
          <View className="flex-1 justify-center items-center px-6 py-8">
            {/* Header Section */}
            <View className="mb-10 items-center">
              <Text 
                className="text-4xl font-bold mb-2"
                style={{ color: Colors.textPrimary }}
              >
                Welcome Back
              </Text>
              <Text 
                className="text-base"
                style={{ color: Colors.textSecondary }}
              >
                Sign in to continue to your library
              </Text>
            </View>

            {/* Input Fields */}
            <View className="w-full mb-6">
              <InputField
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="none"
                style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: Colors.lightGray,
                  fontSize: 16,
                  color: Colors.textPrimary,
                }}
              />

              <InputField
                secureTextEntry={secureText}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderWidth: 2,
                  borderColor: Colors.lightGray,
                  fontSize: 16,
                  color: Colors.textPrimary,
                }}
              />
              
              <TouchableOpacity 
                onPress={() => setSecureText(!secureText)}
                style={{ alignSelf: 'flex-end', marginTop: 8, marginBottom: 24 }}
              >
                <Text
                  style={{
                    color: Colors.primary,
                    fontWeight: "600",
                    fontSize: 15,
                  }}
                >
                  {secureText ? "Show Password" : "Hide Password"}
                </Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity
                onPress={handleLogin}
                style={{
                  backgroundColor: Colors.primary,
                  alignItems: "center",
                  borderRadius: 12,
                  alignSelf: "stretch",
                  paddingVertical: 16,
                  paddingHorizontal: 18,
                  marginBottom: 20,
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text className="text-white text-lg font-bold">Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <Text className="mb-6 text-base" style={{ color: Colors.textSecondary }}>
              Don't have an account?{" "}
              <Link href="/Register" asChild>
                <TouchableOpacity>
                  <Text style={{ color: Colors.primary, fontWeight: "700" }}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </Text>

            {/* Divider */}
            <View className="flex-row items-center w-full mb-8">
              <View className="flex-1 h-px" style={{ backgroundColor: Colors.lightGray }} />
              <Text className="mx-4 text-sm" style={{ color: Colors.textSecondary }}>OR</Text>
              <View className="flex-1 h-px" style={{ backgroundColor: Colors.lightGray }} />
            </View>

            {/* Social Login */}
            <View className="w-full">
              <SocialLoginButtons emailHref="/Register" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
