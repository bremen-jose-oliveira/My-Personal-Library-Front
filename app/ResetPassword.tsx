import React, { useState, useEffect } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import InputField from "@/components/inputField";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = useLocalSearchParams(); // Get token from deep link
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [passwordError, setPasswordError] = useState(""); // for confirming passwords

  useEffect(() => {
    if (!token) {
      Alert.alert("Error", "Invalid password reset link.");
      router.push("/");
    }
  }, [token]);

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
  }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),

      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Reset failed");

      Alert.alert("Success", "Password updated successfully!");
      router.push("/");
    } catch (error:any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <>
    <Stack.Screen
      options={{
       headerTitle: "Reset Password",
       headerStyle: {
         backgroundColor: "#ffffff",
       },
       headerTintColor: "#667eea",
       headerShadowVisible: true,
      }}
    />

    <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
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
            Update Password
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#666",
              textAlign: "center",
            }}
          >
            Enter your new password below
          </Text>
        </View>

        {/* Input Fields */}
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
            secureTextEntry={secureText}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter New Password..."
            placeholderTextColor="#999"
          />

          <InputField
            secureTextEntry={secureText}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm New Password..."
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            onPress={() => setSecureText(!secureText)}
            style={{ marginBottom: 10 }}
          >
            <Text
              style={{
                color: "#667eea",
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              {secureText ? "Show Password" : "Hide Password"}
            </Text>
          </TouchableOpacity>

          {passwordError && (
            <Text
              style={{
                color: "#dc3545",
                fontSize: 14,
                marginBottom: 10,
              }}
            >
              {passwordError}
            </Text>
          )}

          <TouchableOpacity
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
            onPress={handleResetPassword}
          >
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "600" }}>
              Update Password
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </>
  );
}
