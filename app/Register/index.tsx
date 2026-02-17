import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Link, router, Stack } from "expo-router";
import React, { useState, useContext } from "react";
import { Alert, TouchableOpacity, View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import Ioicons from "react-native-vector-icons/Ionicons";
import { Colors } from "@/constants/Colors";

export default function Register() {
  const { createUser } = useContext(AuthContext);
  const [secureText, setSecureText] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(""); // for confirming passwords

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return; // Prevent further action if passwords don't match
    }

    try {
      await createUser(username, email, password);
      router.dismissAll();
      router.push("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Failed to register");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Sign Up",
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
                Join Us
              </Text>
              <Text 
                className="text-base"
                style={{ color: Colors.textSecondary }}
              >
                Create your account to get started
              </Text>
            </View>

            {/* Input Fields */}
            <View className="w-full mb-6">
              <InputField
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
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
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: Colors.lightGray,
                  fontSize: 16,
                  color: Colors.textPrimary,
                }}
              />

              <InputField
                secureTextEntry={secureText}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                placeholderTextColor={Colors.textSecondary}
                style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  marginBottom: 8,
                  borderWidth: 2,
                  borderColor: Colors.lightGray,
                  fontSize: 16,
                  color: Colors.textPrimary,
                }}
              />
              
              <TouchableOpacity 
                onPress={() => setSecureText(!secureText)}
                style={{ alignSelf: 'flex-end', marginTop: 8, marginBottom: 16 }}
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

              {passwordError ? (
                <Text 
                  className="text-base mb-4"
                  style={{ color: Colors.error }}
                >
                  {passwordError}
                </Text>
              ) : null}

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
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
                <Text className="text-white text-lg font-bold">Create Account</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Link */}
            <Text className="mb-6 text-base" style={{ color: Colors.textSecondary }}>
              Already have an account?{" "}
              <Link href="/Login" asChild>
                <TouchableOpacity>
                  <Text style={{ color: Colors.primary, fontWeight: "700" }}>Sign In</Text>
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
              <SocialLoginButtons emailHref="/Login" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
