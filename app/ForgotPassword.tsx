import InputField from "@/components/inputField";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
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
    } catch {
        Alert.alert("Error", "Failed to send reset email");
    }
};

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Reset Password",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ioicons name="close" size={24} color="#667eea" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: "#ffffff",
          },
          headerTintColor: "#667eea",
          headerShadowVisible: true,
        }}
      />

      <View
        style={{
          flex: 1,
          backgroundColor: "#f8f9fa",
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 30,
            paddingVertical: 40,
          }}
        >
          {/* Title Section */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: "#667eea",
                marginBottom: 8,
              }}
            >
              Forgot Password?
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#666",
                textAlign: "center",
                paddingHorizontal: 20,
              }}
            >
              Enter your email and we'll send you a link to reset your password
            </Text>
          </View>

          {/* Input Field */}
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
              marginBottom: 20,
            }}
          >
            <InputField
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={{
                backgroundColor: "#667eea",
                alignItems: "center",
                borderRadius: 12,
                paddingVertical: 16,
                shadowColor: "#667eea",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Send Reset Link
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back to Login */}
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Link href="/Login" asChild>
              <TouchableOpacity>
                <Text
                  style={{
                    color: "#667eea",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Back to Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </>
  );
}
